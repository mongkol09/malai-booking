// ============================================
// CHECK DATABASE STRUCTURE FOR GUESTS
// ============================================

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabaseStructure() {
  console.log('🔍 Checking Database Structure...\n');

  try {
    // Check if guests table exists and its structure
    console.log('👤 Checking guests table...');
    const guestTableInfo = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'guests' 
      ORDER BY ordinal_position;
    `;
    
    if (guestTableInfo.length > 0) {
      console.log('✅ Guests table exists with columns:');
      guestTableInfo.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
      });
    } else {
      console.log('❌ Guests table does not exist');
    }

    // Check existing tables
    console.log('\n📋 Checking all tables...');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;
    
    console.log('📊 Existing tables:');
    tables.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });

    // Check if there are other guest-related tables
    console.log('\n👥 Looking for guest-related tables...');
    const guestTables = tables.filter(table => 
      table.table_name.includes('guest') || 
      table.table_name.includes('customer') ||
      table.table_name.includes('client')
    );
    
    if (guestTables.length > 0) {
      console.log('🔍 Found guest-related tables:');
      guestTables.forEach(table => {
        console.log(`  - ${table.table_name}`);
      });
    } else {
      console.log('⚠️  No guest-related tables found');
    }

    // Check booking table structure to understand relationships
    console.log('\n📅 Checking bookings table structure...');
    const bookingTableInfo = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'bookings' 
      ORDER BY ordinal_position;
    `;
    
    if (bookingTableInfo.length > 0) {
      console.log('✅ Bookings table exists with columns:');
      bookingTableInfo.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type}`);
      });
    } else {
      console.log('❌ Bookings table does not exist');
    }

  } catch (error) {
    console.error('❌ Error checking database structure:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
if (require.main === module) {
  checkDatabaseStructure();
}

module.exports = { checkDatabaseStructure };
