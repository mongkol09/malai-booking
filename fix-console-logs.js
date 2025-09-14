#!/usr/bin/env node

/**
 * 🔧 Fix Console Log Vulnerabilities Script
 * 
 * แก้ไข console.log ที่เปิดเผยข้อมูลสำคัญใน production
 * โดยเปลี่ยนเป็น conditional logging
 * 
 * Usage: node fix-console-logs.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const SEARCH_DIRS = [
  './app/admin/src/services',
  './app/admin/src/components'
];

const FILE_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx'];

// Sensitive data patterns to replace
const SENSITIVE_PATTERNS = [
  /console\.log\([^)]*(?:token|password|secret|key|credential|auth)[^)]*\)/gi,
  /console\.log\([^)]*process\.env[^)]*\)/gi,
  /console\.log\([^)]*API.*[Kk]ey[^)]*\)/gi,
  /console\.log\([^)]*Bearer[^)]*\)/gi
];

// General console.log pattern
const CONSOLE_LOG_PATTERN = /console\.log\(/g;

/**
 * 📝 Log helper
 */
const log = {
  info: (msg) => console.log(`ℹ️  ${msg}`),
  success: (msg) => console.log(`✅ ${msg}`),
  warning: (msg) => console.log(`⚠️  ${msg}`),
  error: (msg) => console.log(`❌ ${msg}`),
  title: (msg) => console.log(`\n🚀 ${msg}\n${'='.repeat(50)}`)
};

/**
 * 🔍 Recursively find all files with specified extensions
 */
function findFiles(dir, extensions) {
  let results = [];
  
  if (!fs.existsSync(dir)) {
    log.warning(`Directory not found: ${dir}`);
    return results;
  }

  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // Skip node_modules and backup directories
      if (!item.includes('node_modules') && !item.includes('backup')) {
        results = results.concat(findFiles(fullPath, extensions));
      }
    } else if (stat.isFile()) {
      const ext = path.extname(item);
      if (extensions.includes(ext)) {
        results.push(fullPath);
      }
    }
  }

  return results;
}

/**
 * 🔄 Create safe logging utility at top of file
 */
function addSafeLoggingUtility(content, filePath) {
  // Check if safeLog already exists
  if (content.includes('const safeLog') || content.includes('function safeLog')) {
    return content;
  }

  const isTypeScript = filePath.endsWith('.ts') || filePath.endsWith('.tsx');
  
  const safeLogUtility = isTypeScript ? 
    `// Safe logging utility - only logs in development
const safeLog = (message: string, data?: any): void => {
  if (process.env.NODE_ENV === 'development') {
    console.log(message, data);
  }
};

` : 
    `// Safe logging utility - only logs in development
const safeLog = (message, data) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(message, data);
  }
};

`;

  // Add after imports or at the beginning
  const importEndIndex = content.lastIndexOf('import ');
  const requireEndIndex = content.lastIndexOf('require(');
  
  let insertIndex = 0;
  if (importEndIndex > -1) {
    insertIndex = content.indexOf('\n', importEndIndex) + 1;
  } else if (requireEndIndex > -1) {
    insertIndex = content.indexOf('\n', requireEndIndex) + 1;
  }

  if (insertIndex > 0) {
    return content.slice(0, insertIndex) + '\n' + safeLogUtility + content.slice(insertIndex);
  } else {
    return safeLogUtility + content;
  }
}

/**
 * 🔄 Replace sensitive console.logs in file content
 */
function fixConsoleLogsInContent(content, filePath) {
  let modifiedContent = content;
  let changeCount = 0;

  // First, add safe logging utility
  modifiedContent = addSafeLoggingUtility(modifiedContent, filePath);

  // Replace sensitive console.log calls
  SENSITIVE_PATTERNS.forEach((pattern) => {
    const matches = modifiedContent.match(pattern);
    if (matches) {
      matches.forEach((match) => {
        const replacement = match.replace('console.log(', 'safeLog(');
        modifiedContent = modifiedContent.replace(match, replacement);
        changeCount++;
      });
    }
  });

  // Replace remaining console.log with conditional logging for debugging
  const debugPattern = /console\.log\(([^)]*)\)/g;
  const debugMatches = modifiedContent.match(debugPattern);
  
  if (debugMatches) {
    debugMatches.forEach((match) => {
      // Skip if already converted to safeLog
      if (match.includes('safeLog')) return;
      
      const replacement = match.replace('console.log(', 'safeLog(');
      modifiedContent = modifiedContent.replace(match, replacement);
      changeCount++;
    });
  }

  return { content: modifiedContent, changes: changeCount };
}

/**
 * 📁 Process a single file
 */
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check if file contains console.log
    if (!content.includes('console.log')) {
      return { processed: false, changes: 0 };
    }

    const { content: newContent, changes } = fixConsoleLogsInContent(content, filePath);

    if (changes > 0) {
      // Create backup
      const backupPath = `${filePath}.backup`;
      fs.writeFileSync(backupPath, content);
      
      // Write updated content
      fs.writeFileSync(filePath, newContent);
      
      log.success(`Fixed ${changes} console.log(s) in: ${filePath}`);
      return { processed: true, changes };
    }

    return { processed: false, changes: 0 };
  } catch (error) {
    log.error(`Error processing ${filePath}: ${error.message}`);
    return { processed: false, changes: 0, error: error.message };
  }
}

/**
 * 🎯 Main execution function
 */
async function main() {
  log.title('Fix Console Log Vulnerabilities Script');
  
  let totalFiles = 0;
  let processedFiles = 0;
  let totalChanges = 0;
  const errors = [];

  log.info('🔍 Searching for files with console.log...');

  // Find all files
  let allFiles = [];
  for (const dir of SEARCH_DIRS) {
    const files = findFiles(dir, FILE_EXTENSIONS);
    allFiles = allFiles.concat(files);
  }

  totalFiles = allFiles.length;
  log.info(`Found ${totalFiles} files to check`);

  log.info('🔄 Processing files...');

  // Process each file
  for (const filePath of allFiles) {
    const result = processFile(filePath);
    
    if (result.processed) {
      processedFiles++;
      totalChanges += result.changes;
    }
    
    if (result.error) {
      errors.push({ file: filePath, error: result.error });
    }
  }

  // Summary
  log.title('Summary');
  log.info(`📊 Total files checked: ${totalFiles}`);
  log.success(`✨ Files modified: ${processedFiles}`);
  log.success(`🔧 Total console.log fixed: ${totalChanges}`);

  if (errors.length > 0) {
    log.warning(`⚠️  Errors encountered: ${errors.length}`);
    errors.forEach(({ file, error }) => {
      log.error(`${file}: ${error}`);
    });
  }

  if (processedFiles > 0) {
    log.info('\n📋 Next steps:');
    log.info('1. ✅ Verify changes by testing the application');
    log.info('2. 🗑️  Remove backup files (.backup) if everything works');
    log.info('3. 🚀 Deploy changes to production');
    log.info('\n💡 All console.log calls are now conditional (development only)');
    log.info('   Production builds will not show sensitive logs');
  } else {
    log.warning('No files needed modification.');
  }
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    log.error(`Script failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { main, processFile, fixConsoleLogsInContent };