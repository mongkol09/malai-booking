// ============================================
// PAYMENT CONTROLLER - ENTERPRISE GRADE
// ============================================
// Implements payment_confirm flow with Omise integration

import { Request, Response } from 'express';
import { PrismaClient, BookingStatus } from '@prisma/client';
import type { PaymentStatus } from '@prisma/client';
import { omiseService, OmiseChargeRequest } from '../services/omiseService';
import { z } from 'zod';

const prisma = new PrismaClient();

// ============================================
// VALIDATION SCHEMAS
// ============================================

const createChargeSchema = z.object({
  bookingId: z.string().uuid(),
  omiseToken: z.string().min(1),
  customerEmail: z.string().email().optional()
});

const webhookSchema = z.object({
  id: z.string(),
  type: z.string(),
  data: z.object({
    id: z.string(),
    status: z.string(),
    amount: z.number(),
    currency: z.string().optional()
  }).passthrough()
}).passthrough();

// ============================================
// PHASE 1: CREATE CHARGE WITH OMISE
// ============================================

/**
 * Step 4 from payment_confirm flow:
 * Backend สร้าง Charge กับ Omise
 * 
 * POST /api/v1/bookings/charge
 * Body: { bookingId, omiseToken }
 */
export const createCharge = async (req: Request, res: Response) => {
  try {
    const { bookingId, omiseToken, customerEmail } = createChargeSchema.parse(req.body);

    // 1. Get booking details
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        guest: true,
        room: {
          include: { roomType: true }
        },
        payments: true
      }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // 2. Validate booking can be charged
    if (booking.status !== 'Confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Booking must be confirmed to process payment'
      });
    }

    // 3. Check if payment already exists and is processed
    const existingPayment = booking.payments.find(p => 
      p.status === 'COMPLETED' || p.status === 'PROCESSING'
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

    // 4. Prepare Omise charge request
    const chargeRequest: OmiseChargeRequest = {
      amount: omiseService.formatAmount(Number(booking.finalAmount)),
      currency: 'THB',
      card: omiseToken,
      description: `Hotel Booking ${booking.bookingReferenceId} - ${booking.room?.roomType?.name}`,
      metadata: {
        booking_id: booking.id,
        booking_reference: booking.bookingReferenceId,
        guest_email: booking.guest.email,
        room_number: booking.room?.roomNumber || '',
        checkin_date: booking.checkinDate.toISOString(),
        checkout_date: booking.checkoutDate.toISOString()
      }
    };

    // 5. Create charge with Omise
    const omiseCharge = await omiseService.createCharge(chargeRequest);

    // 6. Create payment record in our database (CRITICAL: status is PROCESSING)
    const payment = await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: Number(booking.finalAmount),
        currency: 'THB',
        omiseChargeId: omiseCharge.id,
        omiseToken: omiseToken,
        paymentMethodType: omiseCharge.card?.brand || 'credit_card',
        status: 'PROCESSING' as PaymentStatus, // NOT COMPLETED!
        gatewayResponse: omiseCharge as any,
        createdAt: new Date()
      }
    });

    // 7. Update booking status to indicate payment is being processed
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: 'Confirmed' as BookingStatus // Keep as confirmed, but payment is processing
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
        currency: 'THB',
        // Don't expose sensitive data
        message: 'Payment is being processed. You will receive confirmation once completed.'
      }
    });

  } catch (error) {
    console.error('Create charge error:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: error.errors
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to process payment',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// ============================================
// PHASE 2: WEBHOOK HANDLER (THE HEART OF THE SYSTEM)
// ============================================

/**
 * Step 6-7 from payment_confirm flow:
 * Backend รับและตรวจสอบ Webhook จาก Omise
 * 
 * POST /webhooks/omise
 * This is the SINGLE SOURCE OF TRUTH for payment confirmation
 */
export const handleOmiseWebhook = async (req: Request, res: Response) => {
  try {
    const rawPayload = JSON.stringify(req.body);
    const signature = req.headers['x-omise-signature'] as string;

    // 1. SECURITY: Verify webhook signature
    if (!omiseService.verifyWebhookSignature(rawPayload, signature || '')) {
      console.error('Invalid webhook signature');
      return res.status(400).json({
        success: false,
        message: 'Invalid signature'
      });
    }

    // 2. Parse webhook payload
    const webhookPayload = omiseService.parseWebhookPayload(rawPayload);
    const parsedPayload = webhookSchema.parse(webhookPayload);

    // 3. IDEMPOTENCY: Check if we've already processed this event
    const existingEvent = await prisma.webhookEvent.findUnique({
      where: { eventId: parsedPayload.id }
    });

    if (existingEvent && existingEvent.processed) {
      console.log(`Webhook ${parsedPayload.id} already processed`);
      return res.json({ success: true, message: 'Event already processed' });
    }

    // 4. Store webhook event for audit trail
    const webhookEvent = await prisma.webhookEvent.create({
      data: {
        eventId: parsedPayload.id,
        eventType: parsedPayload.type,
        objectType: parsedPayload.data.object || 'charge',
        objectId: parsedPayload.data.id,
        payload: parsedPayload as any,
        signature: signature,
        processed: false,
        receivedAt: new Date()
      }
    });

    // 5. Process only payment-related webhooks
    if (!omiseService.isPaymentWebhook(parsedPayload.type)) {
      console.log(`Ignoring non-payment webhook: ${parsedPayload.type}`);
      return res.json({ success: true, message: 'Non-payment event ignored' });
    }

    // 6. Find payment record by Omise charge ID
    const payment = await prisma.payment.findFirst({
      where: { omiseChargeId: parsedPayload.data.id },
      include: {
        booking: {
          include: {
            guest: true,
            room: {
              include: { roomType: true }
            }
          }
        }
      }
    });

    if (!payment) {
      console.error(`Payment not found for charge ID: ${parsedPayload.data.id}`);
      
      await prisma.webhookEvent.update({
        where: { id: webhookEvent.id },
        data: {
          processed: true,
          processedAt: new Date(),
          processingError: 'Payment record not found'
        }
      });

      return res.status(404).json({
        success: false,
        message: 'Payment record not found'
      });
    }

    // 7. THE CORE LOGIC: Update payment status based on Omise webhook
    const newPaymentStatus = omiseService.mapChargeStatusToPaymentStatus(parsedPayload.data.status);
    
    await prisma.$transaction(async (tx) => {
      // Update payment status
      const updatedPayment = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: newPaymentStatus,
          gatewayResponse: parsedPayload.data as any,
          failureMessage: parsedPayload.data.status === 'failed' 
            ? 'Payment failed as reported by Omise' 
            : null,
          processedAt: new Date(),
          updatedAt: new Date()
        }
      });

      // Update booking status based on payment result
      if (newPaymentStatus === 'COMPLETED') {
        // ✅ PAYMENT SUCCESSFUL
        await tx.booking.update({
          where: { id: payment.bookingId },
          data: {
            status: 'Confirmed' as BookingStatus
          }
        });

        // TODO: Trigger success actions:
        // - Send booking confirmation email
        // - Create folio record
        // - Notify admin dashboard
        // - Update room inventory
        
      } else if (newPaymentStatus === 'FAILED') {
        // ❌ PAYMENT FAILED
        await tx.booking.update({
          where: { id: payment.bookingId },
          data: {
            status: 'Confirmed' as BookingStatus // Keep booking, but payment failed
          }
        });

        // TODO: Trigger failure actions:
        // - Send payment failure email
        // - Notify admin for manual follow-up
        // - Create retry payment link
      }

      // Mark webhook as processed
      await tx.webhookEvent.update({
        where: { id: webhookEvent.id },
        data: {
          processed: true,
          processedAt: new Date()
        }
      });
    });

    console.log(`✅ Webhook processed successfully: ${parsedPayload.id}`);
    console.log(`   Charge: ${parsedPayload.data.id}`);
    console.log(`   Status: ${parsedPayload.data.status} → ${newPaymentStatus}`);
    console.log(`   Booking: ${payment.booking.bookingReferenceId}`);

    return res.json({
      success: true,
      message: 'Webhook processed successfully'
    });

  } catch (error) {
    console.error('Webhook processing error:', error);

    // Try to update webhook event with error
    try {
      if (req.body?.id) {
        await prisma.webhookEvent.updateMany({
          where: { eventId: req.body.id },
          data: {
            processingError: error instanceof Error ? error.message : 'Unknown error',
            retryCount: { increment: 1 }
          }
        });
      }
    } catch (updateError) {
      console.error('Failed to update webhook event error:', updateError);
    }

    return res.status(500).json({
      success: false,
      message: 'Webhook processing failed'
    });
  }
};

