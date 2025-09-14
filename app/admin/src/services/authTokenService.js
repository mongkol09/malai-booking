// Safe logging utility - only logs in development
const safeLog = (message, data) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(message, data);
  }
};

/**
 * Secure Authentication Token Service
 * จัดการ authentication อย่างปลอดภัยสำหรับ Professional Dashboard
 */

class AuthTokenService {
  
  constructor() {
    this.tokenKey = 'hotel_admin_token';
    this.refreshTokenKey = 'hotel_admin_refresh_token';
    this.userKey = 'hotel_admin_user';
    this.baseURL = 'http://localhost:3001/api/v1';
  }

  /**
   * ตรวจสอบว่ามี token ที่ valid อยู่หรือไม่
   */
  hasValidToken() {
    const token = this.getToken();
    const user = this.getUser();
    
    if (!token || !user) {
      safeLog('❌ No token or user found');
      return false;
    }

    // ตรวจสอบ token format (JWT should have 3 parts)
    if (typeof token !== 'string' || token.split('.').length !== 3) {
      console.error('❌ Invalid JWT format');
      this.clearAuthData(); // Clear corrupted token
      return false;
    }

    // ตรวจสอบว่า token หมดอายุหรือไม่
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        throw new Error('Invalid JWT structure');
      }
      
      const payload = JSON.parse(atob(tokenParts[1]));
      const currentTime = Date.now() / 1000;
      
