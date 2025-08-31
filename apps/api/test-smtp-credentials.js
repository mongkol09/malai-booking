#!/usr/bin/env node

/**
 * Test Script: SMTP Email Test with Updated Credentials
 * 
 * Tests MailerSend SMTP with the new credentials provided
 */

require('dotenv').config();
const nodemailer = require('nodemailer');

async function testSMTPConnection() {
  console.log('🧪 Testing SMTP Connection with Updated Credentials');
  console.log('='.repeat(60));
  
  // Display current configuration
  console.log('\n📋 SMTP Configuration:');
  console.log('Host:', process.env.SMTP_HOST);
  console.log('Port:', process.env.SMTP_PORT);
  console.log('Username:', process.env.SMTP_USER);
  console.log('Password:', process.env.SMTP_PASS ? '***masked***' : 'NOT SET');
  console.log('From Email:', process.env.FROM_EMAIL);
  console.log('Domain ID:', process.env.MAILERSEND_DOMAIN_ID);
  
  try {
    // Create transporter with updated credentials
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false, // For development
      },
    });
    
    console.log('\n🔌 Testing SMTP connection...');
    
    // Verify connection
    await transporter.verify();
    console.log('✅ SMTP connection successful!');
    
    // Test sending email
    console.log('\n📧 Sending test email...');
    
    const mailOptions = {
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to: 'ai@gmail.com', // Change this to your email
      subject: '🧪 SMTP Test - Hotel Booking System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">🏨 Hotel Booking System</h1>
          <h2>SMTP Test Email</h2>
          
          <p>This is a test email to verify SMTP configuration.</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>📋 Test Details:</h3>
            <ul>
              <li><strong>Date:</strong> ${new Date().toLocaleString('th-TH')}</li>
              <li><strong>SMTP Host:</strong> ${process.env.SMTP_HOST}</li>
              <li><strong>Port:</strong> ${process.env.SMTP_PORT}</li>
              <li><strong>Username:</strong> ${process.env.SMTP_USER}</li>
              <li><strong>From Email:</strong> ${process.env.FROM_EMAIL}</li>
            </ul>
          </div>
          
          <p>If you received this email, the SMTP configuration is working correctly! 🎉</p>
          
          <div style="background: #dcfce7; padding: 15px; border-radius: 8px; border-left: 4px solid #16a34a;">
            <p><strong>✅ Status:</strong> SMTP Configuration Successful</p>
          </div>
          
          <hr style="margin: 30px 0;">
          <p style="color: #6b7280; font-size: 14px;">
            This is an automated test email from Hotel Booking System.<br>
            © ${new Date().getFullYear()} Malai Resort
          </p>
        </div>
      `,
      text: `
        Hotel Booking System - SMTP Test Email
        
        This is a test email to verify SMTP configuration.
        
        Test Details:
        - Date: ${new Date().toLocaleString('th-TH')}
        - SMTP Host: ${process.env.SMTP_HOST}
        - Port: ${process.env.SMTP_PORT}
        - Username: ${process.env.SMTP_USER}
        - From Email: ${process.env.FROM_EMAIL}
        
        If you received this email, the SMTP configuration is working correctly!
        
        Status: SMTP Configuration Successful
        
        © ${new Date().getFullYear()} Malai Resort
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Test email sent successfully!');
    console.log('📧 Message ID:', info.messageId);
    console.log('📨 Preview URL:', nodemailer.getTestMessageUrl(info) || 'N/A');
    
    console.log('\n🎯 Next Steps:');
    console.log('='.repeat(60));
    console.log('1. ✅ Check your email inbox (ai@gmail.com)');
    console.log('2. ✅ Verify email content displays correctly');
    console.log('3. ✅ SMTP is now ready for booking confirmations');
    console.log('4. 🚀 Test booking with email confirmation');
    
  } catch (error) {
    console.error('\n❌ SMTP Test Failed:');
    console.error('Error:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('\n🔧 Authentication Error - Possible solutions:');
      console.log('1. Verify username and password are correct');
      console.log('2. Check if account is active and verified');
      console.log('3. Try using port 2525 instead of 587');
    } else if (error.code === 'ENOTFOUND') {
      console.log('\n🔧 Connection Error - Possible solutions:');
      console.log('1. Check internet connection');
      console.log('2. Verify SMTP host is correct');
      console.log('3. Check firewall settings');
    } else {
      console.log('\n🔧 General Error - Check:');
      console.log('1. All SMTP settings in .env file');
      console.log('2. MailerSend account status');
      console.log('3. Domain verification status');
    }
  }
}

testSMTPConnection();
