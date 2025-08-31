// Create Admin User Script
// Run this with: node create-admin-user.js

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('🔧 Creating admin user...');
    
    const email = 'admin@hotel.com';
    const password = 'SecureAdmin123!';
    
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      console.log('📧 Email:', existingAdmin.email);
      console.log('🆔 ID:', existingAdmin.id);
      console.log('🔑 Password: SecureAdmin123!');
      return;
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);
    
    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email,
        passwordHash,
        userType: 'ADMIN',
        firstName: 'Admin',
        lastName: 'User',
        phoneNumber: '+66123456789',
        country: 'Thailand',
        isActive: true,
        emailVerified: true,
      }
    });
    
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', admin.email);
    console.log('🆔 ID:', admin.id);
    console.log('🔑 Password:', password);
    console.log('👤 User Type:', admin.userType);
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
