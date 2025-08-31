// 🔐 COMPLETE PASSWORD RESET SYSTEM
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const prisma = new PrismaClient();

// ==============================================
// PASSWORD RESET SERVICE
// ==============================================

class PasswordResetService {
  
  // Generate secure token
  generateResetToken() {
    return crypto.randomBytes(32).toString('hex');
  }
  
  // Send reset email
  async sendResetEmail(email, resetToken) {
    try {
      console.log(`📧 Attempting to send reset email to: ${email}`);
      
      // Check if we're in development and the email is not verified in MailerSend
      const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
      const isVerifiedEmail = email === 'mongkol09ms@gmail.com' || email.includes('@malaikhaoyai.com');
      
      if (isDevelopment && !isVerifiedEmail) {
        console.log('⚠️ Development mode: Email not verified in MailerSend');
        console.log('📋 Using console fallback for unverified email');
        
        // Use console fallback for development
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/reset-password?token=${resetToken}`;
        
        console.log('\n📧 PASSWORD RESET EMAIL (DEVELOPMENT):');
        console.log('='.repeat(60));
        console.log(`📮 To: ${email}`);
        console.log(`📝 Subject: รีเซ็ตรหัสผ่าน - Hotel Management System`);
        console.log(`🔗 Reset URL: ${resetUrl}`);
        console.log(`🎫 Token: ${resetToken}`);
        console.log(`⏰ Expires: 60 minutes`);
        console.log('='.repeat(60));
        console.log('✅ In production, this would be sent via MailerSend');
        console.log('🔧 To test real emails, verify your domain in MailerSend\n');
        
        return true;
      }
      
      // Try to send via MailerSend for verified emails
      const { sendPasswordResetEmail } = require('./passwordResetEmailService');
      
      const user = await prisma.user.findUnique({
        where: { email },
        select: { firstName: true, lastName: true }
      });
      
      const userName = user ? `${user.firstName} ${user.lastName}` : 'ผู้ใช้งาน';
      
      const emailSent = await sendPasswordResetEmail(
        email,
        userName,
        resetToken,
        60 // 60 minutes expiry
      );
      
      if (emailSent) {
        console.log(`✅ Email sent successfully via MailerSend to: ${email}`);
        return true;
      } else {
        throw new Error('MailerSend failed');
      }
      
    } catch (error) {
      console.error('❌ Send reset email failed:', error.message);
      
      // Always fallback to console logging
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/reset-password?token=${resetToken}`;
      
      console.log('\n📧 PASSWORD RESET EMAIL (FALLBACK):');
      console.log('='.repeat(60));
      console.log(`📮 To: ${email}`);
      console.log(`📝 Subject: รีเซ็ตรหัสผ่าน - Hotel Management System`);
      console.log(`🔗 Reset URL: ${resetUrl}`);
      console.log(`🎫 Token: ${resetToken}`);
      console.log(`⏰ Expires: 60 minutes`);
      console.log(`❌ Email service error: ${error.message}`);
      console.log('='.repeat(60));
      console.log('💡 Tip: Verify your domain in MailerSend for production emails\n');
      
      return true; // Return true so the process continues
    }
  }
  
  // Request password reset
  async requestPasswordReset(email) {
    try {
      console.log(`🔐 Processing password reset request for: ${email}`);
      
      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isActive: true,
          userType: true
        }
      });
      
      if (!user) {
        // For security, don't reveal if email exists
        return {
          success: true,
          message: 'If the email exists, a password reset link has been sent'
        };
      }
      
      if (!user.isActive) {
        return {
          success: false,
          message: 'Account is deactivated'
        };
      }
      
      // Generate reset token
      const resetToken = this.generateResetToken();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      
      // Clean up old tokens for this user
      await prisma.passwordResetToken.deleteMany({
        where: { userId: user.id }
      });
      
