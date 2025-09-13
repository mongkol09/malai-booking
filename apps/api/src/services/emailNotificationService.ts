// ============================================
// EMAIL NOTIFICATION SERVICE FOR CEO
// ============================================

import nodemailer from 'nodemailer';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface CancellationEmailData {
  bookingId: string;
  guestName: string;
  guestEmail?: string;
  guestPhone?: string;
  roomNumber: string;
  roomType?: string;
  checkInDate?: string;
  checkOutDate?: string;
  originalAmount?: number;
  refundAmount?: number;
  penaltyAmount?: number;
  totalPaid?: number;
  revenueLoss?: number;
  cancellationReason: string;
  cancelledBy?: string;
  daysUntilCheckin?: number;
  bookedDaysAgo?: number;
  stayDuration?: number;
  todayCancellations?: number;
  cancellationTime: string;
  internalNotes?: string;
}

export class EmailNotificationService {
  private transporter: nodemailer.Transporter;
  private ceoEmail: string;

  constructor() {
    // Email configuration from environment
    const emailConfig: EmailConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
      }
    };

    this.ceoEmail = process.env.CEO_EMAIL || 'ceo@hotel.com';
    this.transporter = nodemailer.createTransport(emailConfig);
  }

  // 📧 ส่งอีเมลรายงานการยกเลิกให้ CEO
  public async sendCancellationReport(data: CancellationEmailData): Promise<boolean> {
    try {
      const htmlTemplate = this.generateCancellationHTML(data);
      const textTemplate = this.generateCancellationText(data);

      const mailOptions = {
        from: process.env.SMTP_USER,
        to: this.ceoEmail,
        subject: `🚫 รายงานการยกเลิกการจอง - ${data.bookingId}`,
        text: textTemplate,
        html: htmlTemplate,
        priority: 'high' as const
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ [Email] Cancellation report sent to CEO: ${this.ceoEmail}`);
      return true;

    } catch (error) {
      console.error('❌ [Email] Failed to send cancellation report:', error);
      return false;
    }
  }

  // 📊 สร้าง HTML template สำหรับอีเมล
  private generateCancellationHTML(data: CancellationEmailData): string {
    const formatCurrency = (amount?: number) => amount ? `฿${amount.toLocaleString()}` : 'ไม่ระบุ';
    const formatDate = (dateStr?: string) => dateStr ? new Date(dateStr).toLocaleDateString('th-TH') : 'ไม่ระบุ';

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>รายงานการยกเลิกการจอง</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background-color: white; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #e74c3c, #c0392b); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { padding: 30px; }
        .section { margin-bottom: 25px; }
        .section-title { font-size: 18px; font-weight: bold; color: #2c3e50; margin-bottom: 15px; border-bottom: 2px solid #3498db; padding-bottom: 5px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        .info-item { background-color: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #3498db; }
        .info-label { font-weight: bold; color: #34495e; margin-bottom: 5px; }
        .info-value { color: #2c3e50; font-size: 16px; }
        .financial-summary { background: linear-gradient(135deg, #f39c12, #e67e22); color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .metric-highlight { background-color: #e8f6f3; border: 2px solid #1abc9c; padding: 15px; border-radius: 8px; text-align: center; }
        .metric-value { font-size: 24px; font-weight: bold; color: #16a085; }
        .metric-label { color: #34495e; margin-top: 5px; }
        .alert-high { background-color: #ffeaa7; border-left: 4px solid #fdcb6e; }
        .alert-medium { background-color: #fab1a0; border-left: 4px solid #e17055; }
        .alert-low { background-color: #fd79a8; border-left: 4px solid #e84393; }
        .footer { background-color: #34495e; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚫 รายงานการยกเลิกการจอง</h1>
            <p>รายงานอัตโนมัติจากระบบจัดการโรงแรม</p>
        </div>
        
        <div class="content">
            <!-- Booking Information -->
            <div class="section">
                <div class="section-title">📋 ข้อมูลการจอง</div>
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">เลขที่การจอง</div>
                        <div class="info-value">${data.bookingId}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">ยกเลิกเมื่อ</div>
                        <div class="info-value">${new Date(data.cancellationTime).toLocaleString('th-TH')}</div>
                    </div>
                </div>
            </div>

            <!-- Guest Information -->
            <div class="section">
                <div class="section-title">👤 ข้อมูลผู้เข้าพัก</div>
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">ชื่อ-นามสกุล</div>
                        <div class="info-value">${data.guestName}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">โทรศัพท์</div>
                        <div class="info-value">${data.guestPhone || 'ไม่ระบุ'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">อีเมล</div>
                        <div class="info-value">${data.guestEmail || 'ไม่ระบุ'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">หมายเลขห้อง</div>
                        <div class="info-value">${data.roomNumber} (${data.roomType || 'ไม่ระบุ'})</div>
                    </div>
                </div>
            </div>

            <!-- Stay Information -->
            <div class="section">
                <div class="section-title">📅 ข้อมูลการเข้าพัก</div>
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">วันเข้าพัก</div>
                        <div class="info-value">${formatDate(data.checkInDate)}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">วันออก</div>
                        <div class="info-value">${formatDate(data.checkOutDate)}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">ระยะเวลาเข้าพัก</div>
                        <div class="info-value">${data.stayDuration || 'ไม่ระบุ'} คืน</div>
                    </div>
                    <div class="info-item ${data.daysUntilCheckin && data.daysUntilCheckin < 1 ? 'alert-high' : data.daysUntilCheckin && data.daysUntilCheckin < 7 ? 'alert-medium' : 'alert-low'}">
                        <div class="info-label">ล่วงหน้าก่อนเข้าพัก</div>
                        <div class="info-value">${data.daysUntilCheckin || 'ไม่ระบุ'} วัน</div>
                    </div>
                </div>
            </div>

            <!-- Financial Summary -->
            <div class="financial-summary">
                <h3>💰 สรุปทางการเงิน</h3>
                <div class="info-grid">
                    <div>
                        <strong>ยอดการจองเดิม:</strong> ${formatCurrency(data.originalAmount)}
                    </div>
                    <div>
                        <strong>ยอดที่ชำระแล้ว:</strong> ${formatCurrency(data.totalPaid)}
                    </div>
                    <div>
                        <strong>ยอดคืน:</strong> ${formatCurrency(data.refundAmount)}
                    </div>
                    <div>
                        <strong>ค่าปรับ:</strong> ${formatCurrency(data.penaltyAmount)}
                    </div>
                </div>
            </div>

            <!-- Revenue Impact -->
            <div class="metric-highlight">
                <div class="metric-value">${formatCurrency(data.revenueLoss)}</div>
                <div class="metric-label">📉 รายได้ที่สูญเสีย</div>
            </div>

            <!-- Business Metrics -->
            <div class="section">
                <div class="section-title">📊 ข้อมูลเชิงธุรกิจ</div>
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">จองมาแล้ว</div>
                        <div class="info-value">${data.bookedDaysAgo || 'ไม่ระบุ'} วัน</div>
                    </div>
                    <div class="info-item ${data.todayCancellations && data.todayCancellations > 3 ? 'alert-high' : 'alert-low'}">
                        <div class="info-label">ยกเลิกวันนี้</div>
                        <div class="info-value">${data.todayCancellations || 1} รายการ</div>
                    </div>
                </div>
            </div>

            <!-- Cancellation Details -->
            <div class="section">
                <div class="section-title">📝 รายละเอียดการยกเลิก</div>
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">เหตุผลการยกเลิก</div>
                        <div class="info-value">${data.cancellationReason}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">ยกเลิกโดย</div>
                        <div class="info-value">${data.cancelledBy || 'ระบบ'}</div>
                    </div>
                </div>
                ${data.internalNotes ? `
                <div class="info-item" style="grid-column: 1 / -1; margin-top: 15px;">
                    <div class="info-label">หมายเหตุภายใน</div>
                    <div class="info-value">${data.internalNotes}</div>
                </div>
                ` : ''}
            </div>
        </div>

        <div class="footer">
            <p>รายงานนี้สร้างโดยระบบจัดการโรงแรมอัตโนมัติ</p>
            <p>เวลาส่งรายงาน: ${new Date().toLocaleString('th-TH')}</p>
        </div>
    </div>
</body>
</html>
    `;
  }

  // 📄 สร้าง Text template สำหรับอีเมล
  private generateCancellationText(data: CancellationEmailData): string {
    const formatCurrency = (amount?: number) => amount ? `฿${amount.toLocaleString()}` : 'ไม่ระบุ';
    
    return `
🚫 รายงานการยกเลิกการจอง
════════════════════════════════════════

📋 ข้อมูลการจอง
▪ เลขที่การจอง: ${data.bookingId}
▪ ยกเลิกเมื่อ: ${new Date(data.cancellationTime).toLocaleString('th-TH')}

👤 ข้อมูลผู้เข้าพัก
▪ ชื่อ-นามสกุล: ${data.guestName}
▪ โทรศัพท์: ${data.guestPhone || 'ไม่ระบุ'}
▪ อีเมล: ${data.guestEmail || 'ไม่ระบุ'}
▪ หมายเลขห้อง: ${data.roomNumber} (${data.roomType || 'ไม่ระบุ'})

📅 ข้อมูลการเข้าพัก
▪ วันเข้าพัก: ${data.checkInDate || 'ไม่ระบุ'}
▪ วันออก: ${data.checkOutDate || 'ไม่ระบุ'}
▪ ระยะเวลาเข้าพัก: ${data.stayDuration || 'ไม่ระบุ'} คืน
▪ ล่วงหน้าก่อนเข้าพัก: ${data.daysUntilCheckin || 'ไม่ระบุ'} วัน

💰 สรุปทางการเงิน
▪ ยอดการจองเดิม: ${formatCurrency(data.originalAmount)}
▪ ยอดที่ชำระแล้ว: ${formatCurrency(data.totalPaid)}
▪ ยอดคืน: ${formatCurrency(data.refundAmount)}
▪ ค่าปรับ: ${formatCurrency(data.penaltyAmount)}
▪ รายได้ที่สูญเสีย: ${formatCurrency(data.revenueLoss)}

📊 ข้อมูลเชิงธุรกิจ
▪ จองมาแล้ว: ${data.bookedDaysAgo || 'ไม่ระบุ'} วัน
▪ ยกเลิกวันนี้: ${data.todayCancellations || 1} รายการ

📝 รายละเอียดการยกเลิก
▪ เหตุผลการยกเลิก: ${data.cancellationReason}
▪ ยกเลิกโดย: ${data.cancelledBy || 'ระบบ'}
${data.internalNotes ? `▪ หมายเหตุภายใน: ${data.internalNotes}` : ''}

════════════════════════════════════════
รายงานนี้สร้างโดยระบบจัดการโรงแรมอัตโนมัติ
เวลาส่งรายงาน: ${new Date().toLocaleString('th-TH')}
    `;
  }

  // 🔍 ตรวจสอบการเชื่อมต่อ Email
  public async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('✅ [Email] SMTP connection verified');
      return true;
    } catch (error) {
      console.error('❌ [Email] SMTP connection failed:', error);
      return false;
    }
  }
}

// Export singleton instance
let emailNotificationService: EmailNotificationService | null = null;

export const getEmailNotificationService = (): EmailNotificationService => {
  if (!emailNotificationService) {
    emailNotificationService = new EmailNotificationService();
  }
  return emailNotificationService;
};