// 🏨 Professional Hotel Pricing Rules Creation Script
// Based on industry standards from Marriott, Hilton, IHG

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const PROFESSIONAL_PRICING_RULES = [
  // 🎯 GROUP 1: STRATEGIC LEAD TIME RULES (Priority 1-10)
  {
    name: "Super Early Bird (90+ days)",
    description: "ลดราคา 25% สำหรับการจองล่วงหน้า 90 วันขึ้นไป - กลยุทธ์การันตีรายได้ล่วงหน้า",
    priority: 1,
    conditions: {
      and: [
        { lead_time_days: { gte: 90 } }
      ]
    },
    action: {
      type: "decrease_rate_by_percent",
      value: 25
    },
    category: "lead_time_optimization",
    urgencyLevel: "low"
  },
  
  {
    name: "Early Bird Discount (60-89 days)",
    description: "ลดราคา 15% สำหรับการจองล่วงหน้า 60-89 วัน - ส่งเสริมการจองล่วงหน้า",
    priority: 2,
    conditions: {
      and: [
        { lead_time_days: { gte: 60, lte: 89 } }
      ]
    },
    action: {
      type: "decrease_rate_by_percent",
      value: 15
    },
    category: "lead_time_optimization"
  },

  {
    name: "Advance Purchase (30-59 days)",
    description: "ลดราคา 8% สำหรับการจองล่วงหน้า 30-59 วัน - ราคาพิเศษสำหรับการวางแผนล่วงหน้า",
    priority: 3,
    conditions: {
      and: [
        { lead_time_days: { gte: 30, lte: 59 } }
      ]
    },
    action: {
      type: "decrease_rate_by_percent",
      value: 8
    },
    category: "lead_time_optimization"
  },

  // 🎪 GROUP 2: EVENT & HOLIDAY PREMIUMS (Priority 11-20)
  {
    name: "Holiday Premium",
    description: "เพิ่มราคา 40% สำหรับวันหยุดนักขัตฤกษ์ - ตามมาตรฐานอุตสาหกรรม",
    priority: 11,
    conditions: {
      and: [
        { is_holiday: { eq: true } }
      ]
    },
    action: {
      type: "increase_rate_by_percent",
      value: 40
    },
    category: "seasonal_premium"
  },

  {
    name: "Weekend Premium",
    description: "เพิ่มราคา 25% สำหรับวันหยุดสุดสัปดาห์ (ศุกร์-อาทิตย์)",
    priority: 12,
    conditions: {
      and: [
        { day_of_week: { in: [5, 6, 0] } } // Friday, Saturday, Sunday
      ]
    },
    action: {
      type: "increase_rate_by_percent",
      value: 25
    },
    category: "weekend_premium"
  },

  // 🎯 GROUP 3: OCCUPANCY-BASED YIELD MANAGEMENT (Priority 21-40)
  {
    name: "Peak Demand Pricing (95%+ occupancy)",
    description: "เพิ่มราคา 50% เมื่อห้องเต็มเกือบ 100% - Yield Management สูงสุด",
    priority: 21,
    conditions: {
      and: [
        { occupancy_percent: { gte: 95 } }
      ]
    },
    action: {
      type: "increase_rate_by_percent",
      value: 50
    },
    category: "yield_management",
    urgencyLevel: "high"
  },

  {
    name: "High Demand Surcharge (80-94% occupancy)",
    description: "เพิ่มราคา 30% เมื่อห้องเต็ม 80-94% - การบริหารรายได้เชิงรุก",
    priority: 22,
    conditions: {
      and: [
        { occupancy_percent: { gte: 80, lte: 94 } }
      ]
    },
    action: {
      type: "increase_rate_by_percent",
      value: 30
    },
    category: "yield_management"
  },

  {
    name: "Moderate Demand Adjustment (60-79% occupancy)",
    description: "เพิ่มราคา 15% เมื่อห้องเต็ม 60-79% - การปรับราคาตามความต้องการปานกลาง",
    priority: 23,
    conditions: {
      and: [
        { occupancy_percent: { gte: 60, lte: 79 } }
      ]
    },
    action: {
      type: "increase_rate_by_percent",
      value: 15
    },
    category: "demand_adjustment"
  },

  {
    name: "Low Demand Recovery (20-39% occupancy)",
    description: "ลดราคา 15% เมื่อห้องเต็มต่ำ 20-39% - กระตุ้นความต้องการ",
    priority: 24,
    conditions: {
      and: [
        { occupancy_percent: { gte: 20, lte: 39 } }
      ]
    },
    action: {
      type: "decrease_rate_by_percent",
      value: 15
    },
    category: "demand_stimulus"
  },

  // 🚨 GROUP 4: LAST-MINUTE & WALK-IN PREMIUM (Priority 31-40)
  {
    name: "Same Day Premium (0 days lead time)",
    description: "เพิ่มราคา 75% สำหรับการจองในวันเดียวกัน - Walk-in rate ตามมาตรฐานโรงแรม",
    priority: 31,
    conditions: {
      and: [
        { lead_time_days: { eq: 0 } }
      ]
    },
    action: {
      type: "increase_rate_by_percent",
      value: 75
    },
    category: "walk_in_premium",
    urgencyLevel: "critical"
  },

  {
    name: "Last Minute Premium (1-2 days)",
    description: "เพิ่มราคา 45% สำหรับการจองกะทันหัน 1-2 วัน - Last minute booking premium",
    priority: 32,
    conditions: {
      and: [
        { lead_time_days: { gte: 1, lte: 2 } }
      ]
    },
    action: {
      type: "increase_rate_by_percent",
      value: 45
    },
    category: "last_minute_premium"
  },

  {
    name: "Short Notice Premium (3-6 days)",
    description: "เพิ่มราคา 25% สำหรับการจองระยะสั้น 3-6 วัน - Short notice booking",
    priority: 33,
    conditions: {
      and: [
        { lead_time_days: { gte: 3, lte: 6 } }
      ]
    },
    action: {
      type: "increase_rate_by_percent",
      value: 25
    },
    category: "short_notice_premium"
  },

  {
    name: "Near-term Booking (7-13 days)",
    description: "เพิ่มราคา 12% สำหรับการจอง 7-13 วัน - Near-term booking adjustment",
    priority: 34,
    conditions: {
      and: [
        { lead_time_days: { gte: 7, lte: 13 } }
      ]
    },
    action: {
      type: "increase_rate_by_percent",
      value: 12
    },
    category: "near_term_adjustment"
  }
];

