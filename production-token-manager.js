// ==============================================
// PRODUCTION TOKEN MANAGEMENT SOLUTION
// ==============================================

const jwt = require('jsonwebtoken');
const crypto = require('crypto');

class ProductionTokenManager {
  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
    this.refreshSecret = process.env.REFRESH_SECRET || 'refresh-secret-key-change-in-production';
    
    // Token configuration for production
    this.tokenConfig = {
      accessToken: {
        expiresIn: '15m',           // Short-lived: 15 minutes
        expiresInSeconds: 15 * 60
      },
      refreshToken: {
        expiresIn: '7d',            // Long-lived: 7 days
        expiresInSeconds: 7 * 24 * 60 * 60
      },
      adminToken: {
        expiresIn: '8h',            // Admin work session: 8 hours
        expiresInSeconds: 8 * 60 * 60
      }
    };
  }

  // Generate access token (short-lived)
  generateAccessToken(payload) {
    const now = Math.floor(Date.now() / 1000);
    
    const tokenPayload = {
      ...payload,
      iat: now,
      exp: now + this.tokenConfig.accessToken.expiresInSeconds,
      type: 'access',
      aud: 'hotel-booking-client',
      iss: 'hotel-booking-api'
    };

    return jwt.sign(tokenPayload, this.jwtSecret);
  }

  // Generate refresh token (long-lived)
  generateRefreshToken(payload) {
    const now = Math.floor(Date.now() / 1000);
    
    const tokenPayload = {
      userId: payload.userId,
      sessionId: payload.sessionId,
      iat: now,
      exp: now + this.tokenConfig.refreshToken.expiresInSeconds,
      type: 'refresh',
      aud: 'hotel-booking-client',
      iss: 'hotel-booking-api'
    };

    return jwt.sign(tokenPayload, this.refreshSecret);
  }

  // Generate admin token (medium-lived for admin work)
  generateAdminToken(payload) {
    const now = Math.floor(Date.now() / 1000);
    
    const tokenPayload = {
      ...payload,
      iat: now,
      exp: now + this.tokenConfig.adminToken.expiresInSeconds,
      type: 'admin',
      aud: 'hotel-booking-client',
      iss: 'hotel-booking-api'
    };

    return jwt.sign(tokenPayload, this.jwtSecret);
  }

  // Generate token pair (access + refresh)
  generateTokenPair(userPayload) {
    const sessionId = 'session_' + crypto.randomBytes(16).toString('hex');
    
    const basePayload = {
      userId: userPayload.userId,
      email: userPayload.email,
      userType: userPayload.userType,
      sessionId: sessionId
    };

    const accessToken = this.generateAccessToken(basePayload);
    const refreshToken = this.generateRefreshToken(basePayload);

    return {
      accessToken,
      refreshToken,
      expiresIn: this.tokenConfig.accessToken.expiresInSeconds,
      tokenType: 'Bearer'
    };
  }

  // Verify and decode token
  verifyToken(token, type = 'access') {
    try {
      const secret = type === 'refresh' ? this.refreshSecret : this.jwtSecret;
      const decoded = jwt.verify(token, secret);
      
      // Check token type
      if (decoded.type !== type) {
        throw new Error(`Invalid token type. Expected: ${type}, Got: ${decoded.type}`);
      }

      return { valid: true, payload: decoded };
    } catch (error) {
      return { 
        valid: false, 
        error: error.message,
        expired: error.name === 'TokenExpiredError'
      };
    }
  }

  // Check if token needs refresh (expires in next 5 minutes)
  needsRefresh(token) {
    try {
      const decoded = jwt.decode(token);
      if (!decoded || !decoded.exp) return true;

      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = decoded.exp - now;
      
      // Refresh if expires in next 5 minutes
      return timeUntilExpiry < (5 * 60);
    } catch {
      return true;
    }
  }
}

// ==============================================
// PRODUCTION AUTO-REFRESH CLIENT
// ==============================================

class AutoRefreshTokenClient {
  constructor(apiBaseUrl) {
    this.apiBaseUrl = apiBaseUrl;
    this.tokenManager = new ProductionTokenManager();
    this.refreshPromise = null;
    
    // Auto-refresh interval (check every 5 minutes)
    this.refreshInterval = setInterval(() => {
      this.checkAndRefreshToken();
    }, 5 * 60 * 1000);
  }

  // Store tokens in secure storage
  storeTokens(tokens) {
    localStorage.setItem('hotel_admin_token', tokens.accessToken);
    localStorage.setItem('hotel_admin_refresh_token', tokens.refreshToken);
    localStorage.setItem('hotel_admin_token_expires', 
      (Date.now() + (tokens.expiresIn * 1000)).toString()
    );
  }

