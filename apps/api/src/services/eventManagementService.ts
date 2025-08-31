import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// AI-POWERED EVENT MANAGEMENT SERVICE
// ============================================

export interface AIAnalysisResult {
  eventImpactScore: number; // 0-1 scale
  suggestedPriceIncrease: number; // percentage
  reasoningFactors: string[];
  projectedRevenue: {
    baseRevenue: number;
    projectedRevenue: number;
    increasePercent: number;
  };
  confidence: number; // 0-1 scale
}

export interface EventAggregationSource {
  name: 'GOOGLE_CALENDAR' | 'TICKETMASTER_API' | 'EVENTBRITE_API' | 'FACEBOOK_EVENTS';
  enabled: boolean;
  lastSync?: Date;
  config?: Record<string, any>;
}

export class EventManagementService {
  
  /**
   * AI-powered event impact analysis
   */
  async analyzeEventImpact(eventId: string): Promise<AIAnalysisResult> {
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      throw new Error('Event not found');
    }

    // Mock AI analysis - ในการใช้งานจริงจะเชื่อมต่อกับ ML model
    const analysis = await this.performAIAnalysis(event);
    
    return analysis;
  }

  /**
   * Mock AI analysis (replace with actual AI/ML service)
   */
  private async performAIAnalysis(event: any): Promise<AIAnalysisResult> {
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock analysis based on event characteristics
    let impactScore = 0.5;
    let priceIncrease = 10;
    const factors: string[] = [];

    // Category-based analysis
    if (event.category?.includes('Concert')) {
      impactScore += 0.3;
      priceIncrease += 20;
      factors.push('Major entertainment event attracts tourists');
    }

    if (event.category?.includes('Festival')) {
      impactScore += 0.2;
      priceIncrease += 15;
      factors.push('Cultural festival increases local demand');
    }

    if (event.category?.includes('Sports')) {
      impactScore += 0.25;
      priceIncrease += 18;
      factors.push('Sports event brings regional visitors');
    }

    if (event.category?.includes('Holiday')) {
      impactScore += 0.15;
      priceIncrease += 12;
      factors.push('Public holiday period shows increased bookings');
    }

    // Time-based analysis
    const eventDate = new Date(event.startTime);
    const dayOfWeek = eventDate.getDay();
    
    if (dayOfWeek === 5 || dayOfWeek === 6) { // Friday or Saturday
      impactScore += 0.1;
      priceIncrease += 5;
      factors.push('Weekend event amplifies hotel demand');
    }

    // Duration analysis
    const duration = new Date(event.endTime).getTime() - new Date(event.startTime).getTime();
    const durationDays = duration / (1000 * 60 * 60 * 24);
    
    if (durationDays > 3) {
      impactScore += 0.15;
      priceIncrease += 10;
      factors.push('Multi-day event extends stay duration');
    }

    // Historical data simulation
    factors.push('Historical data shows 40% booking increase for similar events');
    factors.push('Competitor analysis suggests 20-30% price premium opportunity');

    // Calculate projected revenue
    const baseRevenue = 150000; // Mock base revenue
    const projectedRevenue = baseRevenue * (1 + priceIncrease / 100);

    return {
      eventImpactScore: Math.min(impactScore, 1),
      suggestedPriceIncrease: Math.min(priceIncrease, 50), // Cap at 50%
      reasoningFactors: factors,
      projectedRevenue: {
        baseRevenue,
        projectedRevenue,
        increasePercent: priceIncrease
      },
      confidence: Math.min(0.7 + (factors.length * 0.05), 0.95)
    };
  }

  /**
   * Generate dynamic pricing rule based on AI analysis
   */
  async generatePricingRule(eventId: string, analysis: AIAnalysisResult): Promise<any> {
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      throw new Error('Event not found');
    }

    const rule = await prisma.dynamicPricingRule.create({
      data: {
        name: `AI Event Pricing: ${event.title}`,
        description: `AI-generated pricing rule for ${event.title} (Confidence: ${(analysis.confidence * 100).toFixed(1)}%)`,
        priority: 1,
        isActive: false, // Will be activated after admin approval
        conditions: {
          eventId: event.id,
          eventCategory: event.category,
          dateRange: {
            start: event.startTime,
            end: event.endTime
          },
          aiAnalysis: {
            impactScore: analysis.eventImpactScore,
            confidence: analysis.confidence,
            factors: analysis.reasoningFactors
          }
        },
        action: {
          type: 'PERCENTAGE',
          value: analysis.suggestedPriceIncrease,
          maxIncrease: 50,
          roomTypes: ['all']
        },
        dateRangeStart: event.startTime,
        dateRangeEnd: event.endTime,
        roomTypes: ['deluxe', 'suite', 'standard', 'economy']
      }
    });

    return rule;
  }

  /**
   * Aggregate events from external sources
   */
  async aggregateFromSources(sources: EventAggregationSource[]): Promise<any[]> {
    const aggregatedEvents: any[] = [];

    for (const source of sources) {
      if (!source.enabled) continue;

      try {
        const events = await this.fetchFromSource(source);
        aggregatedEvents.push(...events);
      } catch (error) {
        console.error(`Failed to fetch from ${source.name}:`, error);
      }
    }

    return aggregatedEvents;
  }

  /**
   * Mock external API integration
   */
  private async fetchFromSource(source: EventAggregationSource): Promise<any[]> {
    // Mock data for different sources
    switch (source.name) {
      case 'GOOGLE_CALENDAR':
        return [
          {
            title: 'Thailand Tourism Festival 2024',
            description: 'Annual tourism promotion event',
            category: 'Tourism Festival',
            startTime: new Date('2024-12-15T09:00:00Z'),
            endTime: new Date('2024-12-17T22:00:00Z'),
            location: 'Central World, Bangkok',
            source: 'GOOGLE_CALENDAR',
            sourceEventId: `gcal_${Date.now()}`,
            affectsPricing: true
          }
        ];

      case 'TICKETMASTER_API':
        return [
          {
            title: 'International Music Festival',
            description: 'Three-day international music festival',
            category: 'Major Concert',
            startTime: new Date('2024-12-20T18:00:00Z'),
            endTime: new Date('2024-12-22T23:00:00Z'),
            location: 'Impact Arena, Bangkok',
            source: 'TICKETMASTER_API',
            sourceEventId: `tm_${Date.now()}`,
            affectsPricing: true
          }
        ];

      case 'EVENTBRITE_API':
        return [
          {
            title: 'Tech Conference Bangkok 2024',
            description: 'Annual technology conference',
            category: 'Business Conference',
            startTime: new Date('2024-12-10T08:00:00Z'),
            endTime: new Date('2024-12-12T18:00:00Z'),
            location: 'Queen Sirikit Convention Center',
            source: 'EVENTBRITE_API',
            sourceEventId: `eb_${Date.now()}`,
            affectsPricing: true
          }
        ];

      case 'FACEBOOK_EVENTS':
        return [
          {
            title: 'Bangkok Street Food Festival',
            description: 'Local street food celebration',
            category: 'Local Festival',
            startTime: new Date('2024-12-08T16:00:00Z'),
            endTime: new Date('2024-12-08T23:00:00Z'),
            location: 'Chatuchak Park',
            source: 'FACEBOOK_EVENTS',
            sourceEventId: `fb_${Date.now()}`,
            affectsPricing: true
          }
        ];

      default:
        return [];
    }
  }

  /**
   * Process and save aggregated events
   */
  async processAggregatedEvents(events: any[]): Promise<any[]> {
    const processedEvents: any[] = [];

    for (const eventData of events) {
      try {
        // Check if event already exists
        const existingEvent = await prisma.event.findFirst({
          where: {
            OR: [
              { sourceEventId: eventData.sourceEventId },
              {
                AND: [
                  { title: eventData.title },
                  { startTime: eventData.startTime }
                ]
              }
            ]
          }
        });

        if (existingEvent) {
          console.log(`Event already exists: ${eventData.title}`);
          continue;
        }

        // Create new event
        const newEvent = await prisma.event.create({
          data: {
            title: eventData.title,
            description: eventData.description,
            category: eventData.category,
            startTime: eventData.startTime,
            endTime: eventData.endTime,
            location: eventData.location,
            source: eventData.source,
            sourceEventId: eventData.sourceEventId,
            affectsPricing: eventData.affectsPricing,
            status: 'PENDING_REVIEW',
            suggestionDetails: JSON.stringify({
              aggregatedAt: new Date(),
              source: eventData.source,
              needsAIAnalysis: true
            })
          }
        });

        processedEvents.push(newEvent);

        // Trigger AI analysis for pricing-affecting events
        if (newEvent.affectsPricing) {
          this.scheduleAIAnalysis(newEvent.id);
        }

      } catch (error) {
        console.error(`Failed to process event ${eventData.title}:`, error);
      }
    }

    return processedEvents;
  }

  /**
   * Schedule AI analysis for an event (async)
   */
  private async scheduleAIAnalysis(eventId: string): Promise<void> {
    // In production, this would queue the job for background processing
    setTimeout(async () => {
      try {
        const analysis = await this.analyzeEventImpact(eventId);
        const rule = await this.generatePricingRule(eventId, analysis);
        
        await prisma.event.update({
          where: { id: eventId },
          data: {
            suggestedPricingRuleId: rule.id,
            suggestionDetails: JSON.stringify({
              aiAnalysis: analysis,
              analyzedAt: new Date(),
              needsReview: true
            }),
            projectedImpact: analysis.projectedRevenue
          }
        });

        console.log(`✅ AI analysis completed for event ${eventId}`);
      } catch (error) {
        console.error(`❌ AI analysis failed for event ${eventId}:`, error);
      }
    }, 2000); // Simulate 2-second processing delay
  }

  /**
   * Get events pending review with AI analysis
   */
  async getPendingReviewEvents(): Promise<any[]> {
    return await prisma.event.findMany({
      where: { 
        status: 'PENDING_REVIEW',
        suggestedPricingRuleId: { not: null }
      },
      include: {
        suggestedPricingRule: true,
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
    });
  }

  /**
   * Approve or reject event with AI suggestion
   */
  async reviewEvent(eventId: string, decision: 'CONFIRMED' | 'REJECTED', reviewerId: string, notes?: string): Promise<any> {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { suggestedPricingRule: true }
    });

    if (!event) {
      throw new Error('Event not found');
    }

    if (event.status !== 'PENDING_REVIEW') {
      throw new Error('Event has already been reviewed');
    }

    // Update event status
    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        status: decision,
        reviewedByStaffId: reviewerId,
        reviewedAt: new Date(),
        suggestionDetails: event.suggestionDetails ? 
          JSON.stringify({
            ...JSON.parse(event.suggestionDetails as string),
            reviewDecision: decision,
            reviewNotes: notes,
            reviewedAt: new Date()
          }) : JSON.stringify({ reviewDecision: decision, reviewNotes: notes })
      }
    });

    // Activate or deactivate pricing rule based on decision
    if (event.suggestedPricingRule) {
      await prisma.dynamicPricingRule.update({
        where: { id: event.suggestedPricingRule.id },
        data: { isActive: decision === 'CONFIRMED' }
      });
    }

    return updatedEvent;
  }
}

export default new EventManagementService();
