// =============================================
// PRODUCTION JWT SECRET GENERATOR
// =============================================
// Tools that professional developers use

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

class ProfessionalJWTGenerator {
  
  // Method 1: Industry Standard - OpenSSL equivalent
  static generateSecureSecret(length = 64) {
    return crypto.randomBytes(length).toString('base64');
  }

  // Method 2: URL-safe secret (no special characters)
  static generateUrlSafeSecret(length = 64) {
    return crypto.randomBytes(length).toString('base64url');
  }

  // Method 3: Hex format (some prefer this)
  static generateHexSecret(length = 64) {
    return crypto.randomBytes(length).toString('hex');
  }

  // Method 4: High entropy alphanumeric
  static generateAlphanumericSecret(length = 64) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const randomArray = crypto.randomBytes(length);
    
    for (let i = 0; i < length; i++) {
      result += chars[randomArray[i] % chars.length];
    }
    return result;
  }

  // Method 5: Generate complete .env JWT section
  static generateCompleteJWTConfig() {
    const jwtSecret = this.generateSecureSecret(64);
    const refreshSecret = this.generateSecureSecret(64);
    const encryptionKey = this.generateSecureSecret(32);
    
    return {
      JWT_SECRET: jwtSecret,
      JWT_EXPIRES_IN: "15m",           // Short-lived for security
      JWT_REFRESH_SECRET: refreshSecret,
      JWT_REFRESH_EXPIRES_IN: "7d",    // Long-lived refresh
      ENCRYPTION_KEY: encryptionKey
    };
  }

  // Method 6: Professional .env file generator
  static generateDotEnvFile(outputPath = '.env.example') {
    const config = this.generateCompleteJWTConfig();
    
    const envContent = `# ============================================
# JWT CONFIGURATION (GENERATED: ${new Date().toISOString()})
# ============================================
# NEVER commit these secrets to version control!
# Generate new secrets for each environment

# Primary JWT Secret (for access tokens)
JWT_SECRET="${config.JWT_SECRET}"

# JWT Token Expiration (short-lived for security)
JWT_EXPIRES_IN="${config.JWT_EXPIRES_IN}"

# Refresh Token Secret (different from JWT secret)
JWT_REFRESH_SECRET="${config.JWT_REFRESH_SECRET}"

# Refresh Token Expiration (longer-lived)
JWT_REFRESH_EXPIRES_IN="${config.JWT_REFRESH_EXPIRES_IN}"

# Encryption Key (for sensitive data)
ENCRYPTION_KEY="${config.ENCRYPTION_KEY}"

# ============================================
# SECURITY BEST PRACTICES:
# ============================================
# 1. Use different secrets for different environments
# 2. Rotate secrets regularly (quarterly recommended)
# 3. Store secrets in secure key management systems
# 4. Never log or expose secrets in application code
# 5. Use environment variables, not hardcoded values
# ============================================
`;

    console.log('🔐 Professional JWT Configuration Generated:');
    console.log('━'.repeat(80));
    console.log(envContent);
    
    // Save to file
    fs.writeFileSync(outputPath, envContent);
    console.log(`\n💾 Configuration saved to: ${outputPath}`);
    
    return config;
  }

  // Method 7: Validate existing secret strength
  static validateSecretStrength(secret) {
    const analysis = {
      length: secret.length,
      entropy: this.calculateEntropy(secret),
      hasUppercase: /[A-Z]/.test(secret),
      hasLowercase: /[a-z]/.test(secret),
      hasNumbers: /[0-9]/.test(secret),
      hasSpecialChars: /[^A-Za-z0-9]/.test(secret),
      strength: 'weak'
    };

    // Calculate strength
    let score = 0;
    if (analysis.length >= 32) score += 2;
    if (analysis.length >= 64) score += 2;
    if (analysis.hasUppercase) score += 1;
    if (analysis.hasLowercase) score += 1;
    if (analysis.hasNumbers) score += 1;
    if (analysis.hasSpecialChars) score += 1;
    if (analysis.entropy > 4) score += 2;

    if (score >= 8) analysis.strength = 'excellent';
    else if (score >= 6) analysis.strength = 'good';
    else if (score >= 4) analysis.strength = 'fair';
    
    return analysis;
  }

  // Calculate Shannon entropy
  static calculateEntropy(str) {
    const frequency = {};
    for (let char of str) {
      frequency[char] = (frequency[char] || 0) + 1;
    }
    
    let entropy = 0;
    const length = str.length;
    
    for (let count of Object.values(frequency)) {
      const probability = count / length;
      entropy -= probability * Math.log2(probability);
    }
    
    return entropy;
  }
}

// =============================================
// PROFESSIONAL TOKEN MANAGEMENT STRATEGIES
// =============================================

class ProfessionalTokenStrategies {
  
  // Strategy 1: Development Environment
  static developmentStrategy() {
    return {
      accessTokenExpiry: '1h',        // Longer for dev convenience
      refreshTokenExpiry: '30d',      // Very long for dev
      autoRefresh: true,
      rememberMe: true,
      securityLevel: 'relaxed'
    };
  }

