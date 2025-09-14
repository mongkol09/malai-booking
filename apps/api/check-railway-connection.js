const { PrismaClient } = require('@prisma/client');

async function checkRailwayConnection() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🚄 Testing Railway Database Connection...');
    console.log(`🔗 Database URL: ${process.env.DATABASE_URL ? '✅ Set' : '❌ Not set'}`);
    
    // ทดสอบ connection
    await prisma.$connect();
    console.log('✅ Connection successful!');
    
    // ตรวจสอบตาราง
    console.log('\n📊 Database Tables:');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    
    console.log(`📋 Found ${tables.length} tables:`);
    tables.forEach(table => {
      console.log(`   • ${table.table_name}`);
    });
    
    // ตรวจสอบข้อมูล
    console.log('\n📈 Data Summary:');
    try {
      const userCount = await prisma.user.count();
      console.log(`👤 Users: ${userCount}`);
    } catch (e) {
      console.log('👤 Users: ❌ Table not found or empty');
    }
    
    try {
      const roomCount = await prisma.room.count();
      console.log(`🏠 Rooms: ${roomCount}`);
    } catch (e) {
      console.log('🏠 Rooms: ❌ Table not found or empty');
    }
    
    try {
      const bookingCount = await prisma.booking.count();
      console.log(`📋 Bookings: ${bookingCount}`);
    } catch (e) {
      console.log('📋 Bookings: ❌ Table not found or empty');
    }
    
    console.log('\n🎉 Railway database is ready!');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('1. ตรวจสอบ DATABASE_URL ใน .env file');
    console.log('2. ตรวจสอบ Railway database ว่า running อยู่หรือไม่');
    console.log('3. ลอง npx prisma migrate deploy');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkRailwayConnection();