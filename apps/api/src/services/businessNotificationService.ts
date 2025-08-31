import { getNotificationService } from './notificationService';

// ============================================
// BUSINESS LOGIC NOTIFICATION INTEGRATION
// ============================================

const notificationService = getNotificationService();

export class BusinessNotificationService {
  
  // 💰 การแจ้งเตือนเมื่อมีการชำระเงิน
  static async notifyPaymentSuccess(paymentData: {
    paymentId: string;
    bookingId: string;
    amount: number;
    paymentMethod: string;
    transactionTime: string;
    guestName?: string;
  }) {
    try {
      await notificationService.notifyAll('PaymentSuccessful', {
        ...paymentData,
        formattedAmount: `฿${paymentData.amount.toLocaleString()}`
      });
      
      console.log(`✅ Payment notification sent for payment: ${paymentData.paymentId}`);
    } catch (error) {
      console.error('❌ Failed to send payment notification:', error);
    }
  }

  // 🏨 การแจ้งเตือนเมื่อมีการจองใหม่
  static async notifyNewBooking(bookingData: {
    bookingId: string;
    roomNumber: string;
    roomTypeName: string;
    guestName: string;
    checkinDate: string;
    checkoutDate: string;
    totalPrice: number;
    status: string;
  }) {
    try {
      await notificationService.notifyAll('NewBookingCreated', {
        ...bookingData,
        formattedPrice: `฿${bookingData.totalPrice.toLocaleString()}`,
        nights: this.calculateNights(bookingData.checkinDate, bookingData.checkoutDate)
      });
      
      console.log(`✅ New booking notification sent for: ${bookingData.bookingId}`);
    } catch (error) {
      console.error('❌ Failed to send booking notification:', error);
    }
  }

  // 🚪 การแจ้งเตือนเมื่อแขกเช็คอิน
  static async notifyGuestCheckIn(checkinData: {
    bookingId: string;
    guestName: string;
    roomNumber: string;
    checkInTime: string;
    additionalNotes?: string;
  }) {
    try {
      await notificationService.notifyAll('GuestCheckIn', {
        ...checkinData,
        formattedTime: new Date(checkinData.checkInTime).toLocaleString('th-TH')
      });
      
      console.log(`✅ Check-in notification sent for: ${checkinData.bookingId}`);
    } catch (error) {
      console.error('❌ Failed to send check-in notification:', error);
    }
  }

  // 🚪 การแจ้งเตือนเมื่อแขกเช็คเอาท์
  static async notifyGuestCheckOut(checkoutData: {
    bookingId: string;
    guestName: string;
    roomNumber: string;
    checkOutTime: string;
    additionalCharges?: number;
    finalBill?: number;
  }) {
    try {
      await notificationService.notifyAll('GuestCheckOut', {
        ...checkoutData,
        formattedTime: new Date(checkoutData.checkOutTime).toLocaleString('th-TH'),
        formattedCharges: checkoutData.additionalCharges ? `฿${checkoutData.additionalCharges.toLocaleString()}` : '฿0',
        formattedBill: checkoutData.finalBill ? `฿${checkoutData.finalBill.toLocaleString()}` : 'N/A'
      });
      
      console.log(`✅ Check-out notification sent for: ${checkoutData.bookingId}`);
    } catch (error) {
      console.error('❌ Failed to send check-out notification:', error);
    }
  }

  // 🚫 การแจ้งเตือนเมื่อมีการยกเลิกการจอง
  static async notifyBookingCancellation(cancellationData: {
    bookingId: string;
    guestName: string;
    roomNumber: string;
    cancellationReason: string;
    refundAmount?: number;
    cancellationTime: string;
  }) {
    try {
      await notificationService.notifyAll('BookingCancelled', {
        ...cancellationData,
        formattedRefund: cancellationData.refundAmount ? `฿${cancellationData.refundAmount.toLocaleString()}` : '฿0',
        formattedTime: new Date(cancellationData.cancellationTime).toLocaleString('th-TH')
      });
      
      console.log(`✅ Cancellation notification sent for: ${cancellationData.bookingId}`);
    } catch (error) {
      console.error('❌ Failed to send cancellation notification:', error);
    }
  }

