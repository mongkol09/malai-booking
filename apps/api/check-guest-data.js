// 🔍 CHECK GUEST DATA
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkGuestData() {
  try {
    await prisma.$connect();
    
    console.log('👤 USER DATA:');
    const users = await prisma.user.findMany({
      where: { userType: 'CUSTOMER' }
    });
    
    users.forEach(user => {
      console.log(`  User: ${user.firstName} ${user.lastName} (${user.email})`);
    });
    
    console.log('\n🏨 GUEST PROFILES:');
    const guests = await prisma.guest.findMany({
      include: {
        user: true
      }
    });
    
    guests.forEach(guest => {
      console.log(`  Guest: ${guest.firstName} ${guest.lastName} (${guest.email})`);
      if (guest.user) {
        console.log(`    User Type: ${guest.user.userType}`);
      }
    });
    
    console.log(`\nTotal CUSTOMER users: ${users.length}`);
    console.log(`Total Guest profiles: ${guests.length}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkGuestData();
