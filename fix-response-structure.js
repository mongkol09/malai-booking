const fs = require('fs');

// Files to fix
const testFiles = [
  'd:\\Hotel_booking\\test-session-database.js'
];

// Pattern replacements for response structure
const replacements = [
  {
    search: /loginResponse\.data\.accessToken/g,
    replace: 'loginResponse.data.data?.tokens?.accessToken'
  },
  {
    search: /adminLogin\.data\.accessToken/g,
    replace: 'adminLogin.data.data?.tokens?.accessToken'
  },
  {
    search: /userLogin\.data\.accessToken/g,
    replace: 'userLogin.data.data?.tokens?.accessToken'
  },
  {
    search: /refreshResponse\.data\.accessToken/g,
    replace: 'refreshResponse.data.data?.tokens?.accessToken'
  },
  {
    search: /login\.data\.accessToken/g,
    replace: 'login.data.data?.tokens?.accessToken'
  },
  {
    search: /secondLogin\.data\.accessToken/g,
    replace: 'secondLogin.data.data?.tokens?.accessToken'
  },
  {
    search: /\.data\.refreshToken/g,
    replace: '.data.data?.tokens?.refreshToken'
  },
  {
    search: /\.data\.sessionId/g,
    replace: '.data.data?.sessionId'
  }
];

testFiles.forEach(filePath => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    console.log(`Fixing ${filePath}...`);
    
    replacements.forEach(({ search, replace }) => {
      const matches = content.match(search);
      if (matches) {
        console.log(`  - Replacing ${matches.length} instances of ${search}`);
        content = content.replace(search, replace);
      }
    });
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed ${filePath}`);
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
  }
});

console.log('✅ All files fixed!');
