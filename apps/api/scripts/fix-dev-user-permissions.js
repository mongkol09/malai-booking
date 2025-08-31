const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixDevUserPermissions() {
  try {
    console.log('🔧 แก้ไข DEV User Permissions...');
    console.log('');
    
    // 1. ตรวจสอบ DEV user
    const devUser = await prisma.user.findUnique({
      where: { email: 'mongkol03su@gmail.com' },
      include: {
        staffProfile: {
          include: {
            role: {
              include: {
                permissions: true
              }
            }
          }
        }
      }
    });
    
    if (!devUser) {
      console.log('❌ DEV user not found');
      return;
    }
    
    console.log('✅ DEV User found:');
    console.log(`  📧 Email: ${devUser.email}`);
    console.log(`  👤 Role: ${devUser.userType}`);
    console.log(`  🏢 Staff Profile: ${devUser.staffProfile ? 'Yes' : 'No'}`);
    
    if (devUser.staffProfile) {
      console.log(`  🎭 Role Assigned: ${devUser.staffProfile.role ? devUser.staffProfile.role.name : 'No'}`);
    }
    console.log('');
    
    // 2. หา DEV role หรือสร้างใหม่
    let devRole = await prisma.role.findFirst({
      where: { name: 'DEV' },
      include: { permissions: true }
    });
    
    if (!devRole) {
      console.log('🆕 Creating DEV role...');
      devRole = await prisma.role.create({
        data: {
          name: 'DEV',
          description: 'Developer with full system access',
          isActive: true
        },
        include: { permissions: true }
      });
      console.log('✅ DEV role created');
    } else {
      console.log('✅ DEV role exists');
    }
    
    // 3. สร้าง permissions สำหรับ DEV (full access)
    const resources = ['users', 'bookings', 'rooms', 'payments', 'reports', 'settings'];
    
    for (const resource of resources) {
      const existingPermission = await prisma.permission.findFirst({
        where: {
          roleId: devRole.id,
          resourceName: resource
        }
      });
      
      if (!existingPermission) {
        await prisma.permission.create({
          data: {
            roleId: devRole.id,
            resourceName: resource,
            canRead: true,
            canWrite: true,
            canCreate: true,
            canDelete: true
          }
        });
        console.log(`✅ Permission created for ${resource}`);
      }
    }
    
    // 4. สร้าง Staff Profile ถ้าไม่มี
    if (!devUser.staffProfile) {
      console.log('🆕 Creating Staff Profile for DEV user...');
      await prisma.staff.create({
        data: {
          userId: devUser.id,
          employeeId: 'DEV001',
          department: 'Development',
          position: 'Lead Developer',
          isActive: true,
          roleId: devRole.id
        }
      });
      console.log('✅ Staff Profile created');
    } else if (!devUser.staffProfile.roleId) {
      console.log('🔄 Updating Staff Profile role...');
      await prisma.staff.update({
        where: { userId: devUser.id },
        data: { roleId: devRole.id }
      });
      console.log('✅ Staff Profile role updated');
    }
    
    // 5. ตรวจสอบผลลัพธ์
    const updatedUser = await prisma.user.findUnique({
      where: { email: 'mongkol03su@gmail.com' },
      include: {
        staffProfile: {
          include: {
            role: {
              include: {
                permissions: true
              }
            }
          }
        }
      }
    });
    
    console.log('');
    console.log('🎉 แก้ไขเสร็จสิ้น!');
    console.log('📋 สรุปผลลัพธ์:');
    console.log(`  👤 User: ${updatedUser.email}`);
    console.log(`  🎭 Role: ${updatedUser.staffProfile?.role?.name || 'None'}`);
    console.log(`  🔐 Permissions: ${updatedUser.staffProfile?.role?.permissions?.length || 0} permissions`);
    console.log('');
    console.log('✅ ตอนนี้ user สามารถเข้าถึง User API ได้แล้ว!');
    
  } catch (error) {
    console.error('❌ Error fixing DEV user permissions:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixDevUserPermissions();
