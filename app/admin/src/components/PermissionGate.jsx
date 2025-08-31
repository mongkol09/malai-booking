import React from 'react';
import { usePermissions } from '../hooks/usePermissions';

// Component สำหรับการตรวจสอบสิทธิ์และแสดงผล UI ตาม permissions
const PermissionGate = ({ 
  resource, 
  action, 
  role, 
  children, 
  fallback = null,
  loading = null 
}) => {
  const { hasPermission, hasRole, loading: permissionLoading } = usePermissions();

  // แสดง loading state
  if (permissionLoading) {
    return loading || (
      <div className="d-flex justify-content-center">
        <div className="spinner-border spinner-border-sm" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // ตรวจสอบ permission ถ้ามี resource และ action
  if (resource && action) {
    if (!hasPermission(resource, action)) {
      return fallback;
    }
  }

  // ตรวจสอบ role ถ้าระบุ
  if (role) {
    if (!hasRole(role)) {
      return fallback;
    }
  }

  // แสดง children ถ้าผ่านการตรวจสอบ
  return children;
};

// Component สำหรับปุ่มที่ต้องการ permission
export const PermissionButton = ({ 
  resource, 
  action, 
  role,
  children, 
  className = 'btn btn-primary',
  disabled = false,
  ...props 
}) => {
  const { hasPermission, hasRole, loading } = usePermissions();

  // ตรวจสอบ permission
  let hasAccess = true;
  if (resource && action) {
    hasAccess = hasPermission(resource, action);
  }
  if (role && hasAccess) {
    hasAccess = hasRole(role);
  }

  if (!hasAccess) {
    return null; // ไม่แสดงปุ่มถ้าไม่มีสิทธิ์
  }

  return (
    <button 
      className={className}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
};

// Component สำหรับ Link ที่ต้องการ permission
export const PermissionLink = ({ 
  resource, 
  action, 
  role,
  children, 
  className = '',
  ...props 
}) => {
  const { hasPermission, hasRole } = usePermissions();

  // ตรวจสอบ permission
  let hasAccess = true;
  if (resource && action) {
    hasAccess = hasPermission(resource, action);
  }
  if (role && hasAccess) {
    hasAccess = hasRole(role);
  }

  if (!hasAccess) {
    return null; // ไม่แสดง link ถ้าไม่มีสิทธิ์
  }

  return (
    <a className={className} {...props}>
      {children}
    </a>
  );
};

// Component สำหรับ Menu Item ที่ต้องการ permission
export const PermissionMenuItem = ({ 
  resource, 
  action, 
  role,
  children, 
  className = '',
  ...props 
}) => {
  const { hasPermission, hasRole } = usePermissions();

  // ตรวจสอบ permission
  let hasAccess = true;
  if (resource && action) {
    hasAccess = hasPermission(resource, action);
  }
  if (role && hasAccess) {
    hasAccess = hasRole(role);
  }

  if (!hasAccess) {
    return null; // ไม่แสดง menu item ถ้าไม่มีสิทธิ์
  }

  return (
    <li className={className} {...props}>
      {children}
    </li>
  );
};

// Component สำหรับแสดง Role Badge
export const RoleBadge = ({ className = 'badge bg-primary' }) => {
  const { userRole, loading } = usePermissions();

  if (loading) {
    return (
      <span className="badge bg-secondary">
        <span className="spinner-border spinner-border-sm" role="status"></span>
      </span>
    );
  }

  if (!userRole || !userRole.role) {
    return <span className="badge bg-warning">No Role</span>;
  }

  const getRoleBadgeClass = (roleName) => {
    switch (roleName) {
      case 'Super Admin':
        return 'badge bg-danger';
      case 'Admin':
        return 'badge bg-primary';
      case 'Manager':
        return 'badge bg-info';
      case 'Staff':
        return 'badge bg-success';
      case 'Customer':
        return 'badge bg-secondary';
      default:
        return 'badge bg-secondary';
    }
  };

  return (
    <span className={getRoleBadgeClass(userRole.role.name)}>
      {userRole.role.name}
    </span>
  );
};

// Hook สำหรับการใช้งาน permission ใน component
export const usePermissionGuard = () => {
  const { hasPermission, hasRole, isAdmin, isSuperAdmin, userRole } = usePermissions();

  const canAccess = (resource, action) => {
    return hasPermission(resource, action);
  };

  const canAccessMultiple = (checks) => {
    return checks.every(({ resource, action, role }) => {
      if (resource && action) {
        return hasPermission(resource, action);
      }
      if (role) {
        return hasRole(role);
      }
      return false;
    });
  };

  const canAccessAny = (checks) => {
    return checks.some(({ resource, action, role }) => {
      if (resource && action) {
        return hasPermission(resource, action);
      }
      if (role) {
        return hasRole(role);
      }
      return false;
    });
  };

  return {
    canAccess,
    canAccessMultiple,
    canAccessAny,
    hasRole,
    isAdmin,
    isSuperAdmin,
    userRole
  };
};

export default PermissionGate;
