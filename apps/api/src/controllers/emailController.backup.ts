import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';
import QRCode from 'qrcode';
import { z } from 'zod';

const prisma = new PrismaClient();

// ============================================
// EMAIL CONTROLLER
// Handles all email notifications for hotel booking system
// ============================================

// Initialize MailerSend
const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_TOKEN || '',
});

// Validation schemas
const sendBookingConfirmationSchema = z.object({
  bookingId: z.string().uuid(),
  email: z.string().email().optional(), // Override email if needed
  skipIfSent: z.boolean().default(true) // Skip if already sent
});

const sendReminderEmailSchema = z.object({
  bookingId: z.string().uuid(),
  reminderType: z.enum(['pre_arrival', 'check_in', 'thank_you']),
  scheduledFor: z.string().datetime().optional()
});

// ============================================
// BOOKING CONFIRMATION EMAIL
// ============================================
export const sendBookingConfirmationEmail = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { bookingId, email, skipIfSent } = sendBookingConfirmationSchema.parse(req.body);
    
    // Get booking details with all related data
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        guest: true,
        room: true,
        roomType: true,
        payments: {
          where: { status: 'COMPLETED' },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if email already sent (if skipIfSent is true)
    if (skipIfSent && booking.confirmationEmailSentAt) {
      return res.status(200).json({
        success: true,
        message: 'Confirmation email already sent',
        sentAt: booking.confirmationEmailSentAt
      });
    }

    const targetEmail = email || booking.guest.email;
    
    // Generate QR Code for check-in
    const qrCodeData = await generateCheckInQRCode(booking.bookingReferenceId);
    
    // Prepare email data
    const emailData = await prepareBookingConfirmationData(booking, qrCodeData);
    
    // Send email via MailerSend
    const emailResult = await sendEmailViaMailerSend({
      to: targetEmail,
      toName: `${booking.guest.firstName} ${booking.guest.lastName}`,
      subject: `ยืนยันการจองหมายเลข ${booking.bookingReferenceId} ที่ ${process.env.FROM_NAME || 'Malai Resort'}`,
      templateId: process.env.BOOKING_CONFIRMATION_TEMPLATE_ID || undefined,
      personalization: emailData
    });

    if (emailResult.success) {
      // Update booking record
      await prisma.booking.update({
        where: { id: bookingId },
        data: { 
          confirmationEmailSentAt: new Date(),
          updatedAt: new Date()
        }
      });

      // Log successful email
      await logEmailNotification(bookingId, 'booking_confirmation', targetEmail, 'SENT', emailResult.messageId);

      return res.json({
        success: true,
        message: 'Booking confirmation email sent successfully',
        recipient: targetEmail,
        messageId: emailResult.messageId,
        qrCodeGenerated: true
      });
    } else {
      // Log failed email
      await logEmailNotification(bookingId, 'booking_confirmation', targetEmail, 'FAILED', null, emailResult.error);
      
      // Add to retry queue
      await addEmailToRetryQueue(bookingId, 'booking_confirmation', targetEmail, emailData);

      return res.status(500).json({
        success: false,
        message: 'Failed to send confirmation email',
        error: emailResult.error,
        retryScheduled: true
      });
    }

  } catch (error) {
    console.error('Error sending booking confirmation email:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: error.errors
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error while sending email'
    });
  }
};// ============================================
// DIRECT EMAIL FUNCTION (for bookingController)
// ============================================
export const sendBookingConfirmationEmailDirect = async (booking: any, guest: any, roomType: any): Promise<void> => {
  try {
    // Generate QR Code for check-in
    const qrCodeData = await generateCheckInQRCode(booking.bookingReferenceId);
    
    // Prepare email data with provided objects
    const emailData = await prepareBookingConfirmationDataDirect(booking, guest, roomType, qrCodeData);
    
    // Send email via MailerSend
    const emailResult = await sendEmailViaMailerSend({
      to: guest.email,
      toName: `${guest.firstName} ${guest.lastName}`,
      subject: `ยืนยันการจองหมายเลข ${booking.bookingReferenceId} ที่ ${process.env.FROM_NAME || 'Malai Resort'}`,
      templateId: process.env.BOOKING_CONFIRMATION_TEMPLATE_ID || undefined,
      personalization: emailData
    });

    if (emailResult.success) {
      // Update booking record to mark email as sent
      await prisma.booking.update({
        where: { id: booking.id },
        data: { 
          confirmationEmailSentAt: new Date(),
          updatedAt: new Date()
        }
      });

      // Log successful email
      await logEmailNotification(booking.id, 'booking_confirmation', guest.email, 'SENT', emailResult.messageId);
      
      console.log(`Booking confirmation email sent successfully to ${guest.email}`);
    } else {
      // Log failed email and add to retry queue
      await logEmailNotification(booking.id, 'booking_confirmation', guest.email, 'FAILED', null, emailResult.error);
      await addEmailToRetryQueue(booking.id, 'booking_confirmation', guest.email, emailData);
      
      console.error(`Failed to send booking confirmation email to ${guest.email}:`, emailResult.error);
      throw new Error(`Email sending failed: ${emailResult.error}`);
    }

  } catch (error) {
    console.error('Error in sendBookingConfirmationEmailDirect:', error);
    throw error; // Re-throw to let calling function handle
  }
};

