// ============================================
// USER MANAGEMENT CONTROLLER
// ============================================

import { Request, Response } from 'express';
import { PrismaClient, UserType, StaffStatus } from '@prisma/client';
import { hashPassword, generateSecureToken } from '../utils/auth';
import { sendEmail } from '../utils/email';
import { asyncHandler, AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

// ============================================
// GET ALL USERS (Admin Only)
// ============================================

export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const { 
    page = 1, 
    limit = 10, 
    search = '', 
    role = '', 
    status = '',
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  // Convert to numbers
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  // Build where clause
  const where: any = {};

  // Search filter
  if (search) {
    where.OR = [
      { firstName: { contains: search as string, mode: 'insensitive' } },
      { lastName: { contains: search as string, mode: 'insensitive' } },
      { email: { contains: search as string, mode: 'insensitive' } }
    ];
  }

  // Role filter - convert lowercase frontend values to uppercase backend values
  if (role) {
    const roleMap: { [key: string]: UserType } = {
      'admin': 'ADMIN',
      'employee': 'STAFF', 
      'staff': 'STAFF',
      'customer': 'CUSTOMER',
      // Support legacy uppercase values
      'ADMIN': 'ADMIN',
      'STAFF': 'STAFF', 
      'CUSTOMER': 'CUSTOMER'
    };
    
    const mappedRole = roleMap[role as string];
    if (mappedRole) {
      where.userType = mappedRole;
    }
  }

  // Status filter (active/inactive)
  if (status === 'active') {
    where.isActive = true;
  } else if (status === 'inactive') {
    where.isActive = false;
  }

  // Get users with pagination
  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        country: true,
        userType: true,
        isActive: true,
        emailVerified: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        staffProfile: {
          select: {
            employeeId: true,
            position: true,
            department: {
              select: {
                name: true
              }
            },
            status: true
          }
        }
      },
      skip,
      take: limitNum,
      orderBy: {
        [sortBy as string]: sortOrder as 'asc' | 'desc'
      }
    }),
    prisma.user.count({ where })
  ]);

  // Format response
  const formattedUsers = users.map(user => ({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: `${user.firstName} ${user.lastName}`,
    phoneNumber: user.phoneNumber,
    country: user.country,
    role: user.userType.toLowerCase() === 'staff' ? 'employee' : 
          user.userType.toLowerCase() === 'dev' ? 'dev' : 
          user.userType.toLowerCase(),
    status: user.isActive ? 'active' : 'inactive',
    emailVerified: user.emailVerified,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    // Staff-specific info
    ...(user.staffProfile && {
      employeeId: user.staffProfile.employeeId,
      position: user.staffProfile.position,
      department: user.staffProfile.department?.name,
      staffStatus: user.staffProfile.status
    })
  }));

  res.json({
    success: true,
    message: 'Users retrieved successfully',
    data: {
      users: formattedUsers,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        pages: Math.ceil(totalCount / limitNum)
      }
    }
  });
});

// ============================================
// GET USER BY ID
// ============================================

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    throw new AppError('User ID is required', 400);
  }

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      staffProfile: {
        include: {
          department: true,
          role: true
        }
      },
      guestProfile: true
    }
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Format response
  const formattedUser = {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: `${user.firstName} ${user.lastName}`,
    phoneNumber: user.phoneNumber,
    country: user.country,
    role: user.userType.toLowerCase() === 'staff' ? 'employee' : user.userType.toLowerCase(),
    status: user.isActive ? 'active' : 'inactive',
    emailVerified: user.emailVerified,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    // Staff-specific info
    ...(user.staffProfile && {
      employeeId: user.staffProfile.employeeId,
      position: user.staffProfile.position,
      hireDate: user.staffProfile.hireDate,
      salary: user.staffProfile.salary,
      staffStatus: user.staffProfile.status,
      profileImageUrl: user.staffProfile.profileImageUrl,
      department: user.staffProfile.department,
      role: user.staffProfile.role
    }),
    // Guest-specific info
    ...(user.guestProfile && {
      guestId: user.guestProfile.id,
      idNumber: user.guestProfile.idNumber,
      dateOfBirth: user.guestProfile.dateOfBirth,
      gender: user.guestProfile.gender,
      notes: user.guestProfile.notes
    })
  };

  res.json({
    success: true,
    message: 'User retrieved successfully',
    data: { user: formattedUser }
  });
});

