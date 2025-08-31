#!/usr/bin/env node

/**
 * Test Script: SMTP Email Test with Different Port Configurations
 * 
 * Tests MailerSend SMTP with different port configurations
 */

require('dotenv').config();
const nodemailer = require('nodemailer');

async function testSMTPWithPort(port, secure = false) {
  console.log(`\n🧪 Testing SMTP with Port ${port} (secure: ${secure})`);
  console.log('='.repeat(50));
  
  try {
    // Create transporter with different port
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: port,
      secure: secure, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false, // For development
      },
      debug: true, // Enable debug logging
      logger: true, // Enable logger
    });
    
    console.log(`🔌 Testing connection to ${process.env.SMTP_HOST}:${port}...`);
    
    // Verify connection
    await transporter.verify();
    console.log(`✅ SMTP connection successful on port ${port}!`);
    
    // Test sending a simple email
    console.log('📧 Sending test email...');
    
    const mailOptions = {
      from: `"Hotel Booking Test" <${process.env.FROM_EMAIL}>`,
      to: 'ai@gmail.com',
      subject: `🧪 SMTP Test Port ${port} - ${new Date().toLocaleString('th-TH')}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">🏨 Hotel Booking System</h1>
          <h2>SMTP Test - Port ${port}</h2>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>📋 Connection Details:</h3>
            <ul>
              <li><strong>Host:</strong> ${process.env.SMTP_HOST}</li>
              <li><strong>Port:</strong> ${port}</li>
              <li><strong>Secure:</strong> ${secure}</li>
              <li><strong>Username:</strong> ${process.env.SMTP_USER}</li>
              <li><strong>Test Time:</strong> ${new Date().toLocaleString('th-TH')}</li>
            </ul>
          </div>
          
          <div style="background: #dcfce7; padding: 15px; border-radius: 8px; border-left: 4px solid #16a34a;">
            <p><strong>✅ Status:</strong> SMTP Working on Port ${port}</p>
          </div>
          
          <p>This email confirms that SMTP is working correctly! 🎉</p>
        </div>
      `,
    };
    
    const info = await transporter.sendMail(mailOptions);
    
    console.log(`✅ Email sent successfully via port ${port}!`);
    console.log('📧 Message ID:', info.messageId);
    
    return { success: true, port, messageId: info.messageId };
    
  } catch (error) {
    console.error(`❌ Port ${port} failed: ${error.message}`);
    return { success: false, port, error: error.message };
  }
}

async function testMultiplePorts() {
  console.log('🚀 Testing Multiple SMTP Port Configurations');
  console.log('='.repeat(60));
  
  console.log('\n📋 Current SMTP Configuration:');
  console.log('Host:', process.env.SMTP_HOST);
  console.log('Username:', process.env.SMTP_USER);
  console.log('Password:', process.env.SMTP_PASS ? '***masked***' : 'NOT SET');
  console.log('From Email:', process.env.FROM_EMAIL);
  
  const portTests = [
    { port: 587, secure: false, description: 'Standard SMTP with STARTTLS' },
    { port: 2525, secure: false, description: 'Alternative SMTP port' },
    { port: 465, secure: true, description: 'SMTP over SSL' },
  ];
  
  const results = [];
  
  for (const test of portTests) {
    console.log(`\n🔍 Testing ${test.description}...`);
    const result = await testSMTPWithPort(test.port, test.secure);
    results.push(result);
    
    if (result.success) {
      console.log(`🎉 SUCCESS! Port ${test.port} is working!`);
      break; // Stop on first success
    }
  }
  
  console.log('\n📊 Test Results Summary:');
  console.log('='.repeat(60));
  
  const successfulPorts = results.filter(r => r.success);
  const failedPorts = results.filter(r => !r.success);
  
  if (successfulPorts.length > 0) {
    console.log('✅ Working Ports:');
    successfulPorts.forEach(r => {
      console.log(`  - Port ${r.port}: ${r.messageId}`);
    });
    
    console.log('\n🎯 Recommended Action:');
    console.log(`Update .env file to use port ${successfulPorts[0].port}`);
    console.log('SMTP is now ready for booking confirmations! 🚀');
    
  } else {
    console.log('❌ All ports failed');
    console.log('\n🔧 Troubleshooting Steps:');
    console.log('1. Verify MailerSend account is active');
    console.log('2. Check domain verification status');
    console.log('3. Confirm username and password are correct');
    console.log('4. Contact MailerSend support if issues persist');
    
    failedPorts.forEach(r => {
      console.log(`  - Port ${r.port}: ${r.error}`);
    });
  }
}

testMultiplePorts();
