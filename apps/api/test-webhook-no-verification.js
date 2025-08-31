const express = require('express');

const app = express();

// ✅ Simple webhook receiver without signature verification
app.use('/api/v1/payments/webhooks/omise', express.json(), (req, res) => {
  console.log('\n🔔 WEBHOOK RECEIVED at:', new Date().toISOString());
  console.log('📋 Headers:', {
    'authorization': req.headers.authorization,
    'content-type': req.headers['content-type'],
    'user-agent': req.headers['user-agent'],
    'x-forwarded-for': req.headers['x-forwarded-for']
  });
  console.log('📦 Body:', JSON.stringify(req.body, null, 2));
  
  // Log potential webhook secret header locations
  console.log('\n🔑 Potential webhook secret in headers:');
  Object.keys(req.headers).forEach(header => {
    if (header.toLowerCase().includes('sign') || 
        header.toLowerCase().includes('auth') || 
        header.toLowerCase().includes('webhook')) {
      console.log(`  ${header}: ${req.headers[header]}`);
    }
  });
  
  res.status(200).json({ 
    received: true, 
    timestamp: new Date().toISOString() 
  });
});

// Health check
app.get('/api/v1/payments/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Webhook test server running',
    timestamp: new Date().toISOString() 
  });
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`🚀 Webhook test server running on port ${PORT}`);
  console.log(`📡 Webhook endpoint: http://localhost:${PORT}/api/v1/payments/webhooks/omise`);
  console.log(`🌐 Public endpoint: https://57d3bde282cc.ngrok-free.app/api/v1/payments/webhooks/omise`);
  console.log('\n⏳ Waiting for webhooks from Omise...\n');
});
