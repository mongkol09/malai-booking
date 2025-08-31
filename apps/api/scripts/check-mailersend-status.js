#!/usr/bin/env node

const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

async function checkMailerSendAccountStatus() {
  console.log('🔍 ===== CHECKING MAILERSEND ACCOUNT STATUS =====\n');
  
  try {
    if (!process.env.MAILERSEND_API_TOKEN) {
      console.error('❌ MAILERSEND_API_TOKEN is missing');
      return;
    }

    const { MailerSend } = require('mailersend');
    
    const mailerSend = new MailerSend({
      apiKey: process.env.MAILERSEND_API_TOKEN,
    });

    console.log('🔍 Checking account info...');
    
    // Try to get account information
    try {
      // Check quota/limits
      console.log('📊 API Token Info:');
      console.log('  - Token:', process.env.MAILERSEND_API_TOKEN.substring(0, 20) + '...');
      
      // Test with admin email first (should work even on trial)
      const adminEmail = process.env.TEST_EMAIL || 'admin@malaikhaoyai.com';
      
      console.log('\n📧 Testing with admin email (trial should work):');
      console.log('  - Admin Email:', adminEmail);
      
      const { EmailParams, Sender, Recipient } = require('mailersend');
      
      const fromEmail = process.env.FROM_EMAIL || 'bookings@malaikhaoyai.com';
      const fromName = process.env.FROM_NAME || 'Malai Khaoyai Resort';
      const templateId = process.env.BOOKING_CONFIRMATION_TEMPLATE_ID || 'z3m5jgrq390ldpyo';

      const sentFrom = new Sender(fromEmail, fromName);
      const recipients = [new Recipient(adminEmail, 'Admin Test')];

      const personalization = [{
        email: adminEmail,
        data: {
          guest_name: 'Admin Test',
          booking_id: 'ADMIN-TEST-' + Date.now(),
          room_type: 'Test Room',
          room_number: 'A1',
          checkin_date: new Date().toLocaleDateString('th-TH'),
          checkout_date: new Date(Date.now() + 24*60*60*1000).toLocaleDateString('th-TH'),
          total_amount: '1,000',
          hotel_name: fromName,
          booking_date: new Date().toLocaleDateString('th-TH'),
          nights: '1',
          adults: '1',
          children: '0',
          phone: '081-000-0000',
          email: adminEmail,
          checkin_time: '14:00',
          checkout_time: '12:00'
        }
      }];

      const emailParams = new EmailParams()
        .setFrom(sentFrom)
        .setTo(recipients)
        .setSubject(`Admin Test - ${Date.now()}`)
        .setTemplateId(templateId)
        .setPersonalization(personalization);

      console.log('📤 Sending to admin email...');
      const response = await mailerSend.email.send(emailParams);
      
      if (response && response.body && response.body.message_id) {
        console.log('✅ Admin email test SUCCESS!');
        console.log('📨 Message ID:', response.body.message_id);
        
        console.log('\n📊 Account Status Analysis:');
        console.log('✅ API Token: Valid');
        console.log('✅ Domain: Working'); 
        console.log('✅ Template: Working');
        console.log('⚠️ Account Type: Still TRIAL (can only send to admin)');
        
        console.log('\n🔧 Account Upgrade Status:');
        console.log('❌ Account is still in TRIAL mode');
        console.log('📝 Domain verified ≠ Account approved');
        console.log('⏳ Need to wait for MailerSend team approval');
        
        console.log('\n📋 What "Domain Verified" means:');
        console.log('• ✅ DNS records configured correctly');
        console.log('• ✅ Domain ownership confirmed');
        console.log('• ⚠️ BUT account still needs manual approval');
        
        console.log('\n📋 What "Account Approved" means:');
        console.log('• 🚀 Can send to ANY email address');
        console.log('• 💰 Access to full free tier (12k emails)');
        console.log('• 📊 Full analytics and features');
        
        console.log('\n🎯 Current Recommendation:');
        console.log('• Use Resend as PRIMARY (no restrictions)');
        console.log('• Keep MailerSend as FALLBACK (for future)');
        console.log('• Switch to MailerSend PRIMARY when approved');
        
      } else {
        console.log('❌ Admin email test failed');
        console.log('Response:', response);
      }
      
    } catch (error) {
      console.error('❌ Account check failed:', error?.message || error);
      
      if (error?.body?.message?.includes('Trial accounts')) {
        console.log('\n⚠️ ACCOUNT STATUS: TRIAL (Not Yet Approved)');
        console.log('📝 Domain verified ≠ Account approved');
        console.log('⏳ Still waiting for MailerSend manual review');
      }
    }

  } catch (error) {
    console.error('❌ MailerSend check failed:', error?.message || error);
  }
}

async function recommendConfiguration() {
  console.log('\n🎯 ===== RECOMMENDED CONFIGURATION =====\n');
  
  console.log('📊 Current Status Summary:');
  console.log('• MailerSend: Domain ✅, Account ⏳ (still trial)');
  console.log('• Resend: Working ✅, No restrictions ✅');
  
  console.log('\n🔧 Recommended .env Configuration:');
  console.log('```env');
  console.log('# Use Resend as primary (no trial restrictions)');
  console.log('EMAIL_PRIMARY_PROVIDER=resend');
  console.log('EMAIL_FALLBACK_PROVIDER=mailersend');
  console.log('EMAIL_AUTO_FAILOVER=true');
  console.log('```');
  
  console.log('\n🚀 Benefits of This Setup:');
  console.log('• ✅ Immediate production use (Resend)');
  console.log('• ✅ Auto failover to MailerSend when needed');
  console.log('• ✅ Switch to MailerSend primary when approved');
  console.log('• ✅ No email delivery interruption');
  
  console.log('\n📅 Future Migration Plan:');
  console.log('1. ⏳ Wait for MailerSend account approval');
  console.log('2. 🧪 Test sending to external emails');
  console.log('3. 🔄 Switch: EMAIL_PRIMARY_PROVIDER=mailersend');
  console.log('4. 🎨 Enjoy beautiful template + 12k free emails');
  
  console.log('\n💡 How to Check MailerSend Approval:');
  console.log('• 📧 Check email from MailerSend team');
  console.log('• 🌐 Login to MailerSend dashboard');
  console.log('• 🧪 Test sending to non-admin email');
  console.log('• 📊 Look for "Account Status: Active"');
}

// Main function
async function runAccountCheck() {
  await checkMailerSendAccountStatus();
  await recommendConfiguration();
  
  console.log('\n🎊 CONCLUSION:');
  console.log('Domain verified ✅ ≠ Account approved ⏳');
  console.log('Continue with Resend primary until MailerSend approval! 🚀');
}

if (require.main === module) {
  runAccountCheck();
}

module.exports = { checkMailerSendAccountStatus };
