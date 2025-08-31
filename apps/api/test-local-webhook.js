// 🧪 Mock Omise Webhook Test (Local Testing)
// Test webhook without public URL

const axios = require('axios');
const crypto = require('crypto');

const API_BASE = 'http://localhost:3001/api/v1/payments';
const WEBHOOK_SECRET = 'REPLACE_WITH_ACTUAL_WEBHOOK_SECRET_FROM_OMISE_DASHBOARD';

async function testMockWebhook() {
  console.log('🧪 Testing Mock Omise Webhook Locally...\n');

  // 1. Create mock Omise webhook payload
  const mockPayload = {
    id: 'evnt_test_local_mock_123',
    key: 'charge.complete',
    created: new Date().toISOString(),
    data: {
      id: 'chrg_test_local_mock_123',
      amount: 100000, // 1000 THB in satang
      currency: 'thb',
      status: 'successful',
      authorized: true,
      captured: true,
      paid: true,
      transaction: 'trxn_test_local_123',
      metadata: {
        booking_id: 'test-booking-id',
        customer_email: 'test@hotel.com'
      }
    }
  };

  // 2. Generate proper HMAC signature
  const signature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(JSON.stringify(mockPayload))
    .digest('hex');

  console.log('🔒 Generated signature:', signature.substring(0, 20) + '...');

  try {
    // 3. Send mock webhook to our local endpoint
    const response = await axios.post(`${API_BASE}/webhooks/omise`, mockPayload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${signature}`,
        'X-Omise-Timestamp': Date.now().toString(),
        'User-Agent': 'Omise-Webhook/1.0'
      }
    });

    console.log('✅ Mock webhook processed successfully!');
    console.log('📋 Response:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    if (error.response) {
      console.log('⚠️ Webhook response:', error.response.status);
      console.log('📝 Error details:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('❌ Request failed:', error.message);
    }
  }
}

// Test different webhook events
async function testAllWebhookEvents() {
  const events = [
    { key: 'charge.complete', status: 'successful', paid: true },
    { key: 'charge.failed', status: 'failed', paid: false },
    { key: 'refund.create', status: 'successful', paid: false }
  ];

  for (const event of events) {
    console.log(`\n🔔 Testing ${event.key} event...`);
    
    const payload = {
      id: `evnt_test_${event.key.replace('.', '_')}_123`,
      key: event.key,
      created: new Date().toISOString(),
      data: {
        id: `chrg_test_${event.key.replace('.', '_')}_123`,
        amount: 100000,
        currency: 'thb',
        status: event.status,
        paid: event.paid,
        authorized: event.key !== 'charge.failed',
        captured: event.key === 'charge.complete'
      }
    };

    const signature = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(JSON.stringify(payload))
      .digest('hex');

    try {
      const response = await axios.post(`${API_BASE}/webhooks/omise`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${signature}`,
          'X-Omise-Timestamp': Date.now().toString()
        }
      });
      console.log(`✅ ${event.key} processed successfully`);
    } catch (error) {
      console.log(`⚠️ ${event.key} response:`, error.response?.status, error.response?.data?.error);
    }
  }
}

console.log('🎯 Choose test type:');
console.log('node test-local-webhook.js mock    - Test single mock webhook');
console.log('node test-local-webhook.js all     - Test all webhook event types');

const testType = process.argv[2] || 'mock';

if (testType === 'all') {
  testAllWebhookEvents();
} else {
  testMockWebhook();
}
