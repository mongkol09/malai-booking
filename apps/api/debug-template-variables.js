// Debug Template Variables Issue
require('dotenv').config();
const { MailerSend, EmailParams, Sender, Recipient } = require('mailersend');

const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_TOKEN || '',
});

async function debugTemplateVariables() {
  console.log('🔍 Debugging Template Variables Issue...\n');
  
  try {
    // Step 1: Check current configuration
    console.log('📋 1. Current Configuration:');
    console.log(`   Template ID: ${process.env.BOOKING_CONFIRMATION_TEMPLATE_ID}`);
    console.log(`   From Email: ${process.env.FROM_EMAIL}`);
    console.log(`   API Token: ${process.env.MAILERSEND_API_TOKEN ? 'Configured' : 'Missing'}\n`);
    
    // Step 2: Test with SIMPLE flat structure first
    console.log('🧪 2. Testing with SIMPLE flat structure...');
    await testSimpleStructure();
    
    // Step 3: Test with EXACT structure from image
    console.log('\n🎯 3. Testing with EXACT structure from email template...');
    await testExactStructure();
    
    // Step 4: Test with different template approach
    console.log('\n🔄 4. Testing alternative approaches...');
    await testAlternativeApproaches();
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

async function testSimpleStructure() {
  try {
    const simpleData = {
      name: 'คุณทดสอบ',
      booking_id: 'HTL123456',
      hotel_name: 'Malai Khaoyai Resort',
      customer_city: 'กรุงเทพมหานคร',
      customer_country: 'ประเทศไทย',
      customer_postal_code: '10110',
      room_type: 'Deluxe Garden View',
      Customer_name: 'คุณทดสอบ',
      customer_email: 'test@example.com',
      hotel_phone: '+66 44 123 456',
      hotel_email: 'center@malaikhaoyai.com',
      hotel_website: 'https://malaikhaoyai.com',
      manage_booking_url: 'https://app.malaikhaoyai.com/booking/HTL123456',
      receipt_url: 'https://app.malaikhaoyai.com/receipt/123'
    };

    console.log('   📤 Sending with simple flat structure...');
    const result = await sendTestEmail('Simple Structure Test', simpleData);
    console.log(`   ${result.success ? '✅' : '❌'} Simple Structure: ${result.success ? 'Sent' : result.error}`);
    
  } catch (error) {
    console.log(`   ❌ Simple Structure: Failed - ${error.message}`);
  }
}

async function testExactStructure() {
  try {
    // Exact structure matching the template variables from the image
    const exactData = {
      // Basic fields from image
      name: 'คุณทดสอบ ระบบ',
      booking_id: 'HTL789012',
      hotel_name: 'Malai Khaoyai Resort',
      customer_city: 'เชียงใหม่',
      customer_country: 'ประเทศไทย', 
      customer_postal_code: '50000',
      room_type: 'Superior Pool View',
      Customer_name: 'คุณทดสอบ ระบบ',
      customer_email: 'test@malaikhaoyai.com',
      
      // Nested structures (as seen in our previous tests)
      'check.in.date.time': '15 สิงหาคม 2568 15:00 น.',
      'Check.out.date.time': '17 สิงหาคม 2568 11:00 น.',
      
      // Try both nested and flat for phone
      'cuntomer_phone.no': '+66 89 123 4567',
      cuntomer_phone: { no: '+66 89 123 4567' },
      
      // Price fields
      price: '4,500',
      'Vat.tax': '0.00',
      'price.included.tax': '4,500 บาท',
      Vat: { tax: '0.00' },
      
      // Hotel contact
      hotel_phone: '+66 44 123 456',
      hotel_email: 'center@malaikhaoyai.com', 
      hotel_website: 'https://malaikhaoyai.com',
      hotel_address: '199 หมู่ 4 ตำบลโคกกรวด อำเภอปากช่อง จังหวัดนครราชสีมา',
      hotel_signature_name: 'ทีมงาน Malai Khaoyai Resort',
      
      // URLs
      manage_booking_url: 'https://app.malaikhaoyai.com/booking/HTL789012',
      receipt_url: 'https://app.malaikhaoyai.com/receipt/789012'
    };

    console.log('   📤 Sending with exact structure...');
    const result = await sendTestEmail('Exact Structure Test', exactData);
    console.log(`   ${result.success ? '✅' : '❌'} Exact Structure: ${result.success ? 'Sent' : result.error}`);
    
    // Show what we're sending
    console.log('   📋 Data being sent:');
    Object.keys(exactData).forEach(key => {
      const value = typeof exactData[key] === 'object' ? JSON.stringify(exactData[key]) : exactData[key];
      const displayValue = value.length > 50 ? value.substring(0, 50) + '...' : value;
      console.log(`      ${key}: ${displayValue}`);
    });
    
  } catch (error) {
    console.log(`   ❌ Exact Structure: Failed - ${error.message}`);
  }
}

async function testAlternativeApproaches() {
  // Test 1: Try without template ID (HTML email)
  console.log('   🔬 Test 1: Without template ID...');
  try {
    const result = await sendTestEmail('No Template Test', { name: 'Test User' }, null);
    console.log(`   ${result.success ? '✅' : '❌'} No Template: ${result.success ? 'Sent' : result.error}`);
  } catch (error) {
    console.log(`   ❌ No Template: Failed - ${error.message}`);
  }
  
  // Test 2: Try with minimal data
  console.log('   🔬 Test 2: Minimal data...');
  try {
    const minimalData = {
      name: 'Minimal Test',
      booking_id: 'MIN123'
    };
    const result = await sendTestEmail('Minimal Data Test', minimalData);
    console.log(`   ${result.success ? '✅' : '❌'} Minimal Data: ${result.success ? 'Sent' : result.error}`);
  } catch (error) {
    console.log(`   ❌ Minimal Data: Failed - ${error.message}`);
  }
  
  // Test 3: Try different template ID format
  console.log('   🔬 Test 3: Alternative template handling...');
  try {
    const altData = {
      name: 'Alternative Test',
      booking_id: 'ALT456',
      test_field: 'This is a test value'
    };
    const result = await sendTestEmailAlt('Alternative Test', altData);
    console.log(`   ${result.success ? '✅' : '❌'} Alternative: ${result.success ? 'Sent' : result.error}`);
  } catch (error) {
    console.log(`   ❌ Alternative: Failed - ${error.message}`);
  }
}

async function sendTestEmail(testName, data, templateId = null) {
  try {
    const sentFrom = new Sender(
      process.env.FROM_EMAIL || 'center@malaikhaoyai.com',
      'Malai Khaoyai Debug Test'
    );

    const recipients = [new Recipient('ruuk@malaikhaoyai.com', 'Debug Test User')];

    const personalization = [{
      email: 'ruuk@malaikhaoyai.com',
      data: data
    }];

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setReplyTo(sentFrom)
      .setSubject(`🔍 Debug: ${testName} - ${new Date().toLocaleTimeString()}`)
      .setPersonalization(personalization);

    // Use template ID if provided, otherwise current one
    const useTemplateId = templateId || process.env.BOOKING_CONFIRMATION_TEMPLATE_ID || 'jpzkmgqqwyvg059v';
    if (useTemplateId) {
      emailParams.setTemplateId(useTemplateId);
    }

    const response = await mailerSend.email.send(emailParams);
    
    return {
      success: true,
      messageId: response.body?.message_id || 'unknown'
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function sendTestEmailAlt(testName, data) {
  try {
    const sentFrom = new Sender(
      process.env.FROM_EMAIL || 'center@malaikhaoyai.com',
      'Malai Khaoyai Alt Test'
    );

    const recipients = [new Recipient('ruuk@malaikhaoyai.com', 'Alt Test User')];

    // Try different personalization format
    const personalization = [{
      email: 'ruuk@malaikhaoyai.com',
      data: {
        ...data,
        // Add some standard fields
        subject: `Debug Test: ${testName}`,
        preheader: 'This is a debug test email'
      }
    }];

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setSubject(`🧪 Alt Debug: ${testName}`)
      .setPersonalization(personalization);

    // Try without template ID first
    const response = await mailerSend.email.send(emailParams);
    
    return {
      success: true,
      messageId: response.body?.message_id || 'unknown'
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Check MailerSend API directly
async function checkMailerSendAPI() {
  try {
    console.log('\n🔍 5. Checking MailerSend API capabilities...');
    
    // Try to get account info (if possible with trial account)
    const basicTest = await mailerSend.email.send(new EmailParams()
      .setFrom(new Sender(process.env.FROM_EMAIL, 'API Test'))
      .setTo([new Recipient('ruuk@malaikhaoyai.com', 'API Test')])
      .setSubject('API Connection Test')
      .setText('This is a basic API test')
    );
    
    console.log('   ✅ MailerSend API is accessible');
    console.log(`   📧 Basic email status: ${basicTest.statusCode}`);
    
  } catch (error) {
    console.log(`   ❌ MailerSend API issue: ${error.message}`);
  }
}

// Main execution
debugTemplateVariables()
  .then(() => checkMailerSendAPI())
  .then(() => {
    console.log('\n🎯 Debug Summary:');
    console.log('1. Check your email inbox for multiple test emails');
    console.log('2. Compare which format shows actual data vs placeholders');
    console.log('3. Check MailerSend dashboard for template configuration');
    console.log('4. Verify template ID matches the one you created');
    console.log('\n💡 Common solutions:');
    console.log('• Template ID mismatch - check MailerSend dashboard');
    console.log('• Variables not mapped in template editor');
    console.log('• Trial account limitations on variable processing');
    console.log('• Template not published/saved properly');
  })
  .catch(error => {
    console.error('Debug script failed:', error);
  });
