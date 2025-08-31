const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkRolesAndPermissions() {
  try {
    console.log('🔍 === ตรวจสอบ ROLES และ PERMISSIONS ===\n');
    
    await prisma.$connect();
    console.log('✅ Database connected\n');
    
    // 1. ตรวจสอบ Roles ทั้งหมด
    console.log('📋 ROLES ในระบบ:');
    console.log('='.repeat(60));
    
    const roles = await prisma.role.findMany({
      orderBy: { name: 'asc' },
      include: {
        permissions: true,
        staffs: true,
        _count: {
          select: {
            staffs: true,
            permissions: true
          }
        }
      }
    });
    
    if (roles.length === 0) {
      console.log('❌ ไม่มี Roles ในระบบ\n');
    } else {
      console.log(`✅ พบ ${roles.length} roles:\n`);
      roles.forEach((role, index) => {
        console.log(`${index + 1}. Role: "${role.name}"`);
        console.log(`   ID: ${role.id}`);
        console.log(`   Description: "${role.description || 'ไม่มี'}"`);
        console.log(`   Active: ${role.isActive ? 'Yes' : 'No'}`);
        console.log(`   Staff Count: ${role._count.staffs}`);
        console.log(`   Permission Count: ${role._count.permissions}`);
        console.log(`   Created: ${role.createdAt.toLocaleDateString('th-TH')}`);
        
        if (role.permissions.length > 0) {
          console.log('   📝 Permissions:');
          role.permissions.forEach(perm => {
            const actions = [];
            if (perm.canRead) actions.push('Read');
            if (perm.canWrite) actions.push('Write');
            if (perm.canCreate) actions.push('Create');
            if (perm.canDelete) actions.push('Delete');
            console.log(`      - ${perm.resourceName}: ${actions.join(', ')}`);
          });
        } else {
          console.log('   📝 Permissions: ไม่มี');
        }
        console.log('');
      });
    }
    
    // 2. ตรวจสอบ RolePermissions ทั้งหมด
    console.log('🔐 ROLE PERMISSIONS ทั้งหมดในระบบ:');
    console.log('='.repeat(60));
    
    const allPermissions = await prisma.rolePermission.findMany({
      orderBy: [
        { resourceName: 'asc' },
        { role: { name: 'asc' } }
      ],
      include: {
        role: true
      }
    });
    
    if (allPermissions.length === 0) {
      console.log('❌ ไม่มี Role Permissions ในระบบ\n');
    } else {
      console.log(`✅ พบ ${allPermissions.length} permissions:\n`);
      
      // Group by resource
      const groupedByResource = {};
      allPermissions.forEach(perm => {
        if (!groupedByResource[perm.resourceName]) {
          groupedByResource[perm.resourceName] = [];
        }
        groupedByResource[perm.resourceName].push(perm);
      });
      
      Object.keys(groupedByResource).forEach(resource => {
        console.log(`📦 Resource: ${resource}`);
        groupedByResource[resource].forEach(perm => {
          const actions = [];
          if (perm.canRead) actions.push('Read');
          if (perm.canWrite) actions.push('Write');
          if (perm.canCreate) actions.push('Create');
          if (perm.canDelete) actions.push('Delete');
          console.log(`   - Role: ${perm.role.name} | Actions: ${actions.join(', ')}`);
        });
        console.log('');
      });
    }
    
    // 3. ตรวจสอบ Users/Staffs และ Roles
    console.log('👥 USERS และ ROLES:');
    console.log('='.repeat(60));
    
    const users = await prisma.user.findMany({
      include: {
        staffProfile: {
          include: {
            role: true
          }
        }
      }
    });
    
    console.log(`✅ พบ ${users.length} users ทั้งหมด\n`);
    
    // Staff users
    const staffUsers = users.filter(user => user.staffProfile);
    console.log(`👨‍💼 Staff Users: ${staffUsers.length}`);
    
    if (staffUsers.length > 0) {
      staffUsers.forEach((user, index) => {
        const staff = user.staffProfile;
        console.log(`${index + 1}. ${user.email}`);
        console.log(`   Name: ${user.firstName} ${user.lastName}`);
        console.log(`   Staff Position: ${staff.position || 'ไม่ระบุ'}`);
        console.log(`   Role: ${staff.role ? staff.role.name : '❌ ไม่มี Role'}`);
        console.log(`   Active: ${user.isActive ? 'Yes' : 'No'}`);
        console.log('');
      });
    }
    
    // Users without staff profile
    const regularUsers = users.filter(user => !user.staffProfile);
    console.log(`👤 Regular Users: ${regularUsers.length}`);
    
    if (regularUsers.length > 0) {
      regularUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email} (${user.userType})`);
        console.log(`   Name: ${user.firstName} ${user.lastName}`);
        console.log(`   Active: ${user.isActive ? 'Yes' : 'No'}`);
        console.log('');
      });
    }
    
    // Staff without roles
    const staffWithoutRoles = staffUsers.filter(user => !user.staffProfile.role);
    if (staffWithoutRoles.length > 0) {
      console.log('❌ Staff ที่ไม่มี Role:');
      staffWithoutRoles.forEach(user => {
        console.log(`   - ${user.email} (${user.staffProfile.position || 'ไม่ระบุตำแหน่ง'})`);
      });
      console.log('');
    }
    
    // 4. สรุปสถิติ
    console.log('📊 สรุปสถิติ:');
    console.log('='.repeat(60));
    console.log(`• Roles: ${roles.length}`);
    console.log(`• Role Permissions: ${allPermissions.length}`);
    console.log(`• Total Users: ${users.length}`);
    console.log(`• Staff Users: ${staffUsers.length}`);
    console.log(`• Regular Users: ${regularUsers.length}`);
    console.log(`• Staff without Role: ${staffWithoutRoles.length}`);
    
    if (roles.length === 0) {
      console.log('\n🚨 แนะนำ: ยังไม่มี Roles ในระบบ ควรสร้าง Role พื้นฐานก่อน');
    }
    
    if (allPermissions.length === 0) {
      console.log('\n🚨 แนะนำ: ยังไม่มี Permissions ในระบบ ควรกำหนด Permissions ให้กับ Roles');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRolesAndPermissions();
