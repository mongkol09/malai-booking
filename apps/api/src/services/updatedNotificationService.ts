import { getWebSocketService } from './websocketService';
import { UpdatedExternalNotificationService } from './updatedExternalNotificationService';

// ============================================
// UPDATED CENTRAL NOTIFICATION SERVICE 
// ============================================
// Removed: LINE Notify support
// Added: Discord, Slack, Teams, enhanced logging

export class UpdatedNotificationService {
  private webSocketService = getWebSocketService();
  private externalService = new UpdatedExternalNotificationService();

  // 🔔 ส่งการแจ้งเตือนไปทุกช่องทาง
  public async notifyAll(eventType: string, data: any, options?: {
    skipWebSocket?: boolean;
    skipExternal?: boolean;
    targetRoles?: string[];
  }) {
    const results = {
      webSocket: false,
      external: {},
      timestamp: new Date().toISOString(),
      external_detailed: {}
    };

    try {
      // ส่งไป Admin Dashboard ผ่าน WebSocket
      if (!options?.skipWebSocket && this.webSocketService) {
        try {
          this.webSocketService.notifyAdmins(
            eventType, 
            data, 
            options?.targetRoles || ['ADMIN', 'STAFF']
          );
          results.webSocket = true;
          console.log(`✅ WebSocket notification sent for event: ${eventType}`);
        } catch (wsError) {
          console.error('❌ WebSocket notification failed:', wsError);
          results.webSocket = false;
        }
      }

      // ส่งไป External channels (Telegram, Discord, Slack, Teams)
      if (!options?.skipExternal && this.externalService) {
        try {
          const message = this.formatMessage(eventType, data);
          const externalResults = await this.externalService.sendToAllChannels(message, eventType);
          
          results.external = externalResults;
          results.external_detailed = externalResults;
          
          const successCount = Object.values(externalResults).filter(r => r === true).length;
          const totalChannels = Object.keys(externalResults).length;
          
          console.log(`✅ External notifications: ${successCount}/${totalChannels} channels successful`);
        } catch (extError) {
          console.error('❌ External notification failed:', extError);
          results.external = false;
        }
      }

    } catch (error) {
      console.error('❌ Notification service error:', error);
    }

    return results;
  }

  // 📝 จัดรูปแบบข้อความสำหรับแต่ละ event
  private formatMessage(eventType: string, data: any): string {
    const formatters: { [key: string]: (data: any) => string } = {
      
      PaymentSuccessful: (data) => 
        `💰 การชำระเงินสำเร็จ!\n` +
        `📋 Booking: ${data.bookingId}\n` +
        `💵 จำนวน: ${data.formattedAmount || `฿${data.amount?.toLocaleString()}`}\n` +
        `👤 ผู้จอง: ${data.guestName || 'N/A'}\n` +
        `💳 วิธีชำระ: ${data.paymentMethod}`,

      NewBookingCreated: (data) => 
        `🏨 การจองใหม่!\n` +
        `📋 Booking: ${data.bookingId}\n` +
        `👤 ผู้จอง: ${data.guestName}\n` +
        `🛏️ ห้อง: ${data.roomNumber} (${data.roomTypeName})\n` +
        `📅 เช็คอิน: ${data.checkinDate}\n` +
        `📅 เช็คเอาท์: ${data.checkoutDate}\n` +
        `💰 ราคา: ${data.formattedPrice || `฿${data.totalPrice?.toLocaleString()}`}\n` +
        `📊 สถานะ: ${data.status}`,

      GuestCheckIn: (data) => 
        `🏨 **แจ้งเตือน: ผู้เข้าพักเช็คอิน**\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `👤 **ผู้เข้าพัก:** ${data.guestName || 'ไม่ระบุ'}\n` +
        `🏨 **หมายเลขห้อง:** ${data.roomNumber || 'ไม่ระบุ'}\n` +
        `📋 **เลขที่การจอง:** ${data.bookingId || data.bookingReferenceId || 'ไม่ระบุ'}\n` +
        `📱 **โทรศัพท์:** ${data.phoneNumber || 'ไม่ระบุ'}\n` +
        `📧 **อีเมล:** ${data.email || 'ไม่ระบุ'}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `📅 **วันที่เช็คอิน:** ${data.checkinDate || 'วันนี้'}\n` +
        `📅 **วันที่เช็คเอาท์:** ${data.checkoutDate || 'ไม่ระบุ'}\n` +
        `👥 **จำนวนผู้เข้าพัก:** ${data.guestCount || data.adults || 1} คน\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `💰 **ยอดรวม:** ${data.totalAmount?.toLocaleString() || data.finalAmount?.toLocaleString() || 'ไม่ระบุ'} บาท\n` +
        `💳 **สถานะการชำระ:** ${data.paymentStatus || 'ไม่ระบุ'}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `⏰ **เวลาเช็คอิน:** ${data.formattedTime || data.checkInTime || new Date().toLocaleString('th-TH')}\n` +
        `👨‍💼 **ดำเนินการโดย:** ${data.checkedInBy || 'ระบบ'}`,

      GuestCheckOut: (data) => 
        `👋 แขกเช็คเอาท์!\n` +
        `📋 Booking: ${data.bookingId}\n` +
        `👤 ผู้เข้าพัก: ${data.guestName}\n` +
        `🛏️ ห้อง: ${data.roomNumber}\n` +
        `⏰ เวลาเช็คเอาท์: ${data.formattedTime || data.checkOutTime}\n` +
        `💰 ค่าใช้จ่ายเพิ่มเติม: ${data.formattedCharges || `฿${data.additionalCharges || 0}`}`,

      BookingCancelled: (data) => 
        `❌ ยกเลิกการจอง!\n` +
        `📋 Booking: ${data.bookingId}\n` +
        `👤 ผู้จอง: ${data.guestName}\n` +
        `🛏️ ห้อง: ${data.roomNumber}\n` +
        `📝 เหตุผล: ${data.reason || data.cancellationReason}\n` +
        `💸 เงินคืน: ${data.formattedRefund || `฿${data.refundAmount || 0}`}`,

      RoomStatusChange: (data) => 
        `🛏️ เปลี่ยนสถานะห้อง!\n` +
        `🚪 ห้อง: ${data.roomNumber}\n` +
        `🔄 สถานะ: ${data.oldStatus} → ${data.newStatus}\n` +
        `📝 หมายเหตุ: ${data.notes || 'ไม่มี'}`,

      MaintenanceRequired: (data) => 
        `🔧 ต้องการบำรุงรักษา!\n` +
        `🚪 ห้อง: ${data.roomNumber}\n` +
        `⚠️ ปัญหา: ${data.issue}\n` +
        `🚨 ความเร่งด่วน: ${data.priority}`,

      SystemAlert: (data) => 
        `🚨 แจ้งเตือนระบบ!\n` +
        `📊 ประเภท: ${data.alertType}\n` +
        `⚠️ ระดับ: ${data.severity}\n` +
        `📝 ข้อความ: ${data.message}`,

      DailyReport: (data) => 
        `📊 รายงานประจำวัน!\n` +
        `📅 วันที่: ${data.date}\n` +
        `💰 รายได้: ${data.formattedRevenue || `฿${data.totalRevenue?.toLocaleString()}`}\n` +
        `🏨 อัตราเข้าพัก: ${data.occupancyPercentage || `${data.occupancyRate}%`}\n` +
        `🚪 เช็คอิน: ${data.checkInsToday} ราย\n` +
        `👋 เช็คเอาท์: ${data.checkOutsToday} ราย`,

      SystemTest: (data) => 
        `🧪 ทดสอบระบบแจ้งเตือน!\n` +
        `✅ ระบบทำงานปกติ\n` +
        `🔄 LINE Notify ถูกแทนที่ด้วยระบบใหม่\n` +
        `📱 ช่องทาง: Telegram, Discord, Slack, Teams\n` +
        `⏰ เวลา: ${new Date().toLocaleString('th-TH')}`
    };

    const formatter = formatters[eventType];
    if (formatter) {
      return formatter(data);
    }

    // Default format for unknown events
    return `🔔 เหตุการณ์: ${eventType}\n📋 ข้อมูล: ${JSON.stringify(data, null, 2)}`;
  }

