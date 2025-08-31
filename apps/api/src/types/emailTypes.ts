// ============================================
// EMAIL SYSTEM TYPE DEFINITIONS
// ============================================

export interface EmailData {
  to: string;
  toName: string;
  subject: string;
  type: EmailType;
  templateData: any;
  templateId?: string;
  attachments?: EmailAttachment[];
}

export interface EmailAttachment {
  filename: string;
  content: string | Buffer;
  type: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  blocked?: boolean;
  debug?: boolean;
}

export interface EmailLog {
  id: string;
  bookingId?: string;
  recipientEmail: string;
  emailType: EmailType;
  status: EmailStatus;
  messageId?: string;
  error?: string;
  sentAt?: Date;
  createdAt: Date;
}

export interface EmailQueue {
  id: string;
  bookingId?: string;
  emailType: EmailType;
  recipientEmail: string;
  emailData: any;
  status: EmailQueueStatus;
  retryCount: number;
  maxRetries: number;
  scheduledFor: Date;
  lastAttempt?: Date;
  error?: string;
  createdAt: Date;
}

export enum EmailType {
  BOOKING_CONFIRMATION = 'booking_confirmation',
  PAYMENT_RECEIPT = 'payment_receipt',
  CHECKIN_REMINDER = 'checkin_reminder',
  CHECKOUT_REMINDER = 'checkout_reminder',
  BOOKING_AMENDMENT = 'booking_amendment',
  REFUND_CONFIRMATION = 'refund_confirmation',
  CANCELLATION_CONFIRMATION = 'cancellation_confirmation',
  PASSWORD_RESET = 'password_reset',
  MARKETING = 'marketing',
  NEWSLETTER = 'newsletter',
  SYSTEM_NOTIFICATION = 'system_notification'
}

export enum EmailStatus {
  SENT = 'SENT',
  FAILED = 'FAILED',
  PENDING = 'PENDING',
  RETRYING = 'RETRYING',
  CANCELLED = 'CANCELLED'
}

export enum EmailQueueStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SENT = 'SENT',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  MAX_RETRIES_REACHED = 'MAX_RETRIES_REACHED'
}

export interface EmailTemplate {
  id: string;
  name: string;
  type: EmailType;
  subject: string;
  htmlTemplate: string;
  textTemplate?: string;
  isActive: boolean;
  variables: string[];
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookingEmailData {
  booking: any;
  guest: any;
  roomType: any;
  qrCodeData?: string;
}

export interface PaymentEmailData {
  booking: any;
  payment: any;
  guest: any;
  roomType: any;
}

export interface CheckInReminderData {
  booking: any;
  guest: any;
  roomType: any;
  daysUntilCheckin: number;
  qrCodeData?: string;
}

export interface EmailServiceConfig {
  provider: 'mailersend' | 'sendgrid' | 'ses';
  apiKey: string;
  fromEmail: string;
  fromName: string;
  replyToEmail?: string;
  maxRetries: number;
  retryDelayMinutes: number;
}

export interface TemplateVariable {
  key: string;
  description: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'url';
  required: boolean;
  defaultValue?: any;
}

export interface EmailAnalytics {
  totalSent: number;
  totalFailed: number;
  successRate: number;
  averageDeliveryTime: number;
  topFailureReasons: string[];
  emailTypeBreakdown: Record<EmailType, number>;
  dailyStats: Array<{
    date: string;
    sent: number;
    failed: number;
  }>;
}
