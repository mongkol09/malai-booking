const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function simpleBackup() {
  try {
    console.log('🗄️ Starting Simple Database Backup...');
    console.log(`📅 Backup Date: ${new Date().toISOString()}`);
    
    // Create backup directory
    const backupDir = path.join(__dirname, 'database_backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
      console.log('✅ Created backup directory:', backupDir);
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFilename = `hotel_backup_${timestamp}.json`;
    const backupPath = path.join(backupDir, backupFilename);
    
    const backupData = {
      meta: {
        backupDate: new Date().toISOString(),
        version: '1.0.0',
        source: 'prisma-simple-backup'
      },
      data: {}
    };
    
    console.log('📊 Fetching all data from database...');
    
    // Backup all tables without complex relations
    const tables = [
      'user', 'userSession', 'passwordResetToken',
      'floorPlan', 'bedType', 'roomType', 'room',
      'guest', 'bookingType', 'cancellationPolicy', 'cancellationPolicyRule',
      'booking', 'dailyRoomRate', 'dynamicPricingRule', 'rateAuditLog',
      'paymentMethod', 'folio', 'transaction', 'invoice',
      'department', 'role', 'permission', 'rolePermission',
      'staff', 'employee', 'notification', 'promocode', 'promocodeUsage',
      'auditLog', 'event', 'systemSetting', 'apiKey'
    ];
    
    for (const table of tables) {
      try {
        console.log(`📄 Backing up ${table}...`);
        const data = await prisma[table].findMany();
        backupData.data[table] = data;
        console.log(`   ✅ ${data.length} records backed up`);
      } catch (error) {
        console.log(`   ⚠️ Skipped ${table} (not found or error):`, error.message);
      }
    }
    
    // Write backup file
    fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
    
    console.log('\n🎉 Backup completed successfully!');
    console.log(`📁 Backup file: ${backupPath}`);
    console.log(`📊 File size: ${(fs.statSync(backupPath).size / (1024 * 1024)).toFixed(2)} MB`);
    
    // Count total records
    const totalRecords = Object.values(backupData.data).reduce((sum, records) => sum + records.length, 0);
    console.log(`📈 Total records backed up: ${totalRecords}`);
    
  } catch (error) {
    console.error('❌ Backup failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

simpleBackup();