/**
 * Omise Payment Gateway Configuration
 * ===================================
 * 
 * การตั้งค่าที่ปลอดภัยสำหรับ Omise Payment Gateway
 * รองรับทั้ง Test และ Production Environment
 */

export interface OmiseConfig {
  publicKey: string;
  secretKey: string;
  webhookSecret: string;
  environment: 'test' | 'live';
  currency: string;
  timeout: number;
  retryAttempts: number;
}

export const omiseConfig: OmiseConfig = {
  publicKey: process.env.OMISE_PUBLIC_KEY || '',
  secretKey: process.env.OMISE_SECRET_KEY || '',
  webhookSecret: process.env.OMISE_WEBHOOK_SECRET || '',
  environment: (process.env.OMISE_ENVIRONMENT as 'test' | 'live') || 'test',
  currency: process.env.PAYMENT_CURRENCY || 'THB',
  timeout: parseInt(process.env.OMISE_TIMEOUT || '30000'),
  retryAttempts: parseInt(process.env.OMISE_RETRY_ATTEMPTS || '3')
};

// Validation
export const validateOmiseConfig = (): void => {
  const requiredFields = ['publicKey', 'secretKey', 'webhookSecret'];
  
  for (const field of requiredFields) {
    if (!omiseConfig[field as keyof OmiseConfig]) {
      throw new Error(`Missing required Omise configuration: ${field}`);
    }
  }
  
  if (!omiseConfig.publicKey.startsWith('pk_')) {
    throw new Error('Invalid Omise public key format');
  }
  
  if (!omiseConfig.secretKey.startsWith('sk_')) {
    throw new Error('Invalid Omise secret key format');
  }
  
  if (!omiseConfig.webhookSecret.startsWith('whsec_')) {
    throw new Error('Invalid Omise webhook secret format');
  }
};

// Environment-specific URLs
export const getOmiseApiUrl = (): string => {
  return omiseConfig.environment === 'live' 
    ? 'https://api.omise.co' 
    : 'https://vault.omise.co';
};

// Security headers
export const getOmiseHeaders = (): Record<string, string> => {
  return {
    'Authorization': `Basic ${Buffer.from(omiseConfig.secretKey + ':').toString('base64')}`,
    'Content-Type': 'application/json',
    'User-Agent': 'Malai-Resort-API/1.0.0',
    'X-API-Version': '2019-05-29'
  };
};
