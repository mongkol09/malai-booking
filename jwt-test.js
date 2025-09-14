// ============================================
// 🔧 JWT VERIFICATION TEST
// Test JWT verification directly
// ============================================

const jwt = require('jsonwebtoken');

// Use environment variable only - no hardcoded fallback
const JWT_SECRET = process.env.JWT_SECRET || (() => {
  console.error('❌ JWT_SECRET not found in environment variables');
  console.log('💡 Set JWT_SECRET in your .env file');
  process.exit(1);
})();

function testJWTVerification() {
  console.log('🔧 Testing JWT Verification...\n');
  
  const invalidTokens = [
    'invalid_token_here',
    'Bearer invalid_token',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid_payload.invalid_signature',
    '', // Empty token
    null
  ];
  
  console.log(`Using JWT_SECRET: ${JWT_SECRET?.substring(0, 10)}...\n`);
  
  for (let i = 0; i < invalidTokens.length; i++) {
    const token = invalidTokens[i];
    console.log(`Test ${i + 1}: "${token?.substring(0, 20) || 'null'}..."`);
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log(`  ⚠️ SHOULD FAIL: Token decoded successfully!`);
      console.log(`  Decoded:`, decoded);
    } catch (error) {
      console.log(`  ✅ CORRECT: Token rejected - ${error.message}`);
    }
    console.log('');
  }
  
  // Test with a properly formatted but invalid token
  console.log('Testing with properly formatted but invalid secret...');
  try {
    const fakeToken = jwt.sign({userId: 'test'}, 'wrong-secret');
    console.log(`Fake token: ${fakeToken.substring(0, 30)}...`);
    
    const decoded = jwt.verify(fakeToken, JWT_SECRET);
    console.log(`  ⚠️ SHOULD FAIL: Fake token accepted!`);
  } catch (error) {
    console.log(`  ✅ CORRECT: Fake token rejected - ${error.message}`);
  }
}

testJWTVerification();
