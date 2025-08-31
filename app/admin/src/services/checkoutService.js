import { apiService } from './apiService';
import bookingService from './bookingService';

class CheckoutService {
  
  /**
   * Get booking details for checkout including check-in data
   */
  async getBookingForCheckout(bookingId) {
    try {
      console.log(`🏨 Getting booking for checkout: ${bookingId}`);
      
      // ใช้ bookingService.getBookingById แทน
      const response = await bookingService.getBookingById(bookingId);
      
      // รวมข้อมูล check-in หากมี
      const checkinData = this.getStoredCheckinData(bookingId);
      
      if (response && checkinData) {
        response.checkinDetails = checkinData;
      }
      
      return response;
    } catch (error) {
      console.error(`❌ Failed to get booking for checkout ${bookingId}:`, error);
      throw error;
    }
  }

  /**
   * Get stored check-in data from localStorage
   */
  getStoredCheckinData(bookingId) {
    try {
      const stored = localStorage.getItem(`checkin_${bookingId}`);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error getting stored check-in data:', error);
      return null;
    }
  }

  /**
   * Get booking by room number for checkout
   */
  async getActiveBookingByRoom(roomNumber) {
    try {
      console.log(`🏨 Getting active booking by room: ${roomNumber}`);
      const response = await apiService.get(`/bookings/admin/bookings/active`, {
        params: { roomNumber }
      });
      
      // ดึงข้อมูล booking จาก response
      const bookingData = response?.data?.activeBooking;
      if (bookingData) {
        // ดึงข้อมูลครบถ้วนของ booking
        const fullBooking = await this.getBookingForCheckout(bookingData.id);
        return fullBooking;
      }
      
      throw new Error('No active booking found for this room');
    } catch (error) {
      console.error(`❌ Failed to get active booking by room ${roomNumber}:`, error);
      throw error;
    }
  }

  /**
   * Calculate checkout bill with taxes and charges (Thailand VAT system)
   */
  calculateCheckoutBill(booking) {
    try {
      const baseAmount = parseFloat(booking.totalPrice || 0);
      const discountAmount = parseFloat(booking.discountAmount || 0);
      
      // ระบบภาษีประเทศไทย
      const VAT_RATE = 0.07; // VAT 7%
      
      const subtotal = baseAmount - discountAmount;
      
      // คำนวณ VAT
      const vatAmount = subtotal * VAT_RATE;
      const totalTaxAmount = vatAmount;
      
      const netPayableAmount = subtotal + totalTaxAmount;
      
      // คำนวณค่าใช้จ่ายเพิ่มเติม (Service charges)
      const serviceCharges = booking.bookingServices?.reduce((sum, service) => {
        return sum + parseFloat(service.price || 0);
      }, 0) || 0;

      const finalAmount = netPayableAmount + serviceCharges;

      return {
        baseAmount,
        discountAmount,
        subtotal,
        vatAmount,
        totalTaxAmount,
        serviceCharges,
        netPayableAmount,
        finalAmount,
        advanceAmount: booking.payments?.reduce((sum, payment) => {
          return payment.status === 'SUCCEEDED' ? sum + parseFloat(payment.amount) : sum;
        }, 0) || 0
      };
    } catch (error) {
      console.error('❌ Failed to calculate checkout bill:', error);
      throw error;
    }
  }

  /**
   * Process checkout with check-in data integration
   */
  async processCheckout(bookingId, checkoutData) {
    try {
      console.log(`🏨 Processing checkout for booking: ${bookingId}`);
      
      // Get check-in data to include in checkout
      const checkinData = this.getStoredCheckinData(bookingId);
      
      const enhancedCheckoutData = {
        ...checkoutData,
        checkinReference: checkinData ? {
          checkinTime: checkinData.checkinTime,
          checkoutTime: new Date().toISOString(),
          totalStayDuration: checkinData.checkinTime ? 
            this.calculateStayDuration(checkinData.checkinTime, new Date().toISOString()) : null,
          originalCheckinData: checkinData.checkinData
        } : null
      };
      
      // ใช้ bookingService.processCheckOut แทน
      const response = await bookingService.processCheckOut(bookingId, enhancedCheckoutData);
      
      // ลบข้อมูล check-in ที่เก็บไว้หลังจาก check-out สำเร็จ
      if (response && response.success) {
        localStorage.removeItem(`checkin_${bookingId}`);
      }
      
      return response;
    } catch (error) {
      console.error(`❌ Failed to process checkout ${bookingId}:`, error);
      throw error;
    }
  }

  /**
   * Calculate stay duration in hours and days
   */
  calculateStayDuration(checkinTime, checkoutTime) {
    const checkin = new Date(checkinTime);
    const checkout = new Date(checkoutTime);
    const durationMs = checkout - checkin;
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    
    return {
      totalHours: hours,
      days: days,
      hours: remainingHours,
      formatted: `${days} วัน ${remainingHours} ชั่วโมง`
    };
  }

  /**
   * Get available rooms for checkout dropdown
   */
  async getOccupiedRooms() {
    try {
      console.log('🏨 Getting occupied rooms');
      // ใช้ mock data สำหรับการทดสอบ
      const mockRooms = [
        { roomNumber: 'A1', roomType: 'Standard Room', status: 'occupied' },
        { roomNumber: 'B2', roomType: 'Deluxe Suite', status: 'occupied' }
      ];
      
      console.log('✅ Using mock occupied rooms:', mockRooms);
      return mockRooms;
    } catch (error) {
      console.error('❌ Failed to get occupied rooms:', error);
      throw error;
    }
  }
}

export default new CheckoutService();