// ============================================
// PRE-ARRIVAL REMINDER EMAIL
// ============================================
export const sendPreArrivalReminder = async (req: Request, res: Response) => {
  try {
    const { bookingId, reminderType, scheduledFor } = sendReminderEmailSchema.parse(req.body);
    
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        guest: true,
        room: true,
        roomType: true
      }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if booking is still valid
    if (booking.status === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot send reminder for cancelled booking'
      });
    }

    const emailData = await prepareReminderEmailData(booking, reminderType);
    
    const emailResult = await sendEmailViaMailerSend({
      to: booking.guest.email,
      toName: `${booking.guest.firstName} ${booking.guest.lastName}`,
      subject: getEmailSubjectByType(reminderType, booking),
      templateId: getTemplateIdByType(reminderType),
      personalization: emailData
    });

    if (emailResult.success) {
      await logEmailNotification(bookingId, reminderType, booking.guest.email, 'SENT', emailResult.messageId);
      
      res.json({
        success: true,
        message: `${reminderType} email sent successfully`,
        recipient: booking.guest.email,
        messageId: emailResult.messageId
      });
    } else {
      await logEmailNotification(bookingId, reminderType, booking.guest.email, 'FAILED', null, emailResult.error);
      
      res.status(500).json({
        success: false,
        message: `Failed to send ${reminderType} email`,
        error: emailResult.error
      });
    }

  } catch (error) {
    console.error('Error sending reminder email:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: error.errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error while sending reminder'
    });
  }
};

// ============================================
// RETRY FAILED EMAILS
// ============================================
export const retryFailedEmails = async (req: Request, res: Response) => {
  try {
    // Get failed emails from queue (last 24 hours)
    const failedEmails = await prisma.emailQueue.findMany({
      where: {
        status: 'FAILED',
        retryCount: { lt: 3 }, // Max 3 retries
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      },
      orderBy: { createdAt: 'asc' },
      take: 10 // Process 10 at a time
    });

    const results = [];

    for (const emailJob of failedEmails) {
      try {
        const emailData = emailJob.emailData as any;
        
        const emailResult = await sendEmailViaMailerSend({
          to: emailJob.recipientEmail,
          toName: emailData.recipientName || '',
          subject: emailData.subject || '',
          templateId: emailData.templateId || process.env.BOOKING_CONFIRMATION_TEMPLATE_ID,
          personalization: emailData.personalization || {}
        });

        if (emailResult.success) {
          // Mark as sent
          await prisma.emailQueue.update({
            where: { id: emailJob.id },
            data: { 
              status: 'SENT',
              sentAt: new Date(),
              messageId: emailResult.messageId
            }
          });

          results.push({ id: emailJob.id, status: 'success', messageId: emailResult.messageId });
        } else {
          // Increment retry count
          await prisma.emailQueue.update({
            where: { id: emailJob.id },
            data: { 
              retryCount: { increment: 1 },
              lastRetryAt: new Date(),
              lastError: emailResult.error
            }
          });

          results.push({ id: emailJob.id, status: 'failed', error: emailResult.error });
        }

      } catch (retryError) {
        console.error(`Error retrying email ${emailJob.id}:`, retryError);
        results.push({ id: emailJob.id, status: 'error', error: 'Processing error' });
      }
    }

    res.json({
      success: true,
      message: `Processed ${failedEmails.length} failed emails`,
      results: results,
      successCount: results.filter(r => r.status === 'success').length,
      failedCount: results.filter(r => r.status !== 'success').length
    });

  } catch (error) {
    console.error('Error retrying failed emails:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while retrying emails'
    });
  }
};

