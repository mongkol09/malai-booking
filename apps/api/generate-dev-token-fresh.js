// 🔑 GENERATE NEW DEV TOKEN FOR mongkol09ms@gmail.com
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

async function generateDevToken() {
  try {
    console.log('🔍 Finding DEV user: mongkol09ms@gmail.com...');
    
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: 'mongkol09ms@gmail.com' }
    });

    if (!user) {
      console.log('❌ User not found!');
      return;
    }

    console.log('✅ User found:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.userType}`);

    if (user.userType !== 'DEV') {
      console.log('❌ User is not DEV role!');
      return;
    }

    // Generate session ID (without storing in DB since Session model doesn't exist)
    const sessionId = `dev-session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    console.log('🔗 Session ID generated:', sessionId);

    // Generate JWT token
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      userType: user.userType,
      sessionId: sessionId
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    console.log('\n🎯 NEW DEV TOKEN GENERATED:');
    console.log('='.repeat(60));
    console.log(`📧 User: ${user.email}`);
    console.log(`🎭 Role: ${user.userType}`);
    console.log(`🔗 Session: ${sessionId}`);
    console.log(`🔑 Token: ${token}`);

    console.log('\n📋 USAGE INSTRUCTIONS:');
    console.log('='.repeat(60));
    console.log('1. Copy the token above');
    console.log('2. Use in Authorization header as: Bearer [token]');
    console.log('3. Or update localStorage in frontend:');
    console.log(`   localStorage.setItem('authToken', '${token}');`);

    console.log('\n🧪 TEST COMMANDS:');
    console.log('='.repeat(60));
    console.log('// Test users endpoint');
    console.log(`curl -H "Authorization: Bearer ${token}" http://localhost:3001/api/v1/users`);

    console.log('\n✅ Token generation complete!');

  } catch (error) {
    console.error('❌ Error generating token:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the token generation
generateDevToken();
