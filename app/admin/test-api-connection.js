// Test API Service Connection
// ทดสอบการเชื่อมต่อระหว่าง Frontend และ Backend

import apiService from '../src/services/apiService.js';

const testApiConnection = async () => {
    console.log('🔄 Testing API Service Connection...');
    console.log('API Base URL:', process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1');
    
    try {
        // Test 1: Dashboard KPIs
        console.log('\n📊 Testing Dashboard KPIs...');
        const kpis = await apiService.getDashboardKPIs();
        console.log('✅ Dashboard KPIs:', JSON.stringify(kpis, null, 2));

        // Test 2: Realtime Dashboard
        console.log('\n⚡ Testing Realtime Dashboard...');
        const realtime = await apiService.getRealtimeDashboard();
        console.log('✅ Realtime Data:', JSON.stringify(realtime, null, 2));

        // Test 3: Revenue Analytics
        console.log('\n💰 Testing Revenue Analytics...');
        const revenue = await apiService.getRevenueAnalytics('monthly');
        console.log('✅ Revenue Analytics:', JSON.stringify(revenue, null, 2));

        // Test 4: Booking Trends
        console.log('\n📈 Testing Booking Trends...');
        const trends = await apiService.getBookingTrends('daily');
        console.log('✅ Booking Trends:', JSON.stringify(trends, null, 2));

        console.log('\n🎉 All API tests passed!');
        return true;

    } catch (error) {
        console.error('❌ API Test Failed:', error);
        return false;
    }
};

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { testApiConnection };
}

export { testApiConnection };