// ============================================
// CREATE NEW USER (Admin Only)
// ============================================

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const { 
    email, 
    password, 
    firstName, 
    lastName, 
    phoneNumber, 
    country,
    role = 'STAFF',
    // Staff-specific fields
    employeeId,
    position,
    departmentId,
    roleId,
    hireDate,
    salary
  } = req.body;

  // Validate required fields
  if (!email || !password || !firstName || !lastName) {
    throw new AppError('Email, password, first name, and last name are required', 400);
  }

  // 🔒 DEV ROLE PROTECTION: Only DEV users can create DEV accounts
  if (role && role.toLowerCase() === 'dev') {
    const currentUser = (req as any).user;
    
    if (!currentUser || (currentUser.userType as string) !== 'DEV') {
      throw new AppError('Only DEV users can create DEV accounts', 403);
    }
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw new AppError('User already exists with this email', 409);
  }

  // Check if employee ID exists (for staff)
  if (role === 'STAFF' && employeeId) {
    const existingStaff = await prisma.staff.findUnique({
      where: { employeeId }
    });

    if (existingStaff) {
      throw new AppError('Employee ID already exists', 409);
    }
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Create user with transaction
  const newUser = await prisma.$transaction(async (tx) => {
    // Create user
    const user = await tx.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        phoneNumber,
        country,
        userType: role as UserType,
        isActive: true,
        emailVerified: false
      }
    });

    // Create staff profile if role is STAFF or ADMIN
    if ((role === 'STAFF' || role === 'ADMIN') && employeeId) {
      await tx.staff.create({
        data: {
          userId: user.id,
          employeeId,
          firstName,
          lastName,
          email,
          phoneNumber,
          position,
          departmentId,
          roleId,
          hireDate: hireDate ? new Date(hireDate) : new Date(),
          salary: salary ? parseFloat(salary) : null,
          status: 'Active' as StaffStatus
        }
      });
    }

    return user;
  });

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: { 
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.userType,
        status: newUser.isActive ? 'active' : 'inactive'
      }
    }
  });
});

// ============================================
// UPDATE USER
// ============================================

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { 
    firstName, 
    lastName, 
    phoneNumber, 
    country,
    role,
    status,
    // Staff-specific fields
    position,
    departmentId,
    roleId,
    salary
  } = req.body;

  if (!id) {
    throw new AppError('User ID is required', 400);
  }

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { id },
    include: { staffProfile: true }
  });

  if (!existingUser) {
    throw new AppError('User not found', 404);
  }

  // 🔒 DEV ROLE PROTECTION: Only DEV users can modify DEV users
  if ((existingUser.userType as string) === 'DEV') {
    // Get current user from request (assuming it's added by auth middleware)
    const currentUser = (req as any).user;
    
    if (!currentUser || (currentUser.userType as string) !== 'DEV') {
      throw new AppError('Only DEV users can modify DEV accounts', 403);
    }
  }

  // 🔒 DEV ROLE PROTECTION: Only DEV users can assign DEV role
  if (role && role.toLowerCase() === 'dev') {
    const currentUser = (req as any).user;
    
    if (!currentUser || (currentUser.userType as string) !== 'DEV') {
      throw new AppError('Only DEV users can assign DEV role', 403);
    }
  }

  // Update user with transaction
  const updatedUser = await prisma.$transaction(async (tx) => {
    // Convert role to UserType enum
    let userTypeValue: UserType | undefined;
    if (role) {
      switch (role.toLowerCase()) {
        case 'customer':
          userTypeValue = 'CUSTOMER';
          break;
        case 'employee':
        case 'staff':
          userTypeValue = 'STAFF';
          break;
        case 'admin':
          userTypeValue = 'ADMIN';
          break;
        case 'dev':
          userTypeValue = 'DEV' as UserType;
          break;
        default:
          throw new AppError(`Invalid role: ${role}`, 400);
      }
    }

    // Convert status to boolean
    let isActiveValue: boolean | undefined;
    if (status) {
      switch (status.toLowerCase()) {
        case 'active':
          isActiveValue = true;
          break;
        case 'inactive':
        case 'suspended':
          isActiveValue = false;
          break;
        default:
          throw new AppError(`Invalid status: ${status}`, 400);
      }
    }

    // Update user
    const user = await tx.user.update({
      where: { id },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(phoneNumber !== undefined && { phoneNumber }),
        ...(country !== undefined && { country }),
        ...(userTypeValue && { userType: userTypeValue }),
        ...(isActiveValue !== undefined && { isActive: isActiveValue })
      }
    });

    // Update staff profile if exists and has staff data
    if (existingUser.staffProfile && (position || departmentId || roleId || salary !== undefined)) {
      await tx.staff.update({
        where: { userId: id },
        data: {
          ...(firstName && { firstName }),
          ...(lastName && { lastName }),
          ...(phoneNumber !== undefined && { phoneNumber }),
          ...(position && { position }),
          ...(departmentId && { departmentId }),
          ...(roleId && { roleId }),
          ...(salary !== undefined && { salary: salary ? parseFloat(salary) : null })
        }
      });
    }

    return user;
  });

  res.json({
    success: true,
    message: 'User updated successfully',
    data: { 
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        role: updatedUser.userType.toLowerCase() === 'staff' ? 'employee' : updatedUser.userType.toLowerCase(),
        status: updatedUser.isActive ? 'active' : 'inactive'
      }
    }
  });
});

