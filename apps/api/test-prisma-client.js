// Simple test to verify Prisma client
const { PrismaClient, PaymentStatus } = require('@prisma/client');

console.log('=== PRISMA CLIENT TEST ===');
console.log('PaymentStatus enum:', Object.values(PaymentStatus));
console.log('PROCESSING available:', PaymentStatus.PROCESSING);

const prisma = new PrismaClient();

console.log('WebhookEvent available:', !!prisma.webhookEvent);
console.log('Payment model available:', !!prisma.payment);

// Test payment creation structure
const paymentCreateData = {
  bookingId: 'test-booking-id',
  amount: 1000,
  currency: 'THB',
  paymentMethodId: 'test-method-id',
  omiseChargeId: 'chrg_test_123',
  omiseToken: 'tokn_test_123',
  paymentMethodType: 'credit_card',
  status: PaymentStatus.PROCESSING,
  gatewayResponse: { test: 'data' }
};

console.log('Payment create data structure:', paymentCreateData);
console.log('Status assigned:', paymentCreateData.status);

console.log('=== TEST COMPLETE ===');
