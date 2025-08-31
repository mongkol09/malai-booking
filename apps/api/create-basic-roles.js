const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createBasicRolesAndPermissions() {
  try {
    console.log('🔧 === สร้าง ROLES และ PERMISSIONS พื้นฐาน ===\n');
    
    await prisma.$connect();
    console.log('✅ Database connected\n');
    
    // 1. สร้าง Roles พื้นฐาน
    console.log('📋 กำลังสร้าง Basic Roles...');
    
    const rolesToCreate = [
      {
        name: 'Super Admin',
        description: 'ผู้ดูแลระบบสูงสุด มีสิทธิ์เต็มทุกอย่าง'
      },
      {
        name: 'Admin',
        description: 'ผู้ดูแลระบบ มีสิทธิ์จัดการส่วนใหญ่'
      },
      {
        name: 'Manager',
        description: 'ผู้จัดการ มีสิทธิ์จัดการการจองและรายงาน'
      },
      {
        name: 'Staff',
        description: 'พนักงาน มีสิทธิ์จัดการการจองพื้นฐาน'
      },
      {
        name: 'Customer',
        description: 'ลูกค้า มีสิทธิ์จองและดูข้อมูลส่วนตัว'
      }
    ];
    
    const createdRoles = {};
    
    for (const roleData of rolesToCreate) {
      const existingRole = await prisma.role.findFirst({
        where: { name: roleData.name }
      });
      
      if (existingRole) {
        console.log(`   ⚠️  Role "${roleData.name}" มีอยู่แล้ว`);
        createdRoles[roleData.name] = existingRole;
      } else {
        const newRole = await prisma.role.create({
          data: roleData
        });
        console.log(`   ✅ สร้าง Role "${roleData.name}" สำเร็จ`);
        createdRoles[roleData.name] = newRole;
      }
    }
    
    console.log('\n🔐 กำลังสร้าง Role Permissions...');
    
    // 2. สร้าง Permissions สำหรับแต่ละ Role
    const permissionsConfig = {
      'Super Admin': {
        'users': { canRead: true, canWrite: true, canCreate: true, canDelete: true },
        'roles': { canRead: true, canWrite: true, canCreate: true, canDelete: true },
        'bookings': { canRead: true, canWrite: true, canCreate: true, canDelete: true },
        'rooms': { canRead: true, canWrite: true, canCreate: true, canDelete: true },
        'reports': { canRead: true, canWrite: true, canCreate: true, canDelete: true },
        'settings': { canRead: true, canWrite: true, canCreate: true, canDelete: true },
        'promocodes': { canRead: true, canWrite: true, canCreate: true, canDelete: true },
        'events': { canRead: true, canWrite: true, canCreate: true, canDelete: true }
      },
      'Admin': {
        'users': { canRead: true, canWrite: true, canCreate: true, canDelete: false },
        'roles': { canRead: true, canWrite: false, canCreate: false, canDelete: false },
        'bookings': { canRead: true, canWrite: true, canCreate: true, canDelete: true },
        'rooms': { canRead: true, canWrite: true, canCreate: true, canDelete: false },
        'reports': { canRead: true, canWrite: true, canCreate: true, canDelete: false },
        'settings': { canRead: true, canWrite: true, canCreate: false, canDelete: false },
        'promocodes': { canRead: true, canWrite: true, canCreate: true, canDelete: true },
        'events': { canRead: true, canWrite: true, canCreate: true, canDelete: true }
      },
      'Manager': {
        'users': { canRead: true, canWrite: false, canCreate: false, canDelete: false },
        'bookings': { canRead: true, canWrite: true, canCreate: true, canDelete: false },
        'rooms': { canRead: true, canWrite: true, canCreate: false, canDelete: false },
        'reports': { canRead: true, canWrite: false, canCreate: false, canDelete: false },
        'promocodes': { canRead: true, canWrite: true, canCreate: true, canDelete: false },
        'events': { canRead: true, canWrite: true, canCreate: true, canDelete: false }
      },
      'Staff': {
        'bookings': { canRead: true, canWrite: true, canCreate: true, canDelete: false },
        'rooms': { canRead: true, canWrite: false, canCreate: false, canDelete: false },
        'reports': { canRead: true, canWrite: false, canCreate: false, canDelete: false },
        'events': { canRead: true, canWrite: false, canCreate: false, canDelete: false }
      },
      'Customer': {
        'bookings': { canRead: true, canWrite: false, canCreate: true, canDelete: false },
        'rooms': { canRead: true, canWrite: false, canCreate: false, canDelete: false },
        'events': { canRead: true, canWrite: false, canCreate: false, canDelete: false }
      }
    };
    
    let totalPermissionsCreated = 0;
    
    for (const [roleName, resources] of Object.entries(permissionsConfig)) {
      const role = createdRoles[roleName];
      if (!role) continue;
      
      console.log(`\n   📝 สร้าง Permissions สำหรับ Role "${roleName}":`);
      
      for (const [resourceName, permissions] of Object.entries(resources)) {
        // ตรวจสอบว่ามี permission นี้อยู่แล้วหรือไม่
        const existingPermission = await prisma.rolePermission.findUnique({
          where: {
            roleId_resourceName: {
              roleId: role.id,
              resourceName: resourceName
            }
          }
        });
        
        if (existingPermission) {
          console.log(`      ⚠️  Permission "${resourceName}" มีอยู่แล้ว`);
          continue;
        }
        
        await prisma.rolePermission.create({
          data: {
            roleId: role.id,
            resourceName: resourceName,
            canRead: permissions.canRead || false,
            canWrite: permissions.canWrite || false,
            canCreate: permissions.canCreate || false,
            canDelete: permissions.canDelete || false
          }
        });
        
        const actions = [];
        if (permissions.canRead) actions.push('Read');
        if (permissions.canWrite) actions.push('Write');
        if (permissions.canCreate) actions.push('Create');
        if (permissions.canDelete) actions.push('Delete');
        
        console.log(`      ✅ ${resourceName}: ${actions.join(', ')}`);
        totalPermissionsCreated++;
      }
    }
    
    console.log(`\n📊 สร้าง ${Object.keys(createdRoles).length} roles และ ${totalPermissionsCreated} permissions สำเร็จ\n`);
    
    // 3. แสดงผลลัพธ์
    console.log('🎉 === สรุปผลการสร้าง ===');
    console.log('✅ Roles ที่สร้าง:');
    Object.values(createdRoles).forEach((role, index) => {
      console.log(`   ${index + 1}. ${role.name} - ${role.description}`);
    });
    
    console.log('\n✅ ขั้นตอนถัดไป:');
    console.log('   1. สร้าง Staff Profiles สำหรับ users ที่เป็น ADMIN/STAFF');
    console.log('   2. เชื่อม Users กับ Roles ผ่าน Staff Profile');
    console.log('   3. ทดสอบระบบ permissions');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createBasicRolesAndPermissions();
