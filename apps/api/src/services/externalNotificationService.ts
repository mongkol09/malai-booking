import axios from 'axios';
import { Telegraf } from 'telegraf';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 📱 External Notification Service สำหรับ LINE และ Telegram
export class ExternalNotificationService {
  private lineToken: string;
  private telegramBot: Telegraf | null = null;
  private telegramChatId: string;

  constructor() {
    this.lineToken = process.env.LINE_NOTIFY_TOKEN || '';
    const telegramToken = process.env.TELEGRAM_BOT_TOKEN || '';
    this.telegramChatId = process.env.TELEGRAM_CHAT_ID || '';

    // Initialize Telegram Bot if token is available
    if (telegramToken) {
      try {
        this.telegramBot = new Telegraf(telegramToken);
      } catch (error) {
        console.error('❌ Failed to initialize Telegram Bot:', error);
      }
    }
  }

  // 🔔 ส่งการแจ้งเตือนไปทุกช่องทาง
  public async sendNotification(eventType: string, data: any): Promise<boolean> {
    const message = this.formatMessage(eventType, data);
    let success = false;

    try {
      // ส่งไป LINE Notify (parallel)
      const linePromise = this.sendLineNotification(message);
      
      // ส่งไป Telegram (parallel)  
      const telegramPromise = this.sendTelegramNotification(message);

      // รอให้ทั้งสองส่งเสร็จ
      const [lineResult, telegramResult] = await Promise.allSettled([
        linePromise,
        telegramPromise
      ]);

      // ตรวจสอบผลลัพธ์
      const lineSuccess = lineResult.status === 'fulfilled' && lineResult.value;
      const telegramSuccess = telegramResult.status === 'fulfilled' && telegramResult.value;

      success = lineSuccess || telegramSuccess; // สำเร็จอย่างน้อย 1 ช่องทาง

      // บันทึก log
      await this.logNotification(eventType, message, {
        line: lineSuccess,
        telegram: telegramSuccess,
        data: data
      });

      console.log(`📢 External notification sent: LINE(${lineSuccess}) Telegram(${telegramSuccess})`);
      
    } catch (error) {
      console.error('❌ External notification failed:', error);
      await this.logNotification(eventType, message, {
        line: false,
        telegram: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: data
      });
    }

    return success;
  }

