const { PrismaClient } = require('@prisma/client');

async function checkUsers() {
  const prisma = new PrismaClient();
  
  try {
    console.log('📋 Checking users in database...');
    const users = await prisma.user.findMany();
    
    console.log(`\n🔍 Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`- Email: ${user.email}`);
      console.log(`  Role: ${user.role}`);
      console.log(`  ID: ${user.id}`);
      console.log(`  Created: ${user.createdAt}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error checking users:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
