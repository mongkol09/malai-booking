import { Request } from 'express';

// 🔗 Extend Express Request type for webhook handling
declare global {
  namespace Express {
    interface Request {
      webhookId?: string;
      webhookEvent?: any;
      processingStartTime?: number;
    }
  }
}

// 🎯 Webhook Event Types
export interface WebhookEventData {
  webhookId: string;
  eventType: string;
  payload: any;
  status: 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'RETRY';
  receivedAt: Date;
  processedAt?: Date;
  responseCode?: number;
  responseBody?: any;
  processingTimeMs?: number;
  retryCount?: number;
  errorMessage?: string;
}

// 💳 Omise Webhook Event Types
export interface OmiseWebhookEvent {
  id: string;
  key: string;
  created: string;
  data: {
    id: string;
    amount: number;
    currency: string;
    status: string;
    authorized: boolean;
    captured: boolean;
    transaction?: string;
    metadata?: Record<string, any>;
  };
}

// 🔐 Webhook Security Config
export interface WebhookSecurityConfig {
  secret: string;
  ipWhitelist: string[];
  verifyIp: boolean;
  timestampTolerance: number; // minutes
  maxRetries: number;
}

// 📊 Webhook Stats
export interface WebhookStats {
  totalEvents: number;
  successCount: number;
  failureCount: number;
  retryCount: number;
  averageProcessingTime: number;
  lastEventAt?: Date;
}
