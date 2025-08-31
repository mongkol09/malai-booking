# 🧪 Session-Based Authentication Test Suite

## 📋 Overview

ชุดเทสครบครันสำหรับระบบ Session-Based Authentication ที่มีความปลอดภัยระดับ Enterprise รวมไปถึงการทดสอบทุกด้านของระบบตั้งแต่การล็อกอิน ยืนยันตัวตน การจัดการ session และฐานข้อมูล

## 🗂️ Test Files Structure

```
📁 Hotel_booking/
├── 🧪 test-session-auth-complete.js      # Complete authentication flow tests
├── 🔧 test-session-utilities.js          # Core session management function tests  
├── 🗄️ test-session-database.js           # Database integration and persistence tests
├── 🚀 master-session-test.js             # Master test runner (runs all suites)
└── 📄 session-test-report.json           # Generated test report (after running)
```

## 🎯 Test Coverage

### 🔐 Complete Authentication Tests (`test-session-auth-complete.js`)
- ✅ **Authentication Flow**
  - Admin login with session tokens
  - User login with session tokens  
  - Invalid credentials handling
  - Multiple login attempts

- ✅ **Token Validation**
  - Valid token access to protected endpoints
  - Invalid token rejection
  - Missing token handling
  - Malformed authorization headers

- ✅ **Role-Based Access Control**
  - Admin access to admin endpoints
  - User access restriction to admin endpoints
  - User access to user endpoints

- ✅ **Session Management**
  - Session token refresh
  - Invalid refresh token handling
  - Session logout and token invalidation

- ✅ **Admin Session Management**
  - List all active sessions
  - Session statistics
  - Cleanup expired sessions

- ✅ **Security Features**
  - Token expiry headers
  - Multiple login attempt tracking
  - Concurrent session management

- ✅ **Error Handling**
  - Malformed JSON requests
  - Missing required fields
  - Invalid HTTP methods

### 🔧 Session Utilities Tests (`test-session-utilities.js`)
- ✅ **Token Generation**
  - JWT format validation
  - Token header/payload structure
  - Refresh token generation
  - Session ID assignment

- ✅ **Token Validation Mechanics**
  - Valid token usage in endpoints
  - Invalid signature detection
  - Malformed token handling
  - Token case sensitivity

- ✅ **Session Refresh Mechanics**
  - Valid refresh token processing
  - New token generation and validity
  - Old token invalidation
  - Invalid refresh token rejection

- ✅ **Session Logout and Cleanup**
  - Single session logout
  - Multiple session handling
  - Admin session cleanup
  - Token invalidation verification

- ✅ **Security Features**
  - IP address tracking
  - User-Agent consistency checking
  - Security headers in responses

- ✅ **Performance and Load**
  - Concurrent request handling
  - Sequential request performance
  - Response time measurement

### 🗄️ Database Integration Tests (`test-session-database.js`)
- ✅ **Database Session Storage**
  - Session creation in database
  - Session data verification
  - Multiple sessions per user
  - Session-user relationship mapping

- ✅ **Session Persistence and Recovery**
  - Session persistence across requests
  - Session refresh and database updates
  - Session expiry handling
  - Expired session cleanup

- ✅ **User Session Lifecycle**
  - Test user creation and session
  - User session permissions
  - User session visibility in admin
  - User session logout

- ✅ **Database Integrity and Constraints**
  - Session data integrity checks
  - Foreign key constraint validation
  - Session uniqueness constraints
  - Data relationship verification

## 🚀 How to Run Tests

### Prerequisites
```bash
# Install required dependencies
npm install axios colors

# Make sure server is running
npm run dev
```

### Run Individual Test Suites

```bash
# Complete authentication flow tests
node test-session-auth-complete.js

# Session utilities tests  
node test-session-utilities.js

# Database integration tests
node test-session-database.js
```

### Run All Tests with Master Runner

```bash
# Run all test suites
node master-session-test.js

# Run specific suite only
node master-session-test.js --suite complete
node master-session-test.js --suite utilities  
node master-session-test.js --suite database

# Skip report generation
node master-session-test.js --no-report

# Set custom timeout (in milliseconds)
node master-session-test.js --timeout 600000

# Show help
node master-session-test.js --help
```

## 📊 Test Output and Reports

### Console Output
Tests provide real-time feedback with:
- ✅ **PASS**: Test passed successfully
- ❌ **FAIL**: Test failed with error details
- 🔄 **INFO**: Test information and progress
- ⚠️ **WARN**: Warnings or non-critical issues

