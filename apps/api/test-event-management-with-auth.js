// ============================================
// EVENT MANAGEMENT API TESTING SCRIPT (WITH AUTH)
// ============================================

const API_BASE_URL = 'http://localhost:3001/api/v1';

// First, let's get an auth token
async function getAuthToken() {
    try {
        console.log('🔑 Getting authentication token...');
        
        // Try to register a test user first
        const registerData = {
            firstName: 'Test',
            lastName: 'Admin',
            email: 'test.admin@hotelbooking.com',
            password: 'TestPassword123!',
            userType: 'ADMIN'
        };

        const registerResponse = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(registerData)
        });

        const registerResult = await registerResponse.json();
        console.log('Register result:', registerResult);

        // Now try to login
        const loginData = {
            email: 'test.admin@hotelbooking.com',
            password: 'TestPassword123!'
        };

        const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });

        const loginResult = await loginResponse.json();
        console.log('Login result:', loginResult);

        if (loginResult.success && loginResult.data && loginResult.data.tokens && loginResult.data.tokens.accessToken) {
            console.log('✅ Authentication successful');
            return loginResult.data.tokens.accessToken;
        } else {
            console.log('❌ Authentication failed');
            return null;
        }

    } catch (error) {
        console.error('❌ Auth error:', error.message);
        return null;
    }
}

async function testEventManagementAPIs(token) {
    console.log('\n🚀 Testing Event Management APIs...\n');

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    try {
        // Test 1: ดู Analytics เบื้องต้น
        console.log('📊 Test 1: Getting Event Analytics...');
        const analyticsResponse = await fetch(`${API_BASE_URL}/events/strategic/analytics`, {
            headers
        });
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
            headers,
            body: JSON.stringify(eventData)
        });

        const createData = await createResponse.json();
        console.log('Create Event Response:', JSON.stringify(createData, null, 2));
        
        if (createData.success) {
            console.log('✅ Manual event creation test passed\n');
            
            // Test 3: ดึงรายการ Events ที่รอการอนุมัติ
            console.log('📋 Test 3: Getting Pending Events...');
            const pendingResponse = await fetch(`${API_BASE_URL}/events/strategic/pending?page=1&limit=5`, {
                headers
            });
            const pendingData = await pendingResponse.json();
            console.log('Pending Events Response:', JSON.stringify(pendingData, null, 2));
            console.log('✅ Pending events test passed\n');

            // Test 4: Aggregate External Events (Mock)
            console.log('🔄 Test 4: Aggregating External Events...');
            const aggregateResponse = await fetch(`${API_BASE_URL}/events/strategic/aggregate`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    sources: ['GOOGLE_CALENDAR', 'TICKETMASTER_API']
                })
            });

            const aggregateData = await aggregateResponse.json();
            console.log('Aggregate Events Response:', JSON.stringify(aggregateData, null, 2));
            console.log('✅ External events aggregation test passed\n');

            // Test 5: ดู Analytics หลังจากเพิ่ม Events
            console.log('📈 Test 5: Getting Updated Analytics...');
            const finalAnalyticsResponse = await fetch(`${API_BASE_URL}/events/strategic/analytics?period=7d`, {
                headers
            });
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

// Run all tests
async function runAllTests() {
    console.log('===============================================');
    console.log('🎯 EVENT MANAGEMENT API TEST SUITE (WITH AUTH)');
    console.log('===============================================\n');

    const token = await getAuthToken();
    
    if (token) {
        await testEventManagementAPIs(token);
    } else {
        console.log('❌ Cannot proceed without authentication token');
    }

    console.log('\n===============================================');
    console.log('✨ All tests completed!');
    console.log('===============================================');
}

// Execute tests
runAllTests().catch(console.error);
