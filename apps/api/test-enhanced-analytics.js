// ============================================
// ADVANCED ANALYTICS API TESTS
// ============================================
// Comprehensive testing for enhanced analytics endpoints

const API_BASE_URL = 'http://localhost:3001/api/v1/analytics';
const API_KEY = 'dev-api-key-2024';

// Test scenarios and expected behaviors
const testScenarios = [
  {
    name: 'Advanced Revenue Forecasting - Ensemble',
    endpoint: '/advanced/revenue-forecast',
    params: {
      algorithm: 'ensemble',
      forecastPeriods: '30',
      startDate: '2024-01-01',
      endDate: '2024-12-31'
    },
    expectedFields: ['algorithm', 'historical', 'forecast', 'accuracy', 'factors', 'insights']
  },
  {
    name: 'Advanced Revenue Forecasting - Holt-Winters',
    endpoint: '/advanced/revenue-forecast',
    params: {
      algorithm: 'holt-winters',
      forecastPeriods: '14'
    },
    expectedFields: ['algorithm', 'forecast', 'accuracy']
  },
  {
    name: 'Advanced Occupancy Forecasting',
    endpoint: '/advanced/occupancy-forecast',
    params: {
      algorithm: 'ensemble',
      forecastPeriods: '21'
    },
    expectedFields: ['algorithm', 'historical', 'forecast']
  },
  {
    name: 'Multi-dimensional Analytics',
    endpoint: '/advanced/multi-dimensional',
    params: {
      filters: JSON.stringify({
        dateRange: {
          start: '2024-01-01T00:00:00.000Z',
          end: '2024-12-31T23:59:59.999Z',
          granularity: 'month'
        },
        customer: {
          segments: ['business', 'leisure'],
          loyaltyTiers: ['gold', 'platinum']
        },
        property: {
          roomTypes: ['suite', 'deluxe'],
          priceRange: { min: 100, max: 500 }
        }
      })
    },
    expectedFields: ['analysis', 'filters', 'metadata']
  },
  {
    name: 'Drill-down Analysis - Revenue by Country',
    endpoint: '/advanced/drill-down',
    params: {
      drillDown: JSON.stringify({
        metric: 'revenue',
        dimensions: ['country'],
        filters: {
          dateRange: {
            start: '2024-01-01T00:00:00.000Z',
            end: '2024-12-31T23:59:59.999Z'
          }
        },
        groupBy: ['country'],
        sortBy: { field: 'revenue', direction: 'desc' },
        limit: 10
      })
    },
    expectedFields: ['request', 'result']
  },
  {
    name: 'Cohort Analysis',
    endpoint: '/advanced/cohort-analysis',
    params: {
      filters: JSON.stringify({
        dateRange: {
          start: '2024-01-01T00:00:00.000Z',
          end: '2024-12-31T23:59:59.999Z'
        }
      })
    },
    expectedFields: ['cohortAnalysis', 'filters']
  },
  {
    name: 'Advanced Customer Segmentation',
    endpoint: '/advanced/segmentation',
    params: {
      filters: JSON.stringify({
        customer: {
          segments: ['business', 'leisure', 'family']
        }
      })
    },
    expectedFields: ['segmentation', 'filters']
  },
  {
    name: 'Real-time Performance Dashboard',
    endpoint: '/advanced/real-time',
    params: {},
    expectedFields: ['currentMetrics', 'hourlyTrends', 'alerts', 'insights']
  },
  {
    name: 'Predictive Analytics Dashboard',
    endpoint: '/advanced/predictive',
    params: {
      granularity: 'day'
    },
    expectedFields: ['nextWeek', 'nextMonth', 'seasonalForecasts', 'riskFactors', 'opportunities']
  }
];

// ============================================
// TEST EXECUTION
// ============================================

