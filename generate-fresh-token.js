const jwt = require('jsonwebtoken');

// Generate fresh admin token
const payload = {
  userId: 'e6206da0-5204-4960-81d0-3bf0fb939b70', // admin@hotel.com from DB
  email: 'admin@hotel.com',
  userType: 'ADMIN',
  sessionId: 'fresh-session-' + Date.now(),
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
  aud: 'hotel-booking-client',
  iss: 'hotel-booking-api'
};

// Use the same JWT_SECRET that server uses
const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const freshToken = jwt.sign(payload, jwtSecret);

console.log('🔑 Fresh Admin Token Generated:');
console.log('Token:', freshToken);
console.log('');
console.log('📋 Copy these commands into browser console:');
console.log('localStorage.setItem("token", "' + freshToken + '");');
console.log('localStorage.setItem("hotel_admin_token", "' + freshToken + '");');
console.log('localStorage.setItem("hotel_admin_user", ' + JSON.stringify(JSON.stringify({
  id: "e6206da0-5204-4960-81d0-3bf0fb939b70",
  email: "admin@hotel.com", 
  firstName: "Admin",
  lastName: "User",
  userType: "ADMIN"
})) + ');');
console.log('');
console.log('✅ Then refresh the Room Status page!');
