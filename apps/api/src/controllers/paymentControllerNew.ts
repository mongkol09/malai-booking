// ============================================
// PAYMENT CONTROLLER - UPDATED VERSION
// ============================================
// Uses updated Prisma schema with correct fields

import { Request, Response } from 'express';
import { PrismaClient, PaymentStatus, BookingStatus } from '@prisma/client';
import { omiseService, OmiseChargeRequest } from '../services/omiseService';
import { z } from 'zod';

const prisma = new PrismaClient();

// ============================================
// VALIDATION SCHEMAS
// ============================================

const createChargeSchema = z.object({
  bookingId: z.string().uuid(),
  omiseToken: z.string().min(1)
});

// ============================================
// PHASE 1: CREATE CHARGE WITH OMISE
// ============================================

/**
 * POST /api/bookings/charge
 * สร้าง Charge กับ Omise (ตาม payment_confirm Step 4)
 */
export const createCharge = async (req: Request, res: Response) => {
  try {
    const { bookingId, omiseToken } = createChargeSchema.parse(req.body);

    // 1. Get booking details
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        guest: true,
        room: { include: { roomType: true } },
        payments: true
      }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // 2. Check if payment already exists
    const existingPayment = booking.payments.find(p => 
      p.status === PaymentStatus.COMPLETED || p.status === PaymentStatus.PROCESSING
    );

    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: 'Payment already exists for this booking',
        data: {
          paymentId: existingPayment.id,
          status: existingPayment.status,
          omiseChargeId: existingPayment.omiseChargeId
        }
      });
    }

    // 3. Create Omise charge
    const chargeRequest: OmiseChargeRequest = {
      amount: omiseService.formatAmount(Number(booking.finalAmount)),
      currency: 'THB',
      card: omiseToken,
      description: `Hotel Booking ${booking.bookingReferenceId}`,
      metadata: {
        booking_id: booking.id,
        booking_reference: booking.bookingReferenceId,
        guest_email: booking.guest.email
      }
    };

    const omiseCharge = await omiseService.createCharge(chargeRequest);

    // 4. Create payment record using updated schema
    const payment = await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: Number(booking.finalAmount),
        currency: 'THB',
        paymentMethodId: '4ec67f42-a259-4ba7-a2fa-9e7c2ff593e3', // Default credit card
        omiseChargeId: omiseCharge.id,
        omiseToken: omiseToken,
        paymentMethodType: omiseCharge.card?.brand || 'credit_card',
        status: PaymentStatus.PROCESSING,
        gatewayResponse: omiseCharge as any
      }
    });

    return res.json({
      success: true,
      message: 'Payment charge created successfully',
      data: {
        paymentId: payment.id,
        omiseChargeId: omiseCharge.id,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        message: 'Payment is being processed. You will receive confirmation once completed.'
      }
    });

  } catch (error) {
    console.error('Create charge error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process payment',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// ============================================
// PHASE 2: WEBHOOK HANDLER
// ============================================

/**
 * POST /webhooks/omise
 * รับ webhook จาก Omise และอัพเดท payment status
 */
export const handleOmiseWebhook = async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    
    if (!payload.data || !payload.data.id || !payload.type) {
      return res.status(400).json({
        success: false,
        message: 'Invalid webhook payload'
      });
    }

    // Process only charge.complete events
    if (payload.type !== 'charge.complete') {
      return res.json({ 
        success: true, 
        message: 'Event ignored - not charge.complete' 
      });
    }

    const chargeId = payload.data.id;
    const chargeStatus = payload.data.status;

    // Store webhook event for audit
    const existingEvent = await prisma.webhookEvent.findUnique({
      where: { eventId: payload.id }
    });

    if (existingEvent) {
      console.log('Webhook event already processed:', payload.id);
      return res.json({ success: true, message: 'Event already processed' });
    }

    const webhookEvent = await prisma.webhookEvent.create({
      data: {
        eventId: payload.id,
        eventType: payload.type,
        objectType: payload.data.object,
        objectId: payload.data.id,
        payload: payload as any,
        processed: false
      }
    });

    // Find payment by Omise charge ID
    const payment = await prisma.payment.findFirst({
      where: { omiseChargeId: chargeId },
      include: { booking: true }
    });

    if (!payment) {
      await prisma.webhookEvent.update({
        where: { id: webhookEvent.id },
        data: { 
          processed: false,
          processingError: `Payment not found for charge ID: ${chargeId}`
        }
      });
      
      console.error(`Payment not found for charge ID: ${chargeId}`);
      return res.status(404).json({
        success: false,
        message: 'Payment record not found'
      });
    }

    // Map Omise status to our payment status
    let newPaymentStatus: PaymentStatus;
    switch (chargeStatus.toLowerCase()) {
      case 'successful':
        newPaymentStatus = PaymentStatus.COMPLETED;
        break;
      case 'failed':
      case 'expired':
        newPaymentStatus = PaymentStatus.FAILED;
        break;
      default:
        newPaymentStatus = PaymentStatus.PROCESSING;
    }

    // Update payment and webhook event in transaction
    await prisma.$transaction(async (tx) => {
      // Update payment
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: newPaymentStatus,
          processedAt: new Date(),
          gatewayResponse: payload.data as any,
          failureMessage: chargeStatus === 'failed' ? 'Payment failed' : null
        }
      });

      // Mark webhook as processed
      await tx.webhookEvent.update({
        where: { id: webhookEvent.id },
        data: { 
          processed: true,
          processedAt: new Date()
        }
      });
    });

    console.log(`✅ Payment updated: ${payment.id}`);
    console.log(`   Status: ${payment.status} → ${newPaymentStatus}`);
    console.log(`   Booking: ${payment.booking.bookingReferenceId}`);

    return res.json({
      success: true,
      message: 'Webhook processed successfully'
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    
    // Mark failed events for retry
    try {
      await prisma.webhookEvent.updateMany({
        where: { processed: false },
        data: { 
          processingError: error instanceof Error ? error.message : 'Unknown error',
          retryCount: { increment: 1 }
        }
      });
    } catch (updateError) {
      console.error('Failed to update webhook error:', updateError);
    }

    return res.status(500).json({
      success: false,
      message: 'Webhook processing failed'
    });
  }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * GET /api/payments/:id
 * ดูรายละเอียด payment
 */
export const getPayment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Payment ID is required'
      });
    }

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            guest: true,
            room: { include: { roomType: true } }
          }
        }
      }
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    return res.json({
      success: true,
      data: {
        payment: {
          id: payment.id,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          paymentMethodType: payment.paymentMethodType,
          omiseChargeId: payment.omiseChargeId,
          processedAt: payment.processedAt,
          createdAt: payment.createdAt,
          booking: {
            id: payment.booking.id,
            bookingReferenceId: payment.booking.bookingReferenceId,
            guestName: `${payment.booking.guest.firstName} ${payment.booking.guest.lastName}`,
            roomNumber: payment.booking.room?.roomNumber,
            roomType: payment.booking.room?.roomType?.name
          }
        }
      }
    });

  } catch (error) {
    console.error('Get payment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve payment'
    });
  }
};
