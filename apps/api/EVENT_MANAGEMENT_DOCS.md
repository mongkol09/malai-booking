# AI-Powered Event Management System

## Overview

ระบบ Event Management ที่ใช้ AI ในการวิเคราะห์และแนะนำการปรับราคาโดยอัตโนมัติ เมื่อมี events สำคัญที่อาจส่งผลต่อความต้องการของลูกค้า

## Features

### 🤖 AI-Powered Analysis
- วิเคราะห์ impact ของ event ต่อความต้องการของโรงแรม
- แนะนำการปรับราคาอัตโนมัติ พร้อมเหตุผล
- คำนวณ projected revenue ที่คาดว่าจะได้รับ

### 📊 Multi-Source Event Aggregation
- รวบรวม events จาก Google Calendar API
- รวบรวม events จาก Ticketmaster API
- รวบรวม events จาก Facebook Events
- รวบรวม events จาก Eventbrite API
- สร้าง events ด้วยตนเอง

### 👨‍💼 Admin Review Workflow
- Admin สามารถอนุมัติ/ปฏิเสธ event recommendations
- ระบบ audit trail สำหรับการตัดสินใจทุกครั้ง
- Dashboard สำหรับติดตาม event pipeline

### 📈 Analytics & Reporting
- สถิติการอนุมัติ events
- Revenue impact tracking
- Event source performance

## Database Schema

### Updated Event Model
```prisma
model Event {
  id                        String   @id @default(uuid())
  title                     String
  description               String?
  category                  String?  // 'Public Holiday', 'Major Concert', etc.
  startTime                 DateTime
  endTime                   DateTime
  location                  String?
  affectsPricing           Boolean  @default(false)
  
  // AI-Powered Fields
  source                   String   @default("MANUAL") // 'GOOGLE_CALENDAR', 'TICKETMASTER_API'
  sourceEventId           String?  @unique
  status                  EventStatus @default(PENDING_REVIEW)
  suggestedPricingRuleId  String?
  suggestionDetails       String?  // AI explanation JSON
  projectedImpact         Json?    // Revenue projections
  reviewedByStaffId       String?
  reviewedAt              DateTime?
  
  // Relations
  suggestedPricingRule    DynamicPricingRule? @relation(...)
  reviewedByStaff         Staff? @relation(...)
}

enum EventStatus {
  PENDING_REVIEW
  CONFIRMED  
  REJECTED
}
```

## API Endpoints

### GET /api/v1/events/strategic/pending
ดึงรายการ events ที่รอการอนุมัติ

**Query Parameters:**
- `page` (number): หน้าที่ต้องการ (default: 1)
- `limit` (number): จำนวนรายการต่อหน้า (default: 10)  
- `category` (string): กรองตาม category
- `source` (string): กรองตาม source

