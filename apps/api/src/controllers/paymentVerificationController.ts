import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
const Omise = require('omise');
import { OmiseWebhookEvent } from '../types/webhook';

const prisma = new PrismaClient();
const omise = Omise({
  publicKey: process.env.OMISE_PUBLIC_KEY!,
  secretKey: process.env.OMISE_SECRET_KEY!,
});

// 🎯 Enterprise Payment Verification Controller
export class PaymentVerificationController {

  // 💳 Process Omise webhook (secure endpoint)
  static async processOmiseWebhook(req: Request, res: Response): Promise<void> {
    try {
      const webhookEvent: OmiseWebhookEvent = req.body;
      const { id: eventId, key: eventType, data: chargeData } = webhookEvent;

      console.log(`🔔 Processing Omise webhook: ${eventType} for charge: ${chargeData.id}`);

      // Find the payment by Omise charge ID
      const payment = await (prisma as any).payment.findFirst({
        where: { omiseChargeId: chargeData.id },
        include: {
          booking: {
            include: {
              user: true,
              room: true
            }
          }
        }
      });

      if (!payment) {
        console.error(`❌ Payment not found for charge: ${chargeData.id}`);
        res.status(404).json({
          error: 'Payment not found',
          chargeId: chargeData.id
        });
        return;
      }

      // Process different webhook events
      switch (eventType) {
        case 'charge.complete':
          await PaymentVerificationController.handleChargeComplete(payment, chargeData);
          break;
        
        case 'charge.failed':
          await PaymentVerificationController.handleChargeFailed(payment, chargeData);
          break;
        
        case 'refund.create':
          await PaymentVerificationController.handleRefundCreate(payment, chargeData);
          break;
        
        default:
          console.log(`⚠️ Unhandled webhook event: ${eventType}`);
      }

      res.status(200).json({
        success: true,
        eventType,
        chargeId: chargeData.id,
        processed: true
      });

    } catch (error) {
      console.error('❌ Webhook processing error:', error);
      res.status(500).json({
        error: 'Webhook processing failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // ✅ Handle successful charge completion
  private static async handleChargeComplete(payment: any, chargeData: any): Promise<void> {
    try {
      // Update payment status
      await (prisma as any).payment.update({
        where: { id: payment.id },
        data: {
          status: 'COMPLETED',
          processedAt: new Date(),
          gatewayResponse: chargeData
        }
      });

      // Update booking status to confirmed
      await (prisma as any).booking.update({
        where: { id: payment.bookingId },
        data: {
          status: 'CONFIRMED',
          confirmedAt: new Date()
        }
      });

      console.log(`✅ Payment completed for booking: ${payment.bookingId}`);

      // TODO: Send confirmation email
      // await EmailService.sendBookingConfirmation(payment.booking);

    } catch (error) {
      console.error('Error handling charge complete:', error);
      throw error;
    }
  }

  // ❌ Handle failed charge
  private static async handleChargeFailed(payment: any, chargeData: any): Promise<void> {
    try {
      // Update payment status
      await (prisma as any).payment.update({
        where: { id: payment.id },
        data: {
          status: 'FAILED',
          processedAt: new Date(),
          failureMessage: chargeData.failure_message || 'Payment failed',
          gatewayResponse: chargeData
        }
      });

      // Update booking status to failed
      await (prisma as any).booking.update({
        where: { id: payment.bookingId },
        data: {
          status: 'PAYMENT_FAILED'
        }
      });

      console.log(`❌ Payment failed for booking: ${payment.bookingId}`);

      // TODO: Send failure notification
      // await EmailService.sendPaymentFailureNotification(payment.booking);

    } catch (error) {
      console.error('Error handling charge failed:', error);
      throw error;
    }
  }

  // 🔄 Handle refund creation
  private static async handleRefundCreate(payment: any, chargeData: any): Promise<void> {
    try {
      // Create refund record
      await (prisma as any).refund.create({
        data: {
          paymentId: payment.id,
          amount: chargeData.amount,
          currency: chargeData.currency,
          status: 'PROCESSED',
          refundReason: 'Webhook processed refund',
          processedAt: new Date(),
          gatewayResponse: chargeData
        }
      });

      // Update payment status
      await (prisma as any).payment.update({
        where: { id: payment.id },
        data: {
          status: 'REFUNDED',
          gatewayResponse: chargeData
        }
      });

      console.log(`🔄 Refund created for payment: ${payment.id}`);

    } catch (error) {
      console.error('Error handling refund create:', error);
      throw error;
    }
  }

  // 🔍 Verify payment against Omise directly
  static async verifyPaymentWithOmise(req: Request, res: Response): Promise<void> {
    try {
      const { paymentId } = req.params;

      // Get payment from database
      const payment = await (prisma as any).payment.findUnique({
        where: { id: paymentId },
        include: {
          booking: true
        }
      });

      if (!payment) {
        res.status(404).json({
          error: 'Payment not found',
          paymentId
        });
        return;
      }

      if (!payment.omiseChargeId) {
        res.status(400).json({
          error: 'Payment has no Omise charge ID',
          paymentId
        });
        return;
      }

      // Verify with Omise
      const omiseCharge = await omise.charges.retrieve(payment.omiseChargeId);
      
      // Compare statuses
      const dbStatus = payment.status;
      const omiseStatus = omiseCharge.status;
      const omisePaid = omiseCharge.paid;

      // Check for discrepancies
      const isConsistent = PaymentVerificationController.checkStatusConsistency(
        dbStatus, 
        omiseStatus, 
        omisePaid
      );

      res.status(200).json({
        success: true,
        paymentId,
        verification: {
          consistent: isConsistent,
          database: {
            status: dbStatus,
            amount: payment.amount.toString(),
            processedAt: payment.processedAt
          },
          omise: {
            status: omiseStatus,
            paid: omisePaid,
            amount: omiseCharge.amount,
            authorized: omiseCharge.authorized,
            captured: omiseCharge.captured,
            created: omiseCharge.created
          },
          discrepancies: isConsistent ? [] : [
            `DB status: ${dbStatus}, Omise status: ${omiseStatus}, Omise paid: ${omisePaid}`
          ]
        }
      });

    } catch (error) {
      console.error('❌ Payment verification error:', error);
      res.status(500).json({
        error: 'Payment verification failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // 🔍 Check status consistency between DB and Omise
  private static checkStatusConsistency(
    dbStatus: string, 
    omiseStatus: string, 
    omisePaid: boolean
  ): boolean {
    // Define status mapping
    const statusMap: Record<string, { omiseStatus: string; omisePaid: boolean }> = {
      'COMPLETED': { omiseStatus: 'successful', omisePaid: true },
      'FAILED': { omiseStatus: 'failed', omisePaid: false },
      'PENDING': { omiseStatus: 'pending', omisePaid: false },
      'REFUNDED': { omiseStatus: 'successful', omisePaid: false } // Refunded charges show as successful but not paid
    };

    const expected = statusMap[dbStatus];
    if (!expected) return false;

    return expected.omiseStatus === omiseStatus && expected.omisePaid === omisePaid;
  }

  // 📊 Get payment audit trail
  static async getPaymentAuditTrail(req: Request, res: Response): Promise<void> {
    try {
      const { paymentId } = req.params;

      // Get payment with all related data
      const payment = await (prisma as any).payment.findUnique({
        where: { id: paymentId },
        include: {
          booking: {
            include: {
              user: true,
              room: true
            }
          }
        }
      });

      if (!payment) {
        res.status(404).json({
          error: 'Payment not found',
          paymentId
        });
        return;
      }

      // Get webhook events for this payment
      const webhookEvents = await (prisma as any).webhookEvent.findMany({
        where: {
          payload: {
            path: ['data', 'id'],
            equals: payment.omiseChargeId
          }
        },
        orderBy: { receivedAt: 'asc' }
      });

      // Get email logs
      const emailLogs = await (prisma as any).emailLog.findMany({
        where: { bookingId: payment.bookingId },
        orderBy: { createdAt: 'asc' }
      });

      res.status(200).json({
        success: true,
        payment: {
          id: payment.id,
          bookingId: payment.bookingId,
          amount: payment.amount.toString(),
          currency: payment.currency,
          status: payment.status,
          omiseChargeId: payment.omiseChargeId,
          createdAt: payment.createdAt,
          processedAt: payment.processedAt
        },
        booking: {
          id: payment.booking.id,
          checkInDate: payment.booking.checkInDate,
          checkOutDate: payment.booking.checkOutDate,
          status: payment.booking.status,
          totalAmount: payment.booking.totalAmount.toString(),
          guestName: `${payment.booking.user.firstName} ${payment.booking.user.lastName}`,
          guestEmail: payment.booking.user.email
        },
        auditTrail: {
          webhookEvents: webhookEvents.map((event: any) => ({
            eventId: event.webhookId,
            eventType: event.eventType,
            status: event.status,
            receivedAt: event.receivedAt,
            processedAt: event.processedAt,
            processingTimeMs: event.processingTimeMs
          })),
          emailLogs: emailLogs.map((log: any) => ({
            emailType: log.emailType,
            status: log.status,
            sentAt: log.sentAt,
            error: log.error
          }))
        }
      });

    } catch (error) {
      console.error('❌ Audit trail error:', error);
      res.status(500).json({
        error: 'Failed to get audit trail',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // 📈 Get webhook statistics
  static async getWebhookStats(req: Request, res: Response): Promise<void> {
    try {
      const { days = 7 } = req.query;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - Number(days));

      const stats = await (prisma as any).webhookEvent.groupBy({
        by: ['status'],
        where: {
          receivedAt: {
            gte: startDate
          }
        },
        _count: {
          status: true
        },
        _avg: {
          processingTimeMs: true
        }
      });

      const totalEvents = await (prisma as any).webhookEvent.count({
        where: {
          receivedAt: {
            gte: startDate
          }
        }
      });

      const lastEvent = await (prisma as any).webhookEvent.findFirst({
        orderBy: { receivedAt: 'desc' }
      });

      res.status(200).json({
        success: true,
        period: `Last ${days} days`,
        statistics: {
          totalEvents,
          breakdown: stats.reduce((acc: any, stat: any) => {
            acc[stat.status] = {
              count: stat._count.status,
              averageProcessingTime: Math.round(stat._avg.processingTimeMs || 0)
            };
            return acc;
          }, {}),
          lastEventAt: lastEvent?.receivedAt || null
        }
      });

    } catch (error) {
      console.error('❌ Webhook stats error:', error);
      res.status(500).json({
        error: 'Failed to get webhook statistics',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export default PaymentVerificationController;
