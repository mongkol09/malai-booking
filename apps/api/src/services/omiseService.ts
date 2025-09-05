/**
 * Omise Payment Gateway Service
 * =============================
 * 
 * Service สำหรับจัดการการชำระเงินผ่าน Omise
 * มีความปลอดภัยสูง พร้อม Error Handling และ Retry Logic
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import crypto from 'crypto';
import { omiseConfig, validateOmiseConfig, getOmiseApiUrl, getOmiseHeaders } from '../config/omise';

// Types
export interface OmiseChargeRequest {
  amount: number;
  currency: string;
  card: string; // Omise token
  description?: string;
  metadata?: Record<string, any>;
  return_uri?: string;
  capture?: boolean;
}

export interface OmiseChargeResponse {
  id: string;
  amount: number;
  currency: string;
  status: string;
  paid: boolean;
  paid_at?: string;
  failure_code?: string;
  failure_message?: string;
  card?: {
    brand: string;
    last_digits: string;
    name: string;
  };
  created_at: string;
}

export interface OmiseRefundRequest {
  amount: number;
  metadata?: Record<string, any>;
}

export interface OmiseRefundResponse {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
}

export interface OmiseWebhookPayload {
  id: string;
  type: string;
  data: {
    id: string;
    object: string;
    status: string;
    amount: number;
    currency: string;
    [key: string]: any;
  };
  created_at: string;
}

export class OmiseService {
  private client: AxiosInstance;
  private retryAttempts: number;

  constructor() {
    // Validate configuration
    validateOmiseConfig();
    
    this.retryAttempts = omiseConfig.retryAttempts;
    
    // Create axios instance with security settings
    this.client = axios.create({
      baseURL: getOmiseApiUrl(),
      timeout: omiseConfig.timeout,
      headers: getOmiseHeaders(),
      // Security settings
      maxRedirects: 0,
      validateStatus: (status) => status < 500, // Don't retry on 4xx errors
    });

    // Add request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        console.log(`🔐 [Omise] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('❌ [Omise] Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log(`✅ [Omise] ${response.status} ${response.config.url}`);
        return response;
      },
      async (error) => {
        if (error.response) {
          console.error(`❌ [Omise] ${error.response.status} ${error.config?.url}:`, error.response.data);
        } else if (error.request) {
          console.error('❌ [Omise] Network error:', error.message);
        } else {
          console.error('❌ [Omise] Configuration error:', error.message);
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * สร้าง Charge ใหม่
   */
  async createCharge(chargeRequest: OmiseChargeRequest): Promise<OmiseChargeResponse> {
    try {
      const response = await this.makeRequest(() =>
        this.client.post('/charges', {
          amount: chargeRequest.amount,
          currency: chargeRequest.currency,
          card: chargeRequest.card,
          description: chargeRequest.description || 'Malai Resort Booking Payment',
          metadata: {
            ...chargeRequest.metadata,
            source: 'malai_resort_api',
            timestamp: new Date().toISOString()
          },
          return_uri: chargeRequest.return_uri,
          capture: chargeRequest.capture !== false // Default to true
        })
      );

      return response.data;
    } catch (error) {
      console.error('❌ [Omise] Failed to create charge:', error);
      throw new Error(`Payment charge creation failed: ${this.getErrorMessage(error)}`);
    }
  }

  /**
   * ดึงข้อมูล Charge
   */
  async getCharge(chargeId: string): Promise<OmiseChargeResponse> {
    try {
      const response = await this.makeRequest(() =>
        this.client.get(`/charges/${chargeId}`)
      );

      return response.data;
    } catch (error) {
      console.error(`❌ [Omise] Failed to get charge ${chargeId}:`, error);
      throw new Error(`Failed to retrieve charge: ${this.getErrorMessage(error)}`);
    }
  }

  /**
   * สร้าง Refund
   */
  async createRefund(chargeId: string, refundRequest: OmiseRefundRequest): Promise<OmiseRefundResponse> {
    try {
      const response = await this.makeRequest(() =>
        this.client.post(`/charges/${chargeId}/refunds`, {
          amount: refundRequest.amount,
          metadata: {
            ...refundRequest.metadata,
            source: 'malai_resort_api',
            refund_reason: 'guest_cancellation',
            timestamp: new Date().toISOString()
          }
        })
      );

      return response.data;
    } catch (error) {
      console.error(`❌ [Omise] Failed to create refund for charge ${chargeId}:`, error);
      throw new Error(`Refund creation failed: ${this.getErrorMessage(error)}`);
    }
  }

  /**
   * ตรวจสอบ Webhook Signature
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    try {
      if (!signature) {
        console.warn('⚠️ [Omise] No webhook signature provided');
        return false;
      }

      const expectedSignature = crypto
        .createHmac('sha256', omiseConfig.webhookSecret)
        .update(payload, 'utf8')
        .digest('hex');

      const isValid = crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      );

      if (!isValid) {
        console.warn('⚠️ [Omise] Invalid webhook signature');
      }

      return isValid;
    } catch (error) {
      console.error('❌ [Omise] Webhook signature verification error:', error);
      return false;
    }
  }

  /**
   * แปลง Omise Status เป็น Payment Status ของเรา
   */
  mapChargeStatusToPaymentStatus(omiseStatus: string): string {
    switch (omiseStatus) {
      case 'successful':
      case 'paid':
        return 'COMPLETED';
      case 'failed':
        return 'FAILED';
      case 'pending':
        return 'PENDING';
      case 'expired':
        return 'EXPIRED';
      case 'reversed':
        return 'REVERSED';
      default:
        return 'PENDING';
    }
  }

  /**
   * ตรวจสอบว่าเป็น Payment Webhook หรือไม่
   */
  isPaymentWebhook(webhookType: string): boolean {
    const paymentTypes = [
      'charge.create',
      'charge.complete',
      'charge.failed',
      'charge.expired',
      'refund.create',
      'refund.complete'
    ];
    return paymentTypes.includes(webhookType);
  }

  /**
   * แปลง Webhook Payload
   */
  parseWebhookPayload(rawPayload: string): OmiseWebhookPayload {
    try {
      return JSON.parse(rawPayload);
    } catch (error) {
      console.error('❌ [Omise] Failed to parse webhook payload:', error);
      throw new Error('Invalid webhook payload format');
    }
  }

  /**
   * สร้าง Payment Link สำหรับ Guest
   */
  async createPaymentLink(chargeRequest: OmiseChargeRequest): Promise<string> {
    try {
      const response = await this.makeRequest(() =>
        this.client.post('/charges', {
          ...chargeRequest,
          capture: false, // Don't capture immediately
          return_uri: chargeRequest.return_uri || `${process.env.FRONTEND_URL}/payment/complete`
        })
      );

      // Return the charge ID for frontend to handle
      return response.data.id;
    } catch (error) {
      console.error('❌ [Omise] Failed to create payment link:', error);
      throw new Error(`Payment link creation failed: ${this.getErrorMessage(error)}`);
    }
  }

  /**
   * ยืนยันการชำระเงิน (Capture)
   */
  async captureCharge(chargeId: string): Promise<OmiseChargeResponse> {
    try {
      const response = await this.makeRequest(() =>
        this.client.post(`/charges/${chargeId}/capture`)
      );

      return response.data;
    } catch (error) {
      console.error(`❌ [Omise] Failed to capture charge ${chargeId}:`, error);
      throw new Error(`Charge capture failed: ${this.getErrorMessage(error)}`);
    }
  }

  /**
   * ยกเลิกการชำระเงิน
   */
  async voidCharge(chargeId: string): Promise<OmiseChargeResponse> {
    try {
      const response = await this.makeRequest(() =>
        this.client.post(`/charges/${chargeId}/void`)
      );

      return response.data;
    } catch (error) {
      console.error(`❌ [Omise] Failed to void charge ${chargeId}:`, error);
      throw new Error(`Charge void failed: ${this.getErrorMessage(error)}`);
    }
  }

  /**
   * Private method สำหรับ Retry Logic
   */
  private async makeRequest<T>(requestFn: () => Promise<AxiosResponse<T>>): Promise<AxiosResponse<T>> {
    let lastError: any;

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        return await requestFn();
      } catch (error: any) {
        lastError = error;
        
        // Don't retry on client errors (4xx)
        if (error.response && error.response.status >= 400 && error.response.status < 500) {
          throw error;
        }

        // Don't retry on validation errors
        if (error.response?.data?.error_code === 'validation_failed') {
          throw error;
        }

        if (attempt < this.retryAttempts) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          console.log(`🔄 [Omise] Retry attempt ${attempt}/${this.retryAttempts} in ${delay}ms`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }

  /**
   * แปลง Error Message
   */
  private getErrorMessage(error: any): string {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.response?.data?.error_description) {
      return error.response.data.error_description;
    }
    if (error.message) {
      return error.message;
    }
    return 'Unknown error occurred';
  }
}

// Export singleton instance
export const omiseService = new OmiseService();