      if (payload.exp && payload.exp < currentTime) {
        safeLog('🔒 Token expired, need refresh');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('❌ Invalid token format:', error);
      this.clearAuthData(); // Clear corrupted token
      return false;
    }
  }

  /**
   * ดึง token จาก localStorage
   */
  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * ดึง refresh token จาก localStorage
   */
  getRefreshToken() {
    return localStorage.getItem(this.refreshTokenKey);
  }

  /**
   * ดึงข้อมูลผู้ใช้จาก localStorage
   */
  getUser() {
    const userStr = localStorage.getItem(this.userKey);
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('❌ Invalid user data:', error);
      return null;
    }
  }

  /**
   * บันทึก authentication data
   */
  saveAuthData(token, refreshToken, user) {
    // ✅ Map userType to role for compatibility
    const mappedUser = {
      ...user,
      role: user.userType || user.role // ใช้ userType จาก API
    };
    
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.refreshTokenKey, refreshToken);
    localStorage.setItem(this.userKey, JSON.stringify(mappedUser));
    safeLog('✅ Authentication data saved for role:', mappedUser.role);
  }

  /**
   * ลบ authentication data ทั้งหมด
   */
  clearAuthData() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.userKey);
    safeLog('🗑️ Authentication data cleared');
  }

  /**
   * สร้าง headers สำหรับ API request
   */
  getAuthHeaders() {
    const token = this.getToken();
    
    return {
      'Content-Type': 'application/json',
      'X-API-Key': process.env.REACT_APP_API_KEY || process.env.REACT_APP_API_KEY_FALLBACK,
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  /**
   * Login แบบปลอดภัย
   */
  async login(username, password) {
    try {
      safeLog('🔐 Attempting secure login...');
      
      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.REACT_APP_API_KEY || process.env.REACT_APP_API_KEY_FALLBACK
        },
        body: JSON.stringify({
          email: username.trim(),  // ✅ ใช้ email แทน username
          password: password
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        // ✅ ปรับให้ตรงกับ API response structure
        const { tokens, user } = result.data;
        const { accessToken, refreshToken } = tokens;
        
        // บันทึก authentication data
        this.saveAuthData(
          accessToken, 
          refreshToken,
          user
        );
        
        safeLog('✅ Login successful:', user.email);
        return {
          success: true,
          user: user,
          token: accessToken
        };
      } else {
        throw new Error(result.error?.message || 'Login failed');
      }

    } catch (error) {
      console.error('❌ Login failed:', error);
      this.clearAuthData();
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Refresh token อย่างปลอดภัย
   */
  async refreshToken() {
    try {
      const refreshToken = this.getRefreshToken();
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      safeLog('🔄 Refreshing token...');
      
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.REACT_APP_API_KEY || process.env.REACT_APP_API_KEY_FALLBACK
        },
        body: JSON.stringify({
          refreshToken: refreshToken
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        // Handle both response formats: result.data.token และ result.data.tokens.accessToken
        const newToken = result.data.token || result.data.tokens?.accessToken;
        const newRefreshToken = result.data.refreshToken || result.data.tokens?.refreshToken;
        
        safeLog('🔍 Refresh response structure:', result.data);
        safeLog('🔑 Extracted tokens:', { newToken: newToken ? 'Present' : 'Missing', newRefreshToken: newRefreshToken ? 'Present' : 'Missing' });
        
        // Validate new token format before saving
        if (typeof newToken === 'string' && newToken.split('.').length === 3) {
          // อัปเดต token ใหม่
          this.saveAuthData(
            newToken,
            newRefreshToken || refreshToken,
            result.data.user || this.getUser()
          );
          
          safeLog('✅ Token refreshed successfully');
          return {
            success: true,
            token: newToken
          };
        } else {
          console.error('❌ Received invalid token format from refresh');
          this.clearAuthData();
          throw new Error('Invalid token format received from server');
        }
      } else {
        throw new Error(result.error?.message || 'Token refresh failed');
      }

    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      this.clearAuthData();
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * ทำ authenticated request
   */
  async authenticatedRequest(url, options = {}) {
    safeLog('🔐 ===== AUTHENTICATED REQUEST =====');
    safeLog('🌐 URL:', url);
    safeLog('📋 Options:', options);
    
    try {
      // ตรวจสอบ token ก่อน
      safeLog('🔍 Checking token validity...');
      if (!this.hasValidToken()) {
        safeLog('❌ Token invalid, attempting refresh...');
        // พยายาม refresh token
        const refreshResult = await this.refreshToken();
        
        if (!refreshResult.success) {
          console.error('❌ Token refresh failed');
          throw new Error('Authentication failed - please login again');
        }
        safeLog('✅ Token refreshed successfully');
      } else {
        safeLog('✅ Token is valid');
      }

      // ทำ request พร้อม authentication headers
      const authHeaders = this.getAuthHeaders();
      safeLog('🔑 Auth headers:', authHeaders);
      
      const finalHeaders = {
        ...authHeaders,
        ...options.headers
      };
      safeLog('📋 Final headers:', finalHeaders);
      
      safeLog('🚀 Making fetch request...');
      const response = await fetch(url, {
        ...options,
        headers: finalHeaders
      });
      
      safeLog('📡 Fetch response received:');
      safeLog('  - Status:', response.status);
      safeLog('  - OK:', response.ok);

      // ถ้า unauthorized ลองเรียก refresh token อีกรอบ
      if (response.status === 401) {
        safeLog('🔄 Token expired, attempting refresh...');
        
        const refreshResult = await this.refreshToken();
        
        if (refreshResult.success) {
          // Retry request ด้วย token ใหม่
          return await fetch(url, {
            ...options,
            headers: {
              ...this.getAuthHeaders(),
              ...options.headers
            }
          });
        } else {
          throw new Error('Authentication failed - please login again');
        }
      }

      return response;

    } catch (error) {
      console.error('❌ Authenticated request failed:', error);
      throw error;
    }
  }

  /**
   * Logout อย่างปลอดภัย
   */
  async logout() {
    try {
      const token = this.getToken();
      
      if (token) {
        // เรียก API logout เพื่อ invalidate token บน server
        await fetch(`${this.baseURL}/auth/logout`, {
          method: 'POST',
          headers: this.getAuthHeaders()
        });
      }

    } catch (error) {
      console.error('❌ Logout API failed:', error);
    } finally {
      // ลบ data ใน client เสมอ
      this.clearAuthData();
      safeLog('✅ Logout completed');
    }
  }

  /**
   * ตรวจสอบสิทธิ์การเข้าถึง
   */
  hasPermission(permission) {
    const user = this.getUser();
    
    safeLog('🔍 hasPermission called for:', permission);
    safeLog('🔍 Current user:', user);
    
    if (!user) {
      safeLog('❌ No user found');
      return false;
    }
    
    if (!user.permissions) {
      safeLog('❌ No permissions array found, assuming DEV has all permissions');
      // DEV role should have all permissions even without explicit permissions array
      return user.role === 'DEV' || user.role === 'dev' || user.role === 'admin';
    }

    // ตรวจสอบ role และ permission
    const hasRole = user.role === 'admin' || 
                   user.role === 'manager' || 
                   user.role === 'DEV' || 
                   user.role === 'dev';
    const hasPermission = user.permissions.includes(permission) || 
                         user.permissions.includes('*') ||
                         user.role === 'admin' ||
                         user.role === 'DEV' ||
                         user.role === 'dev';

    safeLog('🔍 Permission check results:');
    safeLog('  - hasRole:', hasRole);
    safeLog('  - hasPermission:', hasPermission);
    safeLog('  - final result:', hasRole && hasPermission);

    return hasRole && hasPermission;
  }

  /**
   * สร้าง demo login สำหรับ development (ต้องลบในการใช้งานจริง)
   */
  async demoLogin() {
    safeLog('🚨 DEMO LOGIN - FOR DEVELOPMENT ONLY');
    
    // สร้าง mock user data สำหรับ demo
    const mockUser = {
      id: 'demo-user',
      username: 'demo-admin',
      role: 'admin',
      permissions: ['*'],
      firstName: 'Demo',
      lastName: 'Admin'
    };

    // สร้าง mock token ที่ valid 24 ชั่วโมง
    const mockToken = this.createMockToken(mockUser);
    
    this.saveAuthData(mockToken, 'mock-refresh-token', mockUser);
    
    return {
      success: true,
      user: mockUser,
      token: mockToken
    };
  }

  /**
   * สร้าง mock token สำหรับ demo (ใช้เฉพาะ development)
   */
  createMockToken(user) {
    const header = { alg: 'HS256', typ: 'JWT' };
    const payload = {
      userId: user.id,
      username: user.username,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    };

    // สร้าง JWT-like token สำหรับ demo
    const encodedHeader = btoa(JSON.stringify(header));
    const encodedPayload = btoa(JSON.stringify(payload));
    const signature = 'demo-signature';

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }
}

// Export singleton instance
const authTokenService = new AuthTokenService();
export default authTokenService;