  // Get stored tokens
  getStoredTokens() {
    return {
      accessToken: localStorage.getItem('hotel_admin_token'),
      refreshToken: localStorage.getItem('hotel_admin_refresh_token'),
      expiresAt: parseInt(localStorage.getItem('hotel_admin_token_expires') || '0')
    };
  }

  // Check and refresh token if needed
  async checkAndRefreshToken() {
    const tokens = this.getStoredTokens();
    
    if (!tokens.accessToken || !tokens.refreshToken) {
      console.log('🔐 No tokens found - user needs to login');
      return false;
    }

    // Check if access token needs refresh
    if (this.tokenManager.needsRefresh(tokens.accessToken)) {
      console.log('🔄 Access token needs refresh...');
      return await this.refreshAccessToken();
    }

    return true;
  }

  // Refresh access token using refresh token
  async refreshAccessToken() {
    // Prevent multiple concurrent refresh requests
    if (this.refreshPromise) {
      return await this.refreshPromise;
    }

    this.refreshPromise = this._performTokenRefresh();
    const result = await this.refreshPromise;
    this.refreshPromise = null;
    
    return result;
  }

  async _performTokenRefresh() {
    try {
      const tokens = this.getStoredTokens();
      
      const response = await fetch(`${this.apiBaseUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokens.refreshToken}`
        },
        body: JSON.stringify({
          refreshToken: tokens.refreshToken
        })
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const newTokens = await response.json();
      this.storeTokens(newTokens);
      
      console.log('✅ Token refreshed successfully');
      return true;

    } catch (error) {
      console.error('❌ Token refresh failed:', error.message);
      this.clearTokens();
      
      // Redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      
      return false;
    }
  }

  // Clear all tokens
  clearTokens() {
    localStorage.removeItem('hotel_admin_token');
    localStorage.removeItem('hotel_admin_refresh_token');
    localStorage.removeItem('hotel_admin_token_expires');
    localStorage.removeItem('hotel_admin_user');
  }

  // Get current valid access token
  async getValidAccessToken() {
    await this.checkAndRefreshToken();
    return this.getStoredTokens().accessToken;
  }

  // Cleanup
  destroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }
}

// ==============================================
// DEVELOPMENT HELPER - GENERATE ADMIN TOKENS
// ==============================================

function generateDevAdminTokens() {
  const tokenManager = new ProductionTokenManager();
  
  const adminPayload = {
    userId: 'e6206da0-5204-4960-81d0-3bf0fb939b70',
    email: 'admin@hotel.com',
    userType: 'ADMIN',
    firstName: 'Admin',
    lastName: 'User'
  };

  // Generate both access and refresh tokens
  const tokens = tokenManager.generateTokenPair(adminPayload);
  
  // Also generate a long-lived admin token for development
  const longLivedAdminToken = tokenManager.generateAdminToken(adminPayload);

  console.log('🔑 Production Token Set Generated:');
  console.log('━'.repeat(60));
  console.log('📱 Access Token (15min):', tokens.accessToken);
  console.log('🔄 Refresh Token (7days):', tokens.refreshToken);
  console.log('👨‍💼 Admin Token (8hours):', longLivedAdminToken);
  console.log('━'.repeat(60));
  
  console.log('\n📋 Browser Console Commands (Auto-Refresh Setup):');
  console.log(`localStorage.setItem("hotel_admin_token", "${tokens.accessToken}");`);
  console.log(`localStorage.setItem("hotel_admin_refresh_token", "${tokens.refreshToken}");`);
  console.log(`localStorage.setItem("hotel_admin_user", '${JSON.stringify(adminPayload)}');`);
  
  console.log('\n📋 Browser Console Commands (Long-lived Admin Token):');
  console.log(`localStorage.setItem("hotel_admin_token", "${longLivedAdminToken}");`);
  console.log(`localStorage.setItem("hotel_admin_user", '${JSON.stringify(adminPayload)}');`);
  
  console.log('\n💡 Production Benefits:');
  console.log('✅ Auto token refresh every 5 minutes');
  console.log('✅ Secure short-lived access tokens (15min)');
  console.log('✅ Long-lived refresh tokens (7 days)');
  console.log('✅ No manual token generation needed');
  console.log('✅ Automatic login redirects on failure');

  return {
    ...tokens,
    adminToken: longLivedAdminToken
  };
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ProductionTokenManager,
    AutoRefreshTokenClient,
    generateDevAdminTokens
  };
}

// Run if executed directly
if (require.main === module) {
  generateDevAdminTokens();
}
