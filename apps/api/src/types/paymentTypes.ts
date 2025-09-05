/**
 * Payment Types and Interfaces
 * ===========================
 * 
 * Type definitions สำหรับระบบการชำระเงิน
 * รองรับ Omise Payment Gateway
 */

import { z } from 'zod';

// ============================================
// ENUMS
// ============================================

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED',
  REVERSED = 'REVERSED',
  CANCELLED = 'CANCELLED'
}

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  INTERNET_BANKING = 'internet_banking',
  PROMPTPAY = 'promptpay',
  TRUE_MONEY = 'true_money',
  RABBIT_LINE_PAY = 'rabbit_line_pay',
  GRABPAY = 'grabpay',
  CASH = 'cash'
}

export enum RefundStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export enum RefundMethod {
  ORIGINAL_PAYMENT = 'original_payment',
  CREDIT_NOTE = 'credit_note',
  BANK_TRANSFER = 'bank_transfer',
  CASH = 'cash'
}

// ============================================
// INTERFACES
// ============================================

export interface PaymentRequest {
  bookingId: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  omiseToken?: string; // For card payments
  returnUrl?: string;
  metadata?: Record<string, any>;
}

export interface PaymentResponse {
  success: boolean;
  message: string;
  data: {
    paymentId: string;
    omiseChargeId?: string;
    status: PaymentStatus;
    amount: number;
    currency: string;
    paymentUrl?: string; // For redirect-based payments
    redirectUrl?: string;
  };
}

export interface RefundRequest {
  paymentId: string;
  amount: number;
  reason: string;
  method: RefundMethod;
  metadata?: Record<string, any>;
}

export interface RefundResponse {
  success: boolean;
  message: string;
  data: {
    refundId: string;
    amount: number;
    status: RefundStatus;
    method: RefundMethod;
    reason: string;
    processedAt?: Date;
  };
}

export interface PaymentWebhook {
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

// ============================================
// ZOD SCHEMAS FOR VALIDATION
// ============================================

export const PaymentRequestSchema = z.object({
  bookingId: z.string().uuid('Invalid booking ID format'),
  amount: z.number().positive('Amount must be positive').max(1000000, 'Amount too high'),
  currency: z.string().length(3, 'Currency must be 3 characters').default('THB'),
  paymentMethod: z.nativeEnum(PaymentMethod, { message: 'Invalid payment method' }),
  omiseToken: z.string().optional(),
  returnUrl: z.string().url('Invalid return URL').optional(),
  metadata: z.record(z.any()).optional()
});

export const RefundRequestSchema = z.object({
  paymentId: z.string().uuid('Invalid payment ID format'),
  amount: z.number().positive('Amount must be positive'),
  reason: z.string().min(1, 'Refund reason is required').max(500, 'Reason too long'),
  method: z.nativeEnum(RefundMethod, { message: 'Invalid refund method' }),
  metadata: z.record(z.any()).optional()
});

export const PaymentWebhookSchema = z.object({
  id: z.string(),
  type: z.string(),
  data: z.object({
    id: z.string(),
    object: z.string(),
    status: z.string(),
    amount: z.number(),
    currency: z.string()
  }).passthrough(),
  created_at: z.string()
});

// ============================================
// UTILITY TYPES
// ============================================

export type PaymentRequestInput = z.infer<typeof PaymentRequestSchema>;
export type RefundRequestInput = z.infer<typeof RefundRequestSchema>;
export type PaymentWebhookInput = z.infer<typeof PaymentWebhookSchema>;

// ============================================
// PAYMENT GATEWAY RESPONSES
// ============================================

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

export interface OmiseRefundResponse {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
}

// ============================================
// PAYMENT FLOW TYPES
// ============================================

export interface PaymentFlow {
  id: string;
  bookingId: string;
  status: 'INITIATED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  steps: PaymentStep[];
  currentStep: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentStep {
  id: string;
  name: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  data?: Record<string, any>;
  error?: string;
  completedAt?: Date;
}

// ============================================
// SECURITY TYPES
// ============================================

export interface PaymentSecurity {
  signature: string;
  timestamp: string;
  nonce: string;
  ipAddress: string;
  userAgent: string;
}

export interface PaymentAudit {
  id: string;
  paymentId: string;
  action: string;
  userId?: string;
  ipAddress: string;
  userAgent: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  timestamp: Date;
}