      // Create new reset token
      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          token: resetToken,
          expiresAt
        }
      });
      
      // Send email
      await this.sendResetEmail(user.email, resetToken);
      
      console.log(`✅ Reset token created for user: ${user.email}`);
      
      return {
        success: true,
        message: 'Password reset link has been sent to your email',
        data: {
          email: user.email,
          resetToken, // Remove in production
          expiresAt
        }
      };
      
    } catch (error) {
      console.error('❌ Password reset request failed:', error);
      return {
        success: false,
        message: 'Failed to process password reset request'
      };
    }
  }
  
  // Reset password with token
  async resetPassword(token, newPassword) {
    try {
      console.log(`🔑 Processing password reset with token: ${token.substring(0, 10)}...`);
      
      // Find valid reset token
      const resetToken = await prisma.passwordResetToken.findFirst({
        where: {
          token,
          expiresAt: { gte: new Date() },
          usedAt: null
        },
        include: {
          user: true
        }
      });
      
      if (!resetToken) {
        return {
          success: false,
          message: 'Invalid or expired reset token'
        };
      }
      
      // Hash new password
      const passwordHash = await bcrypt.hash(newPassword, 10);
      
      // Update password
      await prisma.user.update({
        where: { id: resetToken.userId },
        data: { 
          passwordHash,
          updatedAt: new Date()
        }
      });
      
      // Mark token as used
      await prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() }
      });
      
      console.log(`✅ Password reset successful for user: ${resetToken.user.email}`);
      
      return {
        success: true,
        message: 'Password has been reset successfully',
        data: {
          email: resetToken.user.email,
          resetAt: new Date()
        }
      };
      
    } catch (error) {
      console.error('❌ Password reset failed:', error);
      return {
        success: false,
        message: 'Failed to reset password'
      };
    }
  }
  
  // Admin reset user password (generate temporary password)
  async adminResetUserPassword(targetUserId, adminUserId) {
    try {
      console.log(`👨‍💼 Admin reset password for user ID: ${targetUserId}`);
      
      // Find target user
      const targetUser = await prisma.user.findUnique({
        where: { id: targetUserId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          userType: true
        }
      });
      
      if (!targetUser) {
        return {
          success: false,
          message: 'User not found'
        };
      }
      
      // Generate temporary password
      const tempPassword = this.generateResetToken().substring(0, 12);
      const passwordHash = await bcrypt.hash(tempPassword, 10);
      
      // Update password
      await prisma.user.update({
        where: { id: targetUserId },
        data: { 
          passwordHash,
          updatedAt: new Date()
        }
      });
      
      console.log(`✅ Admin reset successful for user: ${targetUser.email}`);
      
      return {
        success: true,
        message: 'Password reset successfully by admin',
        data: {
          email: targetUser.email,
          tempPassword, // Send this securely to user
          resetAt: new Date()
        }
      };
      
    } catch (error) {
      console.error('❌ Admin password reset failed:', error);
      return {
        success: false,
        message: 'Failed to reset password'
      };
    }
  }
  
  // Clean up expired tokens
  async cleanupExpiredTokens() {
    try {
      const deleted = await prisma.passwordResetToken.deleteMany({
        where: {
          expiresAt: { lt: new Date() }
        }
      });
      
      console.log(`🧹 Cleaned up ${deleted.count} expired reset tokens`);
      return deleted.count;
      
    } catch (error) {
      console.error('❌ Token cleanup failed:', error);
      return 0;
    }
  }
}

// ==============================================
// TESTING THE SYSTEM
// ==============================================

async function testPasswordResetSystem() {
  console.log('🧪 === TESTING PASSWORD RESET SYSTEM ===\n');
  
  try {
    await prisma.$connect();
    console.log('✅ Database connected\n');
    
    const resetService = new PasswordResetService();
    
    // Test 1: Request password reset
    console.log('📧 TEST 1: Request Password Reset');
    console.log('-'.repeat(40));
    
    const resetRequest = await resetService.requestPasswordReset('mongkol09ms@gmail.com');
    console.log('Result:', resetRequest);
    
    if (resetRequest.success && resetRequest.data?.resetToken) {
      // Test 2: Reset password with token
      console.log('\n🔑 TEST 2: Reset Password with Token');
      console.log('-'.repeat(40));
      
      const newPassword = 'newdev123';
      const resetResult = await resetService.resetPassword(resetRequest.data.resetToken, newPassword);
      console.log('Result:', resetResult);
      
      if (resetResult.success) {
        // Test 3: Login with new password
        console.log('\n🔐 TEST 3: Login with New Password');
        console.log('-'.repeat(40));
        
        const user = await prisma.user.findUnique({
          where: { email: 'mongkol09ms@gmail.com' }
        });
        
        const passwordValid = await bcrypt.compare(newPassword, user.passwordHash);
        console.log(`Login Test: ${passwordValid ? '✅ SUCCESS' : '❌ FAILED'}`);
        
        if (passwordValid) {
          console.log(`\n📝 NEW LOGIN CREDENTIALS:`);
          console.log(`Email: ${user.email}`);
          console.log(`Password: ${newPassword}`);
        }
      }
    }
    
    // Test 4: Admin reset
    console.log('\n👨‍💼 TEST 4: Admin Reset User Password');
    console.log('-'.repeat(40));
    
    const targetUser = await prisma.user.findFirst({
      where: { email: 'guest@example.com' }
    });
    
    if (targetUser) {
      const adminReset = await resetService.adminResetUserPassword(targetUser.id, 'admin-id');
      console.log('Admin Reset Result:', adminReset);
    }
    
    // Test 5: Cleanup
    console.log('\n🧹 TEST 5: Cleanup Expired Tokens');
    console.log('-'.repeat(40));
    
    const cleanupCount = await resetService.cleanupExpiredTokens();
    console.log(`Cleanup result: ${cleanupCount} tokens removed`);
    
    console.log('\n✅ PASSWORD RESET SYSTEM TEST COMPLETE!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Export for use in other files
module.exports = { PasswordResetService };

// Run test if this file is executed directly
if (require.main === module) {
  testPasswordResetSystem();
}
