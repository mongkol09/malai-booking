// Test MailerSend Template Integration
// Run: node test-email.js

require('dotenv').config();
const { MailerSend, EmailParams, Sender, Recipient } = require('mailersend');

const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_TOKEN || '',
});

async function testBookingConfirmationEmail() {
  try {
    console.log('🧪 Testing MailerSend template integration...');
    console.log('Template ID:', process.env.BOOKING_CONFIRMATION_TEMPLATE_ID || 'jpzkmgqqwyvg059v');
    
    // Test data matching your template variables
    const testEmailData = {
      // Basic booking info
      booking_id: 'HTL240811001',
      Customer_name: 'John Doe',
      name: 'John Doe',
      customer_email: 'john.doe@example.com',
      customer_city: 'Bangkok',
      customer_country: 'Thailand',
      account_name: 'John Doe',
      
      // Hotel info
      hotel_name: process.env.FROM_NAME || 'Malai Resort',
      hotel_email: process.env.FROM_EMAIL || 'center@malaikhaoyai.com',
      hotel_phone: '+66 XX XXX XXXX',
      hotel_address: 'Malai Khaoyai Resort Address',
      hotel_website: 'https://malaikhaoyai.com',
      hotel_signature_name: 'Malai Resort Team',
      
      // Room and stay details
      room_type: 'Deluxe Garden View',
      guest_count: '2',
      nights: '2',
      
      // Dates and times
      check_in_date: '12/08/2025',
      check_in_time: '15:00',
      check_out_date: '14/08/2025',
      check_out_time: '11:00',
      
      // Financial info
      price: '4,500',
      total: '4,500',
      tax: '0',
      
      // QR Code for check-in (base64 data URL)
      qr_code_data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      
      // Additional URLs
      receipt_url: `${process.env.FRONTEND_URL || 'https://app.malaikhaoyai.com'}/receipt/test123`,
      manage_booking_url: `${process.env.FRONTEND_URL || 'https://app.malaikhaoyai.com'}/booking/HTL240811001`,
    };

    const sentFrom = new Sender(
      'MS_w7nYvI@test-nrw7gymv5mog2k8e.mlsender.net', // ใช้ verified sender
      process.env.FROM_NAME || 'Malai Resort'
    );

    // 👈 ใช้ email ที่ work แล้ว!
    const testEmail = 'ruuk@malaikhaoyai.com';
    const recipients = [new Recipient(testEmail, 'Test User')];

    const personalization = [{
      email: testEmail,
      data: testEmailData
    }];

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setReplyTo(sentFrom)
      .setSubject(`🧪 Test: ยืนยันการจองหมายเลข ${testEmailData.booking_id}`)
      .setTemplateId(process.env.BOOKING_CONFIRMATION_TEMPLATE_ID || 'jpzkmgqqwyvg059v')
      .setPersonalization(personalization);

    console.log('📤 Sending test email to:', testEmail);
    console.log('📋 Template variables:', Object.keys(testEmailData));
    
    const response = await mailerSend.email.send(emailParams);
    
    console.log('✅ Test email sent successfully!');
    console.log('📊 Response:', {
      messageId: response.body?.message_id,
      status: response.statusCode
    });
    
    console.log('\n📝 Next steps:');
    console.log('1. Check your email inbox');
    console.log('2. Verify all template variables are populated correctly');
    console.log('3. Check if QR code displays properly');
    console.log('4. Test all links (receipt_url, manage_booking_url)');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check MAILERSEND_API_TOKEN in .env file');
    console.log('2. Verify template ID is correct');
    console.log('3. Make sure FROM_EMAIL is verified in MailerSend');
    console.log('4. Check template variable names match');
  }
}

// Run test
testBookingConfirmationEmail();
