// Test simple template variable replacement

async function testVariableReplacement() {
  console.log('🧪 Testing variable replacement in custom template...');
  
  try {
    // Import the template dynamically
    const { bookingConfirmationTemplate } = await import('./dist/templates/bookingConfirmationTemplate.js');
    
    // Mock data
    const templateData = {
      guest_name: 'สมชาย ใจดี',
      guest_email: 'test@example.com',
      guest_phone: '+66-81-234-5678',
      guest_country: 'Thailand',
      booking_reference: 'MKR-1234567890',
      booking_status: 'ยืนยันแล้ว',
      checkin_date: 'วันศุกร์ที่ 15 กุมภาพันธ์ 2567',
      checkout_date: 'วันอาทิตย์ที่ 17 กุมภาพันธ์ 2567',
      room_type: 'Deluxe Garden View',
      room_number: 'จะแจ้งให้ทราบในวันเช็คอิน',
      guest_count: 2,
      nights: 2,
      total_amount: '4,500',
      qr_code_url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAGI...'
    };
    
    // Replace variables in template
    let htmlContent = bookingConfirmationTemplate;
    
    console.log('📋 Template variables to replace:');
    Object.keys(templateData).forEach(key => {
      const placeholder = `{{${key}}}`;
      const value = templateData[key] || '';
      const beforeCount = (htmlContent.match(new RegExp(placeholder, 'g')) || []).length;
      htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), value);
      const afterCount = (htmlContent.match(new RegExp(placeholder, 'g')) || []).length;
      
      if (beforeCount > 0) {
        console.log(`✅ Replaced ${beforeCount} instances of ${placeholder} with "${value}"`);
      }
    });
    
    // Check for remaining unreplaced variables
    const remainingVariables = htmlContent.match(/{{[^}]+}}/g);
    
    if (remainingVariables) {
      console.log('⚠️  Unreplaced variables found:');
      remainingVariables.forEach(variable => {
        console.log(`   - ${variable}`);
      });
    } else {
      console.log('✅ All variables replaced successfully!');
    }
    
    // Save the processed template to check
    const fs = require('fs');
    fs.writeFileSync('./test-email-output.html', htmlContent);
    console.log('📄 Processed email saved as test-email-output.html');
    
    return htmlContent;
  } catch (error) {
    console.error('❌ Error testing template:', error);
  }
}

// Run the test
testVariableReplacement();
