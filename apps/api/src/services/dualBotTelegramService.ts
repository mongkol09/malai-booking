import { Telegraf } from 'telegraf';

/**
 * Dual Bot Telegram Service
 * แยกการส่งข้อความระหว่าง Executive Level และ Operational Level
 */

interface BotConfig {
  token: string;
  chatId: string;
  level: 'executive' | 'operational';
  notifications: string[];
}

interface ExecutiveNotification {
  type: 'booking' | 'payment' | 'revenue' | 'cancellation';
  data: {
    bookingId: string;
    customerName: string;
    totalAmount: number;
    paymentStatus: string;
    roomType: string;
    dates: { checkIn: Date; checkOut: Date };
    contactInfo: { email: string; phone: string };
    specialRequests?: string;
  };
}

interface OperationalNotification {
  type: 'housekeeping' | 'checkin' | 'checkout' | 'room_status';
  data: {
    roomNumber: string;
    guestName: string; // First name only for privacy
    action: string;
    time: Date;
    priority: 'high' | 'medium' | 'normal';
    specialNotes?: string;
    roomType?: string;
  };
}

export class DualBotTelegramService {
  private ceoBot: Telegraf;
  private staffBot: Telegraf;
  private ceoChatId: string;
  private staffChatId: string;

  constructor() {
    // CEO Bot configuration
    const ceoToken = process.env.TELEGRAM_BOT_TOKEN || '8090902784:AAHqVuSWGscl_CSG2ojmqF5A7NMmUFxAEA8';
    this.ceoChatId = process.env.TELEGRAM_CHAT_ID || '-1002579208700';
    this.ceoBot = new Telegraf(ceoToken);

    // Staff Bot configuration
    const staffToken = process.env.STAFF_TELEGRAM_BOT_TOKEN || '8236751083:AAGOS9YE_VdOo-mBQ3cMQ9dr1DYRXdzbNgI';
    this.staffChatId = process.env.STAFF_TELEGRAM_CHAT_ID || '-1002926114573';
    this.staffBot = new Telegraf(staffToken);

    console.log('🤖 Dual Bot Service initialized with Telegraf:');
    console.log(`   👔 CEO Bot: ${this.ceoChatId}`);
    console.log(`   🏨 Staff Bot: ${this.staffChatId}`);
  }

  /**
   * ส่งข้อความไปยัง CEO Bot (Executive Level)
   */
  async sendExecutiveNotification(notification: ExecutiveNotification): Promise<boolean> {
    try {
      console.log('📊 Sending executive notification:', notification.type);
      
      const message = this.formatExecutiveMessage(notification);
      return await this.sendTelegramMessage(this.ceoBot, this.ceoChatId, message, 'executive');
      
    } catch (error) {
      console.error('❌ Executive notification failed:', error);
      return false;
    }
  }

  /**
   * ส่งข้อความไปยัง Staff Bot (Operational Level)
   */
  async sendOperationalNotification(notification: OperationalNotification): Promise<boolean> {
    try {
      console.log('🏨 Sending operational notification:', notification.type);
      
      const message = this.formatOperationalMessage(notification);
      return await this.sendTelegramMessage(this.staffBot, this.staffChatId, message, 'operational');
      
    } catch (error) {
      console.error('❌ Operational notification failed:', error);
      return false;
    }
  }

  /**
   * ส่งการจองใหม่ไปทั้งสอง Bot (ข้อมูลต่างกัน)
   */
  async sendBookingNotification(bookingData: any): Promise<{ ceo: boolean; staff: boolean }> {
    const results = { ceo: false, staff: false };

    try {
      // ส่งไปยัง CEO Bot (ข้อมูลครบถ้วน)
      const executiveNotification: ExecutiveNotification = {
        type: 'booking',
        data: {
          bookingId: bookingData.bookingReferenceId || bookingData.id,
          customerName: bookingData.customerName || `${bookingData.firstName} ${bookingData.lastName}`,
          totalAmount: parseFloat(bookingData.totalPrice || bookingData.totalAmount || '0'),
          paymentStatus: bookingData.paymentStatus || 'รอการยืนยัน',
          roomType: bookingData.roomType || bookingData.roomTypeName,
          dates: {
            checkIn: new Date(bookingData.checkIn || bookingData.checkInDate),
            checkOut: new Date(bookingData.checkOut || bookingData.checkOutDate)
          },
          contactInfo: {
            email: bookingData.email || bookingData.guestEmail || 'ไม่ระบุ',
            phone: bookingData.phone || bookingData.phoneNumber || bookingData.guestPhone || 'ไม่ระบุ'
          },
          specialRequests: bookingData.specialRequests || bookingData.notes
        }
      };

      results.ceo = await this.sendExecutiveNotification(executiveNotification);

      // ส่งไปยัง Staff Bot (ข้อมูลพื้นฐาน)
      const guestFirstName = bookingData.customerName?.split(' ')[0] || 
                            bookingData.firstName || 
                            bookingData.guestName?.split(' ')[0] || 
                            'ลูกค้า';

      const operationalNotification: OperationalNotification = {
        type: 'checkout', // Will be 'checkin' when appropriate
        data: {
          roomNumber: bookingData.roomNumber || 'TBA',
          guestName: `คุณ${guestFirstName}`,
          action: 'การจองใหม่',
          time: new Date(),
          priority: bookingData.vip ? 'high' : 'normal',
          specialNotes: bookingData.specialRequests ? 'มีความต้องการพิเศษ' : undefined,
          roomType: bookingData.roomType || bookingData.roomTypeName
        }
      };

      results.staff = await this.sendOperationalNotification(operationalNotification);

    } catch (error) {
      console.error('❌ Booking notification failed:', error);
    }

    return results;
  }

