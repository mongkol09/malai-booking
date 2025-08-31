// 👤 CREATE SAMPLE GUEST USER FOR TESTING
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createSampleGuest() {
  console.log('👤 === CREATING SAMPLE GUEST USER ===\n');
  
  try {
    await prisma.$connect();
    console.log('✅ Database connected\n');
    
    // Check if customer already exists
    const existingCustomer = await prisma.user.findFirst({
      where: { userType: 'CUSTOMER' }
    });
    
    if (existingCustomer) {
      console.log('✅ Customer user already exists:', existingCustomer.email);
      return existingCustomer;
    }
    
    // Hash password
    const password = 'guest123';
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Create guest user
    const guestUser = await prisma.user.create({
      data: {
        email: 'guest@example.com',
        passwordHash,
        userType: 'CUSTOMER',
        firstName: 'สมชาย',
        lastName: 'ใจดี',
        phoneNumber: '081-234-5678',
        country: 'Thailand',
        isActive: true,
        emailVerified: true
      }
    });
    
    console.log('✅ Guest user created:');
    console.log(`  Email: ${guestUser.email}`);
    console.log(`  Name: ${guestUser.firstName} ${guestUser.lastName}`);
    console.log(`  Type: ${guestUser.userType}`);
    console.log(`  Phone: ${guestUser.phoneNumber}`);
    
    // Create guest profile
    const guestProfile = await prisma.guest.create({
      data: {
        userId: guestUser.id,
        firstName: guestUser.firstName,
        lastName: guestUser.lastName,
        email: guestUser.email,
        phoneNumber: guestUser.phoneNumber,
        country: guestUser.country,
        dateOfBirth: new Date('1990-05-15'),
        idNumber: 'TH1234567',
        gender: 'MALE',
        notes: 'Test guest for booking system'
      }
    });
    
    console.log('✅ Guest profile created');
    
    // Show summary
    const totalUsers = await prisma.user.count();
    const totalCustomers = await prisma.user.count({
      where: { userType: 'CUSTOMER' }
    });
    
    console.log(`\n📊 User Summary:`);
    console.log(`  Total Users: ${totalUsers}`);
    console.log(`  Customer Users: ${totalCustomers}`);
    
    return guestUser;
    
  } catch (error) {
    console.error('❌ Failed to create guest:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run
createSampleGuest();
