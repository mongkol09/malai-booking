const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createStaffProfilesAndAssignRoles() {
  try {
    console.log('👥 === สร้าง STAFF PROFILES และเชื่อม ROLES ===\n');
    
    await prisma.$connect();
    console.log('✅ Database connected\n');
    
    // 1. ดึง users ที่ควรเป็น staff (ADMIN, STAFF, DEV)
    const usersToMakeStaff = await prisma.user.findMany({
      where: {
        userType: {
          in: ['ADMIN', 'STAFF', 'DEV']
        }
      },
      include: {
        staffProfile: true
      }
    });
    
    console.log(`🔍 พบ ${usersToMakeStaff.length} users ที่ควรเป็น staff:\n`);
    
    // 2. ดึง roles ที่เราสร้างไว้
    const roles = await prisma.role.findMany();
    const roleMap = {};
    roles.forEach(role => {
      roleMap[role.name] = role;
    });
    
    // 3. กำหนด mapping ระหว่าง userType กับ role
    const userTypeToRole = {
      'DEV': 'Super Admin',  // DEV เป็น Super Admin
      'ADMIN': 'Admin',      // ADMIN เป็น Admin
      'STAFF': 'Staff'       // STAFF เป็น Staff
    };
    
    let staffCreated = 0;
    let rolesAssigned = 0;
    
    for (const user of usersToMakeStaff) {
      console.log(`👤 Processing user: ${user.email} (${user.userType})`);
      
      // ตรวจสอบว่ามี staff profile แล้วหรือไม่
      if (user.staffProfile) {
        console.log(`   ⚠️  Staff profile มีอยู่แล้ว`);
        
        // ตรวจสอบ role
        if (user.staffProfile.roleId) {
          const currentRole = roles.find(r => r.id === user.staffProfile.roleId);
          console.log(`   ℹ️  Role ปัจจุบัน: ${currentRole ? currentRole.name : 'ไม่พบ'}`);
        } else {
          // อัพเดท role ถ้ายังไม่มี
          const targetRoleName = userTypeToRole[user.userType];
          const targetRole = roleMap[targetRoleName];
          
          if (targetRole) {
            await prisma.staff.update({
              where: { userId: user.id },
              data: { roleId: targetRole.id }
            });
            console.log(`   ✅ เชื่อม Role "${targetRoleName}" สำเร็จ`);
            rolesAssigned++;
          }
        }
      } else {
        // สร้าง staff profile ใหม่
        const targetRoleName = userTypeToRole[user.userType];
        const targetRole = roleMap[targetRoleName];
        
        if (!targetRole) {
          console.log(`   ❌ ไม่พบ Role "${targetRoleName}"`);
          continue;
        }
        
        const positionMap = {
          'DEV': 'System Developer',
          'ADMIN': 'System Administrator', 
          'STAFF': 'Hotel Staff'
        };
        
        await prisma.staff.create({
          data: {
            userId: user.id,
            roleId: targetRole.id,
            employeeId: `EMP${Date.now()}${Math.random().toString(36).substr(2, 3).toUpperCase()}`, // สร้าง employeeId unique
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            position: positionMap[user.userType] || 'Staff',
            hireDate: new Date(), // วันที่เริ่มงานเป็นวันนี้
            status: 'Active'
          }
        });
        
        console.log(`   ✅ สร้าง Staff Profile และเชื่อม Role "${targetRoleName}" สำเร็จ`);
        staffCreated++;
        rolesAssigned++;
      }
      console.log('');
    }
    
    console.log('📊 สรุปผลลัพธ์:');
    console.log(`   • Staff Profiles ที่สร้างใหม่: ${staffCreated}`);
    console.log(`   • Roles ที่เชื่อม: ${rolesAssigned}`);
    
    // 4. แสดงสถานะปัจจุบัน
    console.log('\n📋 สถานะปัจจุบันของ Staff Users:');
    console.log('='.repeat(60));
    
    const staffUsers = await prisma.user.findMany({
      where: {
        staffProfile: {
          isNot: null
        }
      },
      include: {
        staffProfile: {
          include: {
            role: true
          }
        }
      }
    });
    
    staffUsers.forEach((user, index) => {
      const staff = user.staffProfile;
      console.log(`${index + 1}. ${user.email} (${user.userType})`);
      console.log(`   Name: ${user.firstName} ${user.lastName}`);
      console.log(`   Employee ID: ${staff.employeeId}`);
      console.log(`   Position: ${staff.position}`);
      console.log(`   Role: ${staff.role ? staff.role.name : '❌ ไม่มี Role'}`);
      console.log(`   Status: ${staff.status}`);
      console.log(`   Hire Date: ${staff.hireDate.toLocaleDateString('th-TH')}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createStaffProfilesAndAssignRoles();
