// 🔧 Admin Token Auto-Refresh Manager
// Professional token management for admin panel

const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, 'apps', 'api', '.env') });

class AdminTokenManager {
    constructor() {
        this.jwtSecret = process.env.JWT_SECRET;
        this.jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
        this.tokenExpiry = process.env.JWT_EXPIRES_IN || '24h';
        this.refreshExpiry = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
        
        if (!this.jwtSecret) {
            throw new Error('JWT_SECRET not found in environment variables');
        }
    }

    // Generate fresh admin token
    generateAdminToken(adminData = {}) {
        const payload = {
            userId: adminData.userId || 'admin-001',
            email: adminData.email || 'admin@hotel.com',
            role: 'admin',
            permissions: ['view_bookings', 'manage_rooms', 'manage_users'],
            isAdmin: true,
            iat: Math.floor(Date.now() / 1000),
            ...adminData
        };

        const token = jwt.sign(payload, this.jwtSecret, {
            expiresIn: this.tokenExpiry,
            issuer: 'hotel-booking-system',
            audience: 'admin-panel'
        });

        return {
            token,
            expiresIn: this.tokenExpiry,
            payload,
            type: 'Bearer'
        };
    }

    // Generate refresh token
    generateRefreshToken(adminData = {}) {
        const payload = {
            userId: adminData.userId || 'admin-001',
            type: 'refresh',
            iat: Math.floor(Date.now() / 1000)
        };

        const refreshToken = jwt.sign(payload, this.jwtRefreshSecret, {
            expiresIn: this.refreshExpiry,
            issuer: 'hotel-booking-system'
        });

        return {
            refreshToken,
            expiresIn: this.refreshExpiry
        };
    }

    // Verify token and check expiry
    verifyToken(token) {
        try {
            const decoded = jwt.verify(token, this.jwtSecret);
            const now = Math.floor(Date.now() / 1000);
            const timeUntilExpiry = decoded.exp - now;
            
            return {
                valid: true,
                decoded,
                expiresIn: timeUntilExpiry,
                needsRefresh: timeUntilExpiry < 300 // Refresh if less than 5 minutes
            };
        } catch (error) {
            return {
                valid: false,
                error: error.message,
                expired: error.name === 'TokenExpiredError'
            };
        }
    }

    // Auto-refresh token if needed
    autoRefreshToken(currentToken) {
        const verification = this.verifyToken(currentToken);
        
        if (verification.valid && !verification.needsRefresh) {
            return {
                action: 'no_refresh_needed',
                token: currentToken,
                expiresIn: verification.expiresIn
            };
        }

        if (verification.expired || verification.needsRefresh) {
            const newTokenData = this.generateAdminToken();
            return {
                action: 'token_refreshed',
                ...newTokenData,
                reason: verification.expired ? 'token_expired' : 'token_near_expiry'
            };
        }

        return {
            action: 'refresh_failed',
            error: verification.error
        };
    }

    // Generate complete auth package for admin
    generateAdminAuthPackage(adminData = {}) {
        const tokenData = this.generateAdminToken(adminData);
        const refreshData = this.generateRefreshToken(adminData);

        return {
            access: tokenData,
            refresh: refreshData,
            usage: {
                headers: {
                    'Authorization': `Bearer ${tokenData.token}`,
                    'Content-Type': 'application/json'
                },
                localStorage: {
                    'admin_token': tokenData.token,
                    'admin_refresh_token': refreshData.refreshToken,
                    'token_expires_at': Date.now() + (24 * 60 * 60 * 1000) // 24h from now
                }
            }
        };
    }
}

// CLI Usage
if (require.main === module) {
    console.log('🔐 ADMIN TOKEN MANAGER - Professional Edition');
    console.log('='.repeat(80));

    try {
        const manager = new AdminTokenManager();
        
        // Generate fresh admin token package
        const adminAuth = manager.generateAdminAuthPackage({
            userId: 'admin-001',
            email: 'admin@hotel-booking.com',
            name: 'System Administrator'
        });

        console.log('\n🎯 FRESH ADMIN TOKEN GENERATED:');
        console.log('━'.repeat(50));
        console.log(`Token: ${adminAuth.access.token}`);
        console.log(`Expires: ${adminAuth.access.expiresIn}`);
        console.log(`Type: ${adminAuth.access.type}`);
        
        console.log('\n📋 AUTHORIZATION HEADER:');
        console.log('━'.repeat(50));
        console.log(`Authorization: ${adminAuth.usage.headers.Authorization}`);
        
        console.log('\n💾 LOCALSTORAGE SETUP:');
        console.log('━'.repeat(50));
        Object.entries(adminAuth.usage.localStorage).forEach(([key, value]) => {
            console.log(`${key}: ${value}`);
        });

        console.log('\n🔍 TOKEN VERIFICATION:');
        console.log('━'.repeat(50));
        const verification = manager.verifyToken(adminAuth.access.token);
        console.log(`Valid: ${verification.valid}`);
        console.log(`Expires in: ${verification.expiresIn} seconds`);
        console.log(`Needs refresh: ${verification.needsRefresh}`);

        console.log('\n🚀 USAGE EXAMPLES:');
        console.log('━'.repeat(50));
        console.log('// Frontend localStorage setup:');
        console.log(`localStorage.setItem('admin_token', '${adminAuth.access.token}');`);
        console.log('\n// API request header:');
        console.log(`headers: { 'Authorization': 'Bearer ${adminAuth.access.token}' }`);
        
        console.log('\n✅ SUCCESS: Admin token ready for immediate use!');
        console.log('💡 TIP: This token is valid for 24 hours');
        
    } catch (error) {
        console.error('❌ ERROR:', error.message);
        console.log('\n🔧 TROUBLESHOOTING:');
        console.log('1. Check if .env file exists in apps/api/');
        console.log('2. Verify JWT_SECRET is set in .env');
        console.log('3. Run from project root directory');
    }
}

module.exports = AdminTokenManager;
