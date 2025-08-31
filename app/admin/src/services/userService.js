// User Management Service สำหรับ Hotel Admin Panel
// เชื่อมต่อกับ Backend User Management APIs

class UserService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';
    this.tokenKey = 'hotel_admin_token';
    this.userKey = 'hotel_admin_user';
  }

  // Helper methods for token management
  getToken() {
    try {
      return localStorage.getItem(this.tokenKey);
    } catch (error) {
      console.error('Failed to get token:', error);
      return null;
    }
  }

  clearAuthData() {
    try {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem('hotel_admin_refresh_token');
      localStorage.removeItem(this.userKey);
    } catch (error) {
      console.error('Failed to clear auth data:', error);
    }
  }

  isTokenValid() {
    const token = this.getToken();
    if (!token) return false;

    try {
      // ตรวจสอบว่า token เป็น JWT format (3 parts separated by dots)
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.error('Invalid JWT format - token must have 3 parts');
        return false;
      }

      // Decode JWT token to check expiration
      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      // ตรวจสอบว่า token หมดอายุหรือไม่ (เพิ่ม buffer 60 วินาที)
      const isValid = payload.exp > (currentTime + 60);
      
      if (!isValid) {
        console.log('Token expired, clearing auth data');
        this.clearAuthData();
      }
      
      return isValid;
    } catch (error) {
      console.error('Token validation failed:', error);
      // ถ้า token corrupted ให้ clear ออก
      this.clearAuthData();
      return false;
    }
  }

  // Helper method สำหรับ API calls
  async request(endpoint, options = {}) {
    // ตรวจสอบ token ก่อนส่ง request
    if (!this.isTokenValid()) {
      console.warn('User not authenticated, token invalid');
      throw new Error('Authentication required - please login again');
    }

    const url = `${this.baseURL}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    // เพิ่ม Authorization header
    const token = this.getToken();
    if (token) {
      defaultHeaders.Authorization = `Bearer ${token}`;
    }

    const config = {
      ...options,
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
        console.warn('Token expired or invalid (401 response)');
        this.clearAuthData();
        throw new Error('Authentication expired - please login again');
      }

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('User API Error:', error);
      throw error;
    }
  }

  // ============================================
  // USER MANAGEMENT METHODS
  // ============================================

  /**
   * รายการผู้ใช้ทั้งหมด (Admin)
   */
  async getAllUsers(params = {}) {
    const searchParams = new URLSearchParams();
    
    // เพิ่ม query parameters ถ้ามี
    if (params.page) searchParams.append('page', params.page);
    if (params.limit) searchParams.append('limit', params.limit);
    if (params.search) searchParams.append('search', params.search);
    if (params.role) searchParams.append('role', params.role);
    if (params.status) searchParams.append('status', params.status);

    const queryString = searchParams.toString();
    const endpoint = `/users${queryString ? `?${queryString}` : ''}`;
    
    return await this.request(endpoint, {
      method: 'GET',
    });
  }

  /**
   * ข้อมูลผู้ใช้เฉพาะ
   */
  async getUserById(userId) {
    return await this.request(`/users/${userId}`, {
      method: 'GET',
    });
  }

  /**
   * ข้อมูลผู้ใช้ปัจจุบัน
   */
  async getCurrentUser() {
    return await this.request('/users/me', {
      method: 'GET',
    });
  }

  /**
   * สร้างผู้ใช้ใหม่ (Admin)
   */
  async createUser(userData) {
    return await this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  /**
   * แก้ไขข้อมูลผู้ใช้ (Admin)
   */
  async updateUser(userId, userData) {
    console.log('🔄 userService.updateUser called with:', { userId, userData });
    const response = await this.request(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
    console.log('📥 userService.updateUser response:', response);
    return response;
  }

  /**
   * ลบผู้ใช้ (Admin)
   */
  async deleteUser(userId) {
    return await this.request(`/users/${userId}`, {
      method: 'DELETE',
    });
  }

  /**
   * แก้ไขข้อมูลส่วนตัว
   */
  async updateProfile(userData) {
    return await this.request('/users/me', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  /**
   * เปลี่ยนรหัสผ่าน
   */
  async changePassword(passwordData) {
    return await this.request('/users/me/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  }

  /**
   * เปลี่ยนสถานะผู้ใช้ (Admin)
   */
  async updateUserStatus(userId, status) {
    return await this.request(`/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  /**
   * กำหนด Role ให้ผู้ใช้ (Admin)
   */
  async assignRole(userId, roleId) {
    return await this.request(`/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ roleId }),
    });
  }

  /**
   * รีเซ็ตรหัสผ่านผู้ใช้ (Admin)
   */
  async resetUserPassword(userId) {
    return await this.request(`/users/${userId}/reset-password`, {
      method: 'POST',
    });
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  /**
   * ตรวจสอบสิทธิ์การเข้าถึง
   */
  canAccessUserManagement() {
    const user = JSON.parse(localStorage.getItem('hotel_admin_user') || '{}');
    return user.role === 'admin' || user.role === 'super_admin';
  }

  /**
   * สร้าง query string จาก object
   */
  buildQueryString(params) {
    const searchParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        searchParams.append(key, params[key]);
      }
    });
    return searchParams.toString();
  }

  /**
   * Format ข้อมูลผู้ใช้สำหรับแสดงผล
   */
  formatUserData(user) {
    return {
      ...user,
      fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      displayRole: this.formatRole(user.role),
      displayStatus: this.formatStatus(user.status),
      joinedDate: new Date(user.createdAt).toLocaleDateString('th-TH'),
      lastLogin: user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('th-TH') : 'ไม่เคยเข้าสู่ระบบ'
    };
  }

  /**
   * Format Role สำหรับแสดงผล
   */
  formatRole(role) {
    const roleMap = {
      'admin': 'ผู้ดูแลระบบ',
      'super_admin': 'ผู้ดูแลระบบสูงสุด',
      'manager': 'ผู้จัดการ',
      'staff': 'พนักงาน',
      'user': 'ผู้ใช้งาน'
    };
    return roleMap[role] || role;
  }

  /**
   * Format Status สำหรับแสดงผล
   */
  formatStatus(status) {
    const statusMap = {
      'active': 'ใช้งานอยู่',
      'inactive': 'ปิดการใช้งาน',
      'pending': 'รอยืนยัน',
      'suspended': 'ถูกระงับ'
    };
    return statusMap[status] || status;
  }

  /**
   * ตรวจสอบ validation ข้อมูลผู้ใช้
   */
  validateUserData(userData) {
    const errors = {};

    if (!userData.email) {
      errors.email = 'อีเมลเป็นข้อมูลที่จำเป็น';
    } else if (!/\S+@\S+\.\S+/.test(userData.email)) {
      errors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
    }

    if (!userData.firstName) {
      errors.firstName = 'ชื่อเป็นข้อมูลที่จำเป็น';
    }

    if (!userData.lastName) {
      errors.lastName = 'นามสกุลเป็นข้อมูลที่จำเป็น';
    }

    if (!userData.role) {
      errors.role = 'ตำแหน่งเป็นข้อมูลที่จำเป็น';
    }

    if (userData.password && userData.password.length < 6) {
      errors.password = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}

// Export singleton instance
const userService = new UserService();
export default userService;