// ============================================
// EMAIL LOGS AND ANALYTICS
// ============================================
export const getEmailLogs = async (req: Request, res: Response) => {
  try {
    const { bookingId, emailType, status, page = 1, limit = 20 } = req.query;
    
    const where: any = {};
    if (bookingId) where.bookingId = bookingId as string;
    if (emailType) where.emailType = emailType as string;
    if (status) where.status = status as string;

    const [logs, total] = await Promise.all([
      prisma.emailLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        include: {
          booking: {
            select: {
              bookingReferenceId: true,
              guest: {
                select: { firstName: true, lastName: true }
              }
            }
          }
        }
      }),
      prisma.emailLog.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });

  } catch (error) {
    console.error('Error fetching email logs:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching email logs'
    });
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

async function generateCheckInQRCode(bookingReference: string): Promise<string> {
  try {
    const qrData = {
      type: 'booking_checkin',
      reference: bookingReference,
      timestamp: Date.now()
    };
    
    const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrData), {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

async function prepareBookingConfirmationData(booking: any, qrCodeData: string) {
  const checkinDate = new Date(booking.checkinDate);
  const checkoutDate = new Date(booking.checkoutDate);
  const nights = Math.ceil((checkoutDate.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Get price breakdown from booking intent or calculate
  const priceBreakdown = await calculatePriceBreakdown(booking);
  
  return {
    // Basic booking info
    booking_id: booking.bookingReferenceId,
    Customer_name: `${booking.guest.firstName} ${booking.guest.lastName}`,
    customer_email: booking.guest.email,
    customer_city: booking.guest.country || '',
    customer_country: booking.guest.country || '',
    
    // Hotel info
    hotel_name: process.env.FROM_NAME || 'Malai Resort',
    hotel_email: process.env.FROM_EMAIL || 'center@malaikhaoyai.com',
    hotel_phone: '+66 XX XXX XXXX', // TODO: Add to env
    hotel_address: 'Malai Khaoyai Resort Address', // TODO: Add to env
    hotel_website: 'https://malaikhaoyai.com', // TODO: Add to env
    hotel_signature_name: 'Malai Resort Team',
    
    // Room and stay details
    room_type: booking.roomType.name,
    guest_count: booking.numAdults + booking.numChildren,
    nights: nights.toString(),
    
    // Dates and times
    check_in_date: checkinDate.toLocaleDateString('th-TH'),
    check_in_time: '15:00', // TODO: Make configurable
    Check: {
      out: {
        date: {
          time: checkoutDate.toLocaleDateString('th-TH')
        }
      }
    },
    check_out_date: checkoutDate.toLocaleDateString('th-TH'),
    check_out_time: '11:00', // TODO: Make configurable
    
    // Financial info
    price: Number(booking.totalPrice).toLocaleString('th-TH'),
    total: Number(booking.finalAmount).toLocaleString('th-TH'),
    tax: '0', // TODO: Calculate tax if applicable
    
    // QR Code for check-in
    qr_code_data: qrCodeData,
    
    // Additional URLs
    receipt_url: `${process.env.FRONTEND_URL || 'https://app.malaikhaoyai.com'}/receipt/${booking.id}`,
    manage_booking_url: `${process.env.FRONTEND_URL || 'https://app.malaikhaoyai.com'}/booking/${booking.bookingReferenceId}`,
    
    // Price breakdown
    price_breakdown: priceBreakdown
  };
}

async function prepareBookingConfirmationDataDirect(booking: any, guest: any, roomType: any, qrCodeData: string) {
  const checkinDate = new Date(booking.checkinDate);
  const checkoutDate = new Date(booking.checkoutDate);
  const nights = Math.ceil((checkoutDate.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Calculate price breakdown
  const priceBreakdown = await calculatePriceBreakdownDirect(booking);
  
  return {
    // Basic booking info
    booking_id: booking.bookingReferenceId,
    Customer_name: `${guest.firstName} ${guest.lastName}`,
    name: `${guest.firstName} ${guest.lastName}`, // Alternative field name
    customer_email: guest.email,
    customer_city: guest.country || '',
    customer_country: guest.country || '',
    customer_postal_code: '', // TODO: Add if available
    account_name: `${guest.firstName} ${guest.lastName}`,
    
    // Hotel info
    hotel_name: process.env.FROM_NAME || 'Malai Resort',
    hotel_email: process.env.FROM_EMAIL || 'center@malaikhaoyai.com',
    hotel_phone: '+66 XX XXX XXXX', // TODO: Add to env
    hotel_address: 'Malai Khaoyai Resort Address', // TODO: Add to env
    hotel_website: 'https://malaikhaoyai.com', // TODO: Add to env
    hotel_signature_name: 'Malai Resort Team',
    
    // Room and stay details
    room_type: roomType.name,
    guest_count: (booking.numAdults + booking.numChildren).toString(),
    nights: nights.toString(),
    
    // Dates and times (matching template structure)
    check_in_date: checkinDate.toLocaleDateString('th-TH'),
    check_in_time: '15:00',
    check: {
      in: {
        date: {
          time: checkinDate.toLocaleDateString('th-TH')
        }
      }
    },
    Check: {
      out: {
        date: {
          time: checkoutDate.toLocaleDateString('th-TH')
        }
      }
    },
    check_out_date: checkoutDate.toLocaleDateString('th-TH'),
    check_out_time: '11:00',
    
    // Financial info
    price: Number(booking.totalPrice).toLocaleString('th-TH'),
    total: Number(booking.finalAmount || booking.totalPrice).toLocaleString('th-TH'),
    tax: '0', // TODO: Calculate tax if applicable
    
    // QR Code for check-in
    qr_code_data: qrCodeData,
    
    // Additional URLs
    receipt_url: `${process.env.FRONTEND_URL || 'https://app.malaikhaoyai.com'}/receipt/${booking.id}`,
    manage_booking_url: `${process.env.FRONTEND_URL || 'https://app.malaikhaoyai.com'}/booking/${booking.bookingReferenceId}`,
    
    // Price breakdown
    price_breakdown: priceBreakdown
  };
}

async function prepareReminderEmailData(booking: any, reminderType: string) {
  const baseData = await prepareBookingConfirmationData(booking, '');
  
  // Add reminder-specific data
  switch (reminderType) {
    case 'pre_arrival':
      return {
        ...baseData,
        reminder_type: 'Pre-arrival reminder',
        days_until_arrival: Math.ceil((new Date(booking.checkinDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
        weather_info: 'Pleasant weather expected', // TODO: Integrate weather API
        local_attractions: 'Explore Khao Yai National Park and local wineries'
      };
    
    case 'thank_you':
      return {
        ...baseData,
        reminder_type: 'Thank you message',
        review_url: `${process.env.FRONTEND_URL || 'https://app.malaikhaoyai.com'}/review/${booking.id}`,
        feedback_incentive: 'Share your experience and receive 10% discount on your next stay'
      };
    
    default:
      return baseData;
  }
}

async function sendEmailViaMailerSend(params: {
  to: string;
  toName: string;
  subject: string;
  templateId?: string | undefined;
  personalization: any;
}) {
  try {
    const sentFrom = new Sender(
      process.env.FROM_EMAIL || 'center@malaikhaoyai.com',
      process.env.FROM_NAME || 'Malai Resort'
    );

    const recipients = [new Recipient(params.to, params.toName)];

    const personalization = [{
      email: params.to,
      data: params.personalization
    }];

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setReplyTo(sentFrom)
      .setSubject(params.subject)
      .setPersonalization(personalization);

    if (params.templateId) {
      emailParams.setTemplateId(params.templateId);
    }

    const response = await mailerSend.email.send(emailParams);
    
    return {
      success: true,
      messageId: response.body?.message_id || 'unknown',
      response: response
    };

  } catch (error: any) {
    console.error('MailerSend API error:', error);
    return {
      success: false,
      error: error.message || 'Unknown email sending error'
    };
  }
}

async function logEmailNotification(
  bookingId: string, 
  emailType: string, 
  recipientEmail: string, 
  status: string, 
  messageId?: string | null, 
  error?: string | null
) {
  try {
    await prisma.emailLog.create({
      data: {
        bookingId,
        emailType,
        recipientEmail,
        status,
        messageId,
        error,
        sentAt: status === 'SENT' ? new Date() : null
      }
    });
  } catch (logError) {
    console.error('Error logging email notification:', logError);
  }
}

async function addEmailToRetryQueue(
  bookingId: string,
  emailType: string,
  recipientEmail: string,
  emailData: any
) {
  try {
    await prisma.emailQueue.create({
      data: {
        bookingId,
        emailType,
        recipientEmail,
        emailData: emailData as any,
        status: 'FAILED',
        retryCount: 0,
        scheduledFor: new Date(Date.now() + 5 * 60 * 1000) // Retry in 5 minutes
      }
    });
  } catch (queueError) {
    console.error('Error adding email to retry queue:', queueError);
  }
}

async function calculatePriceBreakdown(booking: any) {
  // TODO: Get actual price breakdown from booking intent or calculate
  const checkinDate = new Date(booking.checkinDate);
  const checkoutDate = new Date(booking.checkoutDate);
  const nights = Math.ceil((checkoutDate.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24));
  const pricePerNight = Number(booking.totalPrice) / nights;
  
  const breakdown = [];
  for (let i = 0; i < nights; i++) {
    const date = new Date(checkinDate);
    date.setDate(date.getDate() + i);
    breakdown.push({
      date: date.toLocaleDateString('th-TH'),
      rate: pricePerNight.toLocaleString('th-TH'),
      description: 'Base Rate'
    });
  }
  
  return breakdown;
}

async function calculatePriceBreakdownDirect(booking: any) {
  // Calculate price breakdown for direct function calls
  const checkinDate = new Date(booking.checkinDate);
  const checkoutDate = new Date(booking.checkoutDate);
  const nights = Math.ceil((checkoutDate.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24));
  const pricePerNight = Number(booking.totalPrice) / nights;
  
  const breakdown = [];
  for (let i = 0; i < nights; i++) {
    const date = new Date(checkinDate);
    date.setDate(date.getDate() + i);
    breakdown.push({
      date: date.toLocaleDateString('th-TH'),
      rate: pricePerNight.toLocaleString('th-TH'),
      description: 'Base Rate'
    });
  }
  
  return breakdown;
}

function getEmailSubjectByType(reminderType: string, booking: any): string {
  switch (reminderType) {
    case 'pre_arrival':
      return `เตรียมพร้อมสำหรับการเข้าพักที่ ${process.env.FROM_NAME || 'Malai Resort'} - ${booking.bookingReferenceId}`;
    case 'thank_you':
      return `ขอบคุณที่เลือกพักกับเรา - ${process.env.FROM_NAME || 'Malai Resort'}`;
    default:
      return `Reminder: ${booking.bookingReferenceId} - ${process.env.FROM_NAME || 'Malai Resort'}`;
  }
}

function getTemplateIdByType(reminderType: string): string {
  switch (reminderType) {
    case 'pre_arrival':
      return process.env.PRE_ARRIVAL_TEMPLATE_ID || process.env.BOOKING_CONFIRMATION_TEMPLATE_ID || 'jpzkmgqqwyvg059v';
    case 'thank_you':
      return process.env.THANK_YOU_TEMPLATE_ID || process.env.BOOKING_CONFIRMATION_TEMPLATE_ID || 'jpzkmgqqwyvg059v';
    default:
      return process.env.BOOKING_CONFIRMATION_TEMPLATE_ID || 'jpzkmgqqwyvg059v';
  }
}
