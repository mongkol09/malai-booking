import { Router, Request, Response } from 'express';
import { requireRole } from '../middleware/validateApiKey';
import { getUpdatedNotificationService } from '../services/updatedNotificationService';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();
const notificationService = getUpdatedNotificationService();

// ============================================
// ADMIN NOTIFICATION ROUTES
// ============================================

// 🧪 ทดสอบระบบแจ้งเตือน (Public for testing)
router.post('/test', async (req: Request, res: Response) => {
  try {
    const results = await notificationService.testNotificationSystem();
    
    res.json({
      success: true,
      message: 'Notification test completed',
      data: results
    });
  } catch (error) {
    console.error('Notification test error:', error);
    res.status(500).json({
      success: false,
      message: 'Notification test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 📊 สถิติการแจ้งเตือน (Public for testing)
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = notificationService.getNotificationStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Notification stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notification stats',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 📜 ประวัติการแจ้งเตือน
router.get('/logs', requireRole(['ADMIN', 'STAFF']), async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '20', eventType } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where = eventType ? { eventType: eventType as string } : {};
    
    const [logs, total] = await Promise.all([
      prisma.notificationLog.findMany({
        where,
        orderBy: { sentAt: 'desc' },
        skip,
        take: parseInt(limit as string)
      }),
      prisma.notificationLog.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / parseInt(limit as string))
        }
      }
    });
  } catch (error) {
    console.error('Notification logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notification logs',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 🔔 ส่งการแจ้งเตือนด้วยตนเอง (Manual notification)
router.post('/send', requireRole(['ADMIN']), async (req: Request, res: Response) => {
  try {
    const { eventType, data, options } = req.body;

    if (!eventType || !data) {
      return res.status(400).json({
        success: false,
        message: 'eventType and data are required'
      });
    }

    const results = await notificationService.notifyAll(eventType, data, options);
    
    res.json({
      success: true,
      message: 'Manual notification sent',
      data: results
    });
  } catch (error) {
    console.error('Manual notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send manual notification',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 🏨 จำลอง events สำหรับทดสอบ (Public for testing)
router.post('/simulate/:eventType', async (req: Request, res: Response) => {
  try {
    const { eventType } = req.params;
    let simulatedData;

    switch (eventType) {
      case 'PaymentSuccessful':
        simulatedData = {
          paymentId: `sim_pay_${Date.now()}`,
          bookingId: `sim_book_${Date.now()}`,
          amount: 12500.00,
          paymentMethod: 'Credit Card',
          transactionTime: new Date().toISOString()
        };
        break;

      case 'NewBookingCreated':
        simulatedData = {
          bookingId: `sim_book_${Date.now()}`,
          roomNumber: '104',
          roomTypeName: 'Onsen Room',
          guestName: 'คุณสมชาย ใจดี (ทดสอบ)',
          checkinDate: '2025-08-20',
          checkoutDate: '2025-08-22',
          totalPrice: 12500.00,
          newStatus: 'Confirmed'
        };
        break;

      case 'GuestCheckIn':
        simulatedData = {
          bookingId: `sim_book_${Date.now()}`,
          guestName: 'คุณสมชาย ใจดี (ทดสอบ)',
          roomNumber: '104',
          checkInTime: new Date().toISOString()
        };
        break;

      case 'GuestCheckOut':
        simulatedData = {
          bookingId: `sim_book_${Date.now()}`,
          guestName: 'คุณสมชาย ใจดี (ทดสอบ)',
          roomNumber: '104',
          checkOutTime: new Date().toISOString(),
          additionalCharges: 500.00
        };
        break;

      case 'RoomStatusChange':
        simulatedData = {
          roomId: `sim_room_${Date.now()}`,
          roomNumber: '104',
          oldStatus: 'Occupied',
          newStatus: 'Dirty',
          notes: 'ทดสอบการเปลี่ยนสถานะห้อง'
        };
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid event type for simulation'
        });
    }

    const results = await notificationService.notifyAll(eventType, simulatedData);
    
    res.json({
      success: true,
      message: `Simulated ${eventType} notification sent`,
      data: {
        eventType,
        simulatedData,
        results
      }
    });
  } catch (error) {
    console.error('Simulation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to simulate notification',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
