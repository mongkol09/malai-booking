// ============================================
// ROLE CONSTANTS
// ============================================

// Core user types from Prisma schema
export type UserType = 'CUSTOMER' | 'STAFF' | 'ADMIN' | 'DEV';

// ============================================
// ROLE HIERARCHIES
// ============================================

// Highest level - Development and system access
export const DEV_ROLES: UserType[] = ['DEV'];

// Administrative roles
export const ADMIN_ROLES: UserType[] = ['DEV', 'ADMIN'];

// Management roles (includes admin privileges)
export const MANAGEMENT_ROLES: UserType[] = ['DEV', 'ADMIN'];

// HR roles (for user management)
export const HR_ROLES: UserType[] = ['DEV', 'ADMIN'];

// Staff roles
export const STAFF_ROLES: UserType[] = ['DEV', 'ADMIN', 'STAFF'];

// All authenticated roles
export const ALL_ROLES: UserType[] = ['DEV', 'ADMIN', 'STAFF', 'CUSTOMER'];

// Customer only
export const CUSTOMER_ROLES: UserType[] = ['CUSTOMER'];

// ============================================
// ROLE PERMISSIONS MAPPING
// ============================================

export const ROLE_PERMISSIONS = {
  DEV: {
    name: 'Developer',
    description: 'Full system access including development and debugging features',
    level: 100,
    capabilities: [
      'system:admin',
      'user:manage',
      'role:manage',
      'booking:manage',
      'room:manage',
      'report:view',
      'settings:manage',
      'debug:access',
      'database:admin'
    ]
  },
  ADMIN: {
    name: 'Administrator', 
    description: 'Full administrative access to hotel management system',
    level: 80,
    capabilities: [
      'user:manage',
      'role:manage',
      'booking:manage',
      'room:manage',
      'report:view',
      'settings:manage'
    ]
  },
  STAFF: {
    name: 'Staff',
    description: 'Hotel staff with operational access',
    level: 50,
    capabilities: [
      'booking:view',
      'booking:create',
      'room:view',
      'guest:manage'
    ]
  },
  CUSTOMER: {
    name: 'Customer',
    description: 'Guest/customer access for bookings',
    level: 10,
    capabilities: [
      'booking:own',
      'profile:manage'
    ]
  }
} as const;

// ============================================
// ROLE CHECKING UTILITIES
// ============================================

/**
 * Check if a user type has sufficient privileges for an action
 */
export function hasRole(userType: string, requiredRoles: string[]): boolean {
  return requiredRoles.includes(userType);
}

/**
 * Check if user type has admin privileges
 */
export function isAdmin(userType: string): boolean {
  return ADMIN_ROLES.includes(userType as UserType);
}

/**
 * Check if user type is DEV
 */
export function isDev(userType: string): boolean {
  return userType === 'DEV';
}

/**
 * Get role level (higher number = more privileges)
 */
export function getRoleLevel(userType: string): number {
  return ROLE_PERMISSIONS[userType as keyof typeof ROLE_PERMISSIONS]?.level || 0;
}

/**
 * Compare if user has equal or higher privileges than required role
 */
export function hasMinimumRole(userType: string, minimumRole: string): boolean {
  const userLevel = getRoleLevel(userType);
  const requiredLevel = getRoleLevel(minimumRole);
  return userLevel >= requiredLevel;
}
