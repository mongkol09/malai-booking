// Safe logging utility - only logs in development
const safeLog = (message, data) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(message, data);
  }
};

// Temporary API Service สำหรับ BookingHistory components
// ใช้ API Key แทน JWT เพื่อหลีกเลี่ยงปัญหา localStorage

class BookingHistoryApiService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';
    // Use environment variable only - no hardcoded secrets
    this.apiKey = process.env.REACT_APP_API_KEY;
    
    // Validate API Key
    if (!this.apiKey) {
      console.error('❌ REACT_APP_API_KEY not configured in environment variables');
      throw new Error('API Key not configured - check .env file');
    }
    
    // Debug API Key - secure logging
    safeLog('🔧 BookingHistoryApi Config:', {
      baseURL: this.baseURL,
      apiKeyExists: !!this.apiKey,
      apiKeyLength: this.apiKey.length,
      configured: true
    });
  }

  // API call with API Key (no JWT needed)
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}/api/v1${endpoint}`;
    
    safeLog('🌐 API Request:', {
      url,
      method: options.method || 'GET',
      authenticated: !!this.apiKey
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