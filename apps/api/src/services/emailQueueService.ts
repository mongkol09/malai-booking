import { PrismaClient } from '@prisma/client';
import { 
  EmailType, 
  EmailStatus, 
  EmailQueueStatus,
  EmailQueue,
  EmailData
} from '../types/emailTypes';
import { emailService } from './emailService';

const prisma = new PrismaClient();

// ============================================
// EMAIL QUEUE SERVICE
// ============================================

export class EmailQueueService {
  private isProcessing = false;
  private processingInterval: NodeJS.Timeout | null = null;
  private lastLogTime: number = 0;

  constructor() {
    // Start queue processing on service initialization
    this.startQueueProcessor();
  }

  // ============================================
  // QUEUE MANAGEMENT
  // ============================================

  /**
   * เพิ่มอีเมลลงใน queue
   */
  async addToQueue(
    emailType: EmailType,
    recipientEmail: string,
    emailData: any,
    scheduledFor?: Date,
    bookingId?: string,
    priority: number = 5
  ): Promise<string> {
    try {
      console.log(`📥 Adding ${emailType} email to queue for ${recipientEmail}`);

      // For now, just log since EmailQueue model might not be migrated yet
      const queueItem = {
        id: `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        bookingId,
        emailType,
        recipientEmail,
        emailData,
        status: EmailQueueStatus.PENDING,
        retryCount: 0,
        maxRetries: 3,
        scheduledFor: scheduledFor || new Date(),
        priority,
        createdAt: new Date()
      };

      console.log('📋 Queue Item:', JSON.stringify(queueItem, null, 2));

      // TODO: Uncomment when EmailQueue model is ready
      // const result = await prisma.emailQueue.create({ data: queueItem });
      // return result.id;

      return queueItem.id;

    } catch (error) {
      console.error('❌ Error adding email to queue:', error);
      throw error;
    }
  }

  /**
   * เริ่มการประมวลผล queue
   */
  startQueueProcessor(): void {
    if (this.processingInterval) return;

    console.log('🚀 Starting email queue processor...');

    this.processingInterval = setInterval(async () => {
      if (!this.isProcessing) {
        await this.processQueue();
      }
    }, 30000); // Process every 30 seconds

    // Also process immediately
    this.processQueue();
  }

  /**
   * หยุดการประมวลผล queue
   */
  stopQueueProcessor(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
      console.log('⏹️ Email queue processor stopped');
    }
  }

  /**
   * ประมวลผล queue items ที่รอการส่ง
   */
  async processQueue(): Promise<void> {
    if (this.isProcessing) return;

    this.isProcessing = true;

    try {
      // Only log once every 5 minutes to reduce noise
      const now = Date.now();
      if (!this.lastLogTime || (now - this.lastLogTime) > 5 * 60 * 1000) {
        console.log('📝 Email queue service ready - waiting for EmailQueue model migration');
        this.lastLogTime = now;
      }

      // TODO: Check if EmailQueue model is available
      // For now, skip processing since model is not migrated yet
      return;

      // TODO: Implement actual queue processing when EmailQueue model is ready
      // For now, just log
      console.log('📝 Queue processing would fetch pending emails and send them');

      // Simulated queue processing logic:
      /*
      const pendingEmails = await prisma.emailQueue.findMany({
        where: {
          status: EmailQueueStatus.PENDING,
          scheduledFor: { lte: new Date() }
        },
        orderBy: [
          { priority: 'asc' },
          { scheduledFor: 'asc' }
        ],
        take: 10 // Process 10 emails at a time
      });

      for (const email of pendingEmails) {
        await this.processQueueItem(email);
      }
      */

    } catch (error) {
      console.error('❌ Error processing email queue:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * ประมวลผล queue item เดียว
   */
  async processQueueItem(queueItem: any): Promise<void> {
    try {
      console.log(`📤 Processing queue item: ${queueItem.id}`);

      // Update status to processing
      // await this.updateQueueItemStatus(queueItem.id, EmailQueueStatus.PROCESSING);

      // Prepare email data
      const emailData: EmailData = {
        type: queueItem.emailType,
        to: queueItem.recipientEmail,
        toName: queueItem.emailData.guest_name || queueItem.recipientEmail,
        subject: this.generateSubject(queueItem.emailType, queueItem.emailData),
        templateData: queueItem.emailData
      };

      // Add template ID if available
      const templateId = this.getTemplateId(queueItem.emailType);
      if (templateId) {
        emailData.templateId = templateId;
      }

      // Send email
      const result = await emailService.sendTemplateEmail(emailData);

      if (result.success) {
        // Mark as sent
        // await this.updateQueueItemStatus(queueItem.id, EmailQueueStatus.SENT);
        
        // Log success
        await emailService.logEmail(
          queueItem.recipientEmail,
          queueItem.emailType,
          EmailStatus.SENT,
          result.messageId,
          undefined,
          queueItem.bookingId
        );

        console.log(`✅ Queue item ${queueItem.id} sent successfully`);

      } else {
        // Handle failure
        await this.handleQueueItemFailure(queueItem, result.error || 'Unknown email sending error');
      }

    } catch (error) {
      console.error(`❌ Error processing queue item ${queueItem.id}:`, error);
      await this.handleQueueItemFailure(queueItem, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * จัดการกับ queue item ที่ส่งไม่สำเร็จ
   */
  async handleQueueItemFailure(queueItem: any, error: string): Promise<void> {
    const newRetryCount = queueItem.retryCount + 1;

    if (newRetryCount < queueItem.maxRetries) {
      // Schedule for retry
      const retryDelay = Math.pow(2, newRetryCount) * 5; // Exponential backoff: 5, 10, 20 minutes
      const nextRetry = new Date(Date.now() + retryDelay * 60 * 1000);

      console.log(`⚠️ Queue item ${queueItem.id} failed, retrying in ${retryDelay} minutes`);

      // TODO: Update queue item for retry
      /*
      await prisma.emailQueue.update({
        where: { id: queueItem.id },
        data: {
          status: EmailQueueStatus.PENDING,
          retryCount: newRetryCount,
          scheduledFor: nextRetry,
          error: error,
          lastAttempt: new Date()
        }
      });
      */

    } else {
      // Max retries reached
      console.log(`❌ Queue item ${queueItem.id} reached max retries, marking as failed`);

      // await this.updateQueueItemStatus(queueItem.id, EmailQueueStatus.MAX_RETRIES_REACHED);

      // Log final failure
      await emailService.logEmail(
        queueItem.recipientEmail,
        queueItem.emailType,
        EmailStatus.FAILED,
        undefined,
        error,
        queueItem.bookingId
      );
    }
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  /**
   * สร้าง subject สำหรับอีเมลแต่ละประเภท
   */
  private generateSubject(emailType: EmailType, emailData: any): string {
    const hotelName = process.env.FROM_NAME || 'Malai Khaoyai Resort';
    
    switch (emailType) {
      case EmailType.BOOKING_CONFIRMATION:
        return `ยืนยันการจอง ${emailData.booking_reference} | ${hotelName}`;
      case EmailType.PAYMENT_RECEIPT:
        return `ใบเสร็จการชำระเงิน ${emailData.payment_reference} | ${hotelName}`;
      case EmailType.CHECKIN_REMINDER:
        return `แจ้งเตือนการเช็คอิน - ${emailData.reminder_type} | ${hotelName}`;
      case EmailType.CHECKOUT_REMINDER:
        return `แจ้งเตือนการเช็คเอาท์ | ${hotelName}`;
      case EmailType.BOOKING_AMENDMENT:
        return `แจ้งเปลี่ยนแปลงการจอง ${emailData.booking_reference} | ${hotelName}`;
      case EmailType.REFUND_CONFIRMATION:
        return `ยืนยันการคืนเงิน ${emailData.refund_reference} | ${hotelName}`;
      default:
        return `${hotelName} - Notification`;
    }
  }

  /**
   * ดึง template ID สำหรับอีเมลแต่ละประเภท
   */
  private getTemplateId(emailType: EmailType): string | undefined {
    const templateIds: Record<string, string | undefined> = {
      [EmailType.BOOKING_CONFIRMATION]: process.env.BOOKING_CONFIRMATION_TEMPLATE_ID,
      [EmailType.PAYMENT_RECEIPT]: process.env.PAYMENT_RECEIPT_TEMPLATE_ID,
      [EmailType.CHECKIN_REMINDER]: process.env.CHECKIN_REMINDER_TEMPLATE_ID,
      [EmailType.CHECKOUT_REMINDER]: process.env.CHECKOUT_REMINDER_TEMPLATE_ID,
    };

    return templateIds[emailType];
  }

  /**
   * อัพเดตสถานะของ queue item
   */
  private async updateQueueItemStatus(id: string, status: EmailQueueStatus): Promise<void> {
    try {
      console.log(`📝 Updating queue item ${id} status to ${status}`);
      
      // TODO: Uncomment when EmailQueue model is ready
      /*
      await prisma.emailQueue.update({
        where: { id },
        data: { 
          status,
          lastAttempt: new Date()
        }
      });
      */
      
    } catch (error) {
      console.error('❌ Error updating queue item status:', error);
    }
  }

  // ============================================
  // QUEUE STATISTICS & MANAGEMENT
  // ============================================

  /**
   * ดูสถิติ queue
   */
  async getQueueStats(): Promise<any> {
    try {
      console.log('📊 Fetching queue statistics...');

      // TODO: Implement actual queue stats
      return {
        pending: 0,
        processing: 0,
        sent: 0,
        failed: 0,
        maxRetriesReached: 0,
        message: 'Queue statistics will be available after EmailQueue model migration'
      };

    } catch (error) {
      console.error('❌ Error fetching queue stats:', error);
      return { error: 'Failed to fetch queue statistics' };
    }
  }

  /**
   * ลบ queue items เก่าที่ส่งแล้ว
   */
  async cleanupOldQueueItems(olderThanDays: number = 7): Promise<void> {
    try {
      const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);
      
      console.log(`🧹 Cleaning up queue items older than ${olderThanDays} days`);

      // TODO: Implement actual cleanup
      /*
      const result = await prisma.emailQueue.deleteMany({
        where: {
          status: EmailQueueStatus.SENT,
          createdAt: { lt: cutoffDate }
        }
      });

      console.log(`✅ Cleaned up ${result.count} old queue items`);
      */

    } catch (error) {
      console.error('❌ Error cleaning up queue items:', error);
    }
  }

  /**
   * ส่งอีเมลทันทีโดยไม่ผ่าน queue (สำหรับการทดสอบ)
   */
  async sendImmediately(
    emailType: EmailType,
    recipientEmail: string,
    emailData: any
  ): Promise<any> {
    try {
      console.log(`🚀 Sending ${emailType} email immediately to ${recipientEmail}`);

      const emailParams: EmailData = {
        to: recipientEmail,
        toName: emailData.guest_name || recipientEmail,
        subject: this.generateSubject(emailType, emailData),
        templateData: emailData,
        type: emailType
      };

      // Add template ID if available
      const templateId = this.getTemplateId(emailType);
      if (templateId) {
        emailParams.templateId = templateId;
      }

      const result = await emailService.sendTemplateEmail(emailParams);

      // Log the result
      await emailService.logEmail(
        recipientEmail,
        emailType,
        result.success ? EmailStatus.SENT : EmailStatus.FAILED,
        result.messageId,
        result.error
      );

      return result;

    } catch (error) {
      console.error('❌ Error sending email immediately:', error);
      throw error;
    }
  }
}

// ============================================
// SINGLETON EXPORT
// ============================================

export const emailQueueService = new EmailQueueService();
export default emailQueueService;
