import { Request, Response } from 'express';
import axios from 'axios';
import { DualBotTelegramService } from '../services/dualBotTelegramService';

// Initialize Dual Bot Service with environment variables
const dualBotService = new DualBotTelegramService();

// Legacy support - will be removed after migration
const HOUSEKEEPING_BOT_TOKEN = '8236751083:AAGOS9YE_VdOo-mBQ3cMQ9dr1DYRXdzbNgI';
const TELEGRAM_API_URL = `https://api.telegram.org/bot${HOUSEKEEPING_BOT_TOKEN}`;
const HOUSEKEEPING_CHAT_ID = process.env.STAFF_TELEGRAM_CHAT_ID || process.env.HOUSEKEEPING_TELEGRAM_CHAT_ID || '-1001234567890';

/**
 * Send room cleaning notification to housekeeping staff
 */
export const sendCleaningNotification = async (req: Request, res: Response) => {
  try {
    const {
      roomNumber,
      roomType,
      guestName,
      checkOutTime,
      priority = 'normal',
      specialInstructions = ''
    } = req.body;

    console.log('📱 Sending housekeeping notification via Dual Bot System:', {
      roomNumber,
      roomType,
      priority
    });

    // Use new Dual Bot Service for Staff notifications
    const notificationData = {
      roomNumber,
      roomType,
      guestName,
      checkOutTime,
      priority: priority as 'high' | 'medium' | 'normal',
      specialInstructions
    };

    const result = await dualBotService.sendHousekeepingNotification(notificationData);
    let telegramResponse: any = null;

    if (!result) {
      // Fallback to legacy method if Dual Bot fails
      console.log('⚠️ Dual Bot failed, falling back to legacy method...');
      
      const priorityEmoji = priority === 'high' ? '🔴' : priority === 'medium' ? '🟡' : '🟢';
      const timestamp = new Date().toLocaleString('th-TH', {
        timeZone: 'Asia/Bangkok',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });

      const message = `
🧹 *แจ้งเตือนทำความสะอาดห้อง*

${priorityEmoji} *ห้อง: ${roomNumber}*
🏠 ประเภทห้อง: ${roomType}
👤 ลูกค้า: ${guestName}
🚪 เช็คเอาท์: ${checkOutTime}
⏰ เวลาแจ้งเตือน: ${timestamp}
📊 ระดับความสำคัญ: ${priority === 'high' ? 'สูง' : priority === 'medium' ? 'ปานกลาง' : 'ปกติ'}

${specialInstructions ? `📝 *คำแนะนำพิเศษ:*\n${specialInstructions}\n` : ''}
✅ กรุณาทำความสะอาดห้องและอัปเดตสถานะเมื่อเสร็จสิ้น

#RoomCleaning #Room${roomNumber} #${priority}Priority
      `.trim();

      // Send to Telegram (legacy method)
      telegramResponse = await axios.post(`${TELEGRAM_API_URL}/sendMessage`, {
        chat_id: HOUSEKEEPING_CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
        disable_web_page_preview: true
      });
    }

    console.log('✅ Housekeeping notification sent successfully');

    // Log the notification for tracking (only if legacy method was used)
    if (telegramResponse) {
      await logNotification({
        type: 'room_cleaning',
        roomNumber,
        priority,
        chatId: HOUSEKEEPING_CHAT_ID,
        messageId: telegramResponse.data.result.message_id,
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      message: 'Cleaning notification sent successfully',
      data: {
        roomNumber,
        chatId: HOUSEKEEPING_CHAT_ID,
        messageId: telegramResponse?.data?.result?.message_id || 'dual-bot-message',
        sentAt: new Date().toLocaleString('th-TH')
      }
    });

  } catch (error) {
    console.error('❌ Error sending housekeeping notification:', error);
    
    // Log the error but don't fail the check-out process
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to send cleaning notification',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
};

/**
 * Send multiple room cleaning notifications
 */
export const sendBulkCleaningNotifications = async (req: Request, res: Response) => {
  try {
    const { rooms } = req.body;
    
    if (!Array.isArray(rooms) || rooms.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Rooms array is required' }
      });
    }

    console.log(`📱 Sending bulk housekeeping notifications for ${rooms.length} rooms`);

    const results = [];
    
    for (const room of rooms) {
      try {
        // Use the same notification logic for each room
        const notificationResult = await sendSingleRoomNotification(room);
        results.push({
          roomNumber: room.roomNumber,
          success: true,
          messageId: notificationResult.messageId
        });
      } catch (error) {
        console.error(`❌ Failed to send notification for room ${room.roomNumber}:`, error);
        results.push({
          roomNumber: room.roomNumber,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.length - successCount;

    res.json({
      success: failCount === 0,
      message: `Sent ${successCount} notifications successfully${failCount > 0 ? `, ${failCount} failed` : ''}`,
      data: {
        total: results.length,
        successful: successCount,
        failed: failCount,
        results
      }
    });

  } catch (error) {
    console.error('❌ Error sending bulk housekeeping notifications:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to send bulk cleaning notifications',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
};

/**
 * Get dual bot system status
 */
export const getHousekeepingBotStatus = async (req: Request, res: Response) => {
  try {
    console.log('🤖 Checking dual bot system status...');
    
    // Get status from Dual Bot Service
    const dualBotStatus = dualBotService.getBotStatus();
    
    // Test both bots
    const testResults = await dualBotService.testBothBots();
    
    res.json({
      success: true,
      data: {
        dualBotSystem: {
          ceo: {
            ...dualBotStatus.ceo,
            testResult: testResults.ceo ? '✅ Connected' : '❌ Failed'
          },
          staff: {
            ...dualBotStatus.staff,
            testResult: testResults.staff ? '✅ Connected' : '❌ Failed'
          }
        },
        legacy: {
          token: HOUSEKEEPING_BOT_TOKEN ? '✅ Available' : '❌ Missing',
          chatId: HOUSEKEEPING_CHAT_ID !== '-1001234567890' ? '✅ Configured' : '⚠️ Default placeholder'
        },
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error checking dual bot status:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to check dual bot status',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
};

/**
 * Test both CEO and Staff bots
 */
export const testDualBots = async (req: Request, res: Response) => {
  try {
    console.log('🧪 Testing dual bot system...');
    
    const testResults = await dualBotService.testBothBots();
    
    res.json({
      success: true,
      message: 'Dual bot test completed',
      data: {
        ceo: {
          sent: testResults.ceo,
          status: testResults.ceo ? '✅ Working' : '❌ Failed'
        },
        staff: {
          sent: testResults.staff,
          status: testResults.staff ? '✅ Working' : '❌ Failed'
        },
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error testing dual bots:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to test dual bots',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
};

/**
 * Send test booking notification to both bots
 */
export const testBookingNotification = async (req: Request, res: Response) => {
  try {
    console.log('📋 Testing booking notification on both bots...');
    
    const testBookingData = {
      bookingReferenceId: 'TEST_' + Date.now(),
      customerName: 'คุณทดสอบ ระบบ',
      firstName: 'ทดสอบ',
      lastName: 'ระบบ',
      email: 'test@malairesort.com',
      phone: '081-234-5678',
      roomType: 'Grand Serenity Suite',
      roomNumber: 'A101',
      checkIn: new Date(),
      checkOut: new Date(Date.now() + 24 * 60 * 60 * 1000), // +1 day
      totalPrice: '3500',
      paymentStatus: 'ทดสอบระบบ',
      specialRequests: 'การทดสอบระบบ Dual Bot',
      vip: false
    };
    
    const results = await dualBotService.sendBookingNotification(testBookingData);
    
    res.json({
      success: true,
      message: 'Test booking notification sent',
      data: {
        ceo: {
          sent: results.ceo,
          message: 'Executive level notification (full data)',
          status: results.ceo ? '✅ Sent' : '❌ Failed'
        },
        staff: {
          sent: results.staff,
          message: 'Operational level notification (filtered data)',
          status: results.staff ? '✅ Sent' : '❌ Failed'
        },
        testData: testBookingData,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error testing booking notification:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to test booking notification',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
};

/**
 * Helper function to send notification for a single room
 */
async function sendSingleRoomNotification(roomData: any) {
  const {
    roomNumber,
    roomType,
    guestName,
    checkOutTime,
    priority = 'normal',
    specialInstructions = ''
  } = roomData;

  const priorityEmoji = priority === 'high' ? '🔴' : priority === 'medium' ? '🟡' : '🟢';
  const timestamp = new Date().toLocaleString('th-TH', {
    timeZone: 'Asia/Bangkok'
  });

  const message = `
🧹 *แจ้งเตือนทำความสะอาดห้อง*

${priorityEmoji} *ห้อง: ${roomNumber}*
🏠 ประเภทห้อง: ${roomType}
👤 ลูกค้า: ${guestName}
🚪 เช็คเอาท์: ${checkOutTime}
⏰ เวลาแจ้งเตือน: ${timestamp}

${specialInstructions ? `📝 *คำแนะนำพิเศษ:*\n${specialInstructions}\n` : ''}
✅ กรุณาทำความสะอาดห้องและอัปเดตสถานะเมื่อเสร็จสิ้น

#RoomCleaning #Room${roomNumber}
  `.trim();

  const telegramResponse = await axios.post(`${TELEGRAM_API_URL}/sendMessage`, {
    chat_id: HOUSEKEEPING_CHAT_ID,
    text: message,
    parse_mode: 'Markdown',
    disable_web_page_preview: true
  });

  return {
    messageId: telegramResponse.data.result.message_id,
    sentAt: timestamp
  };
}

/**
 * Log notification for tracking purposes
 */
async function logNotification(data: any) {
  try {
    // TODO: Store in database for tracking
    console.log('📝 Logging notification:', data);
    
    // This could be saved to a notifications table or ML data collection
    // For now, just log to console
    
  } catch (error) {
    console.error('⚠️ Failed to log notification:', error);
    // Don't throw error - logging is optional
  }
}