  /**
   * ส่งแจ้งเตือนทำความสะอาดห้อง (Staff Bot เท่านั้น)
   */
  async sendHousekeepingNotification(data: {
    roomNumber: string;
    roomType: string;
    guestName: string;
    checkOutTime: string;
    priority: 'high' | 'medium' | 'normal';
    specialInstructions?: string;
  }): Promise<boolean> {
    const notification: OperationalNotification = {
      type: 'housekeeping',
      data: {
        roomNumber: data.roomNumber,
        guestName: data.guestName.split(' ')[0] || 'ลูกค้า', // First name only
        action: 'ทำความสะอาด',
        time: new Date(),
        priority: data.priority,
        specialNotes: data.specialInstructions,
        roomType: data.roomType
      }
    };

    return await this.sendOperationalNotification(notification);
  }

  /**
   * ส่งแจ้งเตือน Check-in (Staff Bot เท่านั้น)
   */
  async sendCheckInNotification(data: {
    roomNumber: string;
    roomType: string;
    guestName: string;
    checkInTime: string;
    vip: boolean;
    specialRequests?: string;
  }): Promise<boolean> {
    const notification: OperationalNotification = {
      type: 'checkin',
      data: {
        roomNumber: data.roomNumber,
        guestName: data.guestName.split(' ')[0] || 'ลูกค้า', // First name only
        action: 'เข้าพัก',
        time: new Date(),
        priority: data.vip ? 'high' : 'normal',
        specialNotes: data.specialRequests,
        roomType: data.roomType
      }
    };

    return await this.sendOperationalNotification(notification);
  }

  /**
   * Format ข้อความสำหรับ Executive Level
   */
  private formatExecutiveMessage(notification: ExecutiveNotification): string {
    const { type, data } = notification;

    switch (type) {
      case 'booking':
        return `
🏨 *MALAI RESORT - การจองใหม่!*

🆕 *การจองสำเร็จ*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 *รายละเอียดการจอง:*
🔖 *หมายเลขการจอง:* #${data.bookingId}
👤 *ชื่อผู้จอง:* ${data.customerName}
📧 *อีเมล:* ${data.contactInfo.email}
📱 *เบอร์โทรศัพท์:* ${data.contactInfo.phone}

📅 *วันที่เข้าพัก:* ${data.dates.checkIn.toLocaleDateString('th-TH')}
📅 *วันที่ออก:* ${data.dates.checkOut.toLocaleDateString('th-TH')}
🏠 *ประเภทห้อง:* ${data.roomType}

💰 *ราคารวม:* ฿${data.totalAmount.toLocaleString('th-TH')}
💳 *สถานะการชำระ:* ${data.paymentStatus}

${data.specialRequests ? `📝 *หมายเหตุ:* ${data.specialRequests}\n` : ''}
⏰ *เวลาที่จอง:* ${new Date().toLocaleString('th-TH')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ *สถานะ:* การจองได้รับการยืนยันแล้ว
🔔 *การแจ้งเตือน:* Executive Level Notification
        `.trim();

      default:
        return `📊 Executive Notification: ${type}`;
    }
  }

