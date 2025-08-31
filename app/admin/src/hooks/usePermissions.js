import { useState, useEffect, useCallback } from 'react';
import rolePermissionService from '../services/rolePermissionService';

// Hook สำหรับตรวจสอบ permissions
export const usePermissions = () => {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // โหลดข้อมูล role ของผู้ใช้
  const loadUserRole = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const role = await rolePermissionService.getCurrentUserRole();
      setUserRole(role);
    } catch (err) {
      setError(err.message);
      console.error('Failed to load user role:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserRole();
  }, [loadUserRole]);

  // ตรวจสอบสิทธิ์ในการเข้าถึง resource
  const hasPermission = useCallback((resource, action) => {
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
  }, [userRole]);

  // ตรวจสอบ role
  const hasRole = useCallback((roleName) => {
    return userRole && userRole.role && userRole.role.name === roleName;
  }, [userRole]);

  // ตรวจสอบว่าเป็น Admin หรือสูงกว่า
  const isAdmin = useCallback(() => {
    return hasRole('Super Admin') || hasRole('Admin');
  }, [hasRole]);

  // ตรวจสอบว่าเป็น Super Admin
  const isSuperAdmin = useCallback(() => {
    return hasRole('Super Admin');
  }, [hasRole]);

  // รีเฟรช permissions
  const refreshPermissions = useCallback(() => {
    rolePermissionService.clearCache();
    loadUserRole();
  }, [loadUserRole]);

  return {
    userRole,
    loading,
    error,
    hasPermission,
    hasRole,
    isAdmin,
    isSuperAdmin,
    refreshPermissions
  };
};

// Hook สำหรับจัดการ roles
export const useRoles = () => {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // โหลดข้อมูล roles และ permissions
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [rolesData, permissionsData] = await Promise.all([
        rolePermissionService.getRoles(),
        rolePermissionService.getRolePermissions()
      ]);
      
      setRoles(rolesData);
      setPermissions(permissionsData);
    } catch (err) {
      setError(err.message);
      console.error('Failed to load roles data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // สร้าง role ใหม่
  const createRole = useCallback(async (roleData) => {
    try {
      const result = await rolePermissionService.createRole(roleData);
      await loadData(); // รีโหลดข้อมูล
      return result;
    } catch (err) {
      console.error('Failed to create role:', err);
      throw err;
    }
  }, [loadData]);

  // อัพเดท role
  const updateRole = useCallback(async (roleId, roleData) => {
    try {
      const result = await rolePermissionService.updateRole(roleId, roleData);
      await loadData(); // รีโหลดข้อมูล
      return result;
    } catch (err) {
      console.error('Failed to update role:', err);
      throw err;
    }
  }, [loadData]);

  // ลบ role
  const deleteRole = useCallback(async (roleId) => {
    try {
      const result = await rolePermissionService.deleteRole(roleId);
      await loadData(); // รีโหลดข้อมูล
      return result;
    } catch (err) {
      console.error('Failed to delete role:', err);
      throw err;
    }
  }, [loadData]);

  // อัพเดท permissions ของ role
  const updateRolePermissions = useCallback(async (roleId, permissionsData) => {
    try {
      const result = await rolePermissionService.updateRolePermissions(roleId, permissionsData);
      await loadData(); // รีโหลดข้อมูล
      return result;
    } catch (err) {
      console.error('Failed to update role permissions:', err);
      throw err;
    }
  }, [loadData]);

  // รีเฟรชข้อมูล
  const refreshData = useCallback(() => {
    rolePermissionService.clearCache();
    loadData();
  }, [loadData]);

  return {
    roles,
    permissions,
    loading,
    error,
    createRole,
    updateRole,
    deleteRole,
    updateRolePermissions,
    refreshData
  };
};
