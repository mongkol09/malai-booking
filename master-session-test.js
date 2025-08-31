// ============================================
// 🚀 MASTER SESSION AUTHENTICATION TEST RUNNER
// 🌟 Complete Test Suite for Session-Based Authentication
// ============================================

const colors = require('colors');
const fs = require('fs');
const path = require('path');

// Import all test suites
const completeTests = require('./test-session-auth-complete');
const utilityTests = require('./test-session-utilities');
const databaseTests = require('./test-session-database');

// ============================================
// MASTER TEST CONFIGURATION
// ============================================

const MASTER_CONFIG = {
  BASE_URL: 'http://localhost:3001/api/v1',
  OUTPUT_REPORT: true,
  REPORT_FILE: 'session-test-report.json',
  DELAY_BETWEEN_SUITES: 2000, // 2 seconds
  MAX_RETRIES: 3,
  TIMEOUT_PER_SUITE: 300000, // 5 minutes
};

// Global test tracking
let masterResults = {
  startTime: null,
  endTime: null,
  duration: 0,
  suites: {
    complete: { status: 'pending', error: null, duration: 0 },
    utilities: { status: 'pending', error: null, duration: 0 },
    database: { status: 'pending', error: null, duration: 0 }
  },
  summary: {
    totalSuites: 3,
    passedSuites: 0,
    failedSuites: 0,
    skippedSuites: 0
  }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

function logMaster(message, level = 'INFO') {
  const timestamp = new Date().toLocaleTimeString();
  const colors_map = {
    'INFO': 'cyan',
    'SUCCESS': 'green',
    'ERROR': 'red',
    'WARN': 'yellow',
    'DEBUG': 'gray'
  };
  
  const color = colors_map[level] || 'white';
  console.log(`[${timestamp}] ${message}`[color]);
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function checkServerHealth() {
  logMaster('🏥 Checking server health...', 'INFO');
  
  try {
    const axios = require('axios');
    const response = await axios.get(`http://localhost:3001/api/health`, { timeout: 5000 });
    
    if (response.status === 200) {
      logMaster(`✅ Server is healthy: ${response.data.message || 'OK'}`, 'SUCCESS');
      return true;
    } else {
      logMaster(`❌ Server health check failed: ${response.status}`, 'ERROR');
      return false;
    }
  } catch (error) {
    logMaster(`❌ Server health check failed: ${error.message}`, 'ERROR');
    return false;
  }
}

async function runWithTimeout(testFunction, timeoutMs, suiteName) {
  return new Promise(async (resolve, reject) => {
    let completed = false;
    
    // Set timeout
    const timeoutId = setTimeout(() => {
      if (!completed) {
        completed = true;
        reject(new Error(`Test suite '${suiteName}' timed out after ${timeoutMs}ms`));
      }
    }, timeoutMs);
    
    try {
      // Run the test function
      await testFunction();
      
      if (!completed) {
        completed = true;
        clearTimeout(timeoutId);
        resolve();
      }
    } catch (error) {
      if (!completed) {
        completed = true;
        clearTimeout(timeoutId);
        reject(error);
      }
    }
  });
}

function printBanner() {
  console.log(''.rainbow);
  console.log('🚀 MASTER SESSION AUTHENTICATION TEST SUITE 🚀'.rainbow.bold);
  console.log('='.repeat(70).rainbow);
  console.log('');
  console.log('🔐 Complete Session-Based Authentication Testing'.cyan.bold);
  console.log('📊 Comprehensive Coverage: Auth, Utilities, Database'.cyan);
  console.log('🎯 Production-Ready Validation'.cyan);
  console.log('');
  console.log('='.repeat(70).rainbow);
  console.log('');
}

function printSuiteBanner(suiteName, description) {
  console.log('');
  console.log(`📋 TEST SUITE: ${suiteName.toUpperCase()}`.blue.bold);
  console.log(`📝 ${description}`.blue);
  console.log('─'.repeat(50).blue);
}

// ============================================
// TEST SUITE RUNNERS
// ============================================

async function runCompleteAuthTests() {
  printSuiteBanner('Complete Authentication', 'Full authentication flow testing');
  const startTime = Date.now();
  
  try {
    await runWithTimeout(
      completeTests.runAllTests,
      MASTER_CONFIG.TIMEOUT_PER_SUITE,
      'Complete Authentication'
    );
    
    const duration = Date.now() - startTime;
    masterResults.suites.complete = { status: 'passed', error: null, duration };
    masterResults.summary.passedSuites++;
    
    logMaster('✅ Complete authentication tests PASSED', 'SUCCESS');
    
  } catch (error) {
    const duration = Date.now() - startTime;
    masterResults.suites.complete = { status: 'failed', error: error.message, duration };
    masterResults.summary.failedSuites++;
    
    logMaster(`❌ Complete authentication tests FAILED: ${error.message}`, 'ERROR');
    throw error;
  }
}

async function runUtilityTests() {
  printSuiteBanner('Session Utilities', 'Core session management function testing');
  const startTime = Date.now();
  
  try {
    await runWithTimeout(
      utilityTests.runUtilityTests,
      MASTER_CONFIG.TIMEOUT_PER_SUITE,
      'Session Utilities'
    );
    
    const duration = Date.now() - startTime;
    masterResults.suites.utilities = { status: 'passed', error: null, duration };
    masterResults.summary.passedSuites++;
    
    logMaster('✅ Session utility tests PASSED', 'SUCCESS');
    
  } catch (error) {
    const duration = Date.now() - startTime;
    masterResults.suites.utilities = { status: 'failed', error: error.message, duration };
    masterResults.summary.failedSuites++;
    
    logMaster(`❌ Session utility tests FAILED: ${error.message}`, 'ERROR');
    throw error;
  }
}

async function runDatabaseTests() {
  printSuiteBanner('Database Integration', 'Session persistence and database testing');
  const startTime = Date.now();
  
  try {
    await runWithTimeout(
      databaseTests.runDatabaseTests,
      MASTER_CONFIG.TIMEOUT_PER_SUITE,
      'Database Integration'
    );
    
    const duration = Date.now() - startTime;
    masterResults.suites.database = { status: 'passed', error: null, duration };
    masterResults.summary.passedSuites++;
    
    logMaster('✅ Database integration tests PASSED', 'SUCCESS');
    
  } catch (error) {
    const duration = Date.now() - startTime;
    masterResults.suites.database = { status: 'failed', error: error.message, duration };
    masterResults.summary.failedSuites++;
    
    logMaster(`❌ Database integration tests FAILED: ${error.message}`, 'ERROR');
    throw error;
  }
}

// ============================================
// REPORT GENERATION
// ============================================

function generateReport() {
  if (!MASTER_CONFIG.OUTPUT_REPORT) return;
  
  logMaster('📊 Generating test report...', 'INFO');
  
  const report = {
    metadata: {
      timestamp: new Date().toISOString(),
      duration: masterResults.duration,
      testEnvironment: {
        baseUrl: MASTER_CONFIG.BASE_URL,
        nodeVersion: process.version,
        platform: process.platform
      }
    },
    summary: masterResults.summary,
    suites: masterResults.suites,
    recommendations: generateRecommendations()
  };
  
  try {
    fs.writeFileSync(MASTER_CONFIG.REPORT_FILE, JSON.stringify(report, null, 2));
    logMaster(`📄 Report saved to: ${MASTER_CONFIG.REPORT_FILE}`, 'SUCCESS');
  } catch (error) {
    logMaster(`❌ Failed to save report: ${error.message}`, 'ERROR');
  }
}

function generateRecommendations() {
  const recommendations = [];
  
  // Check suite performance
  Object.entries(masterResults.suites).forEach(([suiteName, suiteResult]) => {
    if (suiteResult.duration > 60000) { // Over 1 minute
      recommendations.push({
        type: 'performance',
        suite: suiteName,
        message: `Suite '${suiteName}' took ${(suiteResult.duration / 1000).toFixed(2)}s - consider optimization`
      });
    }
    
    if (suiteResult.status === 'failed') {
      recommendations.push({
        type: 'failure',
        suite: suiteName,
        message: `Suite '${suiteName}' failed: ${suiteResult.error}`
      });
    }
  });
  
  // Overall recommendations
  if (masterResults.summary.failedSuites > 0) {
    recommendations.push({
      type: 'critical',
      message: `${masterResults.summary.failedSuites} test suite(s) failed - address before deployment`
    });
  }
  
  if (masterResults.summary.passedSuites === masterResults.summary.totalSuites) {
    recommendations.push({
      type: 'success',
      message: 'All test suites passed - system ready for production'
    });
  }
  
  return recommendations;
}

// ============================================
// RESULTS SUMMARY
// ============================================

function printDetailedResults() {
  console.log('');
  console.log('📊 DETAILED TEST RESULTS'.rainbow.bold);
  console.log('='.repeat(70).rainbow);
  
  // Suite results
  Object.entries(masterResults.suites).forEach(([suiteName, result]) => {
    const status = result.status.toUpperCase();
    const color = result.status === 'passed' ? 'green' : 'red';
    const duration = (result.duration / 1000).toFixed(2);
    
    console.log(`📋 ${suiteName.toUpperCase().padEnd(20)} ${status[color]} (${duration}s)`);
    
    if (result.error) {
      console.log(`   ❌ Error: ${result.error}`.red);
    }
  });
  
  console.log('');
  console.log('📈 SUMMARY STATISTICS'.blue.bold);
  console.log('─'.repeat(30).blue);
  console.log(`✅ Passed Suites: ${masterResults.summary.passedSuites.toString().green}`);
  console.log(`❌ Failed Suites: ${masterResults.summary.failedSuites.toString().red}`);
  console.log(`⏭️  Skipped Suites: ${masterResults.summary.skippedSuites.toString().yellow}`);
  console.log(`📊 Total Suites: ${masterResults.summary.totalSuites.toString().cyan}`);
  console.log(`⏱️  Total Duration: ${(masterResults.duration / 1000).toFixed(2)}s`.cyan);
  console.log(`📈 Success Rate: ${((masterResults.summary.passedSuites / masterResults.summary.totalSuites) * 100).toFixed(1)}%`.cyan);
  
  // Recommendations
  const recommendations = generateRecommendations();
  if (recommendations.length > 0) {
    console.log('');
    console.log('💡 RECOMMENDATIONS'.yellow.bold);
    console.log('─'.repeat(30).yellow);
    
    recommendations.forEach(rec => {
      const icon = rec.type === 'success' ? '✅' : rec.type === 'critical' ? '🚨' : '💡';
      console.log(`${icon} ${rec.message}`);
    });
  }
}

// ============================================
// MAIN TEST ORCHESTRATOR
// ============================================

async function runMasterTestSuite() {
  printBanner();
  
  masterResults.startTime = new Date();
  logMaster(`🚀 Starting master test suite at ${masterResults.startTime.toISOString()}`, 'INFO');
  
  // Pre-flight checks
  logMaster('🔍 Running pre-flight checks...', 'INFO');
  
  const serverHealthy = await checkServerHealth();
  if (!serverHealthy) {
    logMaster('❌ Server health check failed - aborting test suite', 'ERROR');
    process.exit(1);
  }
  
  // Check required dependencies
  try {
    require('axios');
    require('colors');
    logMaster('✅ All dependencies available', 'SUCCESS');
  } catch (error) {
    logMaster(`❌ Missing dependencies: ${error.message}`, 'ERROR');
    process.exit(1);
  }
  
  logMaster('🎯 Starting test execution...', 'INFO');
  
  // Run test suites sequentially with error handling
  const suites = [
    { name: 'Complete Authentication', runner: runCompleteAuthTests },
    { name: 'Session Utilities', runner: runUtilityTests },
    { name: 'Database Integration', runner: runDatabaseTests }
  ];
  
  for (const suite of suites) {
    try {
      logMaster(`🔄 Starting suite: ${suite.name}`, 'INFO');
      await suite.runner();
      logMaster(`✅ Completed suite: ${suite.name}`, 'SUCCESS');
      
      // Delay between suites
      if (MASTER_CONFIG.DELAY_BETWEEN_SUITES > 0) {
        logMaster(`⏳ Waiting ${MASTER_CONFIG.DELAY_BETWEEN_SUITES}ms before next suite...`, 'DEBUG');
        await delay(MASTER_CONFIG.DELAY_BETWEEN_SUITES);
      }
      
    } catch (error) {
      logMaster(`❌ Suite failed: ${suite.name} - ${error.message}`, 'ERROR');
      
      // Continue with other suites even if one fails
      // In production, you might want to stop on critical failures
    }
  }
  
  // Calculate final results
  masterResults.endTime = new Date();
  masterResults.duration = masterResults.endTime - masterResults.startTime;
  
  // Generate reports
  generateReport();
  printDetailedResults();
  
  // Final status
  console.log('');
  if (masterResults.summary.failedSuites === 0) {
    console.log('🎉 ALL TEST SUITES PASSED! System ready for production! 🎉'.green.bold);
    process.exit(0);
  } else {
    console.log(`❌ ${masterResults.summary.failedSuites} TEST SUITE(S) FAILED!`.red.bold);
    console.log('🔧 Please address the issues before deploying to production.'.yellow);
    process.exit(1);
  }
}

// ============================================
// CLI INTERFACE
// ============================================

function printUsage() {
  console.log('');
  console.log('🚀 MASTER SESSION TEST RUNNER'.blue.bold);
  console.log('');
  console.log('Usage:');
  console.log('  node master-session-test.js [options]');
  console.log('');
  console.log('Options:');
  console.log('  --help, -h          Show this help message');
  console.log('  --suite <name>      Run specific suite only (complete|utilities|database)');
  console.log('  --no-report         Skip report generation');
  console.log('  --timeout <ms>      Set timeout per suite (default: 300000)');
  console.log('');
  console.log('Examples:');
  console.log('  node master-session-test.js                    # Run all suites');
  console.log('  node master-session-test.js --suite complete   # Run complete auth tests only');
  console.log('  node master-session-test.js --no-report        # Skip report generation');
  console.log('');
}

// Parse command line arguments
const args = process.argv.slice(2);
let specificSuite = null;

for (let i = 0; i < args.length; i++) {
  switch (args[i]) {
    case '--help':
    case '-h':
      printUsage();
      process.exit(0);
      break;
      
    case '--suite':
      specificSuite = args[i + 1];
      i++; // Skip next argument
      break;
      
    case '--no-report':
      MASTER_CONFIG.OUTPUT_REPORT = false;
      break;
      
    case '--timeout':
      MASTER_CONFIG.TIMEOUT_PER_SUITE = parseInt(args[i + 1]) || MASTER_CONFIG.TIMEOUT_PER_SUITE;
      i++; // Skip next argument
      break;
      
    default:
      if (args[i].startsWith('--')) {
        console.log(`Unknown option: ${args[i]}`.red);
        printUsage();
        process.exit(1);
      }
  }
}

// Run specific suite if requested
if (specificSuite) {
  console.log(`🎯 Running specific suite: ${specificSuite}`.cyan.bold);
  
  switch (specificSuite.toLowerCase()) {
    case 'complete':
      runCompleteAuthTests().catch(error => {
        console.error('💥 Suite failed:', error.message);
        process.exit(1);
      });
      break;
      
    case 'utilities':
      runUtilityTests().catch(error => {
        console.error('💥 Suite failed:', error.message);
        process.exit(1);
      });
      break;
      
    case 'database':
      runDatabaseTests().catch(error => {
        console.error('💥 Suite failed:', error.message);
        process.exit(1);
      });
      break;
      
    default:
      console.log(`❌ Unknown suite: ${specificSuite}`.red);
      console.log('Available suites: complete, utilities, database'.yellow);
      process.exit(1);
  }
} else {
  // Run all suites
  runMasterTestSuite().catch(error => {
    console.error('💥 Master test suite failed:', error.message);
    process.exit(1);
  });
}

// ============================================
// EXPORTS
// ============================================

module.exports = {
  runMasterTestSuite,
  runCompleteAuthTests,
  runUtilityTests,
  runDatabaseTests,
  generateReport,
  masterResults
};
