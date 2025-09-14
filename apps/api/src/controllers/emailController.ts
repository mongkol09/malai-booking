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
 * Updated function - ใช้ MailerSend Template ที่มีอยู่แล้ว
 */
export const sendBookingConfirmationEmailDirect = async (booking: any, guest: any, roomType: any): Promise<void> => {
  try {
    console.log(`📧 [MailerSend] Sending booking confirmation email for ${booking.bookingReferenceId}`);
    
    // Import MailerSend service
    const { emailService } = await import('../services/emailService');
    
    // เตรียมข้อมูลสำหรับ Template - ปรับให้ตรงกับ MailerSend Template
    const numAdults = booking.numAdults || 1;
    const numChildren = booking.numChildren || 0;
    const totalGuests = numAdults + numChildren;
    
    // คำนวณราคาต่อคืน
    const checkinDate = new Date(booking.checkinDate);
    const checkoutDate = new Date(booking.checkoutDate);
    const nights = Math.ceil((checkoutDate.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24)) || 1;
    
    // ใช้ข้อมูล Payment Breakdown จาก Database
    const finalAmount = parseFloat(booking.finalAmount?.toString() || '0');
    const totalPrice = parseFloat(booking.totalPrice?.toString() || '0'); // Room Rate เดิม
    const taxAmount = parseFloat(booking.taxAmount?.toString() || '0');
    const serviceChargeAmount = parseFloat(booking.serviceChargeAmount?.toString() || '0');
    const discountAmount = parseFloat(booking.discountAmount?.toString() || '0');
    const extraChargesAmount = parseFloat(booking.extraChargesAmount?.toString() || '0');
    const commissionAmount = parseFloat(booking.commissionAmount?.toString() || '0');
    
    // คำนวณราคาต่อคืนจาก Room Rate หลัก
    const roomPricePerNight = Math.round(totalPrice / nights);
    
    const templateData = {
      // Reservation Details
      guest_name: `${guest.firstName} ${guest.lastName}`,
      room_type: roomType?.name || 'Standard Room',
      guest_count: `${numAdults} ผู้ใหญ่${numChildren > 0 ? `, ${numChildren} เด็ก` : ''}`,
      checkin_date: checkinDate.toLocaleDateString('th-TH'),
      checkout_date: checkoutDate.toLocaleDateString('th-TH'),
      booking_reference: booking.bookingReferenceId,
      
      // Payment Breakdown Details
      room_price_per_night: `฿${roomPricePerNight.toLocaleString()}`,
      room_total: `฿${totalPrice.toLocaleString()}`, // Base room rate
      service_charge: `฿${serviceChargeAmount.toLocaleString()}`,
      tax_amount: `฿${taxAmount.toLocaleString()}`,
      discount_amount: `฿${discountAmount.toLocaleString()}`,
      extra_charges: `฿${extraChargesAmount.toLocaleString()}`,
      commission_amount: `฿${commissionAmount.toLocaleString()}`,
      grand_total: `฿${finalAmount.toLocaleString()}`,
      
      // Contact Information
      guest_phone: guest.phoneNumber || guest.phone || '+66-XX-XXX-XXXX',
      cuntomer_phone: { no: guest.phoneNumber || guest.phone || '+66-XX-XXX-XXXX' }, // Nested structure สำหรับ template
      
      // Additional fields (backward compatibility)
      guest_email: guest.email,
      booking_id: booking.bookingReferenceId,
      room_number: booking.room?.roomNumber || 'จะแจ้งให้ทราบ',
      num_adults: numAdults,
      num_children: numChildren,
      total_amount: `฿${finalAmount.toLocaleString()}`,
      hotel_name: 'Malai Khaoyai Resort',
      current_date: new Date().toLocaleDateString('th-TH')
    };

    console.log('📋 [MailerSend] Using template data:', templateData);
    
    // ส่งอีเมลผ่าน MailerSend Template
    const result = await emailService.sendTemplateEmail({
      type: 'BOOKING_CONFIRMATION' as any,
      to: guest.email,
      toName: `${guest.firstName} ${guest.lastName}`,
      subject: `ยืนยันการจอง ${booking.bookingReferenceId} - Malai Khaoyai Resort`,
      templateId: process.env.BOOKING_CONFIRMATION_TEMPLATE_ID || 'z3m5jgrq390ldpyo',
      templateData: templateData
    });

    if (!result.success) {
      throw new Error(`MailerSend template email failed: ${result.error}`);
    }

    console.log(`✅ [MailerSend] Booking confirmation email sent successfully. Message ID: ${result.messageId}`);
    
  } catch (error) {
    console.error('❌ [MailerSend] Error sending booking confirmation email:', error);
    throw error;
  }
};

