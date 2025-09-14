// Temporary API Service สำหรับ BookingHistory components
// ใช้ API Key แทน JWT เพื่อหลีกเลี่ยงปัญหา localStorage

class BookingHistoryApiService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';
    // Temporary hardcode to bypass .env cache issues
    this.apiKey = 'hbk_prod_2024_secure_f8e7d6c5b4a392817f4e3d2c1b0a98765432187654321';
    
    // Debug API Key
    console.log('🔧 BookingHistoryApi Config:', {
      baseURL: this.baseURL,
      apiKeyExists: !!this.apiKey,
      apiKeyLength: this.apiKey.length,
      apiKeyPrefix: this.apiKey.substring(0, 10) + '...',
      envApiKey: process.env.REACT_APP_API_KEY?.substring(0, 10) + '...',
      hardcodedKey: this.apiKey.substring(0, 10) + '...'
    });
  }

  // API call with API Key (no JWT needed)
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}/api/v1${endpoint}`;
    
    console.log('🌐 API Request:', {
      url,
      apiKey: this.apiKey.substring(0, 10) + '...',
      headers: {
        'X-API-Key': this.apiKey ? 'Present' : 'Missing'
      }
    });
    
    const config = {
      ...options,
      headers: {
        'X-API-Key': this.apiKey,
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        console.error('❌ API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          data
        });
        throw new Error(data.error?.message || data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Booking History API Error:', error);
      throw error;
    }
  }

  // Booking History Methods
  async getBookingHistory(endpoint = '') {
    // Handle both string endpoint and object filters
    if (typeof endpoint === 'string' && endpoint.startsWith('?')) {
      // Direct endpoint string (e.g., "?page=1&limit=20")
      const fullEndpoint = `/booking-history/${endpoint}`;
      return await this.request(fullEndpoint);
    } else {
      // Object filters (legacy support)
      const filters = endpoint || {};
      const queryParams = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          queryParams.append(key, filters[key]);
        }
      });

      const fullEndpoint = `/booking-history/?${queryParams}`;
      return await this.request(fullEndpoint);
    }
  }

  async getAnalyticsStatistics() {
    const endpoint = '/booking-history/analytics/statistics';
    return await this.request(endpoint);
  }

  async getArchivedBookings(page = 1, limit = 20, filters = {}) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    });

    const endpoint = `/booking-history/archive?${params}`;
    return await this.request(endpoint);
  }

  async archiveBooking(bookingId, reason = 'Manual archive') {
    const endpoint = `/booking-history/archive/${bookingId}`;
    return await this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }

  async restoreBooking(bookingId) {
    const endpoint = `/booking-history/restore/${bookingId}`;
    return await this.request(endpoint, {
      method: 'POST'
    });
  }

  async deleteBooking(bookingId) {
    const endpoint = `/booking-history/archive/delete`;
    return await this.request(endpoint, {
      method: 'DELETE',
      body: JSON.stringify({
        booking_id: bookingId
      })
    });
  }

  async getArchiveCandidates() {
    const endpoint = '/booking-history/archive/candidates';
    return await this.request(endpoint);
  }
}

// Export singleton instance
const bookingHistoryApi = new BookingHistoryApiService();
export default bookingHistoryApi;