async function createProfessionalPricingRules() {
  console.log('🏨 Creating Professional Hotel Pricing Rules...');
  
  try {
    // Clear existing rules first
    console.log('🧹 Clearing existing pricing rules...');
    await prisma.dynamicPricingRule.deleteMany({});
    
    // Create new professional rules
    console.log('✨ Creating new professional pricing rules...');
    
    for (const rule of PROFESSIONAL_PRICING_RULES) {
      const createdRule = await prisma.dynamicPricingRule.create({
        data: {
          name: rule.name,
          description: rule.description,
          priority: rule.priority,
          isActive: true,
          conditions: rule.conditions,
          action: rule.action,
          dateRangeStart: null,
          dateRangeEnd: null,
          roomTypes: [], // Apply to all room types
          category: rule.category || null,
          urgencyLevel: rule.urgencyLevel || null,
          isOverride: false,
          disabledRuleIds: [],
          notificationSent: false
        }
      });
      
      console.log(`✅ Created rule: ${rule.name} (Priority: ${rule.priority})`);
    }
    
    console.log(`\n🎉 Successfully created ${PROFESSIONAL_PRICING_RULES.length} professional pricing rules!`);
    console.log('\n📊 Rule Categories:');
    console.log('   🎯 Lead Time Optimization: 3 rules');
    console.log('   🎪 Seasonal & Weekend Premiums: 2 rules');
    console.log('   📈 Yield Management: 4 rules');
    console.log('   🚨 Last-Minute Premiums: 4 rules');
    console.log('\n💡 These rules follow industry standards from major hotel chains!');
    
  } catch (error) {
    console.error('❌ Error creating pricing rules:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  createProfessionalPricingRules();
}

module.exports = { createProfessionalPricingRules, PROFESSIONAL_PRICING_RULES };
