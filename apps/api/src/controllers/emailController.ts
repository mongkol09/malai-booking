import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { 
  EmailType, 
  BookingEmailData, 
  PaymentEmailData, 
  CheckInReminderData 
} from '../types/emailTypes';
import { emailService } from '../services/emailService';
import { emailTemplateService } from '../services/emailTemplateService';
import { emailQueueService } from '../services/emailQueueService';

const prisma = new PrismaClient();

// ============================================
// EMAIL API CONTROLLERS
// ============================================

/**
 * POST /api/v1/emails/booking-confirmation
 * ส่งอีเมลยืนยันการจอง
 */
export const sendBookingConfirmationEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      res.status(400).json({
        success: false,
        error: 'Booking ID is required'
      });
      return;
    }

    // Fetch booking data
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        guest: true,
        room: {
          include: {
            roomType: true
          }
        }
      }
    });

    if (!booking || !booking.guest) {
      res.status(404).json({
        success: false,
        error: 'Booking or guest not found'
      });
      return;
    }

    // Prepare email data
    const emailData = await emailTemplateService.prepareBookingConfirmationData({
      booking,
      guest: booking.guest,
      roomType: booking.room?.roomType || { name: 'Standard Room' }
    });

    // Send email immediately or add to queue
    const sendImmediately = req.body.immediate === true;
    
    if (sendImmediately) {
      const result = await emailQueueService.sendImmediately(
        EmailType.BOOKING_CONFIRMATION,
        booking.guest.email,
        emailData
      );

      res.json({
        success: result.success,
        messageId: result.messageId,
        message: result.success ? 'Booking confirmation email sent successfully' : 'Failed to send email',
        error: result.error
      });
    } else {
      const queueId = await emailQueueService.addToQueue(
        EmailType.BOOKING_CONFIRMATION,
        booking.guest.email,
        emailData,
        new Date(),
        bookingId
      );

      res.json({
        success: true,
        queueId,
        message: 'Booking confirmation email added to queue'
      });
    }

  } catch (error) {
    console.error('❌ Error sending booking confirmation email:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * POST /api/v1/emails/payment-receipt
 * ส่งอีเมลใบเสร็จการชำระเงิน
 */
export const sendPaymentReceiptEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { paymentId } = req.body;

    if (!paymentId) {
      res.status(400).json({
        success: false,
        error: 'Payment ID is required'
      });
      return;
    }

    // Fetch payment data
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        booking: {
          include: {
            guest: true,
            room: {
              include: {
                roomType: true
              }
            }
          }
        }
      }
    });

    if (!payment || !payment.booking?.guest) {
      res.status(404).json({
        success: false,
        error: 'Payment, booking, or guest not found'
      });
      return;
    }

    // Prepare email data
    const emailData = await emailTemplateService.preparePaymentReceiptData({
      booking: payment.booking,
      payment,
      guest: payment.booking.guest,
      roomType: payment.booking.room?.roomType || { name: 'Standard Room' }
    });

    // Send email immediately or add to queue
    const sendImmediately = req.body.immediate === true;
    
    if (sendImmediately) {
      const result = await emailQueueService.sendImmediately(
        EmailType.PAYMENT_RECEIPT,
        payment.booking.guest.email,
        emailData
      );

      res.json({
        success: result.success,
        messageId: result.messageId,
        message: result.success ? 'Payment receipt email sent successfully' : 'Failed to send email',
        error: result.error
      });
    } else {
      const queueId = await emailQueueService.addToQueue(
        EmailType.PAYMENT_RECEIPT,
        payment.booking.guest.email,
        emailData,
        new Date(),
        payment.booking.id
      );

      res.json({
        success: true,
        queueId,
        message: 'Payment receipt email added to queue'
      });
    }

  } catch (error) {
    console.error('❌ Error sending payment receipt email:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * POST /api/v1/emails/checkin-reminder
 * ส่งอีเมลแจ้งเตือนการเช็คอิน
 */
export const sendCheckInReminderEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bookingId, daysUntilCheckin } = req.body;

    if (!bookingId) {
      res.status(400).json({
        success: false,
        error: 'Booking ID is required'
      });
      return;
    }

    // Fetch booking data
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        guest: true,
        room: {
          include: {
            roomType: true
          }
        }
      }
    });

    if (!booking || !booking.guest) {
      res.status(404).json({
        success: false,
        error: 'Booking or guest not found'
      });
      return;
    }

    // Calculate days until check-in if not provided
    const checkinDate = new Date(booking.checkinDate);
    const today = new Date();
    const calculatedDays = Math.ceil((checkinDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const finalDaysUntilCheckin = daysUntilCheckin !== undefined ? daysUntilCheckin : calculatedDays;

    // Prepare email data
    const emailData = await emailTemplateService.prepareCheckInReminderData({
      booking,
      guest: booking.guest,
      roomType: booking.room?.roomType || { name: 'Standard Room' },
      daysUntilCheckin: finalDaysUntilCheckin
    });

    // Send email immediately or add to queue
    const sendImmediately = req.body.immediate === true;
    
    if (sendImmediately) {
      const result = await emailQueueService.sendImmediately(
        EmailType.CHECKIN_REMINDER,
        booking.guest.email,
        emailData
      );

      res.json({
        success: result.success,
        messageId: result.messageId,
        message: result.success ? 'Check-in reminder email sent successfully' : 'Failed to send email',
        error: result.error
      });
    } else {
      const queueId = await emailQueueService.addToQueue(
        EmailType.CHECKIN_REMINDER,
        booking.guest.email,
        emailData,
        new Date(),
        bookingId
      );

      res.json({
        success: true,
        queueId,
        message: 'Check-in reminder email added to queue'
      });
    }

  } catch (error) {
    console.error('❌ Error sending check-in reminder email:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * GET /api/v1/emails/queue/stats
 * ดูสถิติ email queue
 */
export const getEmailQueueStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await emailQueueService.getQueueStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ Error fetching email queue stats:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * GET /api/v1/emails/stats
 * ดูสถิติการส่งอีเมลทั้งหมด
 */
export const getEmailStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { from, to } = req.query;
    
    let dateRange;
    if (from && to) {
      dateRange = {
        from: new Date(from as string),
        to: new Date(to as string)
      };
    }
    
    const stats = await emailService.getEmailStats(dateRange);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ Error fetching email stats:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * GET /api/v1/emails/templates/variables/:emailType
 * ดูรายการ template variables สำหรับ email type ที่กำหนด
 */
export const getTemplateVariables = async (req: Request, res: Response): Promise<void> => {
  try {
    const { emailType } = req.params;
    
    if (!Object.values(EmailType).includes(emailType as EmailType)) {
      res.status(400).json({
        success: false,
        error: 'Invalid email type'
      });
      return;
    }
    
    const variables = emailTemplateService.getTemplateVariables(emailType as EmailType);
    
    res.json({
      success: true,
      data: {
        emailType,
        variables
      }
    });
  } catch (error) {
    console.error('❌ Error fetching template variables:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * POST /api/v1/emails/test
 * ทดสอบการส่งอีเมล
 */
export const testEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { to, emailType, testData } = req.body;
    
    if (!to || !emailType) {
      res.status(400).json({
        success: false,
        error: 'Recipient email and email type are required'
      });
      return;
    }

    // Prepare test email data
    const defaultTestData = {
      guest_name: 'ทดสอบ ระบบ',
      booking_reference: 'TEST-001',
      hotel_name: 'Malai Khaoyai Resort (Test)',
      current_date: new Date().toLocaleDateString('th-TH'),
      ...testData
    };

    const result = await emailQueueService.sendImmediately(
      emailType as EmailType,
      to,
      defaultTestData
    );

    res.json({
      success: result.success,
      messageId: result.messageId,
      message: result.success ? 'Test email sent successfully' : 'Failed to send test email',
      error: result.error
    });

  } catch (error) {
    console.error('❌ Error sending test email:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// ============================================
// LEGACY FUNCTIONS (KEEP FOR BACKWARD COMPATIBILITY)
// ============================================

/**
 * Updated function - ใช้ Resend แทน MailerSend
 */
export const sendBookingConfirmationEmailDirect = async (booking: any, guest: any, roomType: any): Promise<void> => {
  try {
    console.log(`📧 [Resend] Sending booking confirmation email for ${booking.bookingReferenceId}`);
    
    // Import Resend service
    const { resendEmailService } = await import('../services/resendEmailService');
    
    // ส่งอีเมลผ่าน Resend service
    const result = await resendEmailService.sendBookingConfirmation(
      guest.email,
      `${guest.firstName} ${guest.lastName}`,
      {
        bookingReferenceId: booking.bookingReferenceId,
        roomType: roomType,
        room: booking.room,
        checkinDate: booking.checkinDate,
        checkoutDate: booking.checkoutDate,
        finalAmount: booking.finalAmount,
        numAdults: booking.numAdults,
        numChildren: booking.numChildren
      }
    );

    if (!result.success) {
      throw new Error(`Resend email failed: ${result.error}`);
    }

    console.log(`✅ [Resend] Booking confirmation email sent successfully. Message ID: ${result.messageId}`);
    
  } catch (error) {
    console.error('❌ [Resend] Error sending booking confirmation email:', error);
    throw error;
  }
};
