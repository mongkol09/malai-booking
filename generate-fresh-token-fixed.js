const jwt = require('jsonwebtoken');

const payload = {
  userId: 'e6206da0-5204-4960-81d0-3bf0fb939b70',
  email: 'admin@hotel.com',
  userType: 'ADMIN',
  sessionId: 'fresh-session-' + Date.now(),
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60),
  aud: 'hotel-booking-client',
  iss: 'hotel-booking-api'
};

const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const freshToken = jwt.sign(payload, jwtSecret);

console.log('='.repeat(60));
console.log('🔑 FRESH ADMIN TOKEN GENERATED (FIXED CONSISTENCY)');
console.log('='.repeat(60));
console.log('Token:', freshToken);
console.log('');
console.log('🌐 Browser Console Commands (Updated):');
console.log('// Clear all tokens first');
console.log('localStorage.clear();');
console.log('// Set fresh token with consistent key');
console.log(`localStorage.setItem("hotel_admin_token", "${freshToken}");`);
console.log('// Backup token key for compatibility');
console.log(`localStorage.setItem("token", "${freshToken}");`);
console.log('');
console.log('✅ Ready to test Room Status with API Service!');
console.log('='.repeat(60));