  // 🛏️ การแจ้งเตือนเมื่อสถานะห้องเปลี่ยน
  static async notifyRoomStatusChange(roomData: {
    roomId: string;
    roomNumber: string;
    oldStatus: string;
    newStatus: string;
    changedBy?: string;
    notes?: string;
  }) {
    try {
      await notificationService.notifyAll('RoomStatusChange', {
        ...roomData,
        timestamp: new Date().toLocaleString('th-TH')
      });
      
      console.log(`✅ Room status notification sent for room: ${roomData.roomNumber}`);
    } catch (error) {
      console.error('❌ Failed to send room status notification:', error);
    }
  }

  // 🚨 การแจ้งเตือนเหตุการณ์ฉุกเฉิน
  static async notifyEmergencyEvent(emergencyData: {
    eventType: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    location: string;
    description: string;
    reporter?: string;
  }) {
    try {
      await notificationService.notifyAll('EmergencyEvent', {
        ...emergencyData,
        timestamp: new Date().toLocaleString('th-TH'),
        priorityLevel: emergencyData.severity
      });
      
      console.log(`🚨 Emergency notification sent: ${emergencyData.eventType}`);
    } catch (error) {
      console.error('❌ Failed to send emergency notification:', error);
    }
  }

  // 📊 การแจ้งเตือนรายงานประจำวัน
  static async notifyDailyReport(reportData: {
    date: string;
    occupancyRate: number;
    totalRevenue: number;
    checkInsToday: number;
    checkOutsToday: number;
    pendingMaintenance: number;
  }) {
    try {
      await notificationService.notifyAll('DailyReport', {
        ...reportData,
        formattedRevenue: `฿${reportData.totalRevenue.toLocaleString()}`,
        occupancyPercentage: `${reportData.occupancyRate.toFixed(1)}%`,
        reportTime: new Date().toLocaleString('th-TH')
      });
      
      console.log(`📊 Daily report notification sent for: ${reportData.date}`);
    } catch (error) {
      console.error('❌ Failed to send daily report notification:', error);
    }
  }

  // 🔧 Utility Functions
  private static calculateNights(checkinDate: string, checkoutDate: string): number {
    const checkin = new Date(checkinDate);
    const checkout = new Date(checkoutDate);
    const diffTime = Math.abs(checkout.getTime() - checkin.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // 📈 การแจ้งเตือนเมื่อมีการเปลี่ยนแปลงราคา
  static async notifyPriceUpdate(priceData: {
    roomTypeId: string;
    roomTypeName: string;
    oldPrice: number;
    newPrice: number;
    effectiveDate: string;
    updatedBy: string;
  }) {
    try {
      await notificationService.notifyAll('PriceUpdate', {
        ...priceData,
        formattedOldPrice: `฿${priceData.oldPrice.toLocaleString()}`,
        formattedNewPrice: `฿${priceData.newPrice.toLocaleString()}`,
        priceChange: priceData.newPrice - priceData.oldPrice,
        changePercentage: ((priceData.newPrice - priceData.oldPrice) / priceData.oldPrice * 100).toFixed(1)
      });
      
      console.log(`💰 Price update notification sent for: ${priceData.roomTypeName}`);
    } catch (error) {
      console.error('❌ Failed to send price update notification:', error);
    }
  }

  // 🔔 การแจ้งเตือนทั่วไป
  static async notifyGeneral(message: string, priority: 'INFO' | 'WARNING' | 'URGENT' = 'INFO', metadata?: any) {
    try {
      await notificationService.notifyAll('GeneralNotification', {
        message,
        priority,
        timestamp: new Date().toLocaleString('th-TH'),
        metadata
      });
      
      console.log(`🔔 General notification sent: ${message}`);
    } catch (error) {
      console.error('❌ Failed to send general notification:', error);
    }
  }
}

export default BusinessNotificationService;
