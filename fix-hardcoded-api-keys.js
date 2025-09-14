#!/usr/bin/env node

/**
 * 🔧 Fix Hardcoded API Keys Script
 * 
 * แก้ไข hardcoded API key 'hotel-booking-api-key-2024' 
 * ให้เป็น environment variable ทั้งหมดในโปรเจค
 * 
 * Usage: node fix-hardcoded-api-keys.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const OLD_API_KEY = 'hotel-booking-api-key-2024';
const NEW_API_KEY_PATTERN = 'process.env.REACT_APP_API_KEY || process.env.REACT_APP_API_KEY_FALLBACK';

// Directories to search
const SEARCH_DIRS = [
  './app/admin/src/components',
  './app/admin/src/services',
  './app/admin/src/Tuning',
  './app/admin/src/contexts'
];

// File extensions to process
const FILE_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx'];

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
 * 🔄 Replace hardcoded API keys in file content
 */
function replaceApiKeysInContent(content, filePath) {
  let modifiedContent = content;
  let changeCount = 0;

  // Pattern 1: 'X-API-Key': 'hotel-booking-api-key-2024'
  const pattern1 = /'X-API-Key'\s*:\s*'hotel-booking-api-key-2024'/g;
  const replacement1 = `'X-API-Key': ${NEW_API_KEY_PATTERN}`;
  
  const matches1 = modifiedContent.match(pattern1);
  if (matches1) {
    modifiedContent = modifiedContent.replace(pattern1, replacement1);
    changeCount += matches1.length;
  }

  // Pattern 2: "X-API-Key": "hotel-booking-api-key-2024"
  const pattern2 = /"X-API-Key"\s*:\s*"hotel-booking-api-key-2024"/g;
  const replacement2 = `"X-API-Key": ${NEW_API_KEY_PATTERN}`;
  
  const matches2 = modifiedContent.match(pattern2);
  if (matches2) {
    modifiedContent = modifiedContent.replace(pattern2, replacement2);
    changeCount += matches2.length;
  }

  // Pattern 3: const API_KEY = 'hotel-booking-api-key-2024'
  const pattern3 = /const\s+API_KEY\s*=\s*'hotel-booking-api-key-2024'/g;
  const replacement3 = `const API_KEY = ${NEW_API_KEY_PATTERN}`;
  
  const matches3 = modifiedContent.match(pattern3);
  if (matches3) {
    modifiedContent = modifiedContent.replace(pattern3, replacement3);
    changeCount += matches3.length;
  }

  return { content: modifiedContent, changes: changeCount };
}

/**
 * 📁 Process a single file
 */
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check if file contains hardcoded API key
    if (!content.includes(OLD_API_KEY)) {
      return { processed: false, changes: 0 };
    }

    const { content: newContent, changes } = replaceApiKeysInContent(content, filePath);

    if (changes > 0) {
      // Create backup
      const backupPath = `${filePath}.backup`;
      fs.writeFileSync(backupPath, content);
      
      // Write updated content
      fs.writeFileSync(filePath, newContent);
      
      log.success(`Fixed ${changes} API key(s) in: ${filePath}`);
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
  log.title('Fix Hardcoded API Keys Script');
  
  let totalFiles = 0;
  let processedFiles = 0;
  let totalChanges = 0;
  const errors = [];

  log.info('🔍 Searching for files...');

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
  log.success(`🔧 Total changes made: ${totalChanges}`);

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
    log.info('3. 🚀 Commit changes to git');
    log.info('\n💡 Backup files created for safety - remove with:');
    log.info('   find . -name "*.backup" -delete');
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

module.exports = { main, processFile, replaceApiKeysInContent };