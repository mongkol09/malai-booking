const jwt = require('jsonwebtoken');

// Create a development token with issuer and audience
const payload = {
  userId: 'dev-user-123',
  email: 'admin@hotel.dev',
  userType: 'ADMIN',
  sessionId: 'dev-session-123'
};

const secret = 'hotel-booking-super-secret-jwt-key-2024-production-grade-minimum-32-chars';
const token = jwt.sign(payload, secret, { 
  expiresIn: '24h',
  issuer: 'hotel-booking-api',
  audience: 'hotel-booking-client'
});

console.log('Development Token:');
console.log(token);
console.log('\nUse this token in Authorization header:');
console.log(`Bearer ${token}`);
