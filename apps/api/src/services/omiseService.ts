// ============================================
// OMISE PAYMENT SERVICE
// ============================================
// Enterprise-grade Omise integration following payment_confirm requirements

import crypto from 'crypto';

interface OmiseChargeRequest {
  amount: number;        // Amount in smallest currency unit (satang for THB)
  currency: string;      // 'THB'
  card?: string;         // Token from Omise.js
  description: string;   // Booking description
  metadata?: {           // Additional data for tracking
    booking_id: string;
    guest_email: string;
    [key: string]: any;
  };
}

interface OmiseChargeResponse {
  id: string;           // chrg_xxxxx
  object: string;       // 'charge'
  status: string;       // 'pending', 'successful', 'failed'
  amount: number;
  currency: string;
  description: string;
  card?: {
    id: string;
    brand: string;
    last_digits: string;
    [key: string]: any;
  };
  metadata: Record<string, any>;
  created_at: string;
  [key: string]: any;
}

interface WebhookPayload {
  id: string;           // evt_xxxxx
  object: string;       // 'event'
  created_at: string;
  data: {
    id: string;         // chrg_xxxxx
    object: string;     // 'charge'
    status: string;     // 'successful', 'failed'
    amount: number;
    currency: string;
    [key: string]: any;
  };
  type: string;         // 'charge.complete'
}

class OmiseService {
  private secretKey: string;
  private publicKey: string;
  private webhookSecret: string;
  private baseUrl: string;

  constructor() {
    this.secretKey = process.env.OMISE_SECRET_KEY || '';
    this.publicKey = process.env.OMISE_PUBLIC_KEY || '';
    this.webhookSecret = process.env.OMISE_WEBHOOK_SECRET || '';
    this.baseUrl = process.env.OMISE_API_URL || 'https://api.omise.co';
    
    if (!this.secretKey || !this.publicKey) {
      throw new Error('Omise API keys are required');
    }
  }

  /**
   * Create a charge with Omise
   * This is called when booking is created with payment info
   */
  async createCharge(chargeData: OmiseChargeRequest): Promise<OmiseChargeResponse> {
    try {
      const url = `${this.baseUrl}/charges`;
      const auth = Buffer.from(`${this.secretKey}:`).toString('base64');

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chargeData),
      });

      if (!response.ok) {
        const errorData = await response.json() as { message?: string };
        throw new Error(`Omise API Error: ${errorData.message || response.statusText}`);
      }

      const result = await response.json();
      return result as OmiseChargeResponse;

    } catch (error) {
      console.error('Omise createCharge error:', error);
      throw error;
    }
  }

  /**
   * Retrieve charge details from Omise
   * Used for manual verification or troubleshooting
   */
  async getCharge(chargeId: string): Promise<OmiseChargeResponse> {
    try {
      const url = `${this.baseUrl}/charges/${chargeId}`;
      const auth = Buffer.from(`${this.secretKey}:`).toString('base64');

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to retrieve charge: ${response.statusText}`);
      }

      const result = await response.json();
      return result as OmiseChargeResponse;

    } catch (error) {
      console.error('Omise getCharge error:', error);
      throw error;
    }
  }

  /**
   * Verify webhook signature
   * Critical security check - ensures webhook is from Omise
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    try {
      if (!this.webhookSecret) {
        console.warn('Webhook secret not configured - skipping verification');
        return true; // Allow in development, but log warning
      }

      const expectedSignature = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(payload)
        .digest('hex');

      // Omise sends signature as "sha256=xxxxx"
      const receivedSignature = signature.replace('sha256=', '');
      
      return crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'hex'),
        Buffer.from(receivedSignature, 'hex')
      );

    } catch (error) {
      console.error('Webhook signature verification error:', error);
      return false;
    }
  }

  /**
   * Parse and validate webhook payload
   */
  parseWebhookPayload(rawPayload: string): WebhookPayload {
    try {
      const payload = JSON.parse(rawPayload) as WebhookPayload;
      
      // Basic validation
      if (!payload.id || !payload.data || !payload.type) {
        throw new Error('Invalid webhook payload structure');
      }

      return payload;

    } catch (error) {
      console.error('Webhook payload parsing error:', error);
      throw new Error('Invalid webhook payload');
    }
  }

  /**
   * Check if webhook event is relevant for payment confirmation
   */
  isPaymentWebhook(eventType: string): boolean {
    const paymentEvents = [
      'charge.complete',
      'charge.create',
      'charge.update'
    ];
    
    return paymentEvents.includes(eventType);
  }

  /**
   * Extract payment status from Omise charge status
   */
  mapChargeStatusToPaymentStatus(omiseStatus: string): 'PROCESSING' | 'COMPLETED' | 'FAILED' {
    switch (omiseStatus.toLowerCase()) {
      case 'successful':
        return 'COMPLETED';
      case 'failed':
      case 'expired':
        return 'FAILED';
      case 'pending':
      case 'processing':
      default:
        return 'PROCESSING';
    }
  }

  /**
   * Format amount for Omise (convert to smallest unit)
   */
  formatAmount(amount: number, currency: string = 'THB'): number {
    // THB uses satang (1 THB = 100 satang)
    if (currency.toUpperCase() === 'THB') {
      return Math.round(amount * 100);
    }
    
    // Default to 2 decimal places for other currencies
    return Math.round(amount * 100);
  }

  /**
   * Format amount from Omise (convert from smallest unit)
   */
  parseAmount(omiseAmount: number, currency: string = 'THB'): number {
    if (currency.toUpperCase() === 'THB') {
      return omiseAmount / 100;
    }
    
    return omiseAmount / 100;
  }
}

// Singleton instance
export const omiseService = new OmiseService();

// Type exports
export type {
  OmiseChargeRequest,
  OmiseChargeResponse,
  WebhookPayload
};
