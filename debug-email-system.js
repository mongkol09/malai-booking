#!/usr/bin/env node

/**
 * Test Script: Debug Email System
 * 
 * This script directly tests MailerSend configuration and email templates
 */

require('dotenv').config({ path: './apps/api/.env' });
const { MailerSend, EmailParams, Sender, Recipient } = require('mailersend');

async function debugEmailSystem() {
  console.log('🔍 Email System Debug');
  console.log('='.repeat(50));
  
  // Check environment variables
  console.log('\n📋 Environment Configuration:');
  console.log('MAILERSEND_API_TOKEN:', process.env.MAILERSEND_API_TOKEN ? 'SET ✅' : 'MISSING ❌');
  console.log('FROM_EMAIL:', process.env.FROM_EMAIL || 'Not set');
  console.log('FROM_NAME:', process.env.FROM_NAME || 'Not set');
  console.log('BOOKING_CONFIRMATION_TEMPLATE_ID:', process.env.BOOKING_CONFIRMATION_TEMPLATE_ID || 'Not set');
  
  if (!process.env.MAILERSEND_API_TOKEN) {
    console.log('❌ MAILERSEND_API_TOKEN is not set');
    return;
  }
  
  try {
    const mailerSend = new MailerSend({
      apiKey: process.env.MAILERSEND_API_TOKEN,
    });
    
    console.log('\n📧 Testing MailerSend Connection...');
    
    // Test simple email (no template)
    const sentFrom = new Sender(
      process.env.FROM_EMAIL || 'noreply@malairesort.com',
      process.env.FROM_NAME || 'Malai Resort'
    );
    
    const testEmail = 'ai@gmail.com'; // Change this to your email
    const recipients = [new Recipient(testEmail, 'Test User')];
    
    // Test 1: Simple email without template
    console.log('\n🧪 Test 1: Simple email (no template)');
    
    const simpleEmailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setSubject('🧪 Test Email - Simple')
      .setHtml('<h1>Test Email</h1><p>This is a simple test email from Hotel Booking System.</p>')
      .setText('Test Email - This is a simple test email from Hotel Booking System.');
    
    try {
      const simpleResponse = await mailerSend.email.send(simpleEmailParams);
      console.log('✅ Simple email sent successfully');
      console.log('Response status:', simpleResponse.statusCode);
      console.log('Message ID:', simpleResponse.body?.message_id || 'N/A');
    } catch (simpleError) {
      console.log('❌ Simple email failed:');
      console.log('Error:', simpleError.message);
      console.log('Status:', simpleError.response?.status);
      console.log('Data:', simpleError.response?.data);
    }
    
    // Test 2: Template email
    if (process.env.BOOKING_CONFIRMATION_TEMPLATE_ID) {
      console.log('\n🧪 Test 2: Template email');
      
      const testTemplateData = {
        booking_id: 'TEST-12345',
        Customer_name: 'Test Customer',
        name: 'Test Customer',
        customer_email: testEmail,
        hotel_name: process.env.FROM_NAME || 'Malai Resort',
        room_type: 'Deluxe Room',
        check_in_date: '21/08/2025',
        check_out_date: '22/08/2025',
        total: '1,500 บาท',
        nights: '1',
        guest_count: '1',
        current_date: new Date().toLocaleDateString('th-TH')
      };
      
      const personalization = [{
        email: testEmail,
        data: testTemplateData
      }];
      
      const templateEmailParams = new EmailParams()
        .setFrom(sentFrom)
        .setTo(recipients)
        .setSubject('🧪 Test Email - Template')
        .setTemplateId(process.env.BOOKING_CONFIRMATION_TEMPLATE_ID)
        .setPersonalization(personalization);
      
      try {
        const templateResponse = await mailerSend.email.send(templateEmailParams);
        console.log('✅ Template email sent successfully');
        console.log('Response status:', templateResponse.statusCode);
        console.log('Message ID:', templateResponse.body?.message_id || 'N/A');
      } catch (templateError) {
        console.log('❌ Template email failed:');
        console.log('Error:', templateError.message);
        console.log('Status:', templateError.response?.status);
        console.log('Data:', JSON.stringify(templateError.response?.data, null, 2));
      }
    } else {
      console.log('\n⚠️ Template test skipped: BOOKING_CONFIRMATION_TEMPLATE_ID not set');
    }
    
    console.log('\n🎯 Summary:');
    console.log('='.repeat(50));
    console.log('1. Check your email inbox for test emails');
    console.log('2. If template email failed, check template ID');
    console.log('3. If simple email worked but template failed, issue is with template configuration');
    console.log('4. If both failed, check API token and sender email verification');
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugEmailSystem();
