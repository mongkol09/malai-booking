const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkGuestData() {
  try {
    console.log('👤 Checking guest data...');
    
    // Check all guests
    const allGuests = await prisma.guest.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    
    console.log(`📋 Found ${allGuests.length} guests:`);
    console.log('');
    
    allGuests.forEach((guest, index) => {
      console.log(`${index + 1}. ID: ${guest.id}`);
      console.log(`   Name: ${guest.firstName} ${guest.lastName}`);
      console.log(`   Email: ${guest.email}`);
      console.log(`   Phone: ${guest.phoneNumber || 'N/A'}`);
      console.log(`   Created: ${guest.createdAt}`);
      console.log('   ---');
    });
    
    // Check for Mongkol's email specifically
    console.log('🔍 Looking for email: mongkol09ms@gmail.com');
    const mongkolGuest = await prisma.guest.findFirst({
      where: { email: 'mongkol09ms@gmail.com' }
    });
    
    if (mongkolGuest) {
      console.log('🎯 Found existing guest record:');
      console.log(`   ID: ${mongkolGuest.id}`);
      console.log(`   Name: ${mongkolGuest.firstName} ${mongkolGuest.lastName}`);
      console.log(`   Email: ${mongkolGuest.email}`);
      console.log(`   Created: ${mongkolGuest.createdAt}`);
      console.log('');
      console.log('🚨 THIS IS THE PROBLEM! Existing guest overrides new data!');
    }
    
    await prisma.$disconnect();
    console.log('✅ Check completed');
  } catch (error) {
    console.error('❌ Error:', error);
    await prisma.$disconnect();
  }
}

checkGuestData();