// ============================================
// UPDATE USER STATUS
// ============================================

export const updateUserStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!id) {
    throw new AppError('User ID is required', 400);
  }

  if (!status || !['active', 'inactive'].includes(status)) {
    throw new AppError('Valid status (active/inactive) is required', 400);
  }

  const user = await prisma.user.update({
    where: { id: id as string },
    data: { isActive: status === 'active' }
  });

  res.json({
    success: true,
    message: `User ${status === 'active' ? 'activated' : 'deactivated'} successfully`,
    data: { 
      user: {
        id: user.id,
        status: user.isActive ? 'active' : 'inactive'
      }
    }
  });
});

// ============================================
// RESET USER PASSWORD (Admin Only)
// ============================================

export const resetUserPassword = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    throw new AppError('User ID is required', 400);
  }

  const user = await prisma.user.findUnique({
    where: { id: id as string },
    select: { id: true, email: true, firstName: true, lastName: true }
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Generate new temporary password
  const tempPassword = generateSecureToken(12);
  const passwordHash = await hashPassword(tempPassword);

  // Update password
  await prisma.user.update({
    where: { id: id as string },
    data: { passwordHash }
  });

  // Send email with new password (in production, use proper email template)
  try {
    await sendEmail({
      to: user.email,
      subject: 'Password Reset - Hotel Management System',
      templateId: 'password-reset',
      variables: {
        firstName: user.firstName,
        lastName: user.lastName,
        tempPassword: tempPassword
      }
    });
  } catch (emailError) {
    console.error('Failed to send password reset email:', emailError);
    // Continue anyway, as password was reset successfully
  }

  res.json({
    success: true,
    message: 'Password reset successfully. New password has been sent to user email.',
    data: { 
      tempPassword // Remove this in production for security
    }
  });
});

// ============================================
// DELETE USER (Admin Only)
// ============================================

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    throw new AppError('User ID is required', 400);
  }

  const user = await prisma.user.findUnique({
    where: { id: id as string }
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Delete user (cascade will handle related records)
  await prisma.user.delete({
    where: { id: id as string }
  });

  res.json({
    success: true,
    message: 'User deleted successfully'
  });
});

// ============================================
// GET CURRENT USER PROFILE
// ============================================

