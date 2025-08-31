// 🔐 CREATE PROPER SESSION FOR DEV USER
// ============================================
// สร้าง session ใน database สำหรับ sessionAuth middleware

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

async function createProperDevSession() {
  try {
    console.log('🔐 CREATING PROPER DEV SESSION');
    console.log('='.repeat(60));
    
    // 1. หา DEV user
    console.log('🔍 Finding DEV user: mongkol09ms@gmail.com...');
    const user = await prisma.user.findUnique({
      where: { email: 'mongkol09ms@gmail.com' }
    });

    if (!user) {
      console.log('❌ User not found!');
      return;
    }

    console.log('✅ User found:', {
      id: user.id,
      email: user.email,
      userType: user.userType
    });

    if (user.userType !== 'DEV') {
      console.log('❌ User is not DEV role!');
      return;
    }

    // 2. ลบ session เก่าทั้งหมด (cleanup)
    console.log('🧹 Cleaning up old sessions...');
    const deletedSessions = await prisma.userSession.deleteMany({
      where: { userId: user.id }
    });
    console.log(`✅ Deleted ${deletedSessions.count} old sessions`);

    // 3. สร้าง session ใหม่
    console.log('🔨 Creating new session...');
    
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    
    // สร้าง JWT token
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      userType: user.userType,
      sessionId: sessionId
    };

    const accessToken = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    const refreshToken = jwt.sign(
      { userId: user.id, sessionId: sessionId }, 
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, 
      { expiresIn: '30d' }
    );

    // 4. บันทึก session ลง database
    const session = await prisma.userSession.create({
      data: {
        id: sessionId,
        userId: user.id,
        accessToken: accessToken,
        refreshToken: refreshToken,
        expiresAt: expiresAt,
        ipAddress: '127.0.0.1',
        userAgent: 'Developer-Session'
      }
    });

    console.log('✅ Session created successfully:', {
      sessionId: session.id,
      expiresAt: session.expiresAt.toISOString()
    });

    // 5. Update user's last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    console.log('\n🎯 SESSION AUTHENTICATION READY!');
    console.log('='.repeat(60));
    console.log('📧 User: mongkol09ms@gmail.com');
    console.log('🎭 Role: DEV (Highest privileges)');
    console.log('🔗 Session ID:', sessionId);
    console.log('🔑 Access Token:');
    console.log(accessToken);

    console.log('\n🌐 FRONTEND SETUP:');
    console.log('='.repeat(60));
    console.log('// Run this in browser console:');
    console.log(`localStorage.setItem('authToken', '${accessToken}');`);
    console.log(`localStorage.setItem('hotel_admin_token', '${accessToken}');`);
    console.log(`localStorage.setItem('hotel_admin_user', '${JSON.stringify({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      userType: user.userType,
      isActive: true,
      emailVerified: true
    })}');`);

    console.log('\n🧪 API TEST:');
    console.log('='.repeat(60));
    console.log(`curl -H "Authorization: Bearer ${accessToken}" http://localhost:3001/api/v1/bookings/admin/all`);

    console.log('\n✅ READY TO USE!');
    console.log('Now the sessionAuth middleware will work properly.');

  } catch (error) {
    console.error('❌ Error creating session:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the session creation
createProperDevSession();
