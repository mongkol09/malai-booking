import { Router } from 'express';
import {
  getEmailSettings,
  updateEmailSetting,
  bulkUpdateEmailSettings,
  getEmailSettingsAudit,
  checkEmailSetting,
  emergencyEmailToggle
} from '../controllers/emailSettingsController';

const router = Router();

// ============================================
// EMAIL SETTINGS ROUTES
// สำหรับหน้า Admin Panel
// ============================================

/**
 * GET /api/v1/admin/email-settings
 * ดึงการตั้งค่าอีเมลทั้งหมด
 */
router.get('/', getEmailSettings);

/**
 * PUT /api/v1/admin/email-settings/:settingKey
 * อัปเดตการตั้งค่าอีเมลรายการเดียว
 */
router.put('/:settingKey', updateEmailSetting);

/**
 * PUT /api/v1/admin/email-settings/bulk
 * อัปเดตการตั้งค่าอีเมลหลายรายการพร้อมกัน
 */
router.put('/bulk', bulkUpdateEmailSettings);

/**
 * GET /api/v1/admin/email-settings/audit
 * ดู audit log ของการเปลี่ยนแปลงการตั้งค่า
 */
router.get('/audit', getEmailSettingsAudit);

/**
 * GET /api/v1/admin/email-settings/check/:settingKey
 * ตรวจสอบการตั้งค่าเฉพาะ
 */
router.get('/check/:settingKey', checkEmailSetting);

/**
 * POST /api/v1/admin/email-settings/emergency-toggle
 * ปิด/เปิดระบบส่งอีเมลทั้งหมดฉุกเฉิน
 */
router.post('/emergency-toggle', emergencyEmailToggle);

export default router;
