// ============================================
// BOOKING SERVICE - ADMIN OPERATIONS
// ============================================

import { apiService } from './apiService';

const bookingService = {
  // ===============================
  // ADMIN BOOKING MANAGEMENT
  // ===============================

  /**
   * Get all bookings (Admin only)
   */
  async getAllBookings(filters = {}) {
    try {
      console.log('📋 Fetching all bookings via ApiService...');
      const response = await apiService.get('/bookings/admin/all', { params: filters });
      return response.data || response;
    } catch (error) {
      console.error('❌ Failed to fetch all bookings:', error);
      throw error;
    }
  },

  /**
   * Search bookings by various criteria
   */
  async searchBookings(query) {
    try {
      console.log(`🔍 Searching bookings: "${query}" via ApiService...`);
      const response = await apiService.get('/bookings/admin/bookings/search', {
        params: { query }
      });
      return response.data || response;
    } catch (error) {
      console.error('❌ Failed to search bookings:', error);
      throw error;
    }
  },

  /**
   * Get booking by QR code or reference ID
   */
  async getBookingByQR(bookingReferenceId) {
    try {
      console.log(`📱 Getting booking by QR: ${bookingReferenceId} via ApiService...`);
      const response = await apiService.get(`/bookings/admin/bookings/${bookingReferenceId}`);
      return response.data || response;
    } catch (error) {
      console.error(`❌ Failed to get booking by QR ${bookingReferenceId}:`, error);
      throw error;
    }
  },

  /**
   * Get booking details by ID (when API is fixed)
   */
  async getBookingById(bookingId) {
    try {
      console.log(`📋 Getting booking by ID: ${bookingId} via ApiService...`);
      // TODO: เมื่อ GET /bookings/:id แก้ไขแล้ว ให้เปลี่ยนเป็น:
      // const response = await apiService.get(`/bookings/${bookingId}`);
      
      // ปัจจุบันใช้ search แทน
      const searchResponse = await this.searchBookings(bookingId);
      if (searchResponse && searchResponse.bookings && searchResponse.bookings.length > 0) {
        const booking = searchResponse.bookings.find(b => b.id === bookingId);
        return booking || searchResponse.bookings[0];
      }
      throw new Error('Booking not found');
    } catch (error) {
      console.error(`❌ Failed to get booking by ID ${bookingId}:`, error);
      throw error;
    }
  },

  /**
   * Get payment details by payment ID
   */
  async getPaymentDetails(paymentId) {
    try {
      console.log(`💳 Getting payment details: ${paymentId} via ApiService...`);
      const response = await apiService.get(`/payments/${paymentId}`);
      return response.data || response;
    } catch (error) {
      console.error(`❌ Failed to get payment details ${paymentId}:`, error);
      throw error;
    }
  },

  /**
   * Get payment audit trail
   */
  async getPaymentAuditTrail(paymentId) {
    try {
      console.log(`🔍 Getting payment audit trail: ${paymentId} via ApiService...`);
      const response = await apiService.get(`/payments/${paymentId}/audit-trail`);
      return response.data || response;
    } catch (error) {
      console.error(`❌ Failed to get payment audit trail ${paymentId}:`, error);
      throw error;
    }
  },

  // ===============================
  // CHECK-IN / CHECK-OUT OPERATIONS  
  // ===============================

  /**
   * Process check-in for a booking
   */
  async processCheckIn(bookingId, checkInData = {}) {
    try {
      console.log(`🏨 Processing check-in for booking ${bookingId} via ApiService...`);
      const response = await apiService.post(`/bookings/${bookingId}/check-in`, {
        ...checkInData,
        checkedInBy: apiService.getCurrentUser()?.id || 'admin',
        checkedInAt: new Date().toISOString()
      });
      return response.data || response;
    } catch (error) {
      console.error(`❌ Failed to process check-in for booking ${bookingId}:`, error);
      throw error;
    }
  },

  /**
   * Process check-out for a booking
   */
  async processCheckOut(bookingId, checkOutData = {}) {
    try {
      console.log(`🚪 Processing check-out for booking ${bookingId} via ApiService...`);
      const response = await apiService.post(`/bookings/${bookingId}/check-out`, {
        ...checkOutData,
        checkedOutBy: apiService.getCurrentUser()?.id || 'admin',
        checkedOutAt: new Date().toISOString()
      });
      return response.data || response;
    } catch (error) {
      console.error(`❌ Failed to process check-out for booking ${bookingId}:`, error);
      throw error;
    }
  },

  /**
   * Create walk-in booking
   */
  async createWalkInBooking(walkInData) {
    try {
      console.log('🚶 Creating walk-in booking via ApiService...', walkInData);
      const response = await apiService.post('/bookings/walk-in', {
        ...walkInData,
        createdBy: apiService.getCurrentUser()?.id || 'admin',
        createdAt: new Date().toISOString()
      });
      return response.data || response;
    } catch (error) {
      console.error('❌ Failed to create walk-in booking:', error);
      throw error;
    }
  },

  // ===============================
  // TODAY'S OPERATIONS
  // ===============================

  /**
   * Get today's arrivals (for check-in)
   */
  async getTodaysArrivals() {
    try {
      console.log('📅 Getting today arrivals via ApiService...');
      const response = await apiService.get('/checkin/bookings', {
        headers: {
          'X-API-Key': 'hotel-booking-api-key-2024'
        }
      });
      
      console.log('📊 Raw arrivals response:', response);
      
      if (response && response.success && response.data) {
        // Transform the data for check-in dashboard
        const arrivals = response.data.map(booking => ({
          id: booking.id,
          bookingReferenceId: booking.bookingReferenceId,
          guestId: booking.guestId,
          roomId: booking.roomId,
          room: booking.room,
          guest: booking.guest,
          status: booking.status,
          checkInDate: booking.checkInDate,
          checkOutDate: booking.checkOutDate,
          totalAmount: booking.totalAmount,
          outstandingAmount: booking.outstandingAmount || 0,
          roomType: booking.roomType,
          canCheckin: booking.status === 'Confirmed' && new Date(booking.checkInDate) <= new Date(),
          checkInStatus: booking.checkInStatus || 'Pending'
        }));
        
        return {
          success: true,
          data: {
            arrivals: arrivals,
            total: arrivals.length
          }
        };
      }
      
      return response;
    } catch (error) {
      console.error('❌ Error getting today arrivals:', error);
      throw error;
    }
  },

  /**
   * Get today's departures
   */
  async getTodaysDepartures() {
    try {
      console.log('📅 Getting today departures via ApiService...');
      const response = await apiService.get('/bookings/departures');
      return response.data || response;
    } catch (error) {
      console.error('❌ Error getting today departures:', error);
      throw error;
    }
  },

  /**
   * Get active bookings by room
   */
  async getActiveBookingByRoom(roomNumber) {
    try {
      console.log(`🏠 Getting active booking for room ${roomNumber} via ApiService...`);
      const response = await apiService.get('/bookings/admin/bookings/active', {
        params: { roomNumber }
      });
      return response.data || response;
    } catch (error) {
      console.error(`❌ Error getting active booking for room ${roomNumber}:`, error);
      throw error;
    }
  },

  // ===============================
  // ROOM STATUS OPERATIONS
  // ===============================

  /**
   * Get all rooms status with enhanced data
   */
  async getRoomStatus() {
    try {
      console.log('🏨 Getting rooms status via ApiService...');
      const response = await apiService.get('/rooms/status');
      
      console.log('📊 Raw rooms response:', response);
      
      if (response && response.success && response.data) {
        // Transform room data for check-in dashboard
        const rooms = response.data.map(room => ({
          id: room.id,
          roomNumber: room.roomNumber,
          roomType: room.roomType || { name: 'Unknown' },
          status: room.status,
          floor: room.floor || 'Unknown',
          currentBooking: room.currentBooking,
          guest: room.guest,
          canCheckin: room.currentBooking && 
                     room.currentBooking.status === 'Confirmed' && 
                     new Date(room.currentBooking.checkInDate) <= new Date() &&
                     room.status === 'Available',
          canAssign: room.status === 'Available' && !room.currentBooking,
          isOccupied: room.status === 'Occupied',
          isReady: room.status === 'Available' && room.currentBooking && 
                  room.currentBooking.status === 'Confirmed',
          lastCleaned: room.lastCleaned,
          housekeepingStatus: room.housekeepingStatus || 'Clean'
        }));
        
        return {
          success: true,
          data: rooms
        };
      }
      
      return response;
    } catch (error) {
      console.error('❌ Error getting rooms status:', error);
      throw error;
    }
  },

  /**
   * Update room status manually
   */
  async updateRoomStatus(roomId, statusData) {
    try {
      console.log(`🔄 Updating room ${roomId} status via ApiService...`);
      const response = await apiService.post(`/bookings/admin/rooms/${roomId}/status`, {
        status: statusData.status || statusData,
        notes: statusData.notes || '',
        updated_by: apiService.getCurrentUser()?.id || 'admin',
        updated_at: new Date().toISOString()
      });
      return response.data || response;
    } catch (error) {
      console.error(`❌ Failed to update room ${roomId} status:`, error);
      throw error;
    }
  },

  // ===============================
  // CHECK-IN / CHECK-OUT OPERATIONS
  // ===============================

  // ===============================
  // DATA FORMATTING METHODS
  // ===============================

  /**
   * Format booking data for display
   */
  formatBookingForDisplay(booking) {
    return {
      id: booking.id,
      bookingReferenceId: booking.bookingReferenceId || booking.reference_id,
      guestName: booking.customerName || (booking.guest ? `${booking.guest.firstName || ''} ${booking.guest.lastName || ''}`.trim() : booking.guestName || 'Unknown Guest'),
      guestEmail: booking.customerEmail || booking.guest?.email || booking.guestEmail || '',
      guestPhone: booking.customerPhone || booking.guest?.phone || booking.guest?.phoneNumber || booking.guestPhone || '',
      roomNumber: booking.roomId || booking.room?.number || booking.room?.roomNumber || booking.roomNumber || '',
      roomType: booking.roomType || booking.room?.type || booking.room?.roomType?.name || '',
      checkIn: booking.checkInDate || (booking.checkinDate ? new Date(booking.checkinDate).toLocaleDateString() : booking.checkIn || ''),
      checkOut: booking.checkOutDate || (booking.checkoutDate ? new Date(booking.checkoutDate).toLocaleDateString() : booking.checkOut || ''),
      status: booking.status || 'pending',
      statusColor: this.getBookingStatusColor(booking.status),
      paidAmount: booking.paidAmount || booking.paid_amount || booking.totalPrice || '0.00',
      dueAmount: booking.dueAmount || booking.due_amount || booking.finalAmount || '0.00',
      totalAmount: booking.totalAmount || booking.total_amount || booking.totalPrice || booking.finalAmount || '0.00',
      canCheckIn: booking.status === 'Confirmed' && new Date(booking.checkinDate || booking.checkInDate) <= new Date(),
      canCheckOut: booking.status === 'InHouse',
      createdAt: booking.createdAt || booking.created_at,
      updatedAt: booking.updatedAt || booking.updated_at
    };
  },

  /**
   * Get booking status color for display
   */
  getBookingStatusColor(status) {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'text-bg-primary';
      case 'inhouse':
      case 'in-house':
        return 'text-bg-success';
      case 'completed':
        return 'text-bg-secondary';
      case 'cancelled':
        return 'text-bg-danger';
      case 'noshow':
      case 'no-show':
        return 'text-bg-warning';
      case 'pending':
      default:
        return 'text-bg-warning';
    }
  },

  /**
   * Get booking status options for dropdowns
   */
  getBookingStatusOptions() {
    return [
      { value: 'confirmed', label: 'Confirmed', color: 'primary' },
      { value: 'inhouse', label: 'In House', color: 'success' },
      { value: 'completed', label: 'Completed', color: 'secondary' },
      { value: 'cancelled', label: 'Cancelled', color: 'danger' },
      { value: 'noshow', label: 'No Show', color: 'warning' }
    ];
  },

  /**
   * Format check-in/check-out data for API
   */
  formatCheckInOutData(formData) {
    return {
      notes: formData.notes || '',
      specialRequests: formData.specialRequests || '',
      additionalCharges: formData.additionalCharges || [],
      guestSignature: formData.guestSignature || null,
      idVerified: formData.idVerified || false,
      keyCardIssued: formData.keyCardIssued || false
    };
  },

  // ===============================
  // VALIDATION HELPERS
  // ===============================

  /**
   * Validate booking data
   */
  validateBookingData(bookingData) {
    const errors = [];

    if (!bookingData.guestName?.trim()) {
      errors.push('Guest name is required');
    }

    if (!bookingData.roomNumber?.trim()) {
      errors.push('Room number is required');
    }

    if (!bookingData.checkIn) {
      errors.push('Check-in date is required');
    }

    if (!bookingData.checkOut) {
      errors.push('Check-out date is required');
    }

    if (bookingData.checkIn && bookingData.checkOut) {
      const checkInDate = new Date(bookingData.checkIn);
      const checkOutDate = new Date(bookingData.checkOut);
      
      if (checkOutDate <= checkInDate) {
        errors.push('Check-out date must be after check-in date');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // ===============================
  // SEARCH AND FILTER HELPERS
  // ===============================

  /**
   * Build search parameters for API calls
   */
  buildSearchParams(filters) {
    const params = {};

    if (filters.search?.trim()) {
      params.query = filters.search.trim();
    }

    if (filters.status && filters.status !== 'all') {
      params.status = filters.status;
    }

    if (filters.dateFrom) {
      params.startDate = filters.dateFrom;
    }

    if (filters.dateTo) {
      params.endDate = filters.dateTo;
    }

    if (filters.roomNumber?.trim()) {
      params.roomNumber = filters.roomNumber.trim();
    }

    if (filters.guestName?.trim()) {
      params.guestName = filters.guestName.trim();
    }

    return params;
  },

  // ยกเลิกการจอง (รอ API)
  async cancelBooking(bookingId, cancellationData) {
    try {
      console.log('🚫 Canceling booking...', { bookingId, cancellationData });
      
      // TODO: ใช้ POST /admin/bookings/:id/cancel เมื่อ API พร้อม
      const response = await this.request(`/admin/bookings/${bookingId}/cancel`, {
        method: 'POST',
        body: JSON.stringify(cancellationData)
      });
      
      return response;
      
    } catch (error) {
      console.error('❌ Error canceling booking:', error);
      throw new Error(error.message || 'เกิดข้อผิดพลาดในการยกเลิกการจอง');
    }
  },

  // ขอเงินคืน (รอ API)
  async requestRefund(bookingId, refundData) {
    try {
      console.log('💰 Requesting refund...', { bookingId, refundData });
      
      // TODO: ใช้ POST /admin/bookings/:id/refund เมื่อ API พร้อม
      const response = await this.request(`/admin/bookings/${bookingId}/refund`, {
        method: 'POST',
        body: JSON.stringify(refundData)
      });
      
      return response;
      
    } catch (error) {
      console.error('❌ Error requesting refund:', error);
      throw new Error(error.message || 'เกิดข้อผิดพลาดในการขอเงินคืน');
    }
  },

  // ===============================
  // ROOM BOOKING FORM SUPPORT
  // ===============================

  /**
   * Get all room types
   */
  async getRoomTypes() {
    try {
      console.log('🏠 Fetching room types via ApiService...');
      const response = await apiService.get('/rooms/types');
      return response.data || response;
    } catch (error) {
      console.error('❌ Failed to fetch room types:', error);
      throw error;
    }
  },

  /**
   * Get available rooms for a specific room type
   */
  async getAvailableRooms(roomTypeId, checkIn = null, checkOut = null) {
    try {
      let url = `/rooms/type/${roomTypeId}`;
      const params = new URLSearchParams();
      
      if (checkIn) params.append('checkIn', checkIn);
      if (checkOut) params.append('checkOut', checkOut);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      console.log(`🚪 Fetching available rooms: ${url}`);
      const response = await apiService.get(url);
      return response.data || response;
    } catch (error) {
      console.error('❌ Failed to fetch available rooms:', error);
      throw error;
    }
  },

  /**
   * Generate unique booking reference
   */
  async generateBookingReference() {
    try {
      const timestamp = Date.now();
      const date = new Date();
      const year = date.getFullYear().toString().slice(-2);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
      
      const reference = `BK${year}${month}${day}${random}`;
      
      console.log(`🎫 Generated booking reference: ${reference}`);
      return {
        success: true,
        data: { bookingReference: reference }
      };
    } catch (error) {
      console.error('❌ Failed to generate booking reference:', error);
      throw error;
    }
  },

  /**
   * Calculate dynamic pricing for a booking
   */
  async calculateDynamicPrice(roomTypeId, checkInDate, checkOutDate, adults = 1, children = 0) {
    try {
      console.log('💰 Calculating dynamic price via ApiService...');
      
      // Calculate lead time days
      const checkIn = new Date(checkInDate);
      const today = new Date();
      const leadTimeDays = Math.max(1, Math.ceil((checkIn - today) / (1000 * 60 * 60 * 24)));
      
      // Calculate nights
      const checkOut = new Date(checkOutDate);
      const nights = Math.max(1, Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)));
      
      const response = await apiService.post('/pricing/calculate', {
        roomTypeId,
        checkInDate,
        checkOutDate,
        adults: parseInt(adults) || 1,
        children: parseInt(children) || 0,
        leadTimeDays,
        nights
      });
      
      return response.data || response;
    } catch (error) {
      console.error('❌ Failed to calculate dynamic price:', error);
      
      // Fallback: ดึงราคาพื้นฐานจาก roomType
      try {
        const roomType = await this.getRoomTypeById(roomTypeId);
        const baseRate = roomType?.baseRate || 0;
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        const nights = Math.max(1, Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)));
        const totalAmount = parseFloat(baseRate) * nights;
        
        return {
          success: true,
          data: {
            baseRate: parseFloat(baseRate),
            totalAmount,
            nights,
            breakdown: {
              roomRate: totalAmount,
              taxes: 0,
              fees: 0,
              discounts: 0
            }
          }
        };
      } catch (fallbackError) {
        console.error('❌ Fallback pricing also failed:', fallbackError);
        return {
          success: true,
          data: {
            baseRate: 0,
            totalAmount: 0,
            nights: 1,
            breakdown: {
              roomRate: 0,
              taxes: 0,
              fees: 0,
              discounts: 0
            }
          }
        };
      }
    }
  },

  /**
   * Get room type by ID for pricing fallback
   */
  async getRoomTypeById(roomTypeId) {
    try {
      const response = await apiService.get(`/rooms/type/${roomTypeId}`);
      return response.data || response;
    } catch (error) {
      console.error('❌ Failed to get room type:', error);
      return null;
    }
  },

  /**
   * Create new booking
   */
  async createBooking(bookingData) {
    try {
      console.log('📝 Creating new booking via ApiService...');
      
      // Transform data to match API expectations
      const apiData = {
        // Room and dates
        roomId: bookingData.roomId,
        checkInDate: bookingData.checkInDate,
        checkOutDate: bookingData.checkOutDate,
        adults: parseInt(bookingData.adults) || 1,
        children: parseInt(bookingData.children) || 0,

        // Guest details
        guestTitle: bookingData.guestTitle || 'Mr',
        guestFirstName: bookingData.guestFirstName,
        guestLastName: bookingData.guestLastName,
        guestEmail: bookingData.guestEmail,
        guestPhone: bookingData.guestPhone,
        guestCountryCode: bookingData.guestCountryCode || '+66',
        guestAddress: bookingData.guestAddress,
        guestCity: bookingData.guestCity,
        guestCountry: bookingData.guestCountry || 'Thailand',
        guestZipCode: bookingData.guestZipCode,
        guestIdType: bookingData.guestIdType,
        guestIdNumber: bookingData.guestIdNumber,
        guestDateOfBirth: bookingData.guestDateOfBirth,
        guestNationality: bookingData.guestNationality || 'Thai',

        // Booking details
        bookingReference: bookingData.bookingReference,
        arrivalFrom: bookingData.arrivalFrom,
        bookingType: bookingData.bookingType,
        purposeOfVisit: bookingData.purposeOfVisit,
        remarks: bookingData.remarks,

        // Company details
        companyName: bookingData.companyName,
        companyAddress: bookingData.companyAddress,
        companyPhone: bookingData.companyPhone,
        companyEmail: bookingData.companyEmail,
        companyGST: bookingData.companyGST,

        // Payment
        totalAmount: bookingData.totalAmount,
        paymentMethod: bookingData.paymentMethod || 'Cash',
        paymentStatus: bookingData.paymentStatus || 'Pending'
      };

      const response = await apiService.post('/bookings', apiData);
      return response.data || response;
    } catch (error) {
      console.error('❌ Failed to create booking:', error);
      throw error;
    }
  },

};

export default bookingService;
