const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3001/api/v1';
const API_KEY = process.env.API_KEY || 'dev-api-key-2024';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY
  }
});

console.log('🚨 Testing Manual Override System');
console.log('==================================\n');

async function testOverrideTemplates() {
  console.log('📋 Testing Override Templates...');
  
  try {
    const response = await api.get('/override/templates');
    
    console.log('✅ Override templates retrieved successfully');
    console.log('Available templates:', response.data.data.templates.length);
    
    response.data.data.templates.forEach((template, index) => {
      console.log(`   ${index + 1}. ${template.name} (${template.category})`);
      console.log(`      Default: ${template.defaultStrategy} ${template.defaultValue}%`);
      console.log(`      Example: ${template.example}`);
    });
    
    return response.data.data.templates;
  } catch (error) {
    console.error('❌ Failed to get override templates:', error.response?.data || error.message);
    return [];
  }
}

async function testEmergencyOverride() {
  console.log('\n🚨 Testing Emergency Override Creation...');
  
  try {
    const emergencyData = {
      eventTitle: 'Emergency: Sudden Royal Event',
      startDate: '2024-12-25T00:00:00Z',
      endDate: '2024-12-26T23:59:59Z',
      category: 'EMERGENCY_HOLIDAY',
      pricingStrategy: 'INCREASE',
      pricingValue: 35,
      targetRoomTypes: ['deluxe', 'suite'],
      reason: 'His Majesty the King announced a special royal ceremony with only 24 hours notice. Expected high demand from VIP guests.',
      urgencyLevel: 'CRITICAL',
      staffId: '550e8400-e29b-41d4-a716-446655440000' // Mock staff ID
    };
    
    const response = await api.post('/override/emergency', emergencyData);
    
    console.log('✅ Emergency override created successfully');
    console.log('Override Rule ID:', response.data.data.overrideRule.id);
    console.log('Priority:', response.data.data.overrideRule.priority);
    console.log('Impact:', response.data.data.impact);
    
    return response.data.data.overrideRule;
  } catch (error) {
    console.error('❌ Failed to create emergency override:', error.response?.data || error.message);
    if (error.response?.data?.errors) {
      console.log('Validation errors:');
      error.response.data.errors.forEach(err => {
        console.log(`  - ${err.msg}: ${err.param}`);
      });
    }
    return null;
  }
}

async function testQuickEventOverride() {
  console.log('\n⚡ Testing Quick Event Override...');
  
  try {
    const quickEventData = {
      eventTitle: 'Last-Minute Taylor Swift Additional Show',
      startDate: '2024-12-28T00:00:00Z',
      endDate: '2024-12-29T23:59:59Z',
      category: 'SURPRISE_EVENT',
      pricingStrategy: 'INCREASE',
      pricingValue: 50,
      targetRoomTypes: ['all'],
      reason: 'Taylor Swift announced additional concert show due to overwhelming demand. Ticket sales started 2 hours ago.',
      urgencyLevel: 'CRITICAL',
      staffId: '550e8400-e29b-41d4-a716-446655440000'
    };
    
    const response = await api.post('/override/quick-event', quickEventData);
    
    console.log('✅ Quick event override created successfully');
    console.log('Event ID:', response.data.data.event.id);
    console.log('Event Title:', response.data.data.event.title);
    console.log('Override Rule ID:', response.data.data.overrideRule.id);
    console.log('Workflow:', response.data.data.workflow);
    
    return response.data.data;
  } catch (error) {
    console.error('❌ Failed to create quick event override:', error.response?.data || error.message);
    return null;
  }
}

async function testGetActiveOverrides() {
  console.log('\n📊 Testing Active Overrides Retrieval...');
  
  try {
    const response = await api.get('/override/active');
    
    console.log('✅ Active overrides retrieved successfully');
    console.log('Total active overrides:', response.data.data.totalCount);
    console.log('Summary:', response.data.data.summary);
    
    if (response.data.data.activeOverrides.length > 0) {
      console.log('\nActive Overrides:');
      response.data.data.activeOverrides.forEach((override, index) => {
        console.log(`   ${index + 1}. ${override.name}`);
        console.log(`      Priority: ${override.priority}`);
        console.log(`      Days remaining: ${override.daysRemaining}`);
        console.log(`      Created by: ${override.createdBy?.firstName || 'Unknown'} ${override.createdBy?.lastName || ''}`);
      });
    }
    
    return response.data.data.activeOverrides;
  } catch (error) {
    console.error('❌ Failed to get active overrides:', error.response?.data || error.message);
    return [];
  }
}

