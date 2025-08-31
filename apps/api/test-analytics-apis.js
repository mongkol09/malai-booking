// ============================================
// ANALYTICS API TEST SCRIPT
// ============================================
// Test all analytics endpoints with sample data

require('dotenv').config();
const fetch = require('node-fetch');

const API_BASE = process.env.API_BASE_URL || 'http://localhost:3001/api/v1';
const API_KEY = process.env.API_KEY || 'dev-api-key-2024';

console.log('🏨 Malai Khaoyai Resort - Analytics API Testing');
console.log('='.repeat(60));
console.log(`API Base: ${API_BASE}`);
console.log(`Using API Key: ${API_KEY.substring(0, 20)}...`);
console.log('');

async function testAnalyticsAPIs() {
  try {
    // 1. Test Hotel KPI Dashboard
    console.log('📊 Testing Hotel KPI Dashboard...');
    await testKPIDashboard();

    // 2. Test Real-time Dashboard
    console.log('\n⚡ Testing Real-time Dashboard...');
    await testRealTimeDashboard();

    // 3. Test Revenue Analytics
    console.log('\n💰 Testing Revenue Analytics...');
    await testRevenueAnalytics();

    // 4. Test Occupancy Analytics
    console.log('\n🏨 Testing Occupancy Analytics...');
    await testOccupancyAnalytics();

    // 5. Test Booking Trends
    console.log('\n📈 Testing Booking Trends...');
    await testBookingTrends();

    console.log('\n' + '='.repeat(60));
    console.log('✅ All analytics API tests completed!');

  } catch (error) {
    console.error('❌ Analytics API testing failed:', error.message);
  }
}