### JSON Report (Generated automatically)
```json
{
  "metadata": {
    "timestamp": "2025-08-16T10:30:00.000Z",
    "duration": 45123,
    "testEnvironment": {
      "baseUrl": "http://localhost:5001/api",
      "nodeVersion": "v18.0.0",
      "platform": "win32"
    }
  },
  "summary": {
    "totalSuites": 3,
    "passedSuites": 3,
    "failedSuites": 0,
    "skippedSuites": 0
  },
  "suites": {
    "complete": { "status": "passed", "duration": 15234 },
    "utilities": { "status": "passed", "duration": 12456 },
    "database": { "status": "passed", "duration": 17433 }
  },
  "recommendations": [
    {
      "type": "success",
      "message": "All test suites passed - system ready for production"
    }
  ]
}
```

## ⚙️ Configuration

### Test Configuration
Edit the `CONFIG` object in each test file:

```javascript
const CONFIG = {
  BASE_URL: 'http://localhost:5001/api',     // API server URL
  ADMIN_EMAIL: 'admin@hotelair.com',         // Admin account
  ADMIN_PASSWORD: 'admin123',                // Admin password
  TEST_USER_EMAIL: 'testuser@example.com',   // Test user account
  TEST_USER_PASSWORD: 'test123',             // Test user password
  DELAY_BETWEEN_TESTS: 1000,                 // Delay between tests (ms)
};
```

### Master Test Configuration
Edit the `MASTER_CONFIG` object in `master-session-test.js`:

```javascript
const MASTER_CONFIG = {
  BASE_URL: 'http://localhost:5001/api',
  OUTPUT_REPORT: true,                       // Generate JSON report
  REPORT_FILE: 'session-test-report.json',   // Report filename
  DELAY_BETWEEN_SUITES: 2000,                // Delay between suites (ms)
  MAX_RETRIES: 3,                            // Retry failed tests
  TIMEOUT_PER_SUITE: 300000,                 // Timeout per suite (5 min)
};
```

## 🛡️ Security Test Features

### Authentication Security
- Invalid credential rejection
- Token signature validation
- Authorization header format checking
- Session token expiry handling

### Session Security  
- IP address consistency tracking
- User-Agent validation
- Multiple session management
- Concurrent session limits

### Database Security
- Session data integrity
- Foreign key constraints
- Unique constraint validation
- SQL injection prevention

### Performance Security
- Rate limiting validation
- Concurrent request handling
- Memory leak detection
- Response time monitoring

## 📈 Success Criteria

### ✅ All Tests Pass
- All authentication flows work correctly
- Session management functions properly
- Database operations are reliable
- Security measures are effective

### 📊 Performance Benchmarks
- Response time < 500ms for auth operations
- Concurrent request handling (10+ simultaneous)
- Session refresh < 200ms
- Database queries optimized

### 🔒 Security Validation
- No unauthorized access possible
- All tokens properly validated
- Session data protected
- Error messages don't leak sensitive info

## 🚨 Troubleshooting

### Common Issues

#### Server Not Running
```
❌ Server health check failed: connect ECONNREFUSED
```
**Solution**: Make sure the API server is running on `http://localhost:5001`

#### Invalid Credentials
```
❌ Admin Login: Invalid credentials
```
**Solution**: Check admin credentials in test configuration

#### Database Connection Issues
```
❌ Session Database Verification: Could not retrieve session list
```
**Solution**: Verify database connection and Prisma configuration

#### Token Validation Failures
```
❌ Valid Token Access: Valid token rejected
```
**Solution**: Check JWT secret configuration and middleware implementation

### Debug Mode
Add debug logging by setting:
```javascript
process.env.DEBUG = 'session-test:*';
```

## 📝 Test Maintenance

### Adding New Tests
1. Add test function to appropriate test file
2. Update test documentation
3. Add to master test runner if needed
4. Update success criteria

### Updating Credentials
1. Update `CONFIG` objects in test files
2. Ensure test accounts exist in database
3. Verify permissions are correct

### Performance Tuning
1. Adjust timeout values for slower environments
2. Modify delay settings as needed
3. Update performance benchmarks

## 🎉 Production Readiness

When all tests pass:
- ✅ Authentication system is secure
- ✅ Session management is reliable  
- ✅ Database operations are stable
- ✅ Error handling is comprehensive
- ✅ Performance meets requirements

**System is ready for production deployment! 🚀**

---

## 📞 Support

For issues or questions about the test suite:
1. Check the troubleshooting section
2. Review test output and error messages
3. Verify server and database configuration
4. Contact development team if needed

**Happy Testing! 🧪✨**
