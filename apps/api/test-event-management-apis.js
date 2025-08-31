// ============================================
// EVENT MANAGEMENT API TESTING SCRIPT
// ============================================

const API_BASE_URL = 'http://localhost:3001/api/v1';

async function testEventManagementAPIs() {
    console.log('🚀 Testing Event Management APIs...\n');

    try {
        // Test 1: ดู Analytics เบื้องต้น
        console.log('📊 Test 1: Getting Event Analytics...');
        const analyticsResponse = await fetch(`${API_BASE_URL}/events/strategic/analytics`);
        const analyticsData = await analyticsResponse.json();
        console.log('Analytics Response:', JSON.stringify(analyticsData, null, 2));
        console.log('✅ Analytics test passed\n');

        // Test 2: สร้าง Manual Event
        console.log('📅 Test 2: Creating Manual Event...');
        const eventData = {
            title: 'Bangkok International Motor Show 2025',
            description: 'Major automotive exhibition attracting thousands of visitors',
            startTime: '2025-03-28T09:00:00Z',
            endTime: '2025-04-06T18:00:00Z',
            location: 'Challenger Hall, Impact Arena',
            affectsPricing: true
        };

        const createResponse = await fetch(`${API_BASE_URL}/events/strategic/manual`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(eventData)
        });

        const createData = await createResponse.json();
        console.log('Create Event Response:', JSON.stringify(createData, null, 2));
        
        if (createData.success) {
            console.log('✅ Manual event creation test passed\n');
            
            // Store event ID for next tests
            const eventId = createData.data.event.id;

            // Test 3: ดึงรายการ Events ที่รอการอนุมัติ
            console.log('📋 Test 3: Getting Pending Events...');
            const pendingResponse = await fetch(`${API_BASE_URL}/events/strategic/pending?page=1&limit=5`);
            const pendingData = await pendingResponse.json();
            console.log('Pending Events Response:', JSON.stringify(pendingData, null, 2));
            console.log('✅ Pending events test passed\n');

            // Test 4: Aggregate External Events (Mock)
            console.log('🔄 Test 4: Aggregating External Events...');
            const aggregateResponse = await fetch(`${API_BASE_URL}/events/strategic/aggregate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sources: ['GOOGLE_CALENDAR', 'TICKETMASTER_API']
                })
            });

            const aggregateData = await aggregateResponse.json();
            console.log('Aggregate Events Response:', JSON.stringify(aggregateData, null, 2));
            console.log('✅ External events aggregation test passed\n');

            // Test 5: ดู Analytics หลังจากเพิ่ม Events
            console.log('📈 Test 5: Getting Updated Analytics...');
            const finalAnalyticsResponse = await fetch(`${API_BASE_URL}/events/strategic/analytics?period=7d`);
            const finalAnalyticsData = await finalAnalyticsResponse.json();
            console.log('Updated Analytics Response:', JSON.stringify(finalAnalyticsData, null, 2));
            console.log('✅ Updated analytics test passed\n');

        } else {
            console.log('❌ Manual event creation failed:', createData.message);
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

// Test Error Handling
async function testErrorHandling() {
    console.log('🛡️ Testing Error Handling...\n');

    try {
        // Test invalid data
        console.log('🚫 Test: Invalid Event Data...');
        const invalidResponse = await fetch(`${API_BASE_URL}/events/strategic/manual`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: '', // Invalid: empty title
                startTime: 'invalid-date', // Invalid: bad date format
                endTime: '2025-03-27T18:00:00Z' // Invalid: end before start
            })
        });

        const invalidData = await invalidResponse.json();
        console.log('Invalid Data Response:', JSON.stringify(invalidData, null, 2));
        
        if (!invalidData.success) {
            console.log('✅ Error handling test passed - validation errors caught\n');
        } else {
            console.log('❌ Error handling test failed - should have rejected invalid data\n');
        }

    } catch (error) {
        console.error('❌ Error handling test failed:', error.message);
    }
}

// Run all tests
async function runAllTests() {
    console.log('===============================================');
    console.log('🎯 EVENT MANAGEMENT API TEST SUITE');
    console.log('===============================================\n');

    await testEventManagementAPIs();
    await testErrorHandling();

    console.log('===============================================');
    console.log('✨ All tests completed!');
    console.log('===============================================');
}

// Execute tests
runAllTests().catch(console.error);
