// Admin Token Setup for Testing
// Run this in browser console at http://localhost:3000

const adminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMzYxYjc4MC0wMmU1LTRjNTQtYmE2Zi0wNjJkODdiZDZmN2EiLCJlbWFpbCI6ImFpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiQURNSU4iLCJzZXNzaW9uSWQiOiI3NjIyOWQ2Ni1iYjM4LTRlOTItYTE0ZC0zMTFhMzAxZjk4YzUiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU1OTUyMjQyLCJleHAiOjE3NTU5NTMxNDIsImF1ZCI6ImhvdGVsLWJvb2tpbmctY2xpZW50IiwiaXNzIjoiaG90ZWwtYm9va2luZy1hcGkifQ.TM7iCjNBZpMMSfXl27CG1m3VOxD7cw2S4YOnjAXRSxE';

const adminUser = {
  id: '1361b780-02e5-4c54-ba6f-062d87bd6f7a',
  email: 'ai@gmail.com',
  userType: 'ADMIN',
  firstName: 'Admin',
  lastName: 'User',
  isActive: true,
  emailVerified: true
};

// Set authentication data
localStorage.setItem('hotel_admin_token', adminToken);
localStorage.setItem('hotel_admin_user', JSON.stringify(adminUser));

console.log('✅ Admin authentication set up successfully!');
console.log('🔄 Please refresh the page to login');

// Auto refresh
setTimeout(() => {
  window.location.reload();
}, 1000);
