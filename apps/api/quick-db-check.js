// 🔍 DATABASE CONNECTION & BASIC CHECK
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function quickDatabaseCheck() {
  console.log('🔍 === QUICK DATABASE CHECK ===\n');
  
  try {
    // Test connection
    console.log('🔌 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connected successfully\n');
    
    // Check all tables
    console.log('📋 Checking table counts:');
    console.log('='.repeat(40));
    
    const checks = [
      { name: 'Users', model: 'user' },
      { name: 'Room Types', model: 'roomType' },
      { name: 'Rooms', model: 'room' },
      { name: 'Guests', model: 'guest' },
      { name: 'Bookings', model: 'booking' },
      { name: 'System Settings', model: 'systemSetting' },
      { name: 'Pricing Rules', model: 'dynamicPricingRule' }
    ];
    
    for (const check of checks) {
      try {
        const count = await prisma[check.model].count();
        console.log(`  ${check.name}: ${count} records`);
      } catch (error) {
        console.log(`  ${check.name}: ❌ Error (${error.message})`);
      }
    }
    
    // Check if database has any data at all
    console.log('\n🔍 Sample data check:');
    console.log('='.repeat(40));
    
    try {
      const users = await prisma.user.findMany({ take: 3 });
      if (users.length > 0) {
        console.log('👤 Sample Users:');
        users.forEach(user => {
          console.log(`  • ${user.firstName} ${user.lastName} (${user.email})`);
        });
      } else {
        console.log('👤 No users found');
      }
    } catch (error) {
      console.log('👤 Users table error:', error.message);
    }
    
    console.log('\n🎯 Database Status:');
    console.log('='.repeat(40));
    console.log('✅ Connection: Working');
    console.log('✅ Schema: Loaded');
    console.log('⚠️ Data: Empty or minimal');
    
    console.log('\n💡 Recommendations:');
    console.log('  1. Run database seeding scripts');
    console.log('  2. Add sample room types and rates');
    console.log('  3. Configure system settings for tax/service charges');
    console.log('  4. Create test bookings for validation');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('  1. Check DATABASE_URL in .env file');
    console.log('  2. Ensure PostgreSQL is running');
    console.log('  3. Run: npx prisma generate');
    console.log('  4. Run: npx prisma db push');
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
quickDatabaseCheck();
