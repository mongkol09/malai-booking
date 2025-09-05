import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { BusinessNotificationService } from '../services/businessNotificationService';
import { sendCancellationEmail } from '../controllers/emailController';
import { unlockRoomAfterCancellation } from '../services/dailyAvailabilityService';

const prisma = new PrismaClient();

// ============================================
// TYPES & INTERFACES
// ============================================

interface CancellationRequest {
  reason: string;
  refundAmount: number;
  refundMethod: 'original_payment' | 'credit_note' | 'bank_transfer' | 'cash';
  notifyGuest: boolean;
  internalNotes?: string;
  cancelledBy: string; // User ID who cancelled
}

interface CancellationResponse {
  success: boolean;
  message: string;
  data: {
    cancellationId: string;
    bookingId: string;
    refundId?: string;
    refundAmount: number;
    cancellationTime: string;
    emailSent: boolean;
  };
}

// ============================================
// VALIDATION FUNCTIONS
// ============================================

const validateCancellationRequest = (data: any): CancellationRequest => {
  const errors: string[] = [];

  if (!data.reason || typeof data.reason !== 'string' || data.reason.trim().length === 0) {
    errors.push('เหตุผลการยกเลิกเป็นสิ่งจำเป็น');
  }

  if (typeof data.refundAmount !== 'number' || data.refundAmount < 0) {
    errors.push('จำนวนเงินคืนต้องเป็นตัวเลขและไม่ติดลบ');
  }

  if (!['original_payment', 'credit_note', 'bank_transfer', 'cash'].includes(data.refundMethod)) {
    errors.push('วิธีการคืนเงินไม่ถูกต้อง');
  }

  if (typeof data.notifyGuest !== 'boolean') {
    errors.push('การแจ้งเตือนลูกค้าต้องเป็น true หรือ false');
  }

  if (errors.length > 0) {
    throw new Error(`Validation failed: ${errors.join(', ')}`);
  }

  return {
    reason: data.reason.trim(),
    refundAmount: data.refundAmount,
    refundMethod: data.refundMethod,
    notifyGuest: data.notifyGuest,
    internalNotes: data.internalNotes?.trim(),
    cancelledBy: data.cancelledBy
  };
};

const validateBookingForCancellation = async (bookingId: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      guest: true,
      room: true,
      roomType: true,
      payments: {
        where: { status: 'COMPLETED' },
        orderBy: { createdAt: 'desc' }
      },
      cancellationPolicy: {
        include: {
          rules: {
            orderBy: { daysBeforeCheckin: 'desc' }
          }
        }
      }
    }
  });

  if (!booking) {
    throw new Error('ไม่พบข้อมูลการจอง');
  }

  if (booking.status === 'Cancelled') {
    throw new Error('การจองนี้ถูกยกเลิกไปแล้ว');
  }

  if (booking.status === 'Completed') {
    throw new Error('ไม่สามารถยกเลิกการจองที่เสร็จสิ้นแล้วได้');
  }

  if (booking.status === 'CheckedOut') {
    throw new Error('ไม่สามารถยกเลิกการจองที่เช็คเอาท์แล้วได้');
  }

  return booking;
};

// ============================================
// BUSINESS LOGIC FUNCTIONS
// ============================================

const calculateRefundAmount = (booking: any, requestedRefund: number): number => {
  const totalPaid = booking.payments.reduce((sum: number, payment: any) => {
    return sum + parseFloat(payment.amount.toString());
  }, 0);

  // ตรวจสอบว่าไม่เกินจำนวนที่จ่าย
  if (requestedRefund > totalPaid) {
    throw new Error(`จำนวนเงินคืน (${requestedRefund}) เกินกว่าจำนวนที่จ่าย (${totalPaid})`);
  }

  return requestedRefund;
};

