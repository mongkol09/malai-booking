// Simple test without template to check account limits
require('dotenv').config();
const { MailerSend, EmailParams, Sender, Recipient } = require('mailersend');

const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_TOKEN || '',
});

async function testSimpleEmail() {
  try {
    console.log('🧪 Testing simple email (no template)...');
    
    const sentFrom = new Sender(
      'MS_w7nYvI@test-nrw7gymv5mog2k8e.mlsender.net',
      'Malai Resort Test'
    );

    // ลองส่งไปหา email อื่นๆ ที่อาจจะเป็น admin
    const testEmails = [
      'ruuk@malaikhaoyai.com', // email ที่สมัคร MailerSend
      'MS_w7nYvI@test-nrw7gymv5mog2k8e.mlsender.net', // verified sender
      'admin@yourhotel.com', // from .env
      'ruuk@malaikhaoyai.com', // from .env
      'test@example.com' // generic test
    ];

    for (const email of testEmails) {
      try {
        console.log(`\n📤 Testing with: ${email}`);
        
        const recipients = [new Recipient(email, 'Test User')];

        const emailParams = new EmailParams()
          .setFrom(sentFrom)
          .setTo(recipients)
          .setSubject('🧪 MailerSend Account Test')
          .setHtml('<h1>Test Email</h1><p>This is a simple test email to check account permissions.</p>')
          .setText('This is a simple test email to check account permissions.');

        const response = await mailerSend.email.send(emailParams);
        
        console.log(`✅ Success with ${email}!`);
        console.log('📊 Response:', {
          messageId: response.body?.message_id,
          status: response.statusCode
        });
        
        console.log(`\n🎯 Found working email: ${email}`);
        console.log('Use this email for template testing!');
        break;
        
      } catch (error) {
        console.log(`❌ Failed with ${email}:`, error.body?.message || error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ General error:', error);
  }
}

testSimpleEmail();