/**
 * ส่งอีเมลแจ้งการยกเลิกการจอง
 */
export const sendCancellationEmail = async (booking: any, cancellation: any, refundAmount: number): Promise<void> => {
  try {
    console.log(`📧 [Cancellation] Sending cancellation email for ${booking.bookingReferenceId}`);
    
    // Import email service
    const { emailService } = await import('../services/emailService');
    
    // เตรียมข้อมูลสำหรับ Template
    const checkinDate = new Date(booking.checkinDate);
    const checkoutDate = new Date(booking.checkoutDate);
    const cancellationTime = new Date(cancellation.cancellationTime);
    
    const templateData = {
      // Booking Details
      guest_name: `${booking.guest.firstName} ${booking.guest.lastName}`,
      booking_reference: booking.bookingReferenceId,
      room_type: booking.roomType?.name || 'Standard Room',
      room_number: booking.room?.roomNumber || 'N/A',
      checkin_date: checkinDate.toLocaleDateString('th-TH'),
      checkout_date: checkoutDate.toLocaleDateString('th-TH'),
      
      // Cancellation Details
      cancellation_reason: cancellation.reason,
      cancellation_time: cancellationTime.toLocaleString('th-TH'),
      refund_amount: refundAmount > 0 ? `฿${refundAmount.toLocaleString()}` : '฿0',
      refund_method: getRefundMethodDisplay(cancellation.refundMethod),
      original_amount: `฿${parseFloat(booking.finalAmount.toString()).toLocaleString()}`,
      
      // Additional fields
      guest_email: booking.guest.email,
      hotel_name: 'Malai Khaoyai Resort',
      current_date: new Date().toLocaleDateString('th-TH'),
      contact_info: 'โทร: 044-123-456 หรือ อีเมล: info@malaikhaoyai.com'
    };

    console.log('📋 [Cancellation] Using template data:', templateData);
    
    // ส่งอีเมลผ่าน MailerSend Template
    const result = await emailService.sendTemplateEmail({
      type: 'BOOKING_CANCELLATION' as any,
      to: booking.guest.email,
      toName: `${booking.guest.firstName} ${booking.guest.lastName}`,
      subject: `การยกเลิกการจอง ${booking.bookingReferenceId} - Malai Khaoyai Resort`,
      templateId: process.env.CANCELLATION_TEMPLATE_ID || 'cancellation_template_id', // ต้องสร้าง template ใหม่
      templateData: templateData
    });

    if (!result.success) {
      throw new Error(`MailerSend cancellation email failed: ${result.error}`);
    }

    console.log(`✅ [Cancellation] Cancellation email sent successfully. Message ID: ${result.messageId}`);
    
  } catch (error) {
    console.error('❌ [Cancellation] Error sending cancellation email:', error);
    throw error;
  }
};

/**
 * แปลงวิธีการคืนเงินเป็นข้อความที่อ่านง่าย
 */
const getRefundMethodDisplay = (method: string): string => {
  const methodMap: { [key: string]: string } = {
    'original_payment': 'คืนเงินไปยังบัตรเครดิต/เดบิตเดิม',
    'credit_note': 'เครดิตโน๊ตสำหรับการจองครั้งต่อไป',
    'bank_transfer': 'โอนเงินเข้าบัญชีธนาคาร',
    'cash': 'เงินสด'
  };
  
  return methodMap[method] || method;
};