const applyCancellationPolicy = (booking: any, refundAmount: number): number => {
  if (!booking.cancellationPolicy || booking.cancellationPolicy.rules.length === 0) {
    return refundAmount; // ไม่มี policy = คืนเงินเต็มจำนวน
  }

  const checkinDate = new Date(booking.checkinDate);
  const now = new Date();
  const daysUntilCheckin = Math.ceil((checkinDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  // หา rule ที่เหมาะสม
  const applicableRule = booking.cancellationPolicy.rules.find((rule: any) => 
    daysUntilCheckin >= rule.daysBeforeCheckin
  );

  if (!applicableRule) {
    // ไม่มี rule ที่เหมาะสม = ไม่คืนเงิน
    return 0;
  }

  const refundPercentage = parseFloat(applicableRule.refundPercentage.toString());
  const calculatedRefund = (refundAmount * refundPercentage) / 100;

  return Math.max(0, calculatedRefund - parseFloat(applicableRule.penaltyAmount.toString()));
};

// ============================================
// MAIN CONTROLLER FUNCTIONS
// ============================================

export const cancelBooking = async (req: Request, res: Response) => {
  const { id: bookingId } = req.params;
  const cancellationData = req.body;

  try {
    console.log(`🚫 [Cancellation] Starting cancellation process for booking: ${bookingId}`);

    // 1. Get or create system user for cancellation
    let cancelledByUserId = (req as any).user?.id;
    
    if (!cancelledByUserId) {
      // Try to find system user or create one
      const systemUser = await prisma.user.findFirst({
        where: { email: 'system@hotel.com' }
      });
      
      if (systemUser) {
        cancelledByUserId = systemUser.id;
      } else {
        // Create system user if not exists
        const newSystemUser = await prisma.user.create({
          data: {
            email: 'system@hotel.com',
            passwordHash: 'system_user_no_password',
            userType: 'ADMIN',
            firstName: 'System',
            lastName: 'User',
            isActive: true
          }
        });
        cancelledByUserId = newSystemUser.id;
      }
    }

    // 2. Validate request data
    const validatedData = validateCancellationRequest({
      ...cancellationData,
      cancelledBy: cancelledByUserId
    });

    // 3. Validate booking exists and can be cancelled
    const booking = await validateBookingForCancellation(bookingId);

    // 4. Calculate refund amount
    const calculatedRefund = calculateRefundAmount(booking, validatedData.refundAmount);
    const finalRefundAmount = applyCancellationPolicy(booking, calculatedRefund);

    console.log(`💰 [Cancellation] Refund calculation:`, {
      requested: validatedData.refundAmount,
      calculated: calculatedRefund,
      final: finalRefundAmount,
      policyApplied: booking.cancellationPolicy?.name || 'No Policy',
      cancelledBy: validatedData.cancelledBy
    });

    // 5. Start database transaction
    const result = await prisma.$transaction(async (tx) => {
      // 4.1 Update booking status and clear room assignment
      const updatedBooking = await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: 'Cancelled',
          updatedAt: new Date(),
          // Clear room assignment
          actualRoomId: null,
          roomAssignedAt: null,
          assignedBy: null,
          checkinTime: null,
          checkoutTime: null,
          checkinBy: null,
          checkoutBy: null
        }
      });

      // 4.2 Create cancellation record
      const cancellation = await tx.bookingCancellation.create({
        data: {
          bookingId: bookingId,
          reason: validatedData.reason,
          refundAmount: finalRefundAmount,
          refundMethod: validatedData.refundMethod,
          cancelledBy: validatedData.cancelledBy,
          internalNotes: validatedData.internalNotes,
          cancellationTime: new Date(),
          policyApplied: booking.cancellationPolicy?.name || 'No Policy',
          originalAmount: booking.finalAmount,
          penaltyAmount: calculatedRefund - finalRefundAmount
        }
      });

      // 4.3 Create refund record if applicable
      let refundId = null;
      if (finalRefundAmount > 0) {
        const refund = await tx.paymentRefund.create({
          data: {
            bookingId: bookingId,
            cancellationId: cancellation.id,
            amount: finalRefundAmount,
            method: validatedData.refundMethod,
            status: 'PENDING',
            processedBy: validatedData.cancelledBy,
            refundReason: validatedData.reason,
            createdAt: new Date()
          }
        });
        refundId = refund.id;
      }

      // 4.4 Update room status if assigned
      if (booking.actualRoomId) {
        // Determine room status based on cancellation reason
        let newRoomStatus = 'Available';
        let newHousekeepingStatus = 'Clean';
        
        if (validatedData.reason === 'room_unavailable') {
          // If room is unavailable, set to maintenance
          newRoomStatus = 'Maintenance';
          newHousekeepingStatus = 'Maintenance';
          console.log(`🔧 [Cancellation] Room ${booking.actualRoomId} set to maintenance due to room_unavailable reason`);
        }
        
        await tx.room.update({
          where: { id: booking.actualRoomId },
          data: {
            status: newRoomStatus as any,
            housekeepingStatus: newHousekeepingStatus as any
          }
        });
        console.log(`🏠 [Cancellation] Room ${booking.actualRoomId} status updated to ${newRoomStatus}`);
      }

      // 4.5 Create audit log
      await tx.auditLog.create({
        data: {
          action: 'BOOKING_CANCELLED',
          resourceType: 'Booking',
          resourceId: bookingId,
          userId: validatedData.cancelledBy,
          oldValues: {
            status: booking.status,
            updatedAt: booking.updatedAt
          },
          newValues: {
            status: 'Cancelled',
            cancellationId: cancellation.id,
            refundId: refundId,
            reason: validatedData.reason,
            refundAmount: finalRefundAmount
          },
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        }
      });

      return {
        cancellation,
        refundId,
        updatedBooking
      };
    });

    // 4.6 Unlock daily availability after transaction
    if (booking.actualRoomId && validatedData.reason !== 'room_unavailable') {
      try {
        await unlockRoomAfterCancellation(booking.actualRoomId, bookingId);
        console.log(`🔓 [Cancellation] Daily availability unlocked for room ${booking.actualRoomId}`);
      } catch (error) {
        console.error('❌ [Cancellation] Failed to unlock daily availability:', error);
      }
    }

    // 6. Send notifications
    let emailSent = false;
    if (validatedData.notifyGuest) {
      try {
        await sendCancellationEmail(booking, result.cancellation, finalRefundAmount);
        emailSent = true;
        console.log(`📧 [Cancellation] Cancellation email sent to: ${booking.guest.email}`);
      } catch (emailError) {
        console.error('❌ [Cancellation] Failed to send cancellation email:', emailError);
      }
    }

    // 7. Send Telegram notification
    try {
      await BusinessNotificationService.notifyBookingCancellation({
        bookingId: booking.bookingReferenceId,
        guestName: `${booking.guest.firstName} ${booking.guest.lastName}`,
        roomNumber: booking.room.roomNumber,
        cancellationReason: validatedData.reason,
        refundAmount: finalRefundAmount,
        cancellationTime: result.cancellation.cancellationTime.toISOString()
      });
    } catch (telegramError) {
      console.error('❌ [Cancellation] Failed to send Telegram notification:', telegramError);
    }

    // 8. Prepare response
    const response: CancellationResponse = {
      success: true,
      message: 'ยกเลิกการจองสำเร็จ',
      data: {
        cancellationId: result.cancellation.id,
        bookingId: bookingId,
        refundId: result.refundId || undefined,
        refundAmount: finalRefundAmount,
        cancellationTime: result.cancellation.cancellationTime.toISOString(),
        emailSent: emailSent
      }
    };

    console.log(`✅ [Cancellation] Booking ${bookingId} cancelled successfully`);
    res.status(200).json(response);

  } catch (error: any) {
    console.error(`❌ [Cancellation] Error cancelling booking ${bookingId}:`, error);
    
    res.status(400).json({
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการยกเลิกการจอง',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// ============================================
// SUPPORTING ENDPOINTS
// ============================================

export const getCancellationHistory = async (req: Request, res: Response) => {
  const { bookingId } = req.params;

  try {
    const cancellations = await prisma.bookingCancellation.findMany({
      where: { bookingId },
      include: {
        booking: {
          include: {
            guest: true,
            room: true
          }
        },
        refund: true
      },
      orderBy: { cancellationTime: 'desc' }
    });

    res.status(200).json({
      success: true,
      data: cancellations
    });

  } catch (error: any) {
    console.error('❌ Error fetching cancellation history:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลประวัติการยกเลิก'
    });
  }
};

export const getCancellationPolicy = async (req: Request, res: Response) => {
  const { bookingId } = req.params;

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        cancellationPolicy: {
          include: {
            rules: {
              orderBy: { daysBeforeCheckin: 'desc' }
            }
          }
        },
        payments: {
          where: { status: 'COMPLETED' }
        }
      }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบข้อมูลการจอง'
      });
    }

    const totalPaid = booking.payments.reduce((sum, payment) => {
      return sum + parseFloat(payment.amount.toString());
    }, 0);

    res.status(200).json({
      success: true,
      data: {
        policy: booking.cancellationPolicy,
        totalPaid,
        bookingStatus: booking.status,
        checkinDate: booking.checkinDate
      }
    });

  } catch (error: any) {
    console.error('❌ Error fetching cancellation policy:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลนโยบายการยกเลิก'
    });
  }
};
