// 👤 CREATE GUEST PROFILE FOR EXISTING USER
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createGuestProfile() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected\n');
    
    // Find the customer user
    const user = await prisma.user.findFirst({
      where: { userType: 'CUSTOMER' }
    });
    
    if (!user) {
      console.log('❌ No customer user found');
      return;
    }
    
    console.log(`👤 Found user: ${user.firstName} ${user.lastName} (${user.email})`);
    
    // Create guest profile
    const guestProfile = await prisma.guest.create({
      data: {
        userId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        country: user.country,
        dateOfBirth: new Date('1990-05-15'),
        idNumber: 'TH1234567',
        gender: 'Male',
        notes: 'Test guest for booking system'
      }
    });
    
    console.log('✅ Guest profile created:');
    console.log(`  ID: ${guestProfile.id}`);
    console.log(`  Name: ${guestProfile.firstName} ${guestProfile.lastName}`);
    console.log(`  Email: ${guestProfile.email}`);
    console.log(`  Phone: ${guestProfile.phoneNumber}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createGuestProfile();
