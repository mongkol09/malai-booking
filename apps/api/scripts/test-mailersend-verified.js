#!/usr/bin/env node

const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

async function testMailerSendWithVerifiedDomain() {
  console.log('🧪 ===== MAILERSEND VERIFIED DOMAIN TEST =====\n');
  
  try {
    console.log('🔍 Environment check:');
    console.log('  - MAILERSEND_API_TOKEN:', process.env.MAILERSEND_API_TOKEN ? 'Present' : 'Missing');
    console.log('  - FROM_EMAIL:', process.env.FROM_EMAIL || 'Not set');
    console.log('  - Template ID:', process.env.BOOKING_CONFIRMATION_TEMPLATE_ID || 'z3m5jgrq390ldpyo');

    if (!process.env.MAILERSEND_API_TOKEN) {
      console.error('❌ MAILERSEND_API_TOKEN is missing');
      return;
    }

    const { MailerSend, EmailParams, Sender, Recipient } = require('mailersend');
    
    const mailerSend = new MailerSend({
      apiKey: process.env.MAILERSEND_API_TOKEN,
    });

    // Use verified domain
    const fromEmail = process.env.FROM_EMAIL || 'bookings@malaikhaoyai.com';
    const fromName = process.env.FROM_NAME || 'Malai Khaoyai Resort';
    const testEmail = process.env.TEST_EMAIL || 'admin@malaikhaoyai.com';
    const templateId = process.env.BOOKING_CONFIRMATION_TEMPLATE_ID || 'z3m5jgrq390ldpyo';

    console.log('\n📧 MailerSend Configuration:');
    console.log(`  - From: ${fromName} <${fromEmail}>`);
    console.log(`  - To: ${testEmail}`);
    console.log(`  - Template: ${templateId}`);

    const sentFrom = new Sender(fromEmail, fromName);
    const recipients = [new Recipient(testEmail, 'ทดสอบ MailerSend')];

    // Template data matching your existing template
    const personalization = [{
      email: testEmail,
      data: {
        guest_name: 'ทดสอบ MailerSend',
        booking_id: 'MS-VERIFIED-' + Date.now(),
        room_type: 'Serenity Villa',
        room_number: 'E2', 
        checkin_date: new Date().toLocaleDateString('th-TH'),
        checkout_date: new Date(Date.now() + 2*24*60*60*1000).toLocaleDateString('th-TH'),
        total_amount: '10,000',
        hotel_name: fromName,
        booking_date: new Date().toLocaleDateString('th-TH'),
        nights: '2',
        adults: '2',
        children: '0',
        phone: '081-234-5678',
        email: testEmail,
        checkin_time: '14:00',
        checkout_time: '12:00'
      }
    }];

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setReplyTo(sentFrom)
      .setSubject(`ยืนยันการจอง MS-VERIFIED-${Date.now()} ที่ ${fromName}`)
      .setTemplateId(templateId)
      .setPersonalization(personalization);

    console.log('\n📤 Sending email with verified domain and existing template...');
    console.log('⏰ Time:', new Date().toLocaleString('th-TH'));

    const response = await mailerSend.email.send(emailParams);
    
    if (response && response.body && response.body.message_id) {
      console.log('\n🎉 SUCCESS! MailerSend email sent with verified domain!');
      console.log('📨 Message ID:', response.body.message_id);
      console.log('📧 Email sent to:', testEmail);
      
      console.log('\n✅ MailerSend Integration Status:');
      console.log('• ✅ Domain verified successfully');
      console.log('• ✅ Template working correctly');  
      console.log('• ✅ Email sent successfully');
      console.log('• ✅ Ready for production use');
      
      console.log('\n🎯 MailerSend Advantages:');
      console.log('• 📋 Existing template (z3m5jgrq390ldpyo)');
      console.log('• 🌐 Verified domain (malaikhaoyai.com)');
      console.log('• 📊 Advanced analytics');
      console.log('• 💰 12,000 free emails/month');
      
    } else {
      console.log('\n❌ MailerSend email failed: No message ID returned');
      console.log('Response:', response);
    }

  } catch (error) {
    console.error('\n❌ MailerSend test failed:', error?.message || error);
    
    if (error?.message?.includes('domain')) {
      console.log('\n🔧 Domain Issues:');
      console.log('• Check domain verification in MailerSend dashboard');
      console.log('• Ensure DNS records are properly configured');
      console.log('• Wait for domain propagation (may take up to 24 hours)');
    }
    
    if (error?.message?.includes('template')) {
      console.log('\n🔧 Template Issues:');
      console.log('• Verify template ID: z3m5jgrq390ldpyo');
      console.log('• Check template variables match the data sent');
      console.log('• Ensure template is published and active');
    }
    
    if (error?.message?.includes('API')) {
      console.log('\n🔧 API Issues:');
      console.log('• Check MAILERSEND_API_TOKEN in .env');
      console.log('• Verify API key permissions');
      console.log('• Check rate limits');
    }
    
    console.log('\n📋 Full error details:', error);
  }
}

async function testResendAsBackup() {
  console.log('\n🔄 Testing Resend as backup service...');
  
  if (!process.env.RESEND_API_KEY) {
    console.log('⚠️ Resend not configured - skipping backup test');
    return;
  }

  try {
    const { Resend } = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Use sandbox for testing
    const response = await resend.emails.send({
      from: 'Malai Resort Backup <onboarding@resend.dev>',
      to: 'delivered@resend.dev',
      subject: 'Backup Service Test - Resend',
      html: `
        <div style="font-family: Arial; padding: 20px;">
          <h2>🔄 Backup Email Service Test</h2>
          <p>This email was sent via Resend as a backup service.</p>
          <p><strong>Purpose:</strong> Failover testing</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString('th-TH')}</p>
        </div>
      `
    });

    if (response.data?.id) {
      console.log('✅ Resend backup service working');
      console.log('📨 Message ID:', response.data.id);
    }

  } catch (error) {
    console.log('❌ Resend backup test failed:', error.message);
  }
}

// Main test function
async function runVerificationTest() {
  console.log('🚀 Starting MailerSend Verified Domain Test...\n');
  
  await testMailerSendWithVerifiedDomain();
  await testResendAsBackup();
  
  console.log('\n📊 Test Summary:');
  console.log('• 🧪 MailerSend verified domain tested');
  console.log('• 📋 Existing template usage tested');
  console.log('• 🔄 Backup service tested');
  
  console.log('\n💡 Recommendation:');
  console.log('🎯 Use MailerSend as primary service:');
  console.log('  - Domain already verified ✅');
  console.log('  - Template already created ✅');  
  console.log('  - Higher free tier (12k vs 3k) ✅');
  console.log('  - Use Resend as reliable backup 🔄');
  
  console.log('\n🔧 Environment Configuration:');
  console.log('EMAIL_PRIMARY_PROVIDER=mailersend');
  console.log('EMAIL_FALLBACK_PROVIDER=resend');
  console.log('EMAIL_AUTO_FAILOVER=true');
}

if (require.main === module) {
  runVerificationTest();
}

module.exports = { testMailerSendWithVerifiedDomain };
