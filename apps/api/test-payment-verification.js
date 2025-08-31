/**
 * 🧪 Payment Verification API Test Script
 * Tests all payment confirmation flow endpoints
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const WEBHOOK_SECRET = 'test_webhook_secret_key_123456789';
const API_BASE = 'http://localhost:3001/api/v1/payments';
const API_KEY = process.env.API_KEY || 'your-api-key-here';

async function testPaymentVerificationAPIs() {
  console.log('🚀 Testing Payment Verification APIs...\n');

  try {
    // 1. Test webhook health check
    console.log('📡 Testing webhook health check...');
    const healthResponse = await fetch(`${API_BASE}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData.status);
    console.log('📋 Available endpoints:', healthData.endpoints.length);
    
    // 2. Create test payment first (if needed)
    console.log('\n💳 Creating test payment...');
    const testPayment = await createTestPayment();
    console.log('✅ Test payment created:', testPayment.id);

    // 3. Test payment verification
    console.log('\n🔍 Testing payment verification...');
    const verifyResponse = await fetch(`${API_BASE}/${testPayment.id}/verify`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (verifyResponse.ok) {
      const verifyData = await verifyResponse.json();
      console.log('✅ Payment verification successful');
      console.log('📊 Consistency:', verifyData.verification.consistent);
    } else {
      console.log('❌ Payment verification failed:', verifyResponse.status);
    }

    // 4. Test audit trail
    console.log('\n📋 Testing audit trail...');
    const auditResponse = await fetch(`${API_BASE}/${testPayment.id}/audit-trail`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (auditResponse.ok) {
      const auditData = await auditResponse.json();
      console.log('✅ Audit trail retrieved');
      console.log('🔔 Webhook events:', auditData.auditTrail.webhookEvents.length);
      console.log('📧 Email logs:', auditData.auditTrail.emailLogs.length);
    } else {
      console.log('❌ Audit trail failed:', auditResponse.status);
    }

    // 5. Test webhook stats
    console.log('\n📊 Testing webhook statistics...');
    const statsResponse = await fetch(`${API_BASE}/webhooks/stats?days=30`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (statsResponse.ok) {
      const statsData = await statsResponse.json();
      console.log('✅ Webhook stats retrieved');
      console.log('📈 Total events:', statsData.statistics.totalEvents);
      console.log('📅 Period:', statsData.period);
    } else {
      console.log('❌ Webhook stats failed:', statsResponse.status);
    }

    // 6. Test webhook endpoint (simulate Omise webhook)
    console.log('\n🔔 Testing webhook endpoint...');
    await testWebhookEndpoint(testPayment);

    console.log('\n🎉 All tests completed!');

  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

async function createTestPayment() {
  // Check if test payment already exists
  let existingPayment = await prisma.payment.findFirst({
    where: {
      omiseChargeId: 'chrg_test_webhook_test_123'
    }
  });

  if (existingPayment) {
    console.log('♻️ Using existing test payment');
    return existingPayment;
  }

  // Create test booking if needed
  let testBooking = await prisma.booking.findFirst({
    where: {
      user: { email: 'test@webhook.com' }
    }
  });

  if (!testBooking) {
    // Create test user first
    const testUser = await prisma.user.upsert({
      where: { email: 'test@webhook.com' },
      update: {},
      create: {
        email: 'test@webhook.com',
        passwordHash: 'test_hash',
        userType: 'GUEST',
        firstName: 'Webhook',
        lastName: 'Test',
        phoneNumber: '+66123456789',
        country: 'TH'
      }
    });

    // Get a test room
    const testRoom = await prisma.room.findFirst();
    if (!testRoom) {
      throw new Error('No rooms available for testing');
    }

    // Create test booking
    testBooking = await prisma.booking.create({
      data: {
        userId: testUser.id,
        roomId: testRoom.id,
        checkInDate: new Date('2025-09-01'),
        checkOutDate: new Date('2025-09-03'),
        totalAmount: 5000,
        currency: 'THB',
        status: 'PENDING_PAYMENT',
        numberOfGuests: 2,
        specialRequests: 'Webhook testing booking'
      }
    });
  }

  // Get payment method
  const paymentMethod = await prisma.paymentMethod.findFirst({
    where: { isActive: true }
  });

  if (!paymentMethod) {
    throw new Error('No payment methods available');
  }

  // Create test payment
  const payment = await prisma.payment.create({
    data: {
      bookingId: testBooking.id,
      amount: testBooking.totalAmount,
      currency: 'THB',
      paymentMethodId: paymentMethod.id,
      omiseChargeId: 'chrg_test_webhook_test_123',
      paymentMethodType: 'credit_card',
      status: 'PENDING'
    }
  });

  return payment;
}

async function testWebhookEndpoint(payment) {
  const crypto = require('crypto');
  
  // Simulate Omise webhook payload
  const webhookPayload = {
    id: 'evnt_test_webhook_123',
    key: 'charge.complete',
    created: new Date().toISOString(),
    data: {
      id: payment.omiseChargeId,
      amount: parseInt(payment.amount * 100), // Omise uses smallest currency unit
      currency: payment.currency.toLowerCase(),
      status: 'successful',
      authorized: true,
      captured: true,
      paid: true,
      transaction: 'trxn_test_123'
    }
  };

  // Generate signature
  const signature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(JSON.stringify(webhookPayload))
    .digest('hex');

  try {
    const webhookResponse = await fetch(`${API_BASE}/webhooks/omise`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${signature}`,
        'X-Omise-Timestamp': Date.now().toString()
      },
      body: JSON.stringify(webhookPayload)
    });

    if (webhookResponse.ok) {
      const webhookData = await webhookResponse.json();
      console.log('✅ Webhook processed successfully');
      console.log('🔔 Event type:', webhookData.eventType);
      console.log('💳 Charge ID:', webhookData.chargeId);
    } else {
      const errorData = await webhookResponse.text();
      console.log('❌ Webhook failed:', webhookResponse.status);
      console.log('📝 Error:', errorData);
    }
  } catch (error) {
    console.log('❌ Webhook request error:', error.message);
  }
}

// 🔧 Utility function to check database state
async function checkDatabaseState() {
  console.log('\n📊 Current Database State:');
  
  const payments = await prisma.payment.count();
  const webhookEvents = await prisma.webhookEvent.count();
  const bookings = await prisma.booking.count();
  
  console.log(`💳 Payments: ${payments}`);
  console.log(`🔔 Webhook Events: ${webhookEvents}`);
  console.log(`🏨 Bookings: ${bookings}`);
}

// Run the test
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'check') {
    checkDatabaseState().then(() => process.exit(0));
  } else {
    testPaymentVerificationAPIs().then(() => process.exit(0));
  }
}

module.exports = {
  testPaymentVerificationAPIs,
  createTestPayment,
  checkDatabaseState
};
