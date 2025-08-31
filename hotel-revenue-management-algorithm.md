# 🏨 Hotel Revenue Management Algorithm Design

## 🎯 Core Algorithm Components (โรงแรม Chain ระดับโลก)

### 1. Lead Time Pricing Matrix
```typescript
interface LeadTimePricing {
  leadTimeDays: number;
  priceMultiplier: number;
  riskFactor: number;
  demandPrediction: number;
}

const LEAD_TIME_RULES = [
  { days: [90, 365], multiplier: 0.65, name: "Super Early Bird" },
  { days: [60, 89], multiplier: 0.75, name: "Early Bird" },
  { days: [30, 59], multiplier: 0.85, name: "Advance Purchase" },
  { days: [14, 29], multiplier: 0.95, name: "Standard" },
  { days: [7, 13], multiplier: 1.15, name: "Short Notice" },
  { days: [3, 6], multiplier: 1.35, name: "Last Minute" },
  { days: [1, 2], multiplier: 1.65, name: "Same Day Premium" },
  { days: [0, 0], multiplier: 2.0, name: "Walk-in Rate" }
];
```

### 2. Demand Forecasting Algorithm
```typescript
interface DemandFactors {
  historical_patterns: number;      // 40% weight
  booking_pace: number;            // 25% weight
  market_events: number;           // 20% weight
  competitor_pricing: number;      // 10% weight
  economic_indicators: number;     // 5% weight
}

function calculateDemandScore(factors: DemandFactors): number {
  return (
    factors.historical_patterns * 0.40 +
    factors.booking_pace * 0.25 +
    factors.market_events * 0.20 +
    factors.competitor_pricing * 0.10 +
    factors.economic_indicators * 0.05
  );
}
```

### 3. Revenue Optimization Matrix
```typescript
interface PricingDecision {
  baseRate: number;
  leadTimeMultiplier: number;
  occupancyMultiplier: number;
  demandMultiplier: number;
  seasonalMultiplier: number;
  eventMultiplier: number;
  competitorAdjustment: number;
}

function calculateOptimalPrice(decision: PricingDecision): number {
  return decision.baseRate * 
         decision.leadTimeMultiplier * 
         decision.occupancyMultiplier * 
         decision.demandMultiplier * 
         decision.seasonalMultiplier * 
         decision.eventMultiplier * 
         (1 + decision.competitorAdjustment);
}
```

## 🎪 Advanced Strategies

### 1. Booking Pace Analysis
```typescript
interface BookingPace {
  actualBookings: number;
  forecastBookings: number;
  paceIndex: number; // actualBookings / forecastBookings
}

// Pace-based pricing adjustments
const PACE_ADJUSTMENTS = {
  "0.0-0.7": { multiplier: 0.85, action: "Aggressive Discount" },
  "0.7-0.9": { multiplier: 0.95, action: "Moderate Discount" },
  "0.9-1.1": { multiplier: 1.0, action: "Hold Rate" },
  "1.1-1.3": { multiplier: 1.15, action: "Moderate Increase" },
  "1.3+": { multiplier: 1.35, action: "Premium Pricing" }
};
```

### 2. Market Segmentation Pricing
```typescript
interface CustomerSegment {
  business: { priceElasticity: 0.3, multiplier: 1.2 };
  leisure: { priceElasticity: 0.8, multiplier: 0.9 };
  groups: { priceElasticity: 0.6, multiplier: 0.85 };
  corporate_contract: { priceElasticity: 0.1, multiplier: 1.0 };
}
```

### 3. Event-Driven Pricing
```typescript
interface EventImpact {
  event_type: string;
  distance_km: number;
  attendees: number;
  price_impact: number;
}

const EVENT_MULTIPLIERS = {
  "concert": { impact: 1.5, radius: 25 },
  "convention": { impact: 1.8, radius: 15 },
  "sports": { impact: 2.0, radius: 30 },
  "festival": { impact: 1.6, radius: 20 }
};
```

## 🔄 Real-time Adjustment Algorithm

### Dynamic Pricing Loop (runs every 15 minutes)
```typescript
function dynamicPricingLoop() {
  // 1. Collect real-time data
  const currentOccupancy = getCurrentOccupancy();
  const bookingPace = getBookingPace();
  const competitorRates = getCompetitorRates();
  
  // 2. Calculate demand score
  const demandScore = calculateDemandScore({
    occupancy: currentOccupancy,
    pace: bookingPace,
    competition: competitorRates
  });
  
  // 3. Apply pricing rules
  for (const roomType of roomTypes) {
    for (const date of next365Days) {
      const leadTime = calculateLeadTime(date);
      const newPrice = calculateOptimalPrice({
        baseRate: roomType.baseRate,
        leadTime: leadTime,
        demand: demandScore,
        occupancy: currentOccupancy
      });
      
      updatePrice(roomType.id, date, newPrice);
    }
  }
}
```

## 📊 Performance Metrics

### Key Performance Indicators (KPIs)
- **RevPAR** (Revenue Per Available Room)
- **ADR** (Average Daily Rate)
- **Occupancy Rate**
- **Booking Conversion Rate**
- **Rate Shopping Competitiveness**

### Success Measurements
```typescript
interface RevenueMetrics {
  revpar_growth: number;        // Target: +8-12% annually
  market_share: number;         // Target: Maintain or grow
  profit_margin: number;        // Target: 25-35%
  customer_satisfaction: number; // Target: >4.2/5.0
}
```

## 🏆 Industry Best Practices

### 1. Marriott's Algorithm Approach
- 365-day forward pricing
- 15-minute price updates
- Machine learning demand prediction
- Cross-property optimization

### 2. Hilton's Revenue Strategy
- Dynamic base rate adjustment
- Customer lifetime value integration
- Loyalty program pricing tiers
- Real-time market monitoring

### 3. IHG's Optimization Model
- Segment-specific pricing
- Channel optimization
- Group vs. transient balance
- Regional demand correlation

## ⚡ Implementation Recommendations

1. **Start Simple**: Implement lead time and occupancy-based rules first
2. **Data Quality**: Ensure accurate historical data collection
3. **Testing**: A/B testing for price sensitivity
4. **Integration**: Connect with all booking channels
5. **Monitoring**: Real-time performance dashboards
6. **Training**: Staff education on revenue management principles
