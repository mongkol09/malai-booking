import { getWebSocketService } from './websocketService';
import { getExternalNotificationService } from './externalNotificationService';

// 🎯 Central Notification Service - จัดการการแจ้งเตือนทุกช่องทาง
export class NotificationService {
  private webSocketService = getWebSocketService();
  private externalService = getExternalNotificationService();

  // 🔔 ส่งการแจ้งเตือนไปทุกช่องทาง (WebSocket + LINE + Telegram)
  public async notifyAll(eventType: string, data: any, options?: {
    skipWebSocket?: boolean;
    skipExternal?: boolean;
    targetRoles?: string[];
  }) {
    console.log('🚀 NotificationService.notifyAll started');
    console.log('  - eventType:', eventType);
    console.log('  - data:', JSON.stringify(data, null, 2));
    console.log('  - options:', options);

    const results = {
      webSocket: false,
      external: false,
      timestamp: new Date().toISOString()
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
        } catch (error) {
          console.error('❌ WebSocket notification failed:', error);
        }
      }

      // ส่งไป LINE/Telegram
      if (!options?.skipExternal) {
        try {
          results.external = await this.externalService.sendNotification(eventType, data);
        } catch (error) {
          console.error('❌ External notification failed:', error);
        }
      }

      console.log(`📢 Notification sent [${eventType}]: WebSocket(${results.webSocket}) External(${results.external})`);
      
    } catch (error) {
      console.error('❌ Central notification failed:', error);
    }

    return results;
  }

  // 💳 การชำระเงินสำเร็จ
  public async notifyPaymentSuccessful(paymentData: {
    paymentId: string;
    bookingId: string;
    amount: number;
    paymentMethod: string;
    transactionTime: string;
  }) {
    return this.notifyAll('PaymentSuccessful', paymentData);
  }

  // 🏨 การจองใหม่
  public async notifyNewBookingCreated(bookingData: {
    bookingId: string;
    roomNumber: string;
    roomTypeName: string;
    guestName: string;
    checkinDate: string;
    checkoutDate: string;
    totalPrice: number;
    newStatus: string;
  }) {
    return this.notifyAll('NewBookingCreated', bookingData);
  }

  // 🚪 เช็คอิน
  public async notifyGuestCheckIn(checkInData: {
    bookingId: string;
    guestName: string;
    roomNumber: string;
    checkInTime: string;
  }) {
    console.log('🔔 NotificationService.notifyGuestCheckIn called with data:', JSON.stringify(checkInData, null, 2));
    const result = await this.notifyAll('GuestCheckIn', checkInData);
    console.log('📢 NotificationService.notifyGuestCheckIn result:', result);
    return result;
  }

  // 🛎️ เช็คเอาท์
  public async notifyGuestCheckOut(checkOutData: {
    bookingId: string;
    guestName: string;
    roomNumber: string;
    checkOutTime: string;
    additionalCharges?: number;
  }) {
    return this.notifyAll('GuestCheckOut', checkOutData);
  }

  // 🏠 สถานะห้องเปลี่ยน
  public async notifyRoomStatusChange(roomData: {
    roomId: string;
    roomNumber: string;
    oldStatus: string;
    newStatus: string;
    notes?: string;
  }) {
    return this.notifyAll('RoomStatusChange', roomData);
  }

  // 🧪 ทดสอบระบบแจ้งเตือน
  public async testNotificationSystem() {
    const testData = {
      testId: `test_${Date.now()}`,
      message: 'ทดสอบระบบแจ้งเตือน',
      timestamp: new Date().toISOString()
    };

    const results = await this.notifyAll('SystemTest', testData);
    
    // ทดสอบ external connections แยก
    const externalTest = await this.externalService.testConnections();
    
    return {
      ...results,
      external_detailed: externalTest,
      webSocketConnections: this.webSocketService?.getConnectedAdminsCount() || 0
    };
  }

  // 📊 สถิติการแจ้งเตือน
  public getNotificationStats() {
    return {
      connectedAdmins: this.webSocketService?.getConnectedAdminsCount() || 0,
      connectedAdminsList: this.webSocketService?.getConnectedAdmins() || [],
      services: {
        webSocket: !!this.webSocketService,
        external: !!this.externalService
      }
    };
  }
}

// Export singleton instance
let notificationService: NotificationService | null = null;

export const getNotificationService = (): NotificationService => {
  if (!notificationService) {
    notificationService = new NotificationService();
  }
  return notificationService;
};
