// API Service Layer สำหรับเชื่อมต่อกับ Backend
// ใช้ AuthService เป็น Primary Token Manager
import { authService } from './authService';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';
const API_KEY = process.env.REACT_APP_API_KEY || 'hbk_prod_2024_secure_f8e7d6c5b4a392817f4e3d2c1b0a98765432187654321';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.apiKey = API_KEY;
  }

  // ใช้ AuthService เป็นหลักในการจัดการ token
  getToken() {
    try {
      // ใช้ AuthService เป็นหลัก เพื่อความปลอดภัยและจัดการรวมศูนย์
      return authService.getToken();
    } catch (error) {
      console.error('❌ Failed to get token from AuthService:', error);
      // Fallback ไปที่ localStorage ในกรณีฉุกเฉิน
      return localStorage.getItem('hotel_admin_token') || localStorage.getItem('token');
    }
  }

  // ใช้ AuthService ในการจัดการ token ที่หมดอายุ
  clearInvalidTokens() {
    try {
      console.log('🧹 Using AuthService to clear invalid tokens...');
      
      // ใช้ AuthService เป็นหลักในการจัดการข้อมูล authentication
      if (authService && typeof authService.clearAuthData === 'function') {
        authService.clearAuthData();
        console.log('✅ AuthService cleared authentication data');
      } else {
        // Fallback: Manual cleanup
        console.log('⚠️ AuthService not available, using manual cleanup...');
        const tokenKeys = ['token', 'hotel_admin_token', 'hotel_admin_refresh_token', 'hotel_admin_user'];
        tokenKeys.forEach(key => {
          if (localStorage.getItem(key)) {
            localStorage.removeItem(key);
            console.log(`🗑️ Removed: ${key}`);
          }
        });
      }
      
      console.log('✅ Invalid tokens cleared successfully');
      
    } catch (error) {
      console.error('❌ Failed to clear tokens via AuthService:', error);
    }
  }

  // Helper method for making API calls with AuthService integration
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    console.log(`🌐 API Request: ${options.method || 'GET'} ${endpoint}`);
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      // ลบ x-api-key เพราะ admin endpoints ใช้ JWT แล้ว
      // 'x-api-key': this.apiKey,
    };

    // ใช้ AuthService ในการตรวจสอบ token (JWT authentication)
    const token = authService ? authService.getToken() : null;
    console.log(`🔍 Token from AuthService: ${token ? 'Present (' + token.substring(0, 20) + '...)' : 'None'}`);
    
    // เพิ่ม Authorization header ถ้ามี JWT token
    if (token) {
      // ตรวจสอบว่า token ยังใช้งานได้หรือไม่
      if (authService && typeof authService.isTokenValid === 'function') {
        try {
          if (authService.isTokenValid()) {
            defaultHeaders['Authorization'] = `Bearer ${token}`;
            console.log('🔐 Using JWT token for authentication');
          } else {
            console.warn('⚠️ Token is invalid, will try to refresh...');
            // Token หมดอายุ ให้ลองใช้ refresh token
            await this.refreshTokenIfNeeded();
            const newToken = authService.getToken();
            if (newToken) {
              defaultHeaders['Authorization'] = `Bearer ${newToken}`;
              console.log('🔄 Using refreshed JWT token');
            }
          }
        } catch (error) {
          console.warn('⚠️ Token validation error:', error.message);
        }
      } else {
        // ถ้าไม่มี validation function ใช้ token ตรงๆ
        defaultHeaders['Authorization'] = `Bearer ${token}`;
        console.log('🔐 Using JWT token (no validation)');
      }
    } else {
      console.log('ℹ️ No JWT token available');
    }
    
    console.log('📋 Request headers:', defaultHeaders);

    const config = {
      ...options,
      // ลบ credentials: 'include' เพราะใช้ JWT แทน session cookies
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    const maxRetries = 2; // ลดจาก 3 เป็น 2 เพื่อลด traffic
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        const response = await fetch(url, config);
        
        // Handle 429 (Too Many Requests) with exponential backoff
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After') || Math.pow(2, attempt + 2); // เพิ่ม delay
          const delay = parseInt(retryAfter) * 1000;
          
          if (attempt < maxRetries - 1) {
            console.warn(`🚨 429 Rate Limited - Retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
            await this.sleep(delay);
            attempt++;
            continue;
          } else {
            console.error('❌ Rate limit exceeded - stopping retries');
            throw new Error(`Rate limit exceeded. Please wait before trying again.`);
          }
        }
        
        // Handle 401 Unauthorized (Invalid/Expired Token)
        if (response.status === 401) {
          console.warn('🚨 401 Unauthorized - Invalid or expired token detected');
          
          // ใช้ AuthService ในการจัดการ authentication failure
          if (authService && typeof authService.logout === 'function') {
            console.log('🔄 Using AuthService logout...');
            await authService.logout();
          } else {
            // Fallback: Manual cleanup
            this.clearInvalidTokens();
          }
          
          // Re-enable auto-redirect now that token consistency is fixed
          if (typeof window !== 'undefined' && window.location) {
            console.log('🔄 Redirecting to login page...');
            
            // Check if we're already on a login page
            const currentPath = window.location.pathname;
            if (!currentPath.includes('login') && !currentPath.includes('auth')) {
              // Show alert before redirect
              alert('🔐 Session expired. Please login again.');
              
              // Redirect to login (adjust path as needed)
              const loginUrl = '/login.html'; // or wherever your login page is
              window.location.href = loginUrl;
            }
          }
          
          throw new Error(`Authentication failed: Please login again`);
        }
        
        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        
        return await response.json();
        
      } catch (error) {
        // If it's a rate limit error and we have retries left, continue
        if (error.message.includes('Rate limit') && attempt < maxRetries - 1) {
          attempt++;
          continue;
        }
        
        console.error(`API Request failed for ${endpoint}:`, error);
        throw error;
      }
    }
  }

  // Add sleep helper for rate limiting retry
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Authentication helper methods using AuthService
  isAuthenticated() {
    try {
      return authService && typeof authService.isAuthenticated === 'function' 
        ? authService.isAuthenticated() 
        : !!this.getToken();
    } catch (error) {
      console.error('❌ Failed to check authentication status:', error);
      return false;
    }
  }

  getCurrentUser() {
    try {
      return authService && typeof authService.getCurrentUser === 'function'
        ? authService.getCurrentUser()
        : null;
    } catch (error) {
      console.error('❌ Failed to get current user:', error);
      return null;
    }
  }

  async refreshTokenIfNeeded() {
    try {
      if (authService && typeof authService.refreshSession === 'function') {
        const result = await authService.refreshSession();
        return result && result.success;
      }
      return false;
    } catch (error) {
      console.error('❌ Failed to refresh token:', error);
      return false;
    }
  }

  // GET request
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  // POST request
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // PATCH request
  async patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // Analytics API Methods
  async getDashboardKPIs() {
    try {
      const response = await this.get('/analytics/hotel-kpis');
      return response.data || response;
    } catch (error) {
      console.error('Failed to fetch dashboard KPIs:', error);
      // Return fallback data to prevent UI breaking
      return this.getFallbackKPIs();
    }
  }

  async getRealtimeDashboard() {
    try {
      const response = await this.get('/analytics/realtime-dashboard');
      return response.data || response;
    } catch (error) {
      console.error('Failed to fetch realtime dashboard:', error);
      return this.getFallbackRealtimeData();
    }
  }

  async getRevenueAnalytics(period = 'monthly') {
    try {
      const response = await this.get(`/analytics/revenue?period=${period}`);
      return response.data || response;
    } catch (error) {
      console.error('Failed to fetch revenue analytics:', error);
      return this.getFallbackRevenueData();
    }
  }

  async getOccupancyAnalytics(startDate, endDate) {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      
      const response = await this.get(`/analytics/occupancy?${params.toString()}`);
      return response.data || response;
    } catch (error) {
      console.error('Failed to fetch occupancy analytics:', error);
      return this.getFallbackOccupancyData();
    }
  }

  async getBookingTrends(period = 'daily') {
    try {
      // Generate date range based on period
      const endDate = new Date();
      const startDate = new Date();
      
      switch (period) {
        case 'weekly':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case 'monthly':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        default: // daily
          startDate.setDate(endDate.getDate() - 7);
      }

      const dateFrom = startDate.toISOString().split('T')[0];
      const dateTo = endDate.toISOString().split('T')[0];
      
      const response = await this.get(`/analytics/booking-trends?dateFrom=${dateFrom}&dateTo=${dateTo}&groupBy=day`);
      return response.data || response;
    } catch (error) {
      console.error('Failed to fetch booking trends:', error);
      return this.getFallbackBookingTrends();
    }
  }

  // Fallback data methods (ใช้เมื่อ API ไม่ available)
  getFallbackKPIs() {
    return {
      totalBookings: 1587,
      totalRevenue: 2258000,
      totalCustomers: 2300,
      occupancyRate: 85.5,
      adr: 2500,
      revpar: 2137.5,
      totalRooms: 50,
      availableRooms: 8
    };
  }

  getFallbackRealtimeData() {
    return {
      activeBookings: 42,
      todayCheckins: 8,
      todayCheckouts: 6,
      pendingPayments: 3,
      maintenanceRooms: 2,
      housekeepingTasks: 5
    };
  }

  getFallbackRevenueData() {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return {
      monthly: months.map((month, index) => ({
        month,
        revenue: Math.floor(Math.random() * 500000) + 200000,
        bookings: Math.floor(Math.random() * 100) + 50
      })),
      total: 3500000,
      growth: 12.5
    };
  }

  getFallbackOccupancyData() {
    const days = [];
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push({
        date: date.toISOString().split('T')[0],
        occupancy: Math.floor(Math.random() * 40) + 60, // 60-100%
        totalRooms: 50,
        occupiedRooms: Math.floor(Math.random() * 20) + 30
      });
    }
    return { daily: days };
  }

  getFallbackBookingTrends() {
    const trends = [];
    for (let i = 7; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      trends.push({
        date: date.toISOString().split('T')[0],
        bookings: Math.floor(Math.random() * 20) + 5,
        revenue: Math.floor(Math.random() * 100000) + 50000
      });
    }
    return { daily: trends };
  }

  // Booking API Methods (เพิ่มในอนาคต)
  async getBookings(filters = {}) {
    try {
      const params = new URLSearchParams(filters);
      const response = await this.get(`/bookings?${params.toString()}`);
      return response.data || response;
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      return { bookings: [], total: 0 };
    }
  }

  // Room API Methods (เพิ่มในอนาคต)
  async getRooms() {
    try {
      const response = await this.get('/rooms');
      return response.data || response;
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
      return { rooms: [] };
    }
  }

  // Transaction API Methods (เพิ่มในอนาคต)
  async getTransactions(filters = {}) {
    try {
      const params = new URLSearchParams(filters);
      const response = await this.get(`/financial/transactions?${params.toString()}`);
      return response.data || response;
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      return { transactions: [], total: 0 };
    }
  }

  // ============================================
  // PRIORITY 1 ANALYTICS METHODS
  // ============================================

  // Get revenue trends for chart
  async getRevenueTrends(period = 'daily', days = 30) {
    try {
      const response = await this.request(`/analytics/revenue-trends?period=${period}&days=${days}`);
      return response.data || response;
    } catch (error) {
      console.error('Failed to fetch revenue trends:', error);
      return { trends: [], summary: {} };
    }
  }

  // Get room occupancy by type
  async getRoomOccupancyByType() {
    try {
      const response = await this.request('/analytics/room-occupancy');
      return response.data || response;
    } catch (error) {
      console.error('Failed to fetch room occupancy:', error);
      return { roomTypes: [], chartData: [] };
    }
  }

  // Get payment status overview
  async getPaymentStatusOverview() {
    try {
      const response = await this.request('/analytics/payment-status');
      return response.data || response;
    } catch (error) {
      console.error('Failed to fetch payment status:', error);
      return { paymentStatus: [], chartData: {} };
    }
  }
}

// Create singleton instance
const apiService = new ApiService();

export { apiService };
export default apiService;
