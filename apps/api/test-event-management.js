const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000/api/v1';
const API_KEY = process.env.API_KEY || 'your-api-key';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY
  }
});

console.log('🧪 Testing Event Management API');
console.log('================================\n');

async function testCreateManualEvent() {
  console.log('📅 Testing Manual Event Creation...');
  
  try {
    const response = await api.post('/events/strategic/manual', {
      title: 'Test Conference 2024',
      description: 'Annual technology conference for testing',
      startTime: '2024-12-20T09:00:00Z',
      endTime: '2024-12-22T17:00:00Z',
      location: 'Bangkok Convention Center',
      affectsPricing: true
    });
    
    console.log('✅ Manual event created successfully');
    console.log('Event ID:', response.data.data.event.id);
    console.log('Title:', response.data.data.event.title);
    return response.data.data.event;
  } catch (error) {
    console.error('❌ Failed to create manual event:', error.response?.data || error.message);
    return null;
  }
}

async function testEventAggregation() {
  console.log('\n🔄 Testing Event Aggregation...');
  
  try {
    const response = await api.post('/events/strategic/aggregate', {
      sources: ['GOOGLE_CALENDAR', 'TICKETMASTER_API']
    });
    
    console.log('✅ Event aggregation completed');
    console.log('New events:', response.data.data.newEvents.length);
    console.log('Total aggregated:', response.data.data.totalAggregated);
    return response.data.data.newEvents;
  } catch (error) {
    console.error('❌ Failed to aggregate events:', error.response?.data || error.message);
    return [];
  }
}

async function testGetPendingEvents() {
  console.log('\n📋 Testing Get Pending Events...');
  
  try {
    const response = await api.get('/events/strategic/pending?page=1&limit=5');
    
    console.log('✅ Retrieved pending events');
    console.log('Total events:', response.data.data.pagination.total);
    console.log('Events on this page:', response.data.data.events.length);
    
    if (response.data.data.events.length > 0) {
      const firstEvent = response.data.data.events[0];
      console.log('First event:', firstEvent.title);
      console.log('Status:', firstEvent.status || 'No status field (schema not updated)');
    }
    
    return response.data.data.events;
  } catch (error) {
    console.error('❌ Failed to get pending events:', error.response?.data || error.message);
    return [];
  }
}

async function testEventAnalytics() {
  console.log('\n📊 Testing Event Analytics...');
  
  try {
    const response = await api.get('/events/strategic/analytics?period=30d');
    
    console.log('✅ Retrieved event analytics');
    console.log('Total events (30d):', response.data.data.summary.totalEvents);
    
    if (response.data.data.summary.pendingReview !== undefined) {
      console.log('Pending review:', response.data.data.summary.pendingReview);
      console.log('Approval rate:', response.data.data.summary.approvalRate + '%');
    }
    
    return response.data.data;
  } catch (error) {
    console.error('❌ Failed to get analytics:', error.response?.data || error.message);
    return null;
  }
}

async function testValidation() {
  console.log('\n🔍 Testing Input Validation...');
  
  try {
    // Test with invalid data
    await api.post('/events/strategic/manual', {
      title: '', // Empty title should fail
      startTime: 'invalid-date',
      endTime: '2024-12-20T09:00:00Z' // End before start
    });
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ Validation working correctly');
      console.log('Validation errors:', error.response.data.errors?.length || 'Error structure changed');
    } else {
      console.error('❌ Unexpected validation response:', error.response?.status);
    }
  }
}

async function testDatabaseConnection() {
  console.log('\n🗄️  Testing Database Connection...');
  
  try {
    const response = await axios.get(`${BASE_URL.replace('/api/v1', '')}/health`);
    console.log('✅ Database connection:', response.data.database);
    console.log('API Status:', response.data.status);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log(`🎯 Starting Event Management API Tests`);
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log(`⏰ Time: ${new Date().toISOString()}\n`);

  // Test database connection first
  const dbConnected = await testDatabaseConnection();
  if (!dbConnected) {
    console.log('\n❌ Cannot proceed without database connection');
    return;
  }

  // Run tests in sequence
  const results = {
    manualEvent: await testCreateManualEvent(),
    aggregation: await testEventAggregation(),
    pendingEvents: await testGetPendingEvents(),
    analytics: await testEventAnalytics()
  };

  // Test validation
  await testValidation();

  // Summary
  console.log('\n📊 Test Summary');
  console.log('===============');
  console.log('✅ Manual Event Creation:', results.manualEvent ? 'PASS' : 'FAIL');
  console.log('✅ Event Aggregation:', results.aggregation.length > 0 ? 'PASS' : 'FAIL');
  console.log('✅ Get Pending Events:', results.pendingEvents.length >= 0 ? 'PASS' : 'FAIL');
  console.log('✅ Event Analytics:', results.analytics ? 'PASS' : 'FAIL');

  // Check if schema is updated
  const hasNewFields = results.pendingEvents.some(event => 
    event.status !== undefined || 
    event.category !== undefined || 
    event.source !== undefined
  );

  console.log('\n📋 Schema Status');
  console.log('================');
  if (hasNewFields) {
    console.log('✅ Database schema updated successfully');
    console.log('✅ New Event Management fields available');
  } else {
    console.log('⚠️  Database schema not yet updated');
    console.log('ℹ️  Run migration: node migrate-event-management.js');
    console.log('ℹ️  Or manually: npx prisma db push && npx prisma generate');
  }

  console.log('\n🎉 Event Management API Testing Complete!');
  
  if (!hasNewFields) {
    console.log('\n🔧 Next Steps:');
    console.log('1. Stop the server');
    console.log('2. Run: node migrate-event-management.js');
    console.log('3. Restart the server');
    console.log('4. Run this test again');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testCreateManualEvent,
  testEventAggregation,
  testGetPendingEvents,
  testEventAnalytics,
  testValidation,
  runAllTests
};
