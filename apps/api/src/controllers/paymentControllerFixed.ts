// ============================================
// PAYMENT CONTROLLER - FIXED VERSION
// ============================================
// Works with current Prisma schema

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
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
      p.status === 'COMPLETED' || p.status === 'PENDING'
    );

    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: 'Payment already exists for this booking'
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

    // 4. Create payment record ใช้ field ที่มีจริงในฐานข้อมูล
    const payment = await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: Number(booking.finalAmount),
        paymentMethodId: '4ec67f42-a259-4ba7-a2fa-9e7c2ff593e3', // Default credit card
        transactionToken: omiseCharge.id, // ใช้ transactionToken เก็บ omiseChargeId
        status: 'PENDING', // ใช้ PENDING แทน PROCESSING ก่อน
        // เก็บ Omise response ใน notes หรือ field อื่น
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
        currency: 'THB'
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
// PHASE 2: WEBHOOK HANDLER (SIMPLIFIED)
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

    // Find payment by transaction token (ที่เก็บ omiseChargeId)
    const payment = await prisma.payment.findFirst({
      where: { transactionToken: chargeId },
      include: { booking: true }
    });

    if (!payment) {
      console.error(`Payment not found for charge ID: ${chargeId}`);
      return res.status(404).json({
        success: false,
        message: 'Payment record not found'
      });
    }

    // Map Omise status to our payment status
    let newStatus: 'PENDING' | 'COMPLETED' | 'FAILED';
    switch (chargeStatus.toLowerCase()) {
      case 'successful':
        newStatus = 'COMPLETED';
        break;
      case 'failed':
      case 'expired':
        newStatus = 'FAILED';
        break;
      default:
        newStatus = 'PENDING';
    }

    // Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: newStatus,
        processedAt: new Date()
      }
    });

    console.log(`✅ Webhook processed: ${chargeId} → ${newStatus}`);

    return res.json({
      success: true,
      message: 'Webhook processed successfully'
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
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
          status: payment.status,
          omiseChargeId: payment.transactionToken,
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
