import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Types
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    userType: string;
  };
}

interface EmailSetting {
  setting_id: string;
  setting_key: string;
  setting_value: boolean;
  email_type: string;
  description: string;
  updated_at: Date;
  updated_by_name?: string;
}

// ============================================
// EMAIL SETTINGS CONTROLLER
// จัดการการตั้งค่าระบบส่งอีเมลในหน้า Admin
// ============================================

// Validation schemas
const updateEmailSettingSchema = z.object({
  settingKey: z.string().min(1),
  settingValue: z.boolean(),
  reason: z.string().optional()
});

const bulkUpdateSettingsSchema = z.object({
  settings: z.array(z.object({
    settingKey: z.string(),
    settingValue: z.boolean()
  })),
  reason: z.string().optional()
});

// ============================================
// GET ALL EMAIL SETTINGS
// GET /api/v1/admin/email-settings
// ============================================
export const getEmailSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    // ดึงการตั้งค่าทั้งหมด
    const settings = await prisma.$queryRaw`
      SELECT 
        setting_id,
        setting_key,
        setting_value,
        email_type,
        description,
        updated_at,
        (SELECT CONCAT(first_name, ' ', last_name) 
         FROM "Users" u 
         WHERE u.user_id = es.last_updated_by) as updated_by_name
      FROM "EmailSettings" es
      ORDER BY 
        CASE email_type 
          WHEN 'system' THEN 1 
          ELSE 2 
        END,
        setting_key
    `;

    // ดึงสถานะระบบ
    const systemStatus = await prisma.$queryRaw`
      SELECT component, is_enabled, status, last_health_check, error_message
      FROM "SystemStatus"
      ORDER BY component
    `;

    // จัดกลุ่มการตั้งค่าตามประเภท
    const groupedSettings: {
      system: EmailSetting[];
      emailTypes: Record<string, EmailSetting[]>;
      overall: Record<string, any>;
    } = {
      system: [],
      emailTypes: {},
      overall: {}
    };

    (settings as EmailSetting[]).forEach(setting => {
      if (setting.email_type === 'system') {
        groupedSettings.system.push(setting);
      } else if (setting.email_type) {
        if (!groupedSettings.emailTypes[setting.email_type]) {
          groupedSettings.emailTypes[setting.email_type] = [];
        }
        groupedSettings.emailTypes[setting.email_type]?.push(setting);
      }
    });

    res.json({
      success: true,
      data: {
        settings: groupedSettings,
        systemStatus,
        metadata: {
          totalSettings: (settings as any[]).length,
          lastUpdated: new Date().toISOString()
        }
      }
    });

  } catch (error) {
    console.error('❌ Error fetching email settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch email settings'
    });
  }
};

