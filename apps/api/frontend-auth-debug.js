const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

// ============================================
// FRONTEND AUTHENTICATION DEBUGGING TOOL
// ============================================

async function createValidTokenForFrontend() {
  try {
    console.log('🧪 Creating Valid Token for Frontend Testing\n');

    // 1. หา Admin User
    const adminUser = await prisma.user.findFirst({
      where: {
        userType: { in: ['ADMIN', 'DEV'] },
        isActive: true
      },
      select: {
        id: true,
        email: true,
        userType: true,
        firstName: true,
        lastName: true
      }
    });

    if (!adminUser) {
      console.log('❌ ไม่มี Admin User สำหรับทดสอบ');
      return;
    }

    console.log(`👤 Found Admin User: ${adminUser.email} (${adminUser.userType})`);

    // 2. สร้าง JWT Token
    const JWT_SECRET = process.env.JWT_SECRET || 'malai-booking-secret-key-2024';
    const sessionId = 'frontend-session-' + Date.now();

    const tokenPayload = {
      userId: adminUser.id,
      email: adminUser.email,
      userType: adminUser.userType,
      sessionId: sessionId
    };

    const validToken = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '24h' });

    // 3. สร้าง UserSession
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await prisma.userSession.create({
      data: {
        id: sessionId,
        userId: adminUser.id,
        accessToken: validToken,
        refreshToken: 'refresh-' + sessionId,
        expiresAt: expiresAt
      }
    });

    console.log(`🔑 Created Valid Token (24h):`);
    console.log(`Token: ${validToken}`);
    console.log(`\n📋 Frontend Setup Instructions:`);
    console.log(`\n1. Open Browser Developer Tools`);
    console.log(`2. Go to Application > Local Storage > http://localhost:3000`);
    console.log(`3. Add these keys:`);
    console.log(`   Key: hotel_admin_token`);
    console.log(`   Value: ${validToken}`);
    console.log(`\n   Key: hotel_admin_user`);
    console.log(`   Value: ${JSON.stringify({
      id: adminUser.id,
      email: adminUser.email,
      userType: adminUser.userType,
      firstName: adminUser.firstName,
      lastName: adminUser.lastName
    })}`);

    console.log(`\n🌐 Test Commands:`);
    console.log(`\n1. Test with curl:`);
    console.log(`curl -X GET "http://localhost:3001/api/v1/booking-history/analytics/statistics" \\`);
    console.log(`  -H "Authorization: Bearer ${validToken}"`);

    console.log(`\n2. Test URL (should be correct):`);
    console.log(`✅ http://localhost:3001/api/v1/booking-history/analytics/statistics`);
    console.log(`❌ http://localhost:3001/api/v1/api/v1/booking-history/analytics (wrong - double /api/v1)`);

    console.log(`\n⏰ Token expires at: ${expiresAt.toLocaleString()}`);
    console.log(`🆔 Session ID: ${sessionId}`);

    // 4. ทำความสะอาด session เก่า
    const deletedSessions = await prisma.userSession.deleteMany({
      where: {
        userId: adminUser.id,
        expiresAt: { lt: new Date() }
      }
    });

    console.log(`🧹 Cleaned up ${deletedSessions.count} expired sessions`);

  } catch (error) {
    console.error('❌ Error creating token:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// ============================================
// TEST FRONTEND ENVIRONMENT VARIABLES
// ============================================

function testFrontendConfig() {
  console.log('\n🔧 Frontend Configuration Check:\n');
  
  const expectedEnvVars = {
    'REACT_APP_API_BASE_URL': 'http://localhost:3001',
    'REACT_APP_API_URL': 'http://localhost:3001'
  };

  console.log('📋 Expected .env values:');
  Object.entries(expectedEnvVars).forEach(([key, value]) => {
    console.log(`   ${key}=${value}`);
  });

  console.log('\n⚠️ Make sure these are set in app/admin/.env');
  console.log('⚠️ If you change .env, restart the frontend server!');

  console.log('\n🛣️ URL Construction Test:');
  console.log('Frontend should call:');
  console.log('  Base: http://localhost:3001');
  console.log('  + Path: /api/v1/booking-history/analytics/statistics');
  console.log('  = Full: http://localhost:3001/api/v1/booking-history/analytics/statistics');
  console.log('\nIf you see /api/v1/api/v1/... then REACT_APP_API_BASE_URL is wrong!');
}

// ============================================
// MAIN FUNCTION
// ============================================

async function main() {
  console.log('🚀 Frontend Authentication Debugging Tool\n');
  console.log('=' * 60);
  
  await createValidTokenForFrontend();
  testFrontendConfig();
  
  console.log('\n' + '=' * 60);
  console.log('🏁 Setup Complete!');
  console.log('\n📝 Next Steps:');
  console.log('1. Set localStorage keys as shown above');
  console.log('2. Check .env file for correct API URLs');
  console.log('3. Restart frontend if .env was changed');
  console.log('4. Refresh the BookingHistory page');
}

// รันเฉพาะเมื่อเรียกไฟล์นี้โดยตรง
if (require.main === module) {
  main();
}

module.exports = { createValidTokenForFrontend, testFrontendConfig };