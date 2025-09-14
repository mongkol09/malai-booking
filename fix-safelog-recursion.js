const fs = require('fs');
const path = require('path');

// Script to fix infinite recursion in safeLog functions

const filesWithBadSafeLog = [
  'app/admin/src/services/authService.js',
  'app/admin/src/services/checkoutService.js',
  'app/admin/src/services/pinAuthService.js',
  'app/admin/src/services/roomService_new.js',
  'app/admin/src/services/roomStatusService.js',
  'app/admin/src/services/userService.js',
  'app/admin/src/services/roomService.js',
  'app/admin/src/services/professionalCheckinService.js',
  'app/admin/src/services/createBooking_fixed.js',
  'app/admin/src/services/bookingService.js',
  'app/admin/src/services/bookingService-fixed.js',
  'app/admin/src/services/bookingService-backup.js',
  'app/admin/src/services/authTokenService.js',
  'app/admin/src/services/apiService.js'
];

const projectRoot = 'd:\\Hotel_Version\\hotel_v2';

console.log('🔧 Fixing infinite recursion in safeLog functions...');
let filesFixed = 0;

filesWithBadSafeLog.forEach(relativePath => {
  const filePath = path.join(projectRoot, relativePath);
  
  if (fs.existsSync(filePath)) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Fix the infinite recursion: safeLog(message, data); -> console.log(message, data);
      const originalContent = content;
      content = content.replace(
        /safeLog\(message, data\);/g,
        'console.log(message, data);'
      );
      
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Fixed: ${relativePath}`);
        filesFixed++;
      } else {
        console.log(`⚠️  No changes needed: ${relativePath}`);
      }
    } catch (error) {
      console.error(`❌ Error processing ${relativePath}:`, error.message);
    }
  } else {
    console.log(`⚠️  File not found: ${relativePath}`);
  }
});

console.log(`\n🎉 Fixed infinite recursion in ${filesFixed} files!`);