// 🗄️ Database Backup via Prisma
// Backup ข้อมูลทั้งหมดจาก Malai Booking System

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function backupDatabase() {
  console.log('🗄️ Starting Database Backup via Prisma...');
  console.log(`📅 Backup Date: ${new Date().toISOString()}`);
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
                   new Date().toTimeString().split(' ')[0].replace(/:/g, '');
  
  const backupDir = path.join(__dirname, 'database_backups');
  const backupFile = path.join(backupDir, `hotel_booking_data_${timestamp}.json`);
  
  // สร้าง backup directory
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
    console.log(`✅ Created backup directory: ${backupDir}`);
  }
  
  try {
    console.log('📊 Fetching all data from database...');
    
    // รวบรวมข้อมูลทั้งหมด
    const backupData = {
      metadata: {
        backupDate: new Date().toISOString(),
        backupVersion: '1.0.0',
        databaseName: 'hotel_booking'
      },
      data: {}
    };
    
    // Backup Users
    console.log('👤 Backing up Users...');
    backupData.data.users = await prisma.user.findMany({
      include: {
        sessions: true
      }
    });
    console.log(`   ✅ ${backupData.data.users.length} users backed up`);
    
    // Skip Hotels - not in schema
    
    // Backup Room Types
    console.log('🛏️ Backing up Room Types...');
    backupData.data.roomTypes = await prisma.roomType.findMany({
      include: {
        rooms: true
      }
    });
    console.log(`   ✅ ${backupData.data.roomTypes.length} room types backed up`);
    
    // Backup Rooms
    console.log('🏠 Backing up Rooms...');
    backupData.data.rooms = await prisma.room.findMany({
      include: {
        roomType: true,
        actualBookings: true,
        housekeepingTasks: true
      }
    });
    console.log(`   ✅ ${backupData.data.rooms.length} rooms backed up`);
    
    // Backup Bookings (ข้อมูลสำคัญที่สุด)
    console.log('📋 Backing up Bookings...');
    backupData.data.bookings = await prisma.booking.findMany({
      include: {
        user: true,
        room: {
          include: {
            hotel: true,
            roomType: true
          }
        },
        payments: true
      }
    });
    console.log(`   ✅ ${backupData.data.bookings.length} bookings backed up`);
    
    // Backup Payments
    console.log('💳 Backing up Payments...');
    backupData.data.payments = await prisma.payment.findMany({
      include: {
        booking: true
      }
    });
    console.log(`   ✅ ${backupData.data.payments.length} payments backed up`);
    
    // Backup Sessions
    console.log('🔐 Backing up Sessions...');
    backupData.data.sessions = await prisma.session.findMany({
      include: {
        user: true
      }
    });
    console.log(`   ✅ ${backupData.data.sessions.length} sessions backed up`);
    
    // เขียนไฟล์ backup
    console.log('💾 Writing backup file...');
    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
    
    const fileStats = fs.statSync(backupFile);
    const fileSizeMB = (fileStats.size / (1024 * 1024)).toFixed(2);
    
    console.log('\n🎉 Backup completed successfully!');
    console.log(`📁 Backup file: ${backupFile}`);
    console.log(`📏 File size: ${fileSizeMB} MB`);
    console.log(`📊 Total records: ${Object.values(backupData.data).reduce((sum, table) => sum + (Array.isArray(table) ? table.length : 0), 0)}`);
    
    // สรุปข้อมูล
    console.log('\n📈 Backup Summary:');
    console.log(`   👤 Users: ${backupData.data.users.length}`);
    console.log(`   🏨 Hotels: ${backupData.data.hotels.length}`);
    console.log(`   🛏️ Room Types: ${backupData.data.roomTypes.length}`);
    console.log(`   🏠 Rooms: ${backupData.data.rooms.length}`);
    console.log(`   📋 Bookings: ${backupData.data.bookings.length}`);
    console.log(`   💳 Payments: ${backupData.data.payments.length}`);
    console.log(`   🔐 Sessions: ${backupData.data.sessions.length}`);
    
    return backupFile;
    
  } catch (error) {
    console.error('❌ Backup failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// เรียกใช้งาน
if (require.main === module) {
  backupDatabase()
    .then((backupFile) => {
      console.log(`\n✅ Database backup saved to: ${backupFile}`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Backup process failed:', error);
      process.exit(1);
    });
}

module.exports = { backupDatabase };