// ============================================
// UPDATE SINGLE EMAIL SETTING
// PUT /api/v1/admin/email-settings/:settingKey
// ============================================
export const updateEmailSetting = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { settingKey } = req.params;
    const { settingValue, reason } = updateEmailSettingSchema.parse(req.body);
    
    // ได้ user ID จาก authentication middleware
    const userId = req.user?.id || 'system';
    const userIP = req.ip || '127.0.0.1';
    const userAgent = req.get('User-Agent') || 'Unknown';

    // ตรวจสอบว่า setting key มีอยู่หรือไม่
    const existingSetting = await prisma.$queryRaw`
      SELECT setting_id, setting_value FROM "EmailSettings" 
      WHERE setting_key = ${settingKey}
    `;

    if (!Array.isArray(existingSetting) || existingSetting.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Setting not found'
      });
      return;
    }

    const oldValue = (existingSetting[0] as any).setting_value;

    // ใช้ PostgreSQL function เพื่ออัพเดตพร้อม audit log
    const updateResult = await prisma.$queryRaw`
      SELECT update_email_setting(
        ${settingKey},
        ${settingValue},
        ${userId}::UUID,
        ${reason || 'Updated via admin panel'},
        ${userIP}::INET,
        ${userAgent}
      ) as success
    `;

    const success = (updateResult as any[])[0]?.success;

    if (success) {
      // ดึงข้อมูลใหม่หลังอัพเดต
      const updatedSetting = await prisma.$queryRaw`
        SELECT 
          setting_id,
          setting_key,
          setting_value,
          email_type,
          description,
          updated_at
        FROM "EmailSettings" 
        WHERE setting_key = ${settingKey}
      `;

      res.json({
        success: true,
        message: `Setting '${settingKey}' updated successfully`,
        data: {
          setting: (updatedSetting as any[])[0],
          change: {
            from: oldValue,
            to: settingValue,
            reason: reason || 'Updated via admin panel'
          }
        }
      });

      // Log การเปลี่ยนแปลงสำคัญ
      if (settingKey === 'email_service_enabled' || settingKey === 'checkin_reminder_enabled') {
        console.log(`🔧 CRITICAL SETTING CHANGE: ${settingKey} = ${settingValue} by user ${userId}`);
      }

    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to update setting'
      });
    }

  } catch (error) {
    console.error('❌ Error updating email setting:', error);
    
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: error.errors
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// ============================================
// BULK UPDATE EMAIL SETTINGS
// PUT /api/v1/admin/email-settings/bulk
// ============================================
export const bulkUpdateEmailSettings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { settings, reason } = bulkUpdateSettingsSchema.parse(req.body);
    const userId = req.user?.id || 'system';
    const userIP = req.ip || '127.0.0.1';
    const userAgent = req.get('User-Agent') || 'Unknown';

    const results = [];
    const errors = [];

    // อัพเดตทีละรายการ
    for (const setting of settings) {
      try {
        const updateResult = await prisma.$queryRaw`
          SELECT update_email_setting(
            ${setting.settingKey},
            ${setting.settingValue},
            ${userId}::UUID,
            ${reason || 'Bulk update via admin panel'},
            ${userIP}::INET,
            ${userAgent}
          ) as success
        `;

        const success = (updateResult as any[])[0]?.success;
        
        if (success) {
          results.push({
            settingKey: setting.settingKey,
            status: 'updated',
            newValue: setting.settingValue
          });
        } else {
          errors.push({
            settingKey: setting.settingKey,
            error: 'Update failed'
          });
        }

      } catch (settingError: any) {
        errors.push({
          settingKey: setting.settingKey,
          error: settingError?.message || 'Unknown error'
        });
      }
    }

    res.json({
      success: errors.length === 0,
      message: `Updated ${results.length} settings, ${errors.length} errors`,
      data: {
        updated: results,
        errors: errors,
        summary: {
          total: settings.length,
          successful: results.length,
          failed: errors.length
        }
      }
    });

  } catch (error) {
    console.error('❌ Error in bulk update:', error);
    
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: error.errors
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// ============================================
// GET EMAIL SETTINGS AUDIT LOG
// GET /api/v1/admin/email-settings/audit
// ============================================
export const getEmailSettingsAudit = async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    const auditLogs = await prisma.$queryRaw`
      SELECT 
        esa.audit_id,
        esa.setting_key,
        esa.old_value,
        esa.new_value,
        esa.changed_reason,
        esa.ip_address,
        esa.created_at,
        CONCAT(u.first_name, ' ', u.last_name) as changed_by_name,
        es.email_type,
        es.description
      FROM "EmailSettingsAudit" esa
      LEFT JOIN "Users" u ON u.user_id = esa.changed_by
      LEFT JOIN "EmailSettings" es ON es.setting_id = esa.setting_id
      ORDER BY esa.created_at DESC
      LIMIT ${Number(limit)}
      OFFSET ${Number(offset)}
    `;

    const totalCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM "EmailSettingsAudit"
    `;

    res.json({
      success: true,
      data: {
        auditLogs,
        pagination: {
          total: Number((totalCount as any[])[0]?.count || 0),
          limit: Number(limit),
          offset: Number(offset),
          hasMore: Number(offset) + Number(limit) < Number((totalCount as any[])[0]?.count || 0)
        }
      }
    });

  } catch (error) {
    console.error('❌ Error fetching audit logs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch audit logs'
    });
  }
};

// ============================================
// CHECK SPECIFIC EMAIL SETTING (Helper)
// GET /api/v1/admin/email-settings/check/:settingKey
// ============================================
export const checkEmailSetting = async (req: Request, res: Response): Promise<void> => {
  try {
    const { settingKey } = req.params;
    
    const settingValue = await prisma.$queryRaw`
      SELECT get_email_setting(${settingKey}) as enabled
    `;

    const enabled = (settingValue as any[])[0]?.enabled;

    res.json({
      success: true,
      data: {
        settingKey,
        enabled: Boolean(enabled),
        checkedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error checking email setting:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check setting'
    });
  }
};

// ============================================
// EMERGENCY EMAIL SYSTEM TOGGLE
// POST /api/v1/admin/email-settings/emergency-toggle
// ============================================
export const emergencyEmailToggle = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { action, reason } = z.object({
      action: z.enum(['disable_all', 'enable_all']),
      reason: z.string().min(5, 'Reason must be at least 5 characters')
    }).parse(req.body);

    const userId = req.user?.id || 'system';
    const userIP = req.ip || '127.0.0.1';
    const userAgent = req.get('User-Agent') || 'Unknown';
    const newValue = action === 'enable_all';

    // อัพเดตการตั้งค่าหลักทั้งหมด
    const criticalSettings = [
      'email_service_enabled',
      'booking_confirmation_enabled', 
      'payment_receipt_enabled',
      'checkin_reminder_enabled'
    ];

    const results = [];

    for (const settingKey of criticalSettings) {
      const updateResult = await prisma.$queryRaw`
        SELECT update_email_setting(
          ${settingKey},
          ${newValue},
          ${userId}::UUID,
          ${`EMERGENCY: ${reason}`},
          ${userIP}::INET,
          ${userAgent}
        ) as success
      `;

      results.push({
        settingKey,
        success: (updateResult as any[])[0]?.success,
        newValue
      });
    }

    // Log ฉุกเฉิน
    console.log(`🚨 EMERGENCY EMAIL TOGGLE: ${action} by user ${userId} - ${reason}`);

    res.json({
      success: true,
      message: `Emergency ${action} completed`,
      data: {
        action,
        reason,
        results,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error in emergency toggle:', error);
    
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: error.errors
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Emergency toggle failed'
    });
  }
};
