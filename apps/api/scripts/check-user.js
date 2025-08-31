const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUser() {
  try {
    console.log('🔍 ตรวจสอบข้อมูล User...');
    console.log('');
    
    const targetEmail = 'mongkol03su@gmail.com';
    const user = await prisma.user.findUnique({ 
      where: { email: targetEmail } 
    });
    
    if (user) {
      console.log('✅ User found:');
      console.log('  📧 Email:', user.email);
      console.log('  👤 Role:', user.userType);
      console.log('  ✅ Active:', user.isActive);
      console.log('  🔐 Password Hash:', user.password ? 'Present' : 'Missing');
      console.log('  🆔 User ID:', user.id);
      console.log('');
    } else {
      console.log('❌ Target user not found:', targetEmail);
      console.log('');
      
      const allUsers = await prisma.user.findMany({ 
        select: { 
          email: true, 
          userType: true, 
          isActive: true,
          id: true
        } 
      });
      
      console.log('📋 Available users in system:');
      allUsers.forEach(u => {
        console.log(`  - ${u.email} (${u.userType}) [${u.isActive ? 'Active' : 'Inactive'}]`);
      });
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();