#!/usr/bin/env node

/**
 * 🏥 Health Check Script สำหรับ Malai Resort API
 * 
 * Usage:
 *   node scripts/health-check.js [options]
 * 
 * Options:
 *   --url <url>        API base URL (default: http://localhost:3001)
 *   --detailed         Run detailed health check
 *   --timeout <ms>     Request timeout (default: 10000)
 *   --retries <count>  Number of retries (default: 3)
 *   --interval <ms>    Check interval for continuous mode (default: 30000)
 *   --continuous       Run continuously
 *   --exit-on-fail     Exit with error code on failure
 */

const axios = require('axios');
const chalk = require('chalk');

// Configuration
const config = {
  baseUrl: 'http://localhost:3001',
  timeout: 10000,
  retries: 3,
  interval: 30000,
  continuous: false,
  detailed: false,
  exitOnFail: false
};

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--url':
        config.baseUrl = args[++i];
        break;
      case '--detailed':
        config.detailed = true;
        break;
      case '--timeout':
        config.timeout = parseInt(args[++i]);
        break;
      case '--retries':
        config.retries = parseInt(args[++i]);
        break;
      case '--interval':
        config.interval = parseInt(args[++i]);
        break;
      case '--continuous':
        config.continuous = true;
        break;
      case '--exit-on-fail':
        config.exitOnFail = true;
        break;
      case '--help':
        showHelp();
        process.exit(0);
        break;
    }
  }
}

function showHelp() {
  console.log(`
🏥 Malai Resort API Health Check Script

Usage:
  node scripts/health-check.js [options]

Options:
  --url <url>        API base URL (default: http://localhost:3001)
  --detailed         Run detailed health check
  --timeout <ms>     Request timeout (default: 10000)
  --retries <count>  Number of retries (default: 3)
  --interval <ms>    Check interval for continuous mode (default: 30000)
  --continuous       Run continuously
  --exit-on-fail     Exit with error code on failure
  --help             Show this help message

Examples:
  node scripts/health-check.js
  node scripts/health-check.js --detailed
  node scripts/health-check.js --url https://api.malai-resort.com --continuous
  node scripts/health-check.js --detailed --exit-on-fail
`);
}

// Health check function
async function runHealthCheck() {
  const endpoint = config.detailed ? '/health/detailed' : '/health';
  const url = `${config.baseUrl}${endpoint}`;
  
  console.log(chalk.blue(`🔍 Checking health at: ${url}`));
  
  for (let attempt = 1; attempt <= config.retries; attempt++) {
    try {
      const startTime = Date.now();
      const response = await axios.get(url, {
        timeout: config.timeout,
        headers: {
          'User-Agent': 'Malai-Health-Check/1.0.0'
        }
      });
      
      const responseTime = Date.now() - startTime;
      
      if (response.status === 200) {
        const data = response.data;
        
        // Display results
        console.log(chalk.green(`✅ Health Check Passed (${responseTime}ms)`));
        console.log(chalk.gray(`   Status: ${data.status}`));
        console.log(chalk.gray(`   Timestamp: ${data.timestamp}`));
        
        if (config.detailed && data.checks) {
          console.log(chalk.blue('\n📊 Detailed Results:'));
          data.checks.forEach(check => {
            const statusColor = check.status === 'healthy' ? chalk.green : 
                               check.status === 'warning' ? chalk.yellow : chalk.red;
            console.log(`   ${statusColor(check.status.toUpperCase())} ${check.name} (${check.responseTime})`);
            
            if (check.error) {
              console.log(chalk.red(`     Error: ${check.error}`));
            }
          });
          
          if (data.summary) {
            console.log(chalk.blue('\n📈 Summary:'));
            console.log(`   Total: ${data.summary.total}`);
            console.log(chalk.green(`   Healthy: ${data.summary.healthy}`));
            console.log(chalk.yellow(`   Warning: ${data.summary.warning}`));
            console.log(chalk.red(`   Unhealthy: ${data.summary.unhealthy}`));
          }
        }
        
        return true;
      } else {
        console.log(chalk.red(`❌ Health Check Failed (HTTP ${response.status})`));
        return false;
      }
    } catch (error) {
      console.log(chalk.red(`❌ Health Check Failed (Attempt ${attempt}/${config.retries})`));
      
      if (error.code === 'ECONNREFUSED') {
        console.log(chalk.red(`   Connection refused - Is the API server running?`));
      } else if (error.code === 'ETIMEDOUT') {
        console.log(chalk.red(`   Request timeout (${config.timeout}ms)`));
      } else if (error.response) {
        console.log(chalk.red(`   HTTP ${error.response.status}: ${error.response.statusText}`));
      } else {
        console.log(chalk.red(`   Error: ${error.message}`));
      }
      
      if (attempt < config.retries) {
        console.log(chalk.yellow(`   Retrying in 2 seconds...`));
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }
  
  return false;
}

// Continuous monitoring
async function runContinuous() {
  console.log(chalk.blue(`🔄 Starting continuous health monitoring (interval: ${config.interval}ms)`));
  console.log(chalk.gray(`   Press Ctrl+C to stop`));
  
  let successCount = 0;
  let failCount = 0;
  
  while (true) {
    const timestamp = new Date().toLocaleString();
    console.log(chalk.gray(`\n[${timestamp}] Health Check:`));
    
    const success = await runHealthCheck();
    
    if (success) {
      successCount++;
    } else {
      failCount++;
      if (config.exitOnFail) {
        console.log(chalk.red(`\n💥 Exiting due to health check failure`));
        process.exit(1);
      }
    }
    
    console.log(chalk.gray(`   Success: ${successCount}, Failed: ${failCount}`));
    
    await new Promise(resolve => setTimeout(resolve, config.interval));
  }
}

// Main function
async function main() {
  parseArgs();
  
  console.log(chalk.blue('🏥 Malai Resort API Health Check'));
  console.log(chalk.gray(`   URL: ${config.baseUrl}`));
  console.log(chalk.gray(`   Mode: ${config.detailed ? 'Detailed' : 'Quick'}`));
  console.log(chalk.gray(`   Timeout: ${config.timeout}ms`));
  console.log(chalk.gray(`   Retries: ${config.retries}`));
  
  if (config.continuous) {
    await runContinuous();
  } else {
    const success = await runHealthCheck();
    
    if (!success && config.exitOnFail) {
      console.log(chalk.red(`\n💥 Health check failed`));
      process.exit(1);
    }
  }
}

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log(chalk.yellow('\n\n👋 Health check stopped'));
  process.exit(0);
});

// Run the script
main().catch(error => {
  console.error(chalk.red('💥 Script error:'), error);
  process.exit(1);
});
