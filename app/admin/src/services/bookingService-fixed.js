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
      console.error('❌ Failed to get booking by QR:', error);
      throw error;
    }
  },

  /**
   * Get today's arrivals
   */
  async getTodaysArrivals() {
    try {
      console.log('📅 Fetching today\'s arrivals via ApiService...');
      const response = await apiService.get('/bookings/arrivals');
      return response.data || response;
    } catch (error) {
      console.error('❌ Failed to fetch today\'s arrivals:', error);
      throw error;
    }
  },

  /**
   * Get today's departures
   */
  async getTodaysDepartures() {
    try {
      console.log('🚪 Fetching today\'s departures via ApiService...');
      const response = await apiService.get('/bookings/departures');
      return response.data || response;
    } catch (error) {
      console.error('❌ Failed to fetch today\'s departures:', error);
      throw error;
    }
  },

  // ===============================
  // ROOM MANAGEMENT
  // ===============================

  /**
   * Get room types for selection
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
   * Get available rooms for specific room type and dates
   */
  async getAvailableRooms(roomTypeId, checkInDate, checkOutDate) {
    try {
      console.log(`🚪 Fetching available rooms: ${roomTypeId} from ${checkInDate} to ${checkOutDate} via ApiService...`);
      const response = await apiService.get('/rooms/available', {
        params: {
          roomTypeId,
          checkInDate,
          checkOutDate
        }
      });
      return response.data || response;
    } catch (error) {
      console.error('❌ Failed to fetch available rooms:', error);
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
   * Create new booking - CORRECTED VERSION
   */
  async createBooking(bookingData) {
    try {
      console.log('📝 Creating new booking via ApiService...');
      console.log('📋 Input booking data:', bookingData);
      
      // Transform data to match simpleBookingController expectations
      const apiData = {
        guestData: {
          name: `${bookingData.guestFirstName || ''} ${bookingData.guestLastName || ''}`.trim(),
          email: bookingData.guestEmail || '',
          phone: bookingData.guestPhone || '',
          nationality: bookingData.guestNationality || 'Thai',
          address: bookingData.guestAddress || '',
          city: bookingData.guestCity || '',
          country: bookingData.guestCountry || 'Thailand',
          zipCode: bookingData.guestZipCode || '',
          idType: bookingData.guestIdType || '',
          idNumber: bookingData.guestIdNumber || '',
          dateOfBirth: bookingData.guestDateOfBirth || null
        },
        roomData: {
          type: bookingData.roomTypeId || '',
          number: bookingData.roomId || '',
          guests: parseInt(bookingData.adults) || 1,
          children: parseInt(bookingData.children) || 0,
          preferences: bookingData.remarks || ''
        },
        dates: {
          checkIn: bookingData.checkInDate,
          checkOut: bookingData.checkOutDate,
          arrivalFrom: bookingData.arrivalFrom || ''
        },
        pricing: {
          total: parseFloat(bookingData.totalAmount) || 0,
          currency: 'THB',
          breakdown: {
            roomRate: parseFloat(bookingData.totalAmount) || 0,
            taxes: 0,
            fees: 0
          }
        },
        specialRequests: bookingData.remarks || '',
        source: 'admin_panel',
        paymentMethod: bookingData.paymentMethod || 'Cash',
        status: 'confirmed'
      };

      console.log('📋 Transformed booking data:', apiData);
      
      const response = await apiService.post('/bookings', apiData);
      return response.data || response;
    } catch (error) {
      console.error('❌ Failed to create booking:', error);
      throw error;
    }
  },

  /**
   * Generate booking reference ID
   */
  async generateBookingReference() {
    try {
      console.log('🎫 Generating booking reference via ApiService...');
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const reference = `BK${timestamp.toString().slice(-8)}${random}`;
      
      return {
        success: true,
        data: { bookingReference: reference }
      };
    } catch (error) {
      console.error('❌ Failed to generate booking reference:', error);
      throw error;
    }
  },

};

export default bookingService;

