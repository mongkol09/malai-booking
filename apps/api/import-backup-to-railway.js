const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function importBackupToRailway() {
  try {
    console.log('🚄 Starting Railway Database Import...');
    
    // หาไฟล์ backup ล่าสุด
    const backupDir = path.join(__dirname, 'database_backups');
    const backupFiles = fs.readdirSync(backupDir)
      .filter(file => file.startsWith('hotel_backup_') && file.endsWith('.json'))
      .sort()
      .reverse();
    
    if (backupFiles.length === 0) {
      throw new Error('ไม่พบไฟล์ backup');
    }
    
    const latestBackup = backupFiles[0];
    const backupPath = path.join(backupDir, latestBackup);
    
    console.log(`📁 Using backup file: ${latestBackup}`);
    
    // อ่านข้อมูล backup
    const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
    console.log(`📅 Backup date: ${backupData.meta.backupDate}`);
    console.log(`📊 Total tables: ${Object.keys(backupData.data).length}`);
    
    // เรียงลำดับตาราง (เริ่มจากตารางที่ไม่มี foreign key dependencies)
    const tableOrder = [
      'user', 'userSession', 'passwordResetToken',
      'floorPlan', 'bedType', 'roomType', 'room',
      'guest', 'bookingType', 'cancellationPolicy', 'cancellationPolicyRule',
      'booking', 'dailyRoomRate', 'dynamicPricingRule', 'rateAuditLog',
      'paymentMethod', 'folio', 'transaction', 'invoice',
      'department', 'role', 'rolePermission',
      'staff', 'employee', 'notification', 'promocode', 'promocodeUsage',
      'auditLog', 'event', 'systemSetting'
    ];
    
    let totalImported = 0;
    
    for (const tableName of tableOrder) {
      if (backupData.data[tableName] && backupData.data[tableName].length > 0) {
        try {
          console.log(`📄 Importing ${tableName}...`);
          
          // ลบข้อมูลเดิม (ถ้ามี)
          await prisma[tableName].deleteMany({});
          
          // Import ข้อมูลใหม่
          if (tableName === 'user') {
            // Handle users with individual creates to avoid constraint issues
            for (const record of backupData.data[tableName]) {
              await prisma.user.create({ data: record });
            }
          } else {
            await prisma[tableName].createMany({
              data: backupData.data[tableName],
              skipDuplicates: true
            });
          }
          
          const count = backupData.data[tableName].length;
          console.log(`   ✅ ${count} records imported`);
          totalImported += count;
          
        } catch (error) {
          console.log(`   ⚠️ Error importing ${tableName}:`, error.message);
          // Continue with other tables
        }
      } else {
        console.log(`   ⏭️ Skipping ${tableName} (no data)`);
      }
    }
    
    console.log('\n🎉 Import completed!');
    console.log(`📊 Total records imported: ${totalImported}`);
    
    // ตรวจสอบข้อมูลหลัง import
    console.log('\n📋 Railway Database Summary:');
    const userCount = await prisma.user.count();
    const roomCount = await prisma.room.count();
    const bookingCount = await prisma.booking.count();
    const guestCount = await prisma.guest.count();
    
    console.log(`👤 Users: ${userCount}`);
    console.log(`🏠 Rooms: ${roomCount}`);
    console.log(`📋 Bookings: ${bookingCount}`);
    console.log(`🧳 Guests: ${guestCount}`);
    
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// เรียกใช้งาน
if (require.main === module) {
  importBackupToRailway();
}

module.exports = { importBackupToRailway };