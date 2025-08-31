import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { validationResult } from 'express-validator';

const prisma = new PrismaClient();

// ============================================
// STRATEGIC EVENT MANAGEMENT API
// ============================================

/**
 * GET /api/events/strategic/pending
 * ดึงรายการ events ที่รอการอนุมัติ
 */
export const getPendingEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, category, source } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const whereClause: any = {
      // status: 'PENDING_REVIEW' // จะใช้หลัง generate schema ใหม่
    };

    if (category && typeof category === 'string') {
      whereClause.category = category;
    }

    if (source && typeof source === 'string') {
      whereClause.source = source;
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where: whereClause,
        skip,
        take: Number(limit),
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.event.count({ where: whereClause })
    ]);

    res.json({
      success: true,
      data: {
        events,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching pending events:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * POST /api/events/strategic/aggregate
 * รวบรวม events จากแหล่งข้อมูลภายนอก
 */
export const aggregateExternalEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sources = ['GOOGLE_CALENDAR', 'TICKETMASTER_API'] } = req.body;
    
    // Simulate external API aggregation
    // ในการใช้งานจริงจะเชื่อมต่อกับ Google Calendar API, Ticketmaster API
    const aggregatedEvents = [];

    // Mock Google Calendar Events
    if (sources.includes('GOOGLE_CALENDAR')) {
      const googleEvents = [
        {
          title: 'Bangkok Marathon 2024',
          description: 'Annual marathon event affecting traffic',
          startTime: new Date('2024-12-15T06:00:00Z'),
          endTime: new Date('2024-12-15T12:00:00Z'),
          affectsPricing: true
        }
      ];
      aggregatedEvents.push(...googleEvents);
    }

    // Mock Ticketmaster Events
    if (sources.includes('TICKETMASTER_API')) {
      const ticketmasterEvents = [
        {
          title: 'Taylor Swift Concert',
          description: 'Major concert at Impact Arena',
          startTime: new Date('2024-12-20T19:00:00Z'),
          endTime: new Date('2024-12-20T23:00:00Z'),
          affectsPricing: true
        }
      ];
      aggregatedEvents.push(...ticketmasterEvents);
    }

    // บันทึก events ใหม่ลง database
    const createdEvents = [];
    for (const eventData of aggregatedEvents) {
      const newEvent = await prisma.event.create({
        data: {
          ...eventData
        }
      });
      createdEvents.push(newEvent);
    }

    res.json({
      success: true,
      message: `Aggregated ${createdEvents.length} new events`,
      data: {
        newEvents: createdEvents,
        totalAggregated: aggregatedEvents.length,
        sources
      }
    });

  } catch (error) {
    console.error('Error aggregating external events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to aggregate external events',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * GET /api/events/strategic/analytics
 * ดูสถิติ event management
 */
export const getEventAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { period = '30d' } = req.query;
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    const [
      totalEvents,
      recentEvents
    ] = await Promise.all([
      prisma.event.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      }),
      prisma.event.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      })
    ]);

    res.json({
      success: true,
      data: {
        summary: {
          totalEvents
        },
        recentEvents,
        period: {
          startDate,
          endDate,
          period
        }
      }
    });

  } catch (error) {
    console.error('Error fetching event analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event analytics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * POST /api/events/strategic/manual
 * สร้าง event ด้วยตนเอง
 */
export const createManualEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    const {
      title,
      description,
      startTime,
      endTime,
      location,
      affectsPricing = true,
      createdBy
    } = req.body;

    const newEvent = await prisma.event.create({
      data: {
        title,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        location,
        affectsPricing,
        createdBy
      }
    });

    res.status(201).json({
      success: true,
      message: 'Manual event created successfully',
      data: { event: newEvent }
    });

  } catch (error) {
    console.error('Error creating manual event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create manual event',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export default {
  getPendingEvents,
  aggregateExternalEvents,
  getEventAnalytics,
  createManualEvent
};
