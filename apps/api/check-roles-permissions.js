// 🔍 ตรวจสอบ Roles และ Permissions ในระบบ
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkRolesAndPermissions() {
  console.log('🔍 === ตรวจสอบ ROLES และ PERMISSIONS ===\n');
  
  try {
    await prisma.$connect();
    console.log('✅ Database connected\n');
    
    // 1. ตรวจสอบ Roles ทั้งหมด
    console.log('📋 ROLES ในระบบ:');
    console.log('='.repeat(60));
    
    const roles = await prisma.role.findMany({
      orderBy: { id: 'asc' },
      include: {
        _count: {
          select: {
            staffs: true,
            permissions: true
          }
        }
      }
    });
    
    if (roles.length === 0) {
      console.log('❌ ไม่มี Roles ในระบบ');
    } else {
      roles.forEach((role, index) => {
        console.log(`${index + 1}. ID: ${role.id} | Name: "${role.name}" | Description: "${role.description}"`);
        console.log(`   Staffs: ${role._count.staffs} | Permissions: ${role._count.permissions}`);
        console.log(`   Created: ${role.createdAt.toLocaleDateString('th-TH')}`);
        console.log('');
      });
    }
    
    // 2. ตรวจสอบ Permissions ทั้งหมด
    console.log('\n🔐 PERMISSIONS ในระบบ:');
    console.log('='.repeat(60));
    
    const permissions = await prisma.permission.findMany({
      orderBy: { id: 'asc' },
      include: {
        _count: {
          select: {
            rolePermissions: true
          }
        }
      }
    });
    
    if (permissions.length === 0) {
      console.log('❌ ไม่มี Permissions ในระบบ');
    } else {
      permissions.forEach((permission, index) => {
        console.log(`${index + 1}. ID: ${permission.id} | Action: "${permission.action}" | Resource: "${permission.resource}"`);
        console.log(`   Description: "${permission.description}"`);
        console.log(`   Used by ${permission._count.rolePermissions} roles`);
        console.log('');
      });
    }
    
    // 3. ตรวจสอบ Role-Permission Mapping
    console.log('\n🔗 ROLE-PERMISSION MAPPING:');
    console.log('='.repeat(60));
    
    const rolePermissions = await prisma.rolePermission.findMany({
      include: {
        role: true,
        permission: true
      },
      orderBy: [
        { roleId: 'asc' },
        { permissionId: 'asc' }
      ]
    });
    
    if (rolePermissions.length === 0) {
      console.log('❌ ไม่มี Role-Permission mappings');
    } else {
      // Group by role
      const groupedByRole = {};
      rolePermissions.forEach(rp => {
        const roleName = rp.role.name;
        if (!groupedByRole[roleName]) {
          groupedByRole[roleName] = [];
        }
        groupedByRole[roleName].push(`${rp.permission.action}:${rp.permission.resource}`);
      });
      
      Object.keys(groupedByRole).forEach(roleName => {
        console.log(`📋 ${roleName}:`);
        groupedByRole[roleName].forEach(permission => {
          console.log(`   - ${permission}`);
        });
        console.log('');
      });
    }
    
    // 4. ตรวจสอบ Users และ Roles ของพวกเขา
    console.log('\n👥 USERS และ ROLES:');
    console.log('='.repeat(60));
    
    const users = await prisma.user.findMany({
      include: {
        staff: {
          include: {
            role: true
          }
        }
      },
      orderBy: { id: 'asc' }
    });
    
    if (users.length === 0) {
      console.log('❌ ไม่มี Users ในระบบ');
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.firstName} ${user.lastName} (${user.email})`);
        console.log(`   Role: ${user.staff?.role?.name || 'ไม่มี Role'}`);
        console.log(`   Type: ${user.userType} | Active: ${user.isActive ? 'Yes' : 'No'}`);
        console.log('');
      });
    }
    
    // 5. สรุปสถิติ
    console.log('\n📊 SUMMARY:');
    console.log('='.repeat(60));
    console.log(`Total Roles: ${roles.length}`);
    console.log(`Total Permissions: ${permissions.length}`);
    console.log(`Total Role-Permission mappings: ${rolePermissions.length}`);
    console.log(`Total Users: ${users.length}`);
    
    // 6. ตรวจสอบปัญหาที่เป็นไปได้
    console.log('\n⚠️ POTENTIAL ISSUES:');
    console.log('='.repeat(60));
    
    // Roles without permissions
    const rolesWithoutPermissions = roles.filter(role => role._count.rolePermissions === 0);
    if (rolesWithoutPermissions.length > 0) {
      console.log('❌ Roles ที่ไม่มี Permissions:');
      rolesWithoutPermissions.forEach(role => {
        console.log(`   - ${role.name}`);
      });
    }
    
    // Users without roles
    const usersWithoutRoles = users.filter(user => !user.staff?.role);
    if (usersWithoutRoles.length > 0) {
      console.log('❌ Users ที่ไม่มี Role:');
      usersWithoutRoles.forEach(user => {
        console.log(`   - ${user.email}`);
      });
    }
    
    if (rolesWithoutPermissions.length === 0 && usersWithoutRoles.length === 0) {
      console.log('✅ ไม่พบปัญหา');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
checkRolesAndPermissions();