// ============================================
// UTILITY & ADMIN FUNCTIONS
// ============================================

/**
 * Get payment details for admin/customer
 */
export const getPayment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            guest: true,
            room: {
              include: { roomType: true }
            }
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
          paymentMethod: payment.paymentMethod,
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

/**
 * Get webhook events for admin monitoring
 */
export const getWebhookEvents = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, processed } = req.query;

    const where: any = {};
    if (processed !== undefined) {
      where.processed = processed === 'true';
    }

    const events = await prisma.webhookEvent.findMany({
      where,
      orderBy: { receivedAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    });

    const total = await prisma.webhookEvent.count({ where });

    return res.json({
      success: true,
      data: {
        events,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get webhook events error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve webhook events'
    });
  }
};

/**
 * Manual payment verification - compare with Omise
 */
export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const payment = await prisma.payment.findUnique({
      where: { id }
    });

    if (!payment || !payment.omiseChargeId) {
      return res.status(404).json({
        success: false,
        message: 'Payment or Omise charge ID not found'
      });
    }

    // Get latest status from Omise
    const omiseCharge = await omiseService.getCharge(payment.omiseChargeId);
    const latestStatus = omiseService.mapChargeStatusToPaymentStatus(omiseCharge.status);

    const isSync = payment.status === latestStatus;

    return res.json({
      success: true,
      data: {
        payment: {
          id: payment.id,
          ourStatus: payment.status,
          omiseStatus: omiseCharge.status,
          mappedStatus: latestStatus,
          isSync,
          omiseChargeId: payment.omiseChargeId,
          omiseAmount: omiseService.parseAmount(omiseCharge.amount),
          ourAmount: Number(payment.amount)
        }
      }
    });

  } catch (error) {
    console.error('Verify payment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify payment'
    });
  }
};