  // Strategy 2: Staging Environment  
  static stagingStrategy() {
    return {
      accessTokenExpiry: '30m',       // Medium security
      refreshTokenExpiry: '7d',       // Moderate refresh cycle
      autoRefresh: true,
      rememberMe: false,
      securityLevel: 'moderate'
    };
  }

  // Strategy 3: Production Environment
  static productionStrategy() {
    return {
      accessTokenExpiry: '15m',       // Short-lived for security
      refreshTokenExpiry: '24h',      // Daily refresh required
      autoRefresh: true,
      rememberMe: false,
      securityLevel: 'strict',
      additionalSecurity: {
        ipBinding: true,              // Bind token to IP
        deviceFingerprinting: true,   // Track device changes
        suspiciousActivityDetection: true
      }
    };
  }

  // Strategy 4: High Security Environment (Banking, Healthcare)
  static highSecurityStrategy() {
    return {
      accessTokenExpiry: '5m',        // Very short-lived
      refreshTokenExpiry: '1h',       // Frequent re-authentication
      autoRefresh: false,             // Manual authentication required
      rememberMe: false,
      securityLevel: 'maximum',
      additionalSecurity: {
        twoFactorRequired: true,
        biometricAuth: true,
        zeroTrustModel: true
      }
    };
  }
}

// =============================================
// INDUSTRY TOOLS & COMMANDS
// =============================================

function showIndustryCommands() {
  console.log('\n🛠️ PROFESSIONAL TOOLS FOR JWT SECRETS:');
  console.log('━'.repeat(60));
  
  console.log('\n1️⃣ OpenSSL (Industry Standard):');
  console.log('   openssl rand -base64 64');
  console.log('   openssl rand -hex 32');
  
  console.log('\n2️⃣ Node.js Built-in:');
  console.log('   node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'base64\'))"');
  
  console.log('\n3️⃣ Python (DevOps Teams):');
  console.log('   python -c "import secrets; print(secrets.token_urlsafe(64))"');
  
  console.log('\n4️⃣ Linux/Unix (urandom):');
  console.log('   head -c 64 /dev/urandom | base64');
  
  console.log('\n5️⃣ PowerShell (Windows):');
  console.log('   [System.Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Maximum 256 }))');
  
  console.log('\n6️⃣ Online Tools (Use with caution):');
  console.log('   • https://generate.plus/en/base64');
  console.log('   • https://www.allkeysgenerator.com/Random/Security-Encryption-Key-Generator.aspx');
  console.log('   ⚠️  Note: Never use online tools for production secrets!');

  console.log('\n7️⃣ Professional Key Management:');
  console.log('   • AWS Secrets Manager');
  console.log('   • Azure Key Vault');
  console.log('   • HashiCorp Vault');
  console.log('   • Kubernetes Secrets');
}

// =============================================
// RUN DEMONSTRATION
// =============================================

if (require.main === module) {
  console.log('🔐 PROFESSIONAL JWT SECRET GENERATION DEMO');
  console.log('='.repeat(80));
  
  // Generate various types of secrets
  console.log('\n📋 GENERATED SECRETS:');
  console.log('Base64 (64 bytes):', ProfessionalJWTGenerator.generateSecureSecret());
  console.log('URL-Safe:', ProfessionalJWTGenerator.generateUrlSafeSecret(32));
  console.log('Hex (32 bytes):', ProfessionalJWTGenerator.generateHexSecret(32));
  console.log('Alphanumeric:', ProfessionalJWTGenerator.generateAlphanumericSecret(32));
  
  // Validate current secret strength
  const currentSecret = "hotel-booking-super-secret-jwt-key-2024-production-grade-minimum-32-chars";
  console.log('\n🔍 CURRENT SECRET ANALYSIS:');
  console.log('Secret:', currentSecret);
  console.log('Analysis:', ProfessionalJWTGenerator.validateSecretStrength(currentSecret));
  
  // Generate complete configuration
  console.log('\n🏭 COMPLETE PRODUCTION CONFIG:');
  ProfessionalJWTGenerator.generateDotEnvFile('.env.generated');
  
  // Show industry commands
  showIndustryCommands();
  
  console.log('\n💡 PROFESSIONAL RECOMMENDATIONS:');
  console.log('✅ Use crypto.randomBytes() for Node.js applications');
  console.log('✅ Minimum 256 bits (32 bytes) entropy for JWT secrets');
  console.log('✅ Different secrets for different environments');
  console.log('✅ Rotate secrets quarterly or after security incidents');
  console.log('✅ Store secrets in secure key management systems');
  console.log('✅ Never commit secrets to version control');
  console.log('✅ Use environment variables for all secrets');
  
  console.log('\n🎯 FOR YOUR CURRENT PROJECT:');
  console.log('Your current secret is ADEQUATE for development');
  console.log('For production, consider using the generated secrets above');
  console.log('Implement auto-refresh tokens to reduce security risks');
}

module.exports = {
  ProfessionalJWTGenerator,
  ProfessionalTokenStrategies
};