  /**
   * Format ข้อความสำหรับ Operational Level
   */
  private formatOperationalMessage(notification: OperationalNotification): string {
    const { type, data } = notification;
    const priorityEmoji = data.priority === 'high' ? '🔴' : data.priority === 'medium' ? '🟡' : '🟢';
    const timestamp = data.time.toLocaleString('th-TH');

    switch (type) {
      case 'housekeeping':
        return `
🧹 *แจ้งเตือนทำความสะอาดห้อง*

${priorityEmoji} *ห้อง: ${data.roomNumber}*
🏠 ประเภทห้อง: ${data.roomType || 'Standard'}
👤 ลูกค้า: ${data.guestName}
🚪 เช็คเอาท์: ${timestamp.split(' ')[1]}
⏰ เวลาแจ้งเตือน: ${timestamp}
📊 ระดับความสำคัญ: ${data.priority === 'high' ? 'สูง' : data.priority === 'medium' ? 'ปานกลาง' : 'ปกติ'}

${data.specialNotes ? `📝 *คำแนะนำพิเศษ:*\n${data.specialNotes}\n` : ''}
✅ กรุณาทำความสะอาดห้องและอัปเดตสถานะเมื่อเสร็จสิ้น

#RoomCleaning #Room${data.roomNumber} #${data.priority}Priority
        `.trim();

      case 'checkin':
        return `
🏨 *แจ้งเตือนลูกค้าเข้าพัก*

${priorityEmoji} *ห้อง: ${data.roomNumber}*
👤 ลูกค้า: ${data.guestName}
🏠 ประเภทห้อง: ${data.roomType || 'Standard'}
⏰ เช็คอิน: ${timestamp.split(' ')[1]}
📊 ระดับความสำคัญ: ${data.priority === 'high' ? 'VIP' : 'ปกติ'}

${data.specialNotes ? `📝 *ความต้องการพิเศษ:*\n${data.specialNotes}\n` : ''}
✅ พร้อมต้อนรับลูกค้า
🔑 เตรียมกุญแจห้องและอุปกรณ์

#CheckIn #Room${data.roomNumber} #WelcomeGuest
        `.trim();

      case 'checkout':
        return `
📋 *การจองใหม่ - เตรียมความพร้อม*

🏠 *ห้อง:* ${data.roomNumber}
👤 *ลูกค้า:* ${data.guestName}
📝 *การดำเนินการ:* ${data.action}
⏰ *เวลา:* ${timestamp}
${data.specialNotes ? `📋 *หมายเหตุ:* ${data.specialNotes}\n` : ''}
#NewBooking #Room${data.roomNumber}
        `.trim();

      default:
        return `🏨 Operational Notification: ${type} - Room ${data.roomNumber}`;
    }
  }

  /**
   * ส่งข้อความผ่าน Telegram API
   */
  private async sendTelegramMessage(bot: Telegraf, chatId: string, message: string, level: string): Promise<boolean> {
    try {
      await bot.telegram.sendMessage(chatId, message, {
        parse_mode: 'Markdown'
        // disable_web_page_preview: true // Not available in Telegraf
      });

      console.log(`✅ ${level} notification sent successfully`);
      return true;

    } catch (error) {
      console.error(`❌ ${level} Telegram API error:`, error);
      return false;
    }
  }

  /**
   * ทดสอบการเชื่อมต่อทั้งสอง Bot
   */
  async testBothBots(): Promise<{ ceo: boolean; staff: boolean }> {
    const results = { ceo: false, staff: false };

    try {
      // Test CEO Bot
      const ceoTestMessage = `🔧 *Bot Test - Executive Level*\n\nTesting CEO Bot connection...\n⏰ ${new Date().toLocaleString('th-TH')}`;
      results.ceo = await this.sendTelegramMessage(this.ceoBot, this.ceoChatId, ceoTestMessage, 'executive');

      // Test Staff Bot  
      const staffTestMessage = `🔧 *Bot Test - Operational Level*\n\nTesting Staff Bot connection...\n⏰ ${new Date().toLocaleString('th-TH')}`;
      results.staff = await this.sendTelegramMessage(this.staffBot, this.staffChatId, staffTestMessage, 'operational');

    } catch (error) {
      console.error('❌ Bot testing failed:', error);
    }

    return results;
  }

  /**
   * รับสถานะการกำหนดค่า Bot
   */
  getBotStatus(): { ceo: any; staff: any } {
    return {
      ceo: {
        configured: !!(process.env.TELEGRAM_BOT_TOKEN && this.ceoChatId),
        token: process.env.TELEGRAM_BOT_TOKEN ? '✅ Configured' : '❌ Missing',
        chatId: this.ceoChatId ? '✅ Configured' : '❌ Missing',
        level: 'executive'
      },
      staff: {
        configured: !!(process.env.STAFF_TELEGRAM_BOT_TOKEN && this.staffChatId),
        token: process.env.STAFF_TELEGRAM_BOT_TOKEN ? '✅ Configured' : '❌ Missing', 
        chatId: this.staffChatId ? '✅ Configured' : '❌ Missing',
        level: 'operational'
      }
    };
  }
}
