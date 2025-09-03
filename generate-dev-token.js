const jwt = require('jsonwebtoken');

// Create a development token
const payload = {
  userId: 'dev-user-123',
  email: 'admin@hotel.dev',
  userType: 'ADMIN',
  sessionId: 'dev-session-123'
};

const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-that-should-be-longer-than-32-characters-for-security';
const token = jwt.sign(payload, secret, { expiresIn: '24h' });

console.log('Development Token:');
console.log(token);
console.log('\nUse this token in Authorization header:');
console.log(`Bearer ${token}`);