export const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId; // แก้ไขจาก id เป็น userId

  if (!userId) {
    throw new AppError('User not authenticated', 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phoneNumber: true,
      country: true,
      userType: true,
      isActive: true,
      emailVerified: true,
      lastLoginAt: true,
      createdAt: true,
      staffProfile: {
        select: {
          employeeId: true,
          position: true,
          department: { select: { name: true } },
          profileImageUrl: true
        }
      }
    }
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json({
    success: true,
    message: 'User profile retrieved successfully',
    data: { 
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: `${user.firstName} ${user.lastName}`,
        phoneNumber: user.phoneNumber,
        country: user.country,
        role: user.userType,
        status: user.isActive ? 'active' : 'inactive',
        emailVerified: user.emailVerified,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        ...(user.staffProfile && {
          employeeId: user.staffProfile.employeeId,
          position: user.staffProfile.position,
          department: user.staffProfile.department?.name,
          profileImageUrl: user.staffProfile.profileImageUrl
        })
      }
    }
  });
});

// ============================================
// UPDATE CURRENT USER PROFILE
// ============================================

export const updateCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId; // แก้ไขจาก id เป็น userId
  const { firstName, lastName, phoneNumber, country } = req.body;

  if (!userId) {
    throw new AppError('User not authenticated', 401);
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      firstName,
      lastName,
      phoneNumber,
      country
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phoneNumber: true,
      country: true,
      userType: true
    }
  });

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: { user: updatedUser }
  });
});

// ============================================
// CHANGE PASSWORD (Current User)
// ============================================

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId; // แก้ไขจาก id เป็น userId
  const { currentPassword, newPassword } = req.body;

  console.log('🔐 Change Password Request:');
  console.log('- userId from session:', userId);
  console.log('- hasCurrentPassword:', !!currentPassword);
  console.log('- hasNewPassword:', !!newPassword);

  if (!userId) {
    throw new AppError('User not authenticated', 401);
  }

  if (!currentPassword || !newPassword) {
    throw new AppError('Current password and new password are required', 400);
  }

  // Get user with password
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, passwordHash: true, email: true }
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  console.log('👤 Found user:', { id: user.id, email: user.email });

  // Verify current password
  const bcrypt = require('bcrypt');
  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);

  if (!isCurrentPasswordValid) {
    console.log('❌ Current password verification failed');
    throw new AppError('Current password is incorrect', 400);
  }

  console.log('✅ Current password verified');

  // Hash new password
  const newPasswordHash = await hashPassword(newPassword);

  // Update password
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newPasswordHash }
  });

  console.log('✅ Password updated successfully');

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
});

// ============================================
// GET USER STATISTICS (Admin Only)
// ============================================

export const getUserStats = asyncHandler(async (req: Request, res: Response) => {
  const [totalUsers, activeUsers, adminUsers, staffUsers, customerUsers] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.user.count({ where: { userType: 'ADMIN' } }),
    prisma.user.count({ where: { userType: 'STAFF' } }),
    prisma.user.count({ where: { userType: 'CUSTOMER' } })
  ]);

  res.json({
    success: true,
    message: 'User statistics retrieved successfully',
    data: {
      stats: {
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        adminUsers,
        staffUsers,
        customerUsers
      }
    }
  });
});

// ============================================
// BOOTSTRAP DEV PROMOTION (Super Admin Only)
// ============================================

export const promoteToDevBootstrap = asyncHandler(async (req: Request, res: Response) => {
  const { id: userId } = req.params;
  const { confirmPassword } = req.body;

  if (!userId) {
    throw new AppError('User ID is required', 400);
  }

  // Get current user
  const currentUser = (req as any).user;
  
  // Extra security: require super admin confirmation
  if (!currentUser || (currentUser.userType as string) !== 'ADMIN') {
    throw new AppError('Only ADMIN users can use bootstrap promotion', 403);
  }

  // Validate admin password for extra security
  if (confirmPassword !== 'devbootstrap2025') {
    throw new AppError('Invalid bootstrap confirmation', 403);
  }

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!existingUser) {
    throw new AppError('User not found', 404);
  }

  // Update user to DEV
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      userType: 'DEV' as UserType
    }
  });

  // Log this critical action
  console.log(`🚨 BOOTSTRAP: ${currentUser.email} promoted ${existingUser.email} to DEV role`);

  res.json({
    success: true,
    message: 'User promoted to DEV role successfully (Bootstrap)',
    data: {
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        role: 'DEV',
        status: updatedUser.isActive ? 'active' : 'inactive'
      }
    }
  });
});
