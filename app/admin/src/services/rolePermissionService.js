// Role Permission Service สำหรับ Hotel Admin Panel
// จัดการ Roles, Permissions และการตรวจสอบสิทธิ์

class RolePermissionService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';
    this.cache = {
      roles: null,
      permissions: null,
      userRole: null,
      lastFetch: null
    };
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
  }

  // Helper method สำหรับ API calls
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    // เพิ่ม Authorization header ถ้ามี token
    const token = localStorage.getItem('hotel_admin_token');
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

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Role Permission API Error:', error);
      throw error;
    }
  }

  // ตรวจสอบ cache ยังใช้ได้หรือไม่
  isCacheValid() {
    if (!this.cache.lastFetch) return false;
    return (Date.now() - this.cache.lastFetch) < this.cacheExpiry;
  }

  // ล้าง cache
  clearCache() {
    this.cache = {
      roles: null,
      permissions: null,
      userRole: null,
      lastFetch: null
    };
  }

  // ดึงข้อมูล roles ทั้งหมด
  async getRoles() {
    try {
      if (this.cache.roles && this.isCacheValid()) {
        return this.cache.roles;
      }

      const response = await this.request('/role-permissions/roles');
      this.cache.roles = response.data || response;
      this.cache.lastFetch = Date.now();
      
      return this.cache.roles;
    } catch (error) {
      console.error('Failed to fetch roles:', error);
      throw error;
    }
  }

  // ดึงข้อมูล role permissions ทั้งหมด
  async getRolePermissions() {
    try {
      if (this.cache.permissions && this.isCacheValid()) {
        return this.cache.permissions;
      }

      const response = await this.request('/role-permissions/role-permissions');
      this.cache.permissions = response.data || response;
      this.cache.lastFetch = Date.now();
      
      return this.cache.permissions;
    } catch (error) {
      console.error('Failed to fetch role permissions:', error);
      throw error;
    }
  }

  // ดึงข้อมูล role ของผู้ใช้ปัจจุบัน
  async getCurrentUserRole() {
    try {
      if (this.cache.userRole && this.isCacheValid()) {
        return this.cache.userRole;
      }

      const response = await this.request('/role-permissions/users/me/role');
      this.cache.userRole = response.data || response;
      this.cache.lastFetch = Date.now();
      
      return this.cache.userRole;
    } catch (error) {
      console.error('Failed to fetch user role:', error);
      throw error;
    }
  }

  // ตรวจสอบสิทธิ์ในการเข้าถึง resource
  async hasPermission(resource, action) {
    try {
      const userRole = await this.getCurrentUserRole();
      if (!userRole || !userRole.permissions) {
        return false;
      }

      const permission = userRole.permissions.find(p => p.resourceName === resource);
      if (!permission) {
        return false;
      }

      switch (action.toLowerCase()) {
        case 'read':
          return permission.canRead;
        case 'write':
          return permission.canWrite;
        case 'create':
          return permission.canCreate;
        case 'delete':
          return permission.canDelete;
        default:
          return false;
      }
    } catch (error) {
      console.error('Permission check failed:', error);
      return false;
    }
  }

  // ตรวจสอบว่าเป็น role ที่กำหนดหรือไม่
  async hasRole(roleName) {
    try {
      const userRole = await this.getCurrentUserRole();
      return userRole && userRole.role && userRole.role.name === roleName;
    } catch (error) {
      console.error('Role check failed:', error);
      return false;
    }
  }

  // ตรวจสอบว่าเป็น Admin หรือสูงกว่า
  async isAdmin() {
    try {
      const isSuper = await this.hasRole('Super Admin');
      const isAdmin = await this.hasRole('Admin');
      return isSuper || isAdmin;
    } catch (error) {
      console.error('Admin check failed:', error);
      return false;
    }
  }

  // ตรวจสอบว่าเป็น Super Admin
  async isSuperAdmin() {
    return await this.hasRole('Super Admin');
  }

  // สร้าง role ใหม่
  async createRole(roleData) {
    try {
      const response = await this.request('/role-permissions/roles', {
        method: 'POST',
        body: JSON.stringify(roleData),
      });

      this.clearCache(); // ล้าง cache เพื่ือให้ดึงข้อมูลใหม่
      return response;
    } catch (error) {
      console.error('Failed to create role:', error);
      throw error;
    }
  }

  // อัพเดท role
  async updateRole(roleId, roleData) {
    try {
      const response = await this.request(`/role-permissions/roles/${roleId}`, {
        method: 'PUT',
        body: JSON.stringify(roleData),
      });

      this.clearCache();
      return response;
    } catch (error) {
      console.error('Failed to update role:', error);
      throw error;
    }
  }

  // ลบ role
  async deleteRole(roleId) {
    try {
      const response = await this.request(`/role-permissions/roles/${roleId}`, {
        method: 'DELETE',
      });

      this.clearCache();
      return response;
    } catch (error) {
      console.error('Failed to delete role:', error);
      throw error;
    }
  }

  // อัพเดท permissions ของ role
  async updateRolePermissions(roleId, permissions) {
    try {
      const response = await this.request(`/role-permissions/roles/${roleId}/permissions`, {
        method: 'PUT',
        body: JSON.stringify({ permissions }),
      });

      this.clearCache();
      return response;
    } catch (error) {
      console.error('Failed to update role permissions:', error);
      throw error;
    }
  }

  // ดึงรายการ resources ที่มีให้ใช้งาน
  getAvailableResources() {
    return [
      'users',
      'roles', 
      'bookings',
      'rooms',
      'reports',
      'settings',
      'promocodes',
      'events'
    ];
  }

  // ดึงรายการ actions ที่มีให้ใช้งาน
  getAvailableActions() {
    return ['read', 'write', 'create', 'delete'];
  }
}

// สร้าง singleton instance
const rolePermissionService = new RolePermissionService();

export { rolePermissionService };
export default rolePermissionService;