  // 🟢 ส่งไป LINE Notify
  private async sendLineNotification(message: string): Promise<boolean> {
    if (!this.lineToken) {
      console.log('⚠️ LINE Notify token not configured');
      return false;
    }

    try {
      const response = await axios.post(
        'https://notify-api.line.me/api/notify',
        `message=${encodeURIComponent(message)}`,
        {
          headers: {
            'Authorization': `Bearer ${this.lineToken}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          timeout: 10000 // 10 second timeout
        }
      );

      return response.status === 200;
    } catch (error) {
      console.error('❌ LINE notification failed:', error);
      return false;
    }
  }

  // 🔵 ส่งไป Telegram
  private async sendTelegramNotification(message: string): Promise<boolean> {
    if (!this.telegramBot || !this.telegramChatId) {
      console.log('⚠️ Telegram bot not configured');
      return false;
    }

    try {
      await this.telegramBot.telegram.sendMessage(this.telegramChatId, message, {
        parse_mode: 'HTML'
      });
      return true;
    } catch (error) {
      console.error('❌ Telegram notification failed:', error);
      return false;
    }
  }

  // 📝 จัดรูปแบบข้อความตาม eventType
  private formatMessage(eventType: string, data: any): string {
    const timestamp = new Date().toLocaleString('th-TH', {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });

    switch (eventType) {
      case 'PaymentSuccessful':
        return `🔔 *การชำระเงินสำเร็จ*
━━━━━━━━━━━━━━━━━━━━━━
💳 *ยอดเงิน:* ${data.amount?.toLocaleString()} บาท
📋 *การจอง:* ${data.bookingId || 'N/A'}
💰 *วิธีการ:* ${data.paymentMethod || 'N/A'}
━━━━━━━━━━━━━━━━━━━━━━
⏰ เวลา: ${timestamp}`;

      case 'NewBookingCreated':
        return `🏨 *แจ้งเตือน: การจองใหม่*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 *เลขที่การจอง:* ${data.bookingId || 'ไม่ระบุ'}
👤 *ผู้จอง:* ${data.guestName || 'ไม่ระบุ'}
🏨 *ห้อง:* ${data.roomNumber} (${data.roomTypeName})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 *วันที่เช็คอิน:* ${data.checkinDate}
📅 *วันที่เช็คเอาท์:* ${data.checkoutDate}
🌙 *จำนวนคืน:* ${data.nights || 'ไม่ระบุ'} คืน
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 *ยอดเงินรวม:* ${data.totalPrice?.toLocaleString() || data.formattedPrice || 'ไม่ระบุ'} บาท
📊 *สถานะ:* ${data.status || 'ยืนยันแล้ว'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏰ *เวลาที่จอง:* ${timestamp}
🎯 *แหล่งที่มา:* Admin Panel`;

      case 'GuestCheckIn':
        return `🏨 *แจ้งเตือน: ผู้เข้าพักเช็คอิน*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 *ผู้เข้าพัก:* ${data.guestName || 'ไม่ระบุ'}
🏨 *หมายเลขห้อง:* ${data.roomNumber || 'ไม่ระบุ'}
📋 *เลขที่การจอง:* ${data.bookingId || data.bookingReferenceId || 'ไม่ระบุ'}
📱 *โทรศัพท์:* ${data.phoneNumber || 'ไม่ระบุ'}
📧 *อีเมล:* ${data.email || 'ไม่ระบุ'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 *วันที่เช็คอิน:* ${data.checkinDate || 'วันนี้'}
📅 *วันที่เช็คเอาท์:* ${data.checkoutDate || 'ไม่ระบุ'}
👥 *จำนวนผู้เข้าพัก:* ${data.guestCount || data.adults || 1} คน
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 *ยอดรวม:* ${data.totalAmount?.toLocaleString() || data.finalAmount?.toLocaleString() || 'ไม่ระบุ'} บาท
💳 *สถานะการชำระ:* ${data.paymentStatus || 'ไม่ระบุ'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏰ *เวลาเช็คอิน:* ${timestamp}
👨‍💼 *ดำเนินการโดย:* ${data.checkedInBy || 'ระบบ'}`;

      case 'GuestCheckOut':
        return `🏨 *แจ้งเตือน: ผู้เข้าพักเช็คเอาท์*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 *เลขที่การจอง:* ${data.bookingId || data.bookingReferenceId || 'ไม่ระบุ'}
👤 *ผู้เข้าพัก:* ${data.guestName || 'ไม่ระบุ'}
🏨 *หมายเลขห้อง:* ${data.roomNumber || 'ไม่ระบุ'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 *ค่าใช้จ่ายเพิ่มเติม:* ${data.additionalCharges?.toLocaleString() || 0} บาท
💳 *ยอดชำระรวม:* ${data.finalBill?.toLocaleString() || 'ไม่ระบุ'} บาท
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏰ *เวลาเช็คเอาท์:* ${timestamp}
👨‍💼 *ดำเนินการโดย:* ${data.checkedOutBy || 'ระบบ'}`;

      case 'RoomStatusChange':
        return `🔔 *สถานะห้องเปลี่ยนแปลง*
━━━━━━━━━━━━━━━━━━━━━━
🏨 *ห้อง:* ${data.roomNumber}
📊 *สถานะใหม่:* ${data.newStatus}
📝 *หมายเหตุ:* ${data.notes || 'ไม่มี'}
━━━━━━━━━━━━━━━━━━━━━━
⏰ อัพเดทเมื่อ: ${timestamp}`;

      case 'BookingCancelled':
        return `🚫 <b>แจ้งเตือน: ยกเลิกการจอง</b>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 <b>เลขที่การจอง:</b> ${data.bookingId || 'ไม่ระบุ'}
👤 <b>ผู้เข้าพัก:</b> ${data.guestName || 'ไม่ระบุ'}
📱 <b>โทรศัพท์:</b> ${data.guestPhone || 'ไม่ระบุ'}
📧 <b>อีเมล:</b> ${data.guestEmail || 'ไม่ระบุ'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏨 <b>หมายเลขห้อง:</b> ${data.roomNumber || 'ไม่ระบุ'}
🏠 <b>ประเภทห้อง:</b> ${data.roomType || 'ไม่ระบุ'}
📅 <b>วันเข้าพัก:</b> ${data.checkInDate || 'ไม่ระบุ'}
📅 <b>วันออก:</b> ${data.checkOutDate || 'ไม่ระบุ'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 <b>ยอดเงินเดิม:</b> ${data.formattedOriginalAmount || 'ไม่ระบุ'}
💸 <b>ยอดคืน:</b> ${data.formattedRefund || '฿0'}
💳 <b>ค่าปรับ:</b> ${data.formattedPenalty || '฿0'}
📊 <b>ยอดชำระจริง:</b> ${data.formattedTotalPaid || 'ไม่ระบุ'}
📉 <b>รายได้ที่สูญเสีย:</b> ${data.formattedRevenueLoss || '฿0'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 <b>เหตุผลยกเลิก:</b> ${data.cancellationReason || 'ไม่ระบุ'}
👨‍💼 <b>ยกเลิกโดย:</b> ${data.cancelledBy || 'ระบบ'}
📋 <b>หมายเหตุ:</b> ${data.internalNotes || 'ไม่มี'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏱ <b>ระยะเวลาล่วงหน้า:</b> ${data.daysUntilCheckin ? `${data.daysUntilCheckin} วัน` : 'ไม่ระบุ'} ก่อนเข้าพัก
📊 <b>ระยะเวลาจอง:</b> ${data.bookedDaysAgo ? `${data.bookedDaysAgo} วันที่แล้ว` : 'ไม่ระบุ'}
🏨 <b>ระยะเวลาเข้าพัก:</b> ${data.stayDuration ? `${data.stayDuration} คืน` : 'ไม่ระบุ'}
📈 <b>ยกเลิกวันนี้:</b> ${data.todayCancellations ? `${data.todayCancellations} รายการ` : '1 รายการ'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏰ <b>เวลายกเลิก:</b> ${data.formattedTime || timestamp}`;

      default:
        return `🔔 *การแจ้งเตือนใหม่*
━━━━━━━━━━━━━━━━━━━━━━
📋 ประเภท: ${eventType}
⏰ เวลา: ${timestamp}`;
    }
  }

  // 📊 บันทึก notification log
  private async logNotification(
    eventType: string,
    message: string,
    result: {
      line: boolean;
      telegram: boolean;
      error?: string;
      data: any;
    }
  ): Promise<void> {
    try {
      await prisma.notificationLog.create({
        data: {
          eventType,
          message,
          channels: {
            line: result.line,
            telegram: result.telegram
          },
          success: result.line || result.telegram,
          error: result.error || null,
          metadata: result.data,
          sentAt: new Date()
        }
      });
    } catch (error) {
      console.error('❌ Failed to log notification:', error);
    }
  }

  // 🧪 ทดสอบการเชื่อมต่อ
  public async testConnections(): Promise<{line: boolean, telegram: boolean}> {
    const testMessage = `🧪 *Test Notification*
━━━━━━━━━━━━━━━━━━━━━━
✅ ระบบแจ้งเตือนทำงานปกติ
⏰ ${new Date().toLocaleString('th-TH')}`;

    const lineResult = await this.sendLineNotification(testMessage);
    const telegramResult = await this.sendTelegramNotification(testMessage);

    return {
      line: lineResult,
      telegram: telegramResult
    };
  }

  // 📋 Notification Methods สำหรับ events เฉพาะ
  public async notifyPaymentSuccessful(paymentData: any): Promise<boolean> {
    return this.sendNotification('PaymentSuccessful', paymentData);
  }

  public async notifyNewBookingCreated(bookingData: any): Promise<boolean> {
    return this.sendNotification('NewBookingCreated', bookingData);
  }

  public async notifyGuestCheckIn(checkInData: any): Promise<boolean> {
    return this.sendNotification('GuestCheckIn', checkInData);
  }

  public async notifyGuestCheckOut(checkOutData: any): Promise<boolean> {
    return this.sendNotification('GuestCheckOut', checkOutData);
  }

  public async notifyRoomStatusChange(roomData: any): Promise<boolean> {
    return this.sendNotification('RoomStatusChange', roomData);
  }

  public async notifyBookingCancelled(cancellationData: any): Promise<boolean> {
    return this.sendNotification('BookingCancelled', cancellationData);
  }
}

// Export singleton instance
let externalNotificationService: ExternalNotificationService | null = null;

export const getExternalNotificationService = (): ExternalNotificationService => {
  if (!externalNotificationService) {
    externalNotificationService = new ExternalNotificationService();
  }
  return externalNotificationService;
};