**Response:**
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "id": "uuid",
        "title": "Taylor Swift Concert",
        "category": "Major Concert",
        "status": "PENDING_REVIEW",
        "suggestedPricingRule": {
          "name": "Event Pricing: Taylor Swift Concert",
          "action": { "type": "PERCENTAGE", "value": 25 }
        },
        "projectedImpact": {
          "baseRevenue": 150000,
          "projectedRevenue": 187500,
          "increasePercent": 25
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 15,
      "pages": 2
    }
  }
}
```

### POST /api/v1/events/strategic/aggregate
รวบรวม events จากแหล่งข้อมูลภายนอก

**Request Body:**
```json
{
  "sources": ["GOOGLE_CALENDAR", "TICKETMASTER_API"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Aggregated 3 new events",
  "data": {
    "newEvents": [...],
    "totalAggregated": 5,
    "sources": ["GOOGLE_CALENDAR", "TICKETMASTER_API"]
  }
}
```

### GET /api/v1/events/strategic/analytics  
ดูสถิติ event management

**Query Parameters:**
- `period` (string): ช่วงเวลา ('7d', '30d', '90d')

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalEvents": 25,
      "pendingReview": 5,
      "confirmedEvents": 18,
      "rejectedEvents": 2,
      "approvalRate": "90.0"
    },
    "distribution": {
      "bySource": [
        { "source": "GOOGLE_CALENDAR", "_count": 10 },
        { "source": "TICKETMASTER_API", "_count": 8 }
      ],
      "byCategory": [
        { "category": "Major Concert", "_count": 12 },
        { "category": "Sports Event", "_count": 6 }
      ]
    }
  }
}
```

### POST /api/v1/events/strategic/manual
สร้าง event ด้วยตนเอง

**Request Body:**
```json
{
  "title": "Special Corporate Event",
  "description": "Large corporate conference",
  "startTime": "2024-12-25T10:00:00Z",
  "endTime": "2024-12-25T18:00:00Z",
  "location": "Conference Hall",
  "affectsPricing": true,
  "createdBy": "staff-uuid"
}
```

## AI Analysis Process

### 1. Event Impact Scoring
AI วิเคราะห์ปัจจัยต่าง ๆ เพื่อให้คะแนน impact (0-1):

- **Event Category**: Concert (+0.3), Festival (+0.2), Sports (+0.25)
- **Timing**: Weekend events (+0.1)
- **Duration**: Multi-day events (+0.15)
- **Historical Data**: Similar events performance
- **Competitor Analysis**: Market pricing

### 2. Price Recommendation
จากคะแนน impact จะแนะนำการปรับราคา:

- **High Impact (0.8+)**: 20-35% increase
- **Medium Impact (0.5-0.8)**: 10-20% increase  
- **Low Impact (0.3-0.5)**: 5-10% increase

### 3. Revenue Projection
คำนวณ projected revenue จาก:
- Base revenue (historical average)
- Suggested price increase
- Expected demand change
- Competitive landscape

## Usage Examples

### 1. Setting Up Event Aggregation
```javascript
// Configure event sources
const sources = [
  {
    name: 'GOOGLE_CALENDAR',
    enabled: true,
    config: {
      calendarId: 'bangkok-events@gmail.com',
      apiKey: 'your-google-api-key'
    }
  },
  {
    name: 'TICKETMASTER_API', 
    enabled: true,
    config: {
      apiKey: 'your-ticketmaster-key',
      market: 'TH',
      radius: '50km'
    }
  }
];

// Run aggregation
const response = await fetch('/api/v1/events/strategic/aggregate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ sources: sources.map(s => s.name) })
});
```

### 2. Processing AI Recommendations
```javascript
// Get pending events
const pending = await fetch('/api/v1/events/strategic/pending');
const events = await pending.json();

// Review each event
for (const event of events.data.events) {
  if (event.projectedImpact.increasePercent > 20) {
    console.log(`High impact event: ${event.title}`);
    console.log(`Suggested increase: ${event.projectedImpact.increasePercent}%`);
    console.log(`Projected revenue: $${event.projectedImpact.projectedRevenue}`);
  }
}
```

### 3. Manual Event Creation
```javascript
// Create special event
const newEvent = await fetch('/api/v1/events/strategic/manual', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'VIP Corporate Retreat',
    description: 'Exclusive 3-day corporate event',
    startTime: '2024-12-15T08:00:00Z',
    endTime: '2024-12-17T18:00:00Z', 
    location: 'Resort Conference Center',
    affectsPricing: true,
    createdBy: 'admin-uuid'
  })
});
```

## Deployment Steps

### 1. Database Migration
```bash
# Run migration script
node migrate-event-management.js

# Or manual migration
npx prisma db push
npx prisma generate
```

### 2. Environment Variables
```env
# Add to .env
GOOGLE_CALENDAR_API_KEY=your_key
TICKETMASTER_API_KEY=your_key
EVENTBRITE_API_KEY=your_key
FACEBOOK_APP_TOKEN=your_token

# AI Service (optional)
AI_SERVICE_URL=https://your-ai-service.com
AI_SERVICE_KEY=your_ai_key
```

### 3. Test the System
```bash
# Test event creation
curl -X POST http://localhost:3000/api/v1/events/strategic/manual \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Event","startTime":"2024-12-25T10:00:00Z","endTime":"2024-12-25T18:00:00Z"}'

# Test aggregation
curl -X POST http://localhost:3000/api/v1/events/strategic/aggregate \
  -H "Content-Type: application/json" \
  -d '{"sources":["GOOGLE_CALENDAR"]}'

# View analytics
curl http://localhost:3000/api/v1/events/strategic/analytics?period=30d
```

## Benefits

### 🚀 Revenue Optimization
- เพิ่มรายได้โดยอัตโนมัติเมื่อมี high-demand events
- ลดการพลาด revenue opportunities
- ปรับราคาแบบ data-driven

### ⏰ Time Savings  
- ไม่ต้องติดตาม events ด้วยตนเอง
- AI วิเคราะห์และแนะนำอัตโนมัติ
- Admin แค่อนุมัติ/ปฏิเสธ

### 📊 Better Decision Making
- ได้ข้อมูล impact analysis ครบถ้วน
- มี historical data สำหรับเปรียบเทียบ
- Track performance ของ pricing decisions

### 🔄 Scalability
- รองรับ event sources หลายแหล่ง
- ขยาย AI models ได้ง่าย
- Integrate กับ external services ได้

## Next Steps

1. **Deploy to Production**: ใช้ Railway deployment pipeline
2. **Integrate Real AI**: เชื่อมต่อกับ ML services จริง
3. **Add More Sources**: เพิ่ม event aggregation sources
4. **Frontend Dashboard**: สร้าง admin interface สำหรับ event review
5. **Mobile Notifications**: แจ้งเตือน pending events via mobile app

คุณพร้อมจะ deploy system นี้แล้วหรือต้องการปรับแต่งอะไรเพิ่มเติมไหม? 🚀