  // 🧪 ทดสอบระบบแจ้งเตือน
  public async testNotificationSystem(): Promise<any> {
    console.log('🧪 Testing updated notification system...');
    
    const testResults = {
      webSocket: false,
      external: {},
      webSocketConnections: 0,
      channels_status: {}
    };

    try {
      // Test WebSocket
      if (this.webSocketService) {
        try {
          this.webSocketService.notifyAdmins('SystemTest', {
            message: 'WebSocket test notification'
          });
          testResults.webSocket = true;
          testResults.webSocketConnections = this.webSocketService.getConnectedAdminCount();
        } catch (error) {
          console.error('❌ WebSocket test failed:', error);
        }
      }

      // Test External services
      const externalResults = await this.externalService.testAllChannels();
      testResults.external = externalResults;
      testResults.channels_status = this.externalService.getChannelStatus();

      console.log('✅ Notification system test completed');
      return testResults;

    } catch (error) {
      console.error('❌ Notification system test failed:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // 📊 สถิติการแจ้งเตือน
  public getNotificationStats() {
    const stats = {
      connectedAdmins: this.webSocketService?.getConnectedAdminCount() || 0,
      connectedAdminsList: this.webSocketService?.getConnectedAdmins() || [],
      services: {
        websocket: !!this.webSocketService,
        telegram: !!(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID),
        discord: !!process.env.DISCORD_WEBHOOK_URL,
        slack: !!process.env.SLACK_WEBHOOK_URL,
        teams: !!process.env.TEAMS_WEBHOOK_URL,
        line_notify: false // Discontinued
      },
      lastUpdate: new Date().toISOString()
    };

    return stats;
  }

  // 🔧 ส่วนช่วยเหลือสำหรับการใช้งาน
  public getAvailableEventTypes(): string[] {
    return [
      'PaymentSuccessful',
      'NewBookingCreated', 
      'GuestCheckIn',
      'GuestCheckOut',
      'BookingCancelled',
      'RoomStatusChange',
      'MaintenanceRequired',
      'SystemAlert',
      'DailyReport',
      'SystemTest'
    ];
  }
}

// Singleton instance
let notificationServiceInstance: UpdatedNotificationService | null = null;

export const getUpdatedNotificationService = (): UpdatedNotificationService => {
  if (!notificationServiceInstance) {
    notificationServiceInstance = new UpdatedNotificationService();
  }
  return notificationServiceInstance;
};

export default UpdatedNotificationService;
