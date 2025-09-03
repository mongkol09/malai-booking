// Local bookingService for BookingCancelModal
// This file contains only the methods needed for cancellation

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';

class BookingService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get auth token from localStorage
  getAuthToken() {
    return localStorage.getItem('hotel_admin_token') || sessionStorage.getItem('hotel_admin_token');
  }

  // Make authenticated request
  async request(endpoint, options = {}) {
    const token = this.getAuthToken();
    
    console.log('🔐 BookingService - Token check:', {
      hasToken: !!token,
      tokenLength: token ? token.length : 0,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'No token'
    });
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'hotel-booking-api-key-2024',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Cancel booking - Fixed endpoint path
  async cancelBooking(bookingId, cancellationData) {
    try {
      console.log('🚫 Canceling booking...', { bookingId, cancellationData });
      // Fixed: Use correct endpoint path for JWT auth
      const response = await this.request(`/bookings/admin/${bookingId}/cancel`, {
        method: 'POST',
        body: JSON.stringify(cancellationData)
      });
      return response;
    } catch (error) {
      console.error('❌ Error canceling booking:', error);
      throw new Error(error.message || 'เกิดข้อผิดพลาดในการยกเลิกการจอง');
    }
  }

  // Get cancellation policy - Fixed endpoint path
  async getCancellationPolicy(bookingId) {
    try {
      // Fixed: Use correct endpoint path
      const response = await this.request(`/bookings/${bookingId}/cancellation-policy`);
      return response;
    } catch (error) {
      console.error('❌ Error getting cancellation policy:', error);
      throw new Error(error.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลนโยบายการยกเลิก');
    }
  }

  // Get cancellation history - Fixed endpoint path
  async getCancellationHistory(bookingId) {
    try {
      // Fixed: Use correct endpoint path
      const response = await this.request(`/bookings/${bookingId}/cancellations`);
      return response;
    } catch (error) {
      console.error('❌ Error getting cancellation history:', error);
      throw new Error(error.message || 'เกิดข้อผิดพลาดในการดึงประวัติการยกเลิก');
    }
  }
}

export default new BookingService();
