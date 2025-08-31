// Authentication Service สำหรับ Hotel Admin Panel
// เชื่อมต่อกับ Backend Authentication APIs อย่างปลอดภัย

class AuthService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';
    this.tokenKey = 'hotel_admin_token';
    this.refreshTokenKey = 'hotel_admin_refresh_token';
    this.userKey = 'hotel_admin_user';
  }

  // Helper method สำหรับ API calls (Session-based)
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    // เพิ่ม Authorization header ถ้ามี token (รองรับทั้ง JWT และ Session)
    const token = this.getToken();
    if (token) {
      defaultHeaders.Authorization = `Bearer ${token}`;
    }

    const config = {
      ...options,
      credentials: 'include', // สำคัญ! เพื่อส่ง cookies สำหรับ session auth
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      // ถ้า token หมดอายุหรือไม่ valid
      if (response.status === 401) {
        console.warn('Authentication failed, clearing auth data');
        this.clearAuthData();
        // Redirect to login page
        window.location.href = '/login';
        throw new Error('Please login again');
      }

      if (!response.ok) {
        console.error('Auth API Error:', new Error(`HTTP error! status: ${response.status}`));
        throw new Error(data.error?.message || data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Auth API Error:', error);
      throw error;
    }
  }

  // ============================================
  // TOKEN MANAGEMENT (Local Storage)
  // ============================================

  setToken(token) {
    try {
      localStorage.setItem(this.tokenKey, token);
    } catch (error) {
      console.error('Failed to save token:', error);
    }
  }

  getToken() {
    try {
      return localStorage.getItem(this.tokenKey);
    } catch (error) {
      console.error('Failed to get token:', error);
      return null;
    }
  }

  setRefreshToken(refreshToken) {
    try {
      localStorage.setItem(this.refreshTokenKey, refreshToken);
    } catch (error) {
      console.error('Failed to save refresh token:', error);
    }
  }

  getRefreshToken() {
    try {
      return localStorage.getItem(this.refreshTokenKey);
    } catch (error) {
      console.error('Failed to get refresh token:', error);
      return null;
    }
  }

  setUser(user) {
    try {
      localStorage.setItem(this.userKey, JSON.stringify(user));
    } catch (error) {
      console.error('Failed to save user data:', error);
    }
  }

  getUser() {
    try {
      const userData = localStorage.getItem(this.userKey);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Failed to get user data:', error);
      return null;
    }
  }

  clearAuthData() {
    try {
      // Clear all possible token keys
      const tokenKeys = [
        this.tokenKey,           // 'hotel_admin_token'
        this.refreshTokenKey,    // 'hotel_admin_refresh_token' 
        this.userKey,           // 'hotel_admin_user'
        'token',                // Generic token key used by apiService
        'authToken',            // Alternative token key
        'accessToken'           // Another possible token key
      ];
      
      console.log('🧹 Clearing all authentication data...');
      
      tokenKeys.forEach(key => {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key);
          console.log(`🗑️ Cleared: ${key}`);
        }
      });
      
      console.log('✅ All authentication data cleared successfully');
    } catch (error) {
      console.error('Failed to clear auth data:', error);
    }
  }

  // ============================================
  // TOKEN VALIDATION & UTILITIES
  // ============================================

  // ตรวจสอบว่า token ยัง valid หรือไม่
  isTokenValid() {
    const token = this.getToken();
    if (!token) return false;

    try {
      // ตรวจสอบรูปแบบ JWT token (ต้องมี 3 ส่วนคั่นด้วย ".")
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        console.warn('⚠️ Invalid token format - not a JWT token');
        return false;
      }

      // Decode JWT token to check expiration
      const payload = JSON.parse(atob(tokenParts[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      // ตรวจสอบว่า token หมดอายุหรือไม่ (เพิ่ม buffer 60 วินาที)
      return payload.exp > (currentTime + 60);
    } catch (error) {
      console.error('Token validation failed:', error);
      // หากมีปัญหาในการ decode ให้ล้าง token ทิ้ง
      this.clearAuthData();
      return false;
    }
  }

  // ตรวจสอบว่าผู้ใช้ล็อกอินแล้วหรือไม่
  isAuthenticated() {
    return this.isTokenValid() && !!this.getUser();
  }

  // ลบข้อมูล authentication และ redirect ไป login
  forceLogout() {
    this.clearAuthData();
    window.location.href = '/login';
  }

  // Force clear all tokens (for troubleshooting)
  forceClearAllTokens() {
    try {
      console.log('🚨 Force clearing ALL tokens and data...');
      
      // Clear localStorage completely (only auth-related keys)
      const allKeys = Object.keys(localStorage);
      const authRelatedKeys = allKeys.filter(key => 
        key.includes('token') || 
        key.includes('auth') || 
        key.includes('user') ||
        key.includes('admin') ||
        key.includes('hotel')
      );
      
      authRelatedKeys.forEach(key => {
        localStorage.removeItem(key);
        console.log(`🗑️ Force removed: ${key}`);
      });
      
      // Also clear sessionStorage
      const sessionKeys = Object.keys(sessionStorage);
      const sessionAuthKeys = sessionKeys.filter(key => 
        key.includes('token') || 
        key.includes('auth') || 
        key.includes('user')
      );
      
      sessionAuthKeys.forEach(key => {
        sessionStorage.removeItem(key);
        console.log(`🗑️ Force removed from session: ${key}`);
      });
      
      console.log('💥 Force clear completed!');
      return true;
    } catch (error) {
      console.error('❌ Force clear failed:', error);
      return false;
    }
  }

  // ============================================
  // AUTHENTICATION METHODS
  // ============================================

  // เข้าสู่ระบบ
  async login(email, password) {
    try {
      const response = await this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (response.success && response.data) {
        const { user, tokens } = response.data;
        const { accessToken, refreshToken } = tokens;
        
        // บันทึกข้อมูล authentication
        this.setToken(accessToken);
        this.setRefreshToken(refreshToken);
        this.setUser(user);

        console.log('✅ Token saved successfully:', {
          token: accessToken ? `${accessToken.substring(0, 20)}...` : 'undefined',
          user: user.email,
          localStorage: !!localStorage.getItem(this.tokenKey)
        });

        return {
          success: true,
          user,
          message: 'เข้าสู่ระบบสำเร็จ'
        };
      }

      throw new Error(response.message || 'เข้าสู่ระบบไม่สำเร็จ');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  // ลงทะเบียนผู้ใช้ใหม่
  async register(userData) {
    try {
      const response = await this.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          ...userData,
          userType: 'ADMIN' // กำหนดเป็น ADMIN สำหรับ admin panel
        }),
      });

      if (response.success) {
        return {
          success: true,
          message: 'ลงทะเบียนสำเร็จ โปรดตรวจสอบอีเมลเพื่อยืนยันบัญชี',
          data: response.data
        };
      }

      throw new Error(response.message || 'ลงทะเบียนไม่สำเร็จ');
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }

  // ออกจากระบบ
  async logout() {
    try {
      const refreshToken = this.getRefreshToken();
      
      if (refreshToken) {
        await this.request('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refreshToken }),
        });
      }
    } catch (error) {
      console.error('Logout request failed:', error);
      // ไม่ throw error เพราะ local logout ยังทำงานได้
    } finally {
      // ล้างข้อมูล authentication จาก local storage
      this.clearAuthData();
    }

    return { success: true, message: 'ออกจากระบบสำเร็จ' };
  }

  // รีเฟรช token
  async refreshToken() {
    try {
      const refreshToken = this.getRefreshToken();
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await this.request('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });

      if (response.success && response.data) {
        const { accessToken, refreshToken: newRefreshToken } = response.data;
        
        this.setToken(accessToken);
        if (newRefreshToken) {
          this.setRefreshToken(newRefreshToken);
        }

        return { success: true };
      }

      throw new Error('Token refresh failed');
    } catch (error) {
      console.error('Token refresh failed:', error);
      // ถ้า refresh ไม่ได้ ให้ logout
      this.clearAuthData();
      throw error;
    }
  }

  // ขอรีเซ็ตรหัสผ่าน
  async forgotPassword(email) {
    try {
      const response = await this.request('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      if (response.success) {
        return {
          success: true,
          message: 'ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลแล้ว'
        };
      }

      throw new Error(response.message || 'ส่งอีเมลรีเซ็ตรหัสผ่านไม่สำเร็จ');
    } catch (error) {
      console.error('Forgot password failed:', error);
      throw error;
    }
  }

  // รีเซ็ตรหัสผ่าน
  async resetPassword(token, newPassword) {
    try {
      const response = await this.request('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ 
          token, 
          newPassword,
          confirmPassword: newPassword 
        }),
      });

      if (response.success) {
        return {
          success: true,
          message: 'รีเซ็ตรหัสผ่านสำเร็จ'
        };
      }

      throw new Error(response.message || 'รีเซ็ตรหัสผ่านไม่สำเร็จ');
    } catch (error) {
      console.error('Password reset failed:', error);
      throw error;
    }
  }

  // เปลี่ยนรหัสผ่าน (สำหรับผู้ใช้ที่ล็อกอินแล้ว)
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await this.request('/users/me/password', {
        method: 'PUT',
        body: JSON.stringify({ 
          currentPassword, 
          newPassword,
          confirmPassword: newPassword 
        }),
      });

      if (response.success) {
        return {
          success: true,
          message: 'เปลี่ยนรหัสผ่านสำเร็จ'
        };
      }

      throw new Error(response.message || 'เปลี่ยนรหัสผ่านไม่สำเร็จ');
    } catch (error) {
      console.error('Change password failed:', error);
      throw error;
    }
  }

  // ยืนยันอีเมล
  async verifyEmail(token) {
    try {
      const response = await this.request(`/auth/verify-email/${token}`, {
        method: 'GET',
      });

      if (response.success) {
        return {
          success: true,
          message: 'ยืนยันอีเมลสำเร็จ'
        };
      }

      throw new Error(response.message || 'ยืนยันอีเมลไม่สำเร็จ');
    } catch (error) {
      console.error('Email verification failed:', error);
      throw error;
    }
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  // ตรวจสอบสิทธิ์
  hasRole(role) {
    const user = this.getUser();
    return user && user.userType === role;
  }

  // ตรวจสอบว่าเป็น Admin หรือไม่
  isAdmin() {
    return this.hasRole('ADMIN');
  }

  // ตรวจสอบว่าเป็น Staff หรือไม่
  isStaff() {
    return this.hasRole('STAFF');
  }

  // ตรวจสอบว่ามีสิทธิ์ admin หรือ staff
  hasAdminAccess() {
    return this.isAdmin() || this.isStaff();
  }

  // ดึงข้อมูลผู้ใช้ปัจจุบัน
  getCurrentUser() {
    return this.getUser();
  }
}

// สร้าง singleton instance
const authService = new AuthService();

export { authService };
export default authService;