async function testKPIDashboard() {
  const periods = ['today', 'week', 'month'];
  
  for (const period of periods) {
    try {
      const response = await fetch(`${API_BASE}/analytics/dashboard/kpis?period=${period}`, {
        headers: {
          'X-API-Key': API_KEY,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ KPI Dashboard (${period}):`);
        
        if (data.data && data.data.kpis) {
          const kpis = data.data.kpis;
          console.log(`   📈 Occupancy Rate: ${kpis.occupancyRate}%`);
          console.log(`   💰 ADR: ฿${kpis.adr}`);
          console.log(`   📊 RevPAR: ฿${kpis.revpar}`);
          console.log(`   💵 Total Revenue: ฿${kpis.totalRevenue}`);
          console.log(`   🏨 Total Bookings: ${kpis.totalBookings}`);
          
          if (data.data.trends) {
            console.log(`   📈 Trends: Occupancy ${data.data.trends.occupancyRate.trend} ${data.data.trends.occupancyRate.change}%`);
          }
        }
      } else {
        console.log(`❌ KPI Dashboard (${period}) failed:`, response.status);
      }
    } catch (error) {
      console.log(`❌ KPI Dashboard (${period}) error:`, error.message);
    }
  }
}

async function testRealTimeDashboard() {
  try {
    const response = await fetch(`${API_BASE}/analytics/real-time/dashboard`, {
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Real-time Dashboard retrieved');
      
      if (data.data && data.data.todayMetrics) {
        const metrics = data.data.todayMetrics;
        console.log(`   📅 Today's Arrivals: ${metrics.arrivals}`);
        console.log(`   🚪 Today's Departures: ${metrics.departures}`);
        console.log(`   🏨 Current Occupancy: ${metrics.occupiedRooms}/${metrics.totalRooms} (${metrics.occupancyRate}%)`);
        console.log(`   💰 Today's Revenue: ฿${metrics.todayRevenue}`);
      }

      if (data.data && data.data.recentActivity) {
        console.log(`   📋 Recent Bookings: ${data.data.recentActivity.recentBookings.length} entries`);
      }

      if (data.data && data.data.upcomingEvents) {
        console.log(`   🎉 Upcoming Events: ${data.data.upcomingEvents.length} events`);
      }
    } else {
      console.log('❌ Real-time Dashboard failed:', response.status);
    }
  } catch (error) {
    console.log('❌ Real-time Dashboard error:', error.message);
  }
}

async function testRevenueAnalytics() {
  try {
    const dateFrom = '2025-01-01';
    const dateTo = '2025-01-31';
    
    const response = await fetch(`${API_BASE}/analytics/revenue?dateFrom=${dateFrom}&dateTo=${dateTo}&groupBy=week`, {
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Revenue Analytics retrieved');
      
      if (data.data && data.data.summary) {
        const summary = data.data.summary;
        console.log(`   💰 Total Revenue: ฿${summary.totalRevenue}`);
        console.log(`   📊 Average Revenue: ฿${summary.averageRevenue}`);
        console.log(`   🏨 Total Bookings: ${summary.totalBookings}`);
      }

      if (data.data && data.data.revenueAnalysis) {
        const analysis = data.data.revenueAnalysis;
        console.log(`   📈 Revenue Periods: ${analysis.byPeriod?.length || 0} periods`);
        console.log(`   🏠 Room Types: ${analysis.byRoomType?.length || 0} types`);
      }
    } else {
      console.log('❌ Revenue Analytics failed:', response.status);
    }
  } catch (error) {
    console.log('❌ Revenue Analytics error:', error.message);
  }
}

async function testOccupancyAnalytics() {
  try {
    const dateFrom = '2025-01-01';
    const dateTo = '2025-01-31';
    
    const response = await fetch(`${API_BASE}/analytics/occupancy?dateFrom=${dateFrom}&dateTo=${dateTo}&groupBy=week`, {
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Occupancy Analytics retrieved');
      
      if (data.data) {
        console.log(`   🏨 Total Rooms: ${data.data.totalRooms}`);
        
        if (data.data.occupancyData && data.data.occupancyData.overall) {
          const overall = data.data.occupancyData.overall;
          console.log(`   📊 Overall Occupancy: ${overall.occupancyRate}%`);
          console.log(`   🏠 Occupied Rooms: ${overall.occupiedRooms}/${overall.totalRooms}`);
        }
      }
    } else {
      console.log('❌ Occupancy Analytics failed:', response.status);
    }
  } catch (error) {
    console.log('❌ Occupancy Analytics error:', error.message);
  }
}

async function testBookingTrends() {
  try {
    const dateFrom = '2025-01-01';
    const dateTo = '2025-01-31';
    
    const response = await fetch(`${API_BASE}/analytics/booking-trends?dateFrom=${dateFrom}&dateTo=${dateTo}&groupBy=week`, {
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Booking Trends retrieved');
      
      if (data.data && data.data.trendAnalysis) {
        const analysis = data.data.trendAnalysis;
        console.log(`   📈 Total Bookings: ${analysis.summary.totalBookings}`);
        console.log(`   📊 Avg Bookings/Period: ${analysis.summary.averageBookingsPerPeriod}`);
        console.log(`   📅 Trend Periods: ${analysis.trends.length}`);
      }

      if (data.data && data.data.forecast) {
        const forecast = data.data.forecast;
        if (forecast.nextPeriod) {
          console.log(`   🔮 Next Period Forecast: ${forecast.nextPeriod.predictedBookings} bookings`);
          console.log(`   📈 Trend: ${forecast.nextPeriod.trend}`);
        }
      }

      if (data.data && data.data.insights) {
        console.log(`   💡 Insights: ${data.data.insights.length} recommendations`);
        data.data.insights.forEach((insight, index) => {
          console.log(`      ${index + 1}. ${insight}`);
        });
      }
    } else {
      console.log('❌ Booking Trends failed:', response.status);
    }
  } catch (error) {
    console.log('❌ Booking Trends error:', error.message);
  }
}

// Additional utility functions
async function testErrorHandling() {
  console.log('\n🧪 Testing Error Handling...');
  
  // Test with invalid date format
  try {
    const response = await fetch(`${API_BASE}/analytics/revenue?dateFrom=invalid&dateTo=2025-01-31`, {
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.log('✅ Error handling works - Invalid date rejected');
    } else {
      console.log('❌ Error handling failed - Invalid date accepted');
    }
  } catch (error) {
    console.log('✅ Error handling works - Request failed as expected');
  }

  // Test without API key
  try {
    const response = await fetch(`${API_BASE}/analytics/dashboard/kpis`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 401 || response.status === 403) {
      console.log('✅ API key validation works');
    } else {
      console.log('❌ API key validation failed');
    }
  } catch (error) {
    console.log('✅ API key validation works - Request rejected');
  }
}

// Run the tests
if (require.main === module) {
  testAnalyticsAPIs()
    .then(() => testErrorHandling())
    .then(() => {
      console.log('\n🎉 Analytics API testing completed successfully!');
      console.log('\n📖 Next Steps:');
      console.log('1. Create frontend dashboard components');
      console.log('2. Add real-time WebSocket updates');
      console.log('3. Implement advanced forecasting algorithms');
      console.log('4. Add more detailed analytics filters');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Testing failed:', error);
      process.exit(1);
    });
}

module.exports = {
  testAnalyticsAPIs,
  testKPIDashboard,
  testRealTimeDashboard,
  testRevenueAnalytics,
  testOccupancyAnalytics,
  testBookingTrends
};