async function runAdvancedAnalyticsTests() {
  console.log('🚀 Starting Enhanced Analytics API Tests...\n');
  
  let passedTests = 0;
  let failedTests = 0;
  const startTime = Date.now();

  for (const scenario of testScenarios) {
    try {
      console.log(`📊 Testing: ${scenario.name}`);
      
      // Build URL with parameters
      const url = new URL(API_BASE_URL + scenario.endpoint, 'http://localhost:3001');
      Object.keys(scenario.params).forEach(key => {
        url.searchParams.append(key, scenario.params[key]);
      });

      // Make API request
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'X-API-Key': API_KEY,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Validate response structure
      if (!data.success) {
        throw new Error(`API returned success: false - ${data.error || 'Unknown error'}`);
      }

      // Check expected fields
      const missingFields = scenario.expectedFields.filter(field => !(field in data.data));
      if (missingFields.length > 0) {
        throw new Error(`Missing expected fields: ${missingFields.join(', ')}`);
      }

      // Detailed validation based on endpoint
      validateEndpointSpecifics(scenario, data);

      console.log(`   ✅ PASSED - Response structure valid`);
      console.log(`   📈 Data size: ${JSON.stringify(data).length} bytes`);
      
      // Log key insights for forecasting endpoints
      if (scenario.endpoint.includes('forecast') && data.data.insights) {
        console.log(`   💡 Key insight: ${data.data.insights[0]}`);
      }
      
      passedTests++;

    } catch (error) {
      console.log(`   ❌ FAILED - ${error.message}`);
      failedTests++;
    }
    
    console.log(''); // Add spacing between tests
  }

  // Summary
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  console.log('📋 TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`⏱️  Duration: ${duration}ms`);
  console.log(`📊 Success Rate: ${((passedTests / (passedTests + failedTests)) * 100).toFixed(1)}%`);
  
  if (failedTests === 0) {
    console.log('\n🎉 All Enhanced Analytics tests passed! The advanced features are working correctly.');
  } else {
    console.log(`\n⚠️  ${failedTests} test(s) failed. Please check the issues above.`);
  }
}

// ============================================
// ENDPOINT-SPECIFIC VALIDATION
// ============================================

function validateEndpointSpecifics(scenario, data) {
  const endpoint = scenario.endpoint;
  const responseData = data.data;

  switch (endpoint) {
    case '/advanced/revenue-forecast':
    case '/advanced/occupancy-forecast':
      // Validate forecasting data
      if (!Array.isArray(responseData.forecast)) {
        throw new Error('Forecast should be an array');
      }
      
      if (responseData.forecast.length === 0) {
        throw new Error('Forecast array should not be empty');
      }

      // Check forecast structure
      const firstForecast = responseData.forecast[0];
      const requiredForecastFields = ['period', 'predicted', 'lower', 'upper', 'confidence'];
      const missingForecastFields = requiredForecastFields.filter(field => !(field in firstForecast));
      if (missingForecastFields.length > 0) {
        throw new Error(`Forecast missing fields: ${missingForecastFields.join(', ')}`);
      }

      // Validate accuracy metrics
      if (!responseData.accuracy || !responseData.accuracy.mape) {
        throw new Error('Accuracy metrics missing');
      }
      break;

    case '/advanced/multi-dimensional':
      // Validate multi-dimensional analysis structure
      if (!responseData.analysis || typeof responseData.analysis !== 'object') {
        throw new Error('Analysis object missing or invalid');
      }
      break;

    case '/advanced/drill-down':
      // Validate drill-down results
      if (!responseData.result || !responseData.result.data) {
        throw new Error('Drill-down result data missing');
      }
      
      if (!Array.isArray(responseData.result.data)) {
        throw new Error('Drill-down result data should be an array');
      }
      break;

    case '/advanced/cohort-analysis':
      // Validate cohort analysis
      if (!responseData.cohortAnalysis || !responseData.cohortAnalysis.cohorts) {
        throw new Error('Cohort analysis data missing');
      }
      
      if (!Array.isArray(responseData.cohortAnalysis.cohorts)) {
        throw new Error('Cohorts should be an array');
      }
      break;

    case '/advanced/segmentation':
      // Validate segmentation data
      const segmentationTypes = ['rfm', 'behavioral', 'geographic', 'value'];
      const missingSegmentTypes = segmentationTypes.filter(type => !(type in responseData.segmentation));
      if (missingSegmentTypes.length > 0) {
        throw new Error(`Missing segmentation types: ${missingSegmentTypes.join(', ')}`);
      }
      break;

    case '/advanced/real-time':
      // Validate real-time data
      if (!responseData.currentMetrics) {
        throw new Error('Current metrics missing');
      }
      
      if (!Array.isArray(responseData.hourlyTrends)) {
        throw new Error('Hourly trends should be an array');
      }
      
      if (responseData.hourlyTrends.length !== 24) {
        throw new Error('Should have 24 hourly data points');
      }
      break;

    case '/advanced/predictive':
      // Validate predictive analytics
      if (!responseData.nextWeek || !responseData.nextMonth) {
        throw new Error('Short-term predictions missing');
      }
      
      if (!Array.isArray(responseData.seasonalForecasts)) {
        throw new Error('Seasonal forecasts should be an array');
      }
      
      if (!Array.isArray(responseData.riskFactors) || !Array.isArray(responseData.opportunities)) {
        throw new Error('Risk factors and opportunities should be arrays');
      }
      break;
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Run the tests
if (typeof window === 'undefined') {
  // Node.js environment
  const { fetch } = require('undici');
  global.fetch = fetch;
  runAdvancedAnalyticsTests().catch(console.error);
} else {
  // Browser environment
  runAdvancedAnalyticsTests().catch(console.error);
}
