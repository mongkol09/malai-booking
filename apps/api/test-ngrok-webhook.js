// 🧪 Test ngrok webhook endpoint
// Run this after setting up ngrok

const axios = require('axios');

async function testNgrokWebhook() {
  const NGROK_URL = process.argv[2]; // Pass ngrok URL as argument
  
  if (!NGROK_URL) {
    console.log('❌ Please provide ngrok URL');
    console.log('Usage: node test-ngrok-webhook.js https://your-url.ngrok.io');
    return;
  }

  console.log(`🔗 Testing ngrok webhook: ${NGROK_URL}`);

  try {
    // Test health check through ngrok
    console.log('\n🏥 Testing health check through ngrok...');
    const healthResponse = await axios.get(`${NGROK_URL}/api/v1/payments/health`);
    console.log('✅ Health check through ngrok:', healthResponse.status);
    console.log('📋 Response:', JSON.stringify(healthResponse.data, null, 2));

    // Test webhook endpoint (should fail without signature)
    console.log('\n🔐 Testing webhook security through ngrok...');
    try {
      await axios.post(`${NGROK_URL}/api/v1/payments/webhooks/omise`, {
        id: 'evt_test_ngrok_123',
        key: 'charge.complete',
        data: { id: 'chrg_test_123' }
      });
      console.log('❌ Webhook should have failed (no signature)');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Webhook correctly rejected through ngrok');
        console.log('🔒 Security working:', error.response.data.error);
      } else {
        console.log('⚠️ Unexpected response:', error.response?.status);
      }
    }

    console.log('\n🎉 ngrok tunnel is working correctly!');
    console.log(`🔗 Use this URL in Omise: ${NGROK_URL}/api/v1/payments/webhooks/omise`);
    console.log('📊 Monitor traffic at: http://127.0.0.1:4040');

  } catch (error) {
    console.error('❌ ngrok test failed:', error.message);
    console.log('💡 Make sure ngrok is running and URL is correct');
  }
}

testNgrokWebhook();