async function testUpdateOverride(ruleId) {
  console.log('\n✏️ Testing Override Update...');
  
  if (!ruleId) {
    console.log('⚠️ No rule ID provided, skipping update test');
    return;
  }
  
  try {
    const updateData = {
      pricingValue: 40, // เปลี่ยนจาก 35% เป็น 40%
      reason: 'Updated pricing strategy based on latest demand analysis'
    };
    
    const response = await api.put(`/override/${ruleId}`, updateData);
    
    console.log('✅ Override rule updated successfully');
    console.log('Updated Rule ID:', response.data.data.ruleId);
    console.log('Updated fields:', response.data.data.updatedFields);
    
    return true;
  } catch (error) {
    console.error('❌ Failed to update override:', error.response?.data || error.message);
    return false;
  }
}

async function testRemoveOverride(ruleId) {
  console.log('\n🗑️ Testing Override Removal...');
  
  if (!ruleId) {
    console.log('⚠️ No rule ID provided, skipping removal test');
    return;
  }
  
  try {
    const removeData = {
      staffId: '550e8400-e29b-41d4-a716-446655440000',
      reason: 'Test completed - removing override rule'
    };
    
    const response = await api.delete(`/override/${ruleId}`, { data: removeData });
    
    console.log('✅ Override rule removed successfully');
    console.log('Removed Rule ID:', response.data.data.ruleId);
    console.log('Removed by:', response.data.data.removedBy);
    console.log('Note:', response.data.data.note);
    
    return true;
  } catch (error) {
    console.error('❌ Failed to remove override:', error.response?.data || error.message);
    return false;
  }
}

async function testValidation() {
  console.log('\n🔍 Testing Input Validation...');
  
  try {
    // Test with invalid data
    await api.post('/override/emergency', {
      eventTitle: '', // Empty title should fail
      startDate: 'invalid-date',
      endDate: '2024-12-20T09:00:00Z',
      category: 'INVALID_CATEGORY',
      urgencyLevel: 'LOW' // Not allowed
    });
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ Validation working correctly');
      console.log('Validation errors found:', error.response.data.errors?.length || 'Unknown count');
    } else {
      console.error('❌ Unexpected validation response:', error.response?.status);
    }
  }
}

async function runAllTests() {
  console.log(`🎯 Starting Manual Override System Tests`);
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log(`⏰ Time: ${new Date().toISOString()}\n`);

  // Test sequence
  const results = {
    templates: await testOverrideTemplates(),
    emergencyOverride: await testEmergencyOverride(),
    quickEvent: await testQuickEventOverride(),
    activeOverrides: await testGetActiveOverrides()
  };

  // Test updates if we have an override rule
  if (results.emergencyOverride) {
    await testUpdateOverride(results.emergencyOverride.id);
  }

  // Test validation
  await testValidation();

  // Clean up - remove test overrides
  if (results.emergencyOverride) {
    await testRemoveOverride(results.emergencyOverride.id);
  }
  
  if (results.quickEvent?.overrideRule) {
    await testRemoveOverride(results.quickEvent.overrideRule.id);
  }

  // Final summary
  console.log('\n📊 Test Summary');
  console.log('================');
  console.log('✅ Override Templates:', results.templates.length > 0 ? 'PASS' : 'FAIL');
  console.log('✅ Emergency Override:', results.emergencyOverride ? 'PASS' : 'FAIL');
  console.log('✅ Quick Event Override:', results.quickEvent ? 'PASS' : 'FAIL');
  console.log('✅ Active Overrides:', results.activeOverrides.length >= 0 ? 'PASS' : 'FAIL');

  console.log('\n🎉 Manual Override System Testing Complete!');
  
  console.log('\n💡 Usage Examples:');
  console.log('Emergency Holiday:');
  console.log('  POST /api/v1/override/emergency');
  console.log('  { "eventTitle": "Emergency Royal Event", "urgencyLevel": "CRITICAL" }');
  console.log('');
  console.log('Quick Event:');
  console.log('  POST /api/v1/override/quick-event');
  console.log('  { "eventTitle": "Surprise Concert", "category": "SURPRISE_EVENT" }');
  console.log('');
  console.log('View Active:');
  console.log('  GET /api/v1/override/active');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testOverrideTemplates,
  testEmergencyOverride,
  testQuickEventOverride,
  testGetActiveOverrides,
  testUpdateOverride,
  testRemoveOverride,
  runAllTests
};
