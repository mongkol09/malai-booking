/**
 * Professional Check-in Service
 * เชื่อมต่อกับ Real API สำหรับ Professional Check-in Dashboard
 * พร้อมระบบ authentication ที่ปลอดภัย
 */

import authTokenService from './authTokenService';

const API_BASE = 'http://localhost:3001/api/v1';
const API_KEY = 'hotel-booking-api-key-2024';

class ProfessionalCheckinService {
  
  /**
   * ดึงรายการ bookings วันนี้ที่ต้อง check-in
   */
  async getTodaysArrivals(date = null, includeTomorrow = false) {
    try {
      console.log('📅 Fetching today\'s arrivals...');
      
      // ใช้วันที่ที่ระบุ หรือวันนี้
      const targetDate = date || new Date().toISOString().split('T')[0];
      
      console.log(`📅 Checking arrivals for: ${targetDate}`);
      
      // ✅ ใช้ checkin/bookings API แค่ครั้งเดียว
      const response = await authTokenService.authenticatedRequest(`${API_BASE}/checkin/bookings?date=${targetDate}`, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      let allArrivals = result.data || [];
      
      // เรียก tomorrow เฉพาะเมื่อจำเป็น
      if (includeTomorrow) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        
        console.log(`📅 Also fetching tomorrow: ${tomorrowStr}`);
        
        const tomorrowResponse = await authTokenService.authenticatedRequest(`${API_BASE}/checkin/bookings?date=${tomorrowStr}`, {
          method: 'GET'
        });
        
        const tomorrowResult = tomorrowResponse.ok ? await tomorrowResponse.json() : { data: [] };
        
        // รวม today + tomorrow
        allArrivals = [
          ...allArrivals,
          ...(tomorrowResult.data || [])
        ];
      }
      
      console.log('✅ Today\'s arrivals fetched:', allArrivals.length, 'bookings');
      
      return {
        success: true,
        data: allArrivals,
        count: allArrivals.length
      };

    } catch (error) {
      console.error('❌ Error fetching today\'s arrivals:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * ดึงรายการ bookings วันนี้ที่ต้อง check-out  
   */
  async getTodaysDepartures() {
    try {
      console.log('📅 Fetching today\'s departures...');
      
      // ใช้ authenticated request
      const response = await authTokenService.authenticatedRequest(`${API_BASE}/bookings/departures`, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Today\'s departures fetched:', result.data?.length || 0, 'bookings');
      
      return {
        success: true,
        data: result.data || [],
        count: result.data?.length || 0
      };

    } catch (error) {
      console.error('❌ Error fetching today\'s departures:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * ดึงรายการ active bookings (กำลังพักอยู่)
   */
  async getActiveBookings() {
    try {
      console.log('🏨 Fetching active bookings...');
      
      // ✅ ใช้ checkin/bookings API แทน (มีข้อมูลครบถ้วน)
      const response = await authTokenService.authenticatedRequest(`${API_BASE}/checkin/bookings`, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Active bookings fetched:', result.data?.length || 0, 'bookings');
      
      return {
        success: true,
        data: result.data || [],
        count: result.data?.length || 0
      };

    } catch (error) {
      console.error('❌ Error fetching active bookings:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * Process Check-in
   */
  async processCheckIn(bookingId, checkInData = {}) {
    console.log('🎯 ===== PROFESSIONAL CHECKIN SERVICE =====');
    console.log('📋 Input parameters:');
    console.log('  - bookingId:', bookingId);
    console.log('  - checkInData:', checkInData);
    console.log('🌐 API Configuration:');
    console.log('  - API_BASE:', API_BASE);
    console.log('  - API_KEY:', API_KEY ? 'Present' : 'Missing');
    console.log('  - Full endpoint:', `${API_BASE}/bookings/admin/${bookingId}/check-in`);
    
    try {
      console.log('🚀 Starting API call...');
      
      const payload = {
        checkinTime: new Date().toISOString(),
        notes: checkInData.notes || '',
        specialRequests: checkInData.specialRequests || '',
        roomId: checkInData.roomId,
        assignedBy: 'professional-dashboard'
      };
      
      console.log('📦 Request payload:', payload);
      
      const response = await authTokenService.authenticatedRequest(`${API_BASE}/bookings/admin/${bookingId}/check-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY
        },
        body: JSON.stringify(payload)
      });

      console.log('📡 Response received:');
      console.log('  - Status:', response.status);
      console.log('  - Status Text:', response.statusText);
      console.log('  - OK:', response.ok);

      if (!response.ok) {
        console.error('❌ API Response not OK, parsing error...');
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('❌ Check-in API error details:', errorData);
        throw new Error(errorData.error?.message || errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      console.log('✅ API Response OK, parsing result...');
      const result = await response.json();
      console.log('✅ Check-in API success:', result);
      
      // Send check-in notification
      try {
        console.log('📱 Sending check-in notification...');
        await this.sendCheckinNotification(result.data);
      } catch (notificationError) {
        console.warn('⚠️ Check-in notification failed (but check-in succeeded):', notificationError.message);
      }
      
      return {
        success: true,
        data: result.data,
        message: result.message || 'Check-in completed successfully'
      };

    } catch (error) {
      console.error('❌ Error processing check-in:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * ค้นหา booking
   */
  async searchBookings(searchQuery, searchType = 'all') {
    try {
      console.log('🔍 Searching bookings:', { searchQuery, searchType });
      
      const params = new URLSearchParams({
        query: searchQuery,
        type: searchType
      });

      const response = await fetch(`${API_BASE}/bookings/admin/bookings/search?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Search results:', result.data?.length || 0, 'bookings found');
      
      return {
        success: true,
        data: result.data || [],
        query: searchQuery,
        type: searchType
      };

    } catch (error) {
      console.error('❌ Error searching bookings:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * ดึงข้อมูล booking จาก QR Code หรือ Booking Reference
   */
  async getBookingByReference(bookingReference) {
    try {
      console.log('📋 Fetching booking by reference:', bookingReference);
      
      const response = await fetch(`${API_BASE}/bookings/admin/bookings/${bookingReference}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Booking fetched:', result.data?.bookingReferenceId);
      
      return {
        success: true,
        data: result.data
      };

    } catch (error) {
      console.error('❌ Error fetching booking:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }



  /**
   * Process Check-out
   */
  async processCheckOut(bookingId, checkOutData = {}) {
    console.log('🚪 ===== PROFESSIONAL CHECKOUT SERVICE =====');
    console.log('📋 Input parameters:');
    console.log('  - bookingId:', bookingId);
    console.log('  - checkOutData:', checkOutData);
    console.log('🌐 API Configuration:');
    console.log('  - API_BASE:', API_BASE);
    console.log('  - API_KEY:', API_KEY ? 'Present' : 'Missing');
    console.log('  - Full endpoint:', `${API_BASE}/bookings/admin/${bookingId}/check-out`);
    
    try {
      console.log('🚀 Starting API call...');
      
      const payload = {
        checkOutTime: new Date().toISOString(),
        notes: checkOutData.notes || '',
        assignedBy: 'professional-dashboard',
        additionalCharges: checkOutData.additionalCharges || 0,
        housekeepingNotes: checkOutData.housekeepingNotes || '',
        roomCleaningStatus: 'needs_cleaning',
        ...checkOutData
      };
      
      console.log('📦 Request payload:', payload);

      const response = await authTokenService.authenticatedRequest(`${API_BASE}/bookings/admin/${bookingId}/check-out`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY
        },
        body: JSON.stringify(payload)
      });

      console.log('📡 Response received:');
      console.log('  - Status:', response.status);
      console.log('  - Status Text:', response.statusText);
      console.log('  - OK:', response.ok);

      if (!response.ok) {
        console.error('❌ API Response not OK, parsing error...');
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('❌ Check-out API error details:', errorData);
        throw new Error(errorData.error?.message || errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      console.log('✅ API Response OK, parsing result...');
      const result = await response.json();
      console.log('✅ Check-out API success:', result);
      
      // 🏠 Post Check-out Processing
      await this.handlePostCheckoutWorkflow(bookingId, result.data, payload);
      
      return {
        success: true,
        data: result.data,
        message: 'Check-out completed successfully'
      };

    } catch (error) {
      console.error('❌ Error processing check-out:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Handle Post Check-out Workflow
   * ระบบจัดการหลัง Check-out เสร็จสิ้น
   */
  async handlePostCheckoutWorkflow(bookingId, bookingData, checkoutPayload) {
    console.log('🏠 ===== POST CHECK-OUT WORKFLOW =====');
    console.log('📋 Booking ID:', bookingId);
    console.log('🏨 Booking Data:', bookingData);
    
    try {
      // Extract booking info from nested structure
      console.log('🔍 Full booking data structure:', JSON.stringify(bookingData, null, 2));
      
      const booking = bookingData.booking || bookingData;
      const roomInfo = booking.room || booking;
      const guestInfo = booking.guest || booking;
      
      console.log('🔍 Extracted data:');
      console.log('  - Booking:', booking?.id);
      console.log('  - Room Info:', roomInfo);
      console.log('  - Guest Info:', guestInfo);
      console.log('  - Room Number:', roomInfo?.roomNumber);
      console.log('  - Room ID:', roomInfo?.id);
      console.log('  - Guest Name:', guestInfo?.firstName, guestInfo?.lastName);
      
      // 1. 🧹 จัดการสถานะห้องพัก - ต้องทำความสะอาด
      if (roomInfo?.roomNumber) {
        await this.updateRoomCleaningStatus(roomInfo, {
          status: 'needs_cleaning',
          previousGuest: guestInfo?.firstName + ' ' + guestInfo?.lastName || guestInfo?.name || 'Unknown',
          checkoutTime: checkoutPayload.checkOutTime,
          specialInstructions: checkoutPayload.housekeepingNotes || ''
        });
      } else {
        console.warn('⚠️ No room number found for cleaning status update');
      }
      
      // 2. 📱 ส่งแจ้งเตือนให้ฟ่ายแม่บ้าน
      await this.sendHousekeepingNotification({
        roomNumber: roomInfo?.roomNumber || 'Unknown',
        guestName: guestInfo?.firstName + ' ' + guestInfo?.lastName || guestInfo?.name || 'Unknown',
        checkoutTime: checkoutPayload.checkOutTime,
        specialInstructions: checkoutPayload.housekeepingNotes
      });
      
      // 3. 📊 บันทึกข้อมูลสถิติ
      await this.recordCheckoutStats(bookingId, {
        duration: this.calculateStayDuration(bookingData.checkinTime, checkoutPayload.checkOutTime),
        additionalCharges: checkoutPayload.additionalCharges || 0,
        satisfaction: 'pending_survey'
      });
      
      // 4. 🔔 แจ้งเตือนผู้จัดการ (สำหรับ VIP หรือกรณีพิเศษ)
      if (bookingData.isVip || checkoutPayload.additionalCharges > 0) {
        await this.sendManagerNotification({
          type: 'checkout_special',
          bookingId,
          guestName: bookingData.guestName,
          roomNumber: bookingData.roomNumber,
          additionalCharges: checkoutPayload.additionalCharges,
          isVip: bookingData.isVip
        });
      }
      
      console.log('✅ Post check-out workflow completed');
      
    } catch (error) {
      console.error('❌ Post check-out workflow error:', error);
      // ไม่ throw error เพื่อไม่ให้กระทบ check-out หลัก
    }
  }

  /**
   * Update Room Cleaning Status
   * อัปเดตสถานะห้องให้ต้องทำความสะอาด
   */
  async updateRoomCleaningStatus(roomInfo, cleaningInfo) {
    console.log('🧹 Updating room cleaning status:', roomInfo, cleaningInfo);
    
    try {
      // Use housekeeping API instead of rooms API
      const response = await authTokenService.authenticatedRequest(`${API_BASE}/housekeeping/room-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY
        },
        body: JSON.stringify({
          roomNumber: roomInfo?.roomNumber || roomInfo,
          status: 'need_cleaning', // Convert to API expected format
          notes: `${cleaningInfo.specialInstructions} | Previous guest: ${cleaningInfo.previousGuest} | Checkout: ${cleaningInfo.checkoutTime}`
        })
      });
      
      if (response.ok) {
        console.log('✅ Room cleaning status updated via housekeeping API');
      }
    } catch (error) {
      console.error('❌ Failed to update room cleaning status:', error);
      // Don't break the checkout process if this fails
    }
  }

  /**
   * Send Check-in Notification
   * ส่งแจ้งเตือนการ check-in ให้ทีม housekeeping
   */
  async sendCheckinNotification(bookingData) {
    console.log('📱 Sending check-in notification:', bookingData);
    
    try {
      // เตรียมข้อมูลสำหรับ notification
      const checkinInfo = {
        roomNumber: bookingData.booking?.room?.roomNumber || bookingData.roomNumber || 'Unknown',
        roomType: bookingData.booking?.roomType?.name || bookingData.roomType || 'Standard',
        guestName: bookingData.booking?.guest?.firstName + ' ' + bookingData.booking?.guest?.lastName || 
                   bookingData.guestName || 'Guest',
        checkInTime: new Date().toLocaleTimeString('th-TH'),
        vip: bookingData.booking?.vip || false,
        specialRequests: bookingData.booking?.specialRequests || bookingData.specialRequests || ''
      };

      console.log('📋 Check-in notification data:', checkinInfo);

      // ส่งผ่าน Telegram Bot (Staff Bot)
      const message = `🏨 **แจ้งเตือนลูกค้าเช็คอิน**\n\n` +
                     `🏠 **ห้อง:** ${checkinInfo.roomNumber}\n` +
                     `🏷️ **ประเภทห้อง:** ${checkinInfo.roomType}\n` +
                     `👤 **ลูกค้า:** ${checkinInfo.guestName}\n` +
                     `⏰ **เวลาเช็คอิน:** ${checkinInfo.checkInTime}\n` +
                     `${checkinInfo.vip ? '⭐ **VIP Guest**\n' : ''}` +
                     `${checkinInfo.specialRequests ? `📝 **คำขอพิเศษ:** ${checkinInfo.specialRequests}\n` : ''}\n` +
                     `✅ **ลูกค้าเช็คอินเรียบร้อยแล้ว**\n\n` +
                     `#CheckIn #Room${checkinInfo.roomNumber}`;

      await this.sendNotification('checkin', checkinInfo);
      
      console.log('✅ Check-in notification sent');
      
    } catch (error) {
      console.error('❌ Error sending check-in notification:', error);
      // Don't throw error - notification is not critical for check-in process
    }
  }

  /**
   * Send Housekeeping Notification
   * ส่งแจ้งเตือนให้ทีมแม่บ้าน
   */
  async sendHousekeepingNotification(checkoutInfo) {
    console.log('📱 Sending housekeeping notification:', checkoutInfo);
    
    try {
      // ส่งผ่าน Telegram Bot (Staff Bot)
      const message = `🧹 **แจ้งเตือนทำความสะอาดห้อง**\n\n` +
                     `🏠 **ห้อง:** ${checkoutInfo.roomNumber}\n` +
                     `👤 **ลูกค้าเดิม:** ${checkoutInfo.guestName}\n` +
                     `⏰ **เวลา Check-out:** ${new Date(checkoutInfo.checkoutTime).toLocaleString('th-TH')}\n` +
                     `📝 **หมายเหตุ:** ${checkoutInfo.specialInstructions || 'ไม่มี'}\n\n` +
                     `⚡ **สถานะ:** รอการทำความสะอาด\n` +
                     `🕐 **เวลาโดยประมาณ:** 45 นาที`;

      await this.sendNotification('housekeeping_checkout', {
        message,
        roomNumber: checkoutInfo.roomNumber,
        priority: 'normal',
        type: 'room_cleaning'
      });
      
      console.log('✅ Housekeeping notification sent');
    } catch (error) {
      console.error('❌ Failed to send housekeeping notification:', error);
    }
  }

  /**
   * Record Checkout Statistics
   * บันทึกสถิติการ Check-out
   */
  async recordCheckoutStats(bookingId, statsData) {
    console.log('📊 Recording checkout statistics:', bookingId, statsData);
    
    try {
      // ⚠️ Analytics API temporarily disabled due to auth issues
      console.log('📊 Analytics recording disabled (would record):', {
        bookingId,
        stayDuration: statsData.duration,
        additionalCharges: statsData.additionalCharges,
        satisfactionStatus: statsData.satisfaction
      });
      console.log('✅ Checkout statistics skipped (analytics disabled)');
      
      // Uncomment when analytics API is ready:
      /*
      const response = await authTokenService.authenticatedRequest(`${API_BASE}/analytics/checkout-stats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY
        },
        body: JSON.stringify({
          bookingId,
          stayDuration: statsData.duration,
          additionalCharges: statsData.additionalCharges,
          checkoutTime: new Date().toISOString(),
          satisfactionStatus: statsData.satisfaction,
          processedBy: 'professional-dashboard'
        })
      });
      
      if (response.ok) {
        console.log('✅ Checkout statistics recorded');
      }
      */
    } catch (error) {
      console.warn('⚠️ Analytics API unavailable (non-critical):', error.message);
      // Don't throw error - analytics is optional
    }
  }

  /**
   * Send Manager Notification
   * ส่งแจ้งเตือนให้ผู้จัดการ
   */
  async sendManagerNotification(notificationData) {
    console.log('🔔 Sending manager notification:', notificationData);
    
    try {
      const message = `📋 **แจ้งเตือนผู้จัดการ - Check-out พิเศษ**\n\n` +
                     `👤 **ลูกค้า:** ${notificationData.guestName}\n` +
                     `🏠 **ห้อง:** ${notificationData.roomNumber}\n` +
                     `💰 **ค่าใช้จ่ายเพิ่มเติม:** ${notificationData.additionalCharges} บาท\n` +
                     `⭐ **VIP:** ${notificationData.isVip ? 'ใช่' : 'ไม่ใช่'}\n` +
                     `⏰ **เวลา:** ${new Date().toLocaleString('th-TH')}\n\n` +
                     `📌 **ต้องการความสนใจพิเศษ**`;

      await this.sendNotification('manager_alert', {
        message,
        bookingId: notificationData.bookingId,
        priority: 'high',
        type: 'checkout_special'
      });
      
      console.log('✅ Manager notification sent');
    } catch (error) {
      console.error('❌ Failed to send manager notification:', error);
    }
  }

  /**
   * Calculate Stay Duration
   * คำนวณระยะเวลาที่พัก
   */
  calculateStayDuration(checkinTime, checkoutTime) {
    if (!checkinTime || !checkoutTime) return 0;
    
    const checkin = new Date(checkinTime);
    const checkout = new Date(checkoutTime);
    const diffMs = checkout - checkin;
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    
    return diffHours;
  }

  /**
   * Send Notification via API
   * ส่งแจ้งเตือนผ่าน API
   */
  async sendNotification(type, data) {
    console.log(`📢 Sending ${type} notification:`, data);
    
    try {
      const response = await authTokenService.authenticatedRequest(`${API_BASE}/notifications/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY
        },
        body: JSON.stringify({
          type,
          message: data.message,
          priority: data.priority || 'normal',
          metadata: {
            roomNumber: data.roomNumber,
            bookingId: data.bookingId,
            timestamp: new Date().toISOString()
          }
        })
      });
      
      if (response.ok) {
        console.log(`✅ ${type} notification sent successfully`);
      } else {
        console.warn(`⚠️ ${type} notification failed:`, response.status);
      }
    } catch (error) {
      console.error(`❌ Failed to send ${type} notification:`, error);
      
      // Fallback: ส่งผ่าน Telegram API โดยตรง
      try {
        await this.sendTelegramFallback(type, data);
      } catch (fallbackError) {
        console.error('❌ Telegram fallback also failed:', fallbackError);
      }
    }
  }

  /**
   * Telegram Fallback
   * ระบบสำรองส่ง Telegram โดยตรง
   */
  async sendTelegramFallback(type, data) {
    console.log('📱 Using Telegram fallback for:', type);
    
    // ใช้ Staff Bot สำหรับ operational notifications
    const botToken = '8236751083:AAGOS9YE_VdOo-mBQ3cMQ9dr1DYRXdzbNgI';
    const chatId = '-1002926114573';
    
    const telegramMessage = `🤖 **Fallback Notification**\n\n${data.message}`;
    
    const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: telegramMessage,
        parse_mode: 'Markdown'
      })
    });
    
    if (telegramResponse.ok) {
      console.log('✅ Telegram fallback sent successfully');
    }
  }

  /**
   * Update Room Status
   */
  async updateRoomStatus(roomId, status, notes = '') {
    try {
      console.log('🏠 Updating room status:', { roomId, status });
      
      const response = await fetch(`${API_BASE}/bookings/admin/rooms/${roomId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY
        },
        body: JSON.stringify({
          status,
          notes,
          updatedBy: 'professional-dashboard'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Room status updated successfully');
      
      return {
        success: true,
        data: result.data
      };

    } catch (error) {
      console.error('❌ Error updating room status:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get Room Status
   */
  async getRoomStatus() {
    try {
      console.log('🏠 Fetching room status...');
      
      const response = await fetch(`${API_BASE}/rooms/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Room status fetched:', result.data?.length || 0, 'rooms');
      
      return {
        success: true,
        data: result.data || []
      };

    } catch (error) {
      console.error('❌ Error fetching room status:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * Get Dashboard Stats
   */
  async getDashboardStats() {
    try {
      console.log('📊 Fetching dashboard stats...');
      
      // Fetch multiple endpoints in parallel
      const [arrivalsResult, departuresResult, activeResult] = await Promise.all([
        this.getTodaysArrivals(),
        this.getTodaysDepartures(), 
        this.getActiveBookings()
      ]);

      // ✅ Safe data extraction with proper array checking
      const arrivalsData = Array.isArray(arrivalsResult.data) ? arrivalsResult.data : [];
      const departuresData = Array.isArray(departuresResult.data) ? departuresResult.data : [];
      const activeData = Array.isArray(activeResult.data) ? activeResult.data : [];

      const stats = {
        totalArrivals: arrivalsData.length,
        checkedIn: arrivalsData.filter(b => b.status === 'InHouse').length,
        pending: arrivalsData.filter(b => b.status === 'Confirmed').length,
        late: arrivalsData.filter(b => {
          const checkinTime = new Date(b.checkinDate);
          const now = new Date();
          return b.status === 'Confirmed' && checkinTime < now;
        }).length,
        totalDepartures: departuresData.length,
        checkedOut: departuresData.filter(b => b.status === 'Completed').length,
        inHouse: activeData.length,
        pendingCheckout: departuresData.filter(b => b.status === 'InHouse').length
      };

      console.log('✅ Dashboard stats calculated:', stats);
      
      return {
        success: true,
        data: stats
      };

    } catch (error) {
      console.error('❌ Error fetching dashboard stats:', error);
      return {
        success: false,
        error: error.message,
        data: {
          totalArrivals: 0,
          checkedIn: 0,
          pending: 0,
          late: 0,
          totalDepartures: 0,
          checkedOut: 0,
          inHouse: 0,
          pendingCheckout: 0
        }
      };
    }
  }

  /**
   * Map booking status from database to UI format
   */
  mapBookingStatus(dbStatus) {
    const statusMap = {
      'Confirmed': 'pending',
      'InHouse': 'checked_in',
      'CheckedOut': 'completed',      // แก้ไข: checked_out → completed
      'Completed': 'completed',       // เพิ่ม: รองรับ status ใหม่
      'Cancelled': 'cancelled',
      'NoShow': 'no_show'
    };
    
    return statusMap[dbStatus] || 'pending';
  }

  /**
   * Transform booking data for display
   */
  transformBookingForDisplay(booking) {
    return {
      id: booking.id,
      bookingReference: booking.bookingReferenceId,
      guestName: `${booking.guest?.firstName || ''} ${booking.guest?.lastName || ''}`.trim(),
      roomNumber: booking.room?.roomNumber || 'TBA',
      roomType: booking.room?.roomType?.name || 'Standard',
      checkIn: booking.checkinDate,
      checkOut: booking.checkoutDate,
      adults: booking.numAdults || 1,
      children: booking.numChildren || 0,
      totalGuests: (booking.numAdults || 1) + (booking.numChildren || 0),
      status: this.mapBookingStatus(booking.status),
      phone: booking.guest?.phoneNumber || '',
      email: booking.guest?.email || '',
      specialRequests: booking.specialRequests || '',
      totalPrice: booking.totalPrice || 0,
      actualArrival: booking.actualCheckinTime ? 
        new Date(booking.actualCheckinTime).toTimeString().slice(0, 5) : null,
      checkOutTime: booking.actualCheckoutTime ? 
        new Date(booking.actualCheckoutTime).toTimeString().slice(0, 5) : null,
      canCheckIn: booking.status === 'Confirmed' && new Date(booking.checkinDate) <= new Date(),
      canCheckOut: booking.status === 'InHouse',
      isLate: booking.status === 'Confirmed' && new Date(booking.checkinDate) < new Date(),
      isVip: booking.guest?.vip || false,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt
    };
  }

  /**
   * Send notification via Dual Bot System
   */
  async sendNotification(type, data) {
    try {
      let endpoint = '';
      let payload = {};

      switch (type) {
        case 'checkin':
          // ✅ ไม่ส่ง housekeeping notification สำหรับ checkin แล้ว
          // เพราะ backend notification service จัดการแล้ว
          console.log('ℹ️ Check-in notification handled by backend service');
          return { success: true, message: 'Backend handles check-in notifications' };
          break;

        case 'checkout':
          endpoint = '/housekeeping/cleaning-notification';
          payload = {
            roomNumber: data.roomNumber,
            roomType: data.roomType,
            guestName: data.guestName,
            checkOutTime: new Date().toLocaleTimeString('th-TH'),
            priority: data.vip ? 'high' : 'normal',
            specialInstructions: data.specialRequests || ''
          };
          break;

        case 'housekeeping_checkout':
          endpoint = '/housekeeping/cleaning-notification';
          payload = {
            message: data.message,
            roomNumber: data.roomNumber,
            priority: data.priority || 'normal',
            type: data.type || 'room_cleaning'
          };
          break;

        default:
          throw new Error(`Unknown notification type: ${type}`);
      }

      const response = await authTokenService.authenticatedRequest(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log(`✅ ${type} notification sent successfully`);
      
      return {
        success: true,
        data: result.data
      };

    } catch (error) {
      console.error(`❌ Error sending ${type} notification:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Export singleton instance
const professionalCheckinService = new ProfessionalCheckinService();
export default professionalCheckinService;
