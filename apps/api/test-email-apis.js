const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';
const API_ENDPOINTS = {
  bookingConfirmation: `${API_BASE_URL}/api/v1/emails/booking-confirmation`,
  paymentReceipt: `${API_BASE_URL}/api/v1/emails/payment-receipt`,
  checkinReminder: `${API_BASE_URL}/api/v1/emails/checkin-reminder`,
  testEmail: `${API_BASE_URL}/api/v1/emails/test`,
  queueStats: `${API_BASE_URL}/api/v1/emails/queue/stats`,
  emailStats: `${API_BASE_URL}/api/v1/emails/stats`,
  templateVariables: `${API_BASE_URL}/api/v1/emails/templates/variables`
};

// Test data
const TEST_EMAIL = 'ruuk@malaikhaoyai.com';

// ============================================
// TEST FUNCTIONS
// ============================================

/**
 * Test booking confirmation email API
 */
async function testBookingConfirmationEmail() {
  console.log('\n📧 Testing Booking Confirmation Email API...');
  
  try {
    // Find a test booking
    const booking = await prisma.booking.findFirst({
      where: {
        status: 'CONFIRMED'
      },
      include: {
        guest: true,
        room: {
          include: {
            roomType: true
          }
        }
      }
    });

    if (!booking) {
      console.log('❌ No confirmed bookings found for testing');
      return;
    }

    console.log(`📋 Using booking: ${booking.bookingReferenceId} for ${booking.guest?.firstName} ${booking.guest?.lastName}`);

    // Test immediate sending
    const response = await axios.post(API_ENDPOINTS.bookingConfirmation, {
      bookingId: booking.id,
      immediate: true
    });

    if (response.data.success) {
      console.log('✅ Booking confirmation email sent successfully');
      console.log(`📧 Message ID: ${response.data.messageId}`);
    } else {
      console.log('❌ Failed to send booking confirmation email');
      console.log(`Error: ${response.data.error}`);
    }

    // Test queue sending
    const queueResponse = await axios.post(API_ENDPOINTS.bookingConfirmation, {
      bookingId: booking.id,
      immediate: false
    });

    if (queueResponse.data.success) {
      console.log('✅ Booking confirmation email added to queue');
      console.log(`📋 Queue ID: ${queueResponse.data.queueId}`);
    }

  } catch (error) {
    console.error('❌ Error testing booking confirmation email:', error.response?.data || error.message);
  }
}

/**
 * Test payment receipt email API
 */
async function testPaymentReceiptEmail() {
  console.log('\n💳 Testing Payment Receipt Email API...');
  
  try {
    // Find a test payment
    const payment = await prisma.payment.findFirst({
      where: {
        status: 'PAID'
      },
      include: {
        booking: {
          include: {
            guest: true,
            room: {
              include: {
                roomType: true
              }
            }
          }
        }
      }
    });

    if (!payment) {
      console.log('❌ No paid payments found for testing');
      return;
    }

    console.log(`💳 Using payment: ${payment.id} for booking ${payment.booking?.bookingReferenceId}`);

    const response = await axios.post(API_ENDPOINTS.paymentReceipt, {
      paymentId: payment.id,
      immediate: true
    });

    if (response.data.success) {
      console.log('✅ Payment receipt email sent successfully');
      console.log(`📧 Message ID: ${response.data.messageId}`);
    } else {
      console.log('❌ Failed to send payment receipt email');
      console.log(`Error: ${response.data.error}`);
    }

  } catch (error) {
    console.error('❌ Error testing payment receipt email:', error.response?.data || error.message);
  }
}

/**
 * Test check-in reminder email API
 */
async function testCheckInReminderEmail() {
  console.log('\n🏨 Testing Check-In Reminder Email API...');
  
  try {
    // Find a future booking
    const booking = await prisma.booking.findFirst({
      where: {
        checkinDate: {
          gte: new Date()
        }
      },
      include: {
        guest: true,
        room: {
          include: {
            roomType: true
          }
        }
      }
    });

    if (!booking) {
      console.log('❌ No future bookings found for testing');
      return;
    }

    console.log(`🏨 Using booking: ${booking.bookingReferenceId} for ${booking.guest?.firstName} ${booking.guest?.lastName}`);

    const response = await axios.post(API_ENDPOINTS.checkinReminder, {
      bookingId: booking.id,
      daysUntilCheckin: 1,
      immediate: true
    });

    if (response.data.success) {
      console.log('✅ Check-in reminder email sent successfully');
      console.log(`📧 Message ID: ${response.data.messageId}`);
    } else {
      console.log('❌ Failed to send check-in reminder email');
      console.log(`Error: ${response.data.error}`);
    }

  } catch (error) {
    console.error('❌ Error testing check-in reminder email:', error.response?.data || error.message);
  }
}

/**
 * Test email sending API
 */
async function testTestEmail() {
  console.log('\n🧪 Testing Test Email API...');
  
  try {
    const response = await axios.post(API_ENDPOINTS.testEmail, {
      to: TEST_EMAIL,
      emailType: 'BOOKING_CONFIRMATION',
      testData: {
        guest_name: 'ผู้ทดสอบ ระบบ',
        booking_reference: 'TEST-001',
        hotel_name: 'Malai Khaoyai Resort (Test Mode)',
        room_type: 'Deluxe Room (Test)',
        checkin_date: 'วันศุกร์ที่ 15 มีนาคม 2024',
        checkout_date: 'วันเสาร์ที่ 16 มีนาคม 2024',
        total_amount: '3,500'
      }
    });

    if (response.data.success) {
      console.log('✅ Test email sent successfully');
      console.log(`📧 Message ID: ${response.data.messageId}`);
      console.log(`📮 Sent to: ${TEST_EMAIL}`);
    } else {
      console.log('❌ Failed to send test email');
      console.log(`Error: ${response.data.error}`);
    }

  } catch (error) {
    console.error('❌ Error testing test email:', error.response?.data || error.message);
  }
}

/**
 * Test queue stats API
 */
async function testQueueStats() {
  console.log('\n📊 Testing Queue Stats API...');
  
  try {
    const response = await axios.get(API_ENDPOINTS.queueStats);

    if (response.data.success) {
      console.log('✅ Queue stats retrieved successfully');
      console.log('📊 Stats:', JSON.stringify(response.data.data, null, 2));
    } else {
      console.log('❌ Failed to get queue stats');
    }

  } catch (error) {
    console.error('❌ Error testing queue stats:', error.response?.data || error.message);
  }
}

/**
 * Test email stats API
 */
async function testEmailStats() {
  console.log('\n📈 Testing Email Stats API...');
  
  try {
    const response = await axios.get(API_ENDPOINTS.emailStats);

    if (response.data.success) {
      console.log('✅ Email stats retrieved successfully');
      console.log('📈 Stats:', JSON.stringify(response.data.data, null, 2));
    } else {
      console.log('❌ Failed to get email stats');
    }

  } catch (error) {
    console.error('❌ Error testing email stats:', error.response?.data || error.message);
  }
}

/**
 * Test template variables API
 */
async function testTemplateVariables() {
  console.log('\n📝 Testing Template Variables API...');
  
  const emailTypes = ['BOOKING_CONFIRMATION', 'PAYMENT_RECEIPT', 'CHECKIN_REMINDER'];
  
  for (const emailType of emailTypes) {
    try {
      const response = await axios.get(`${API_ENDPOINTS.templateVariables}/${emailType}`);

      if (response.data.success) {
        console.log(`✅ Template variables for ${emailType}:`);
        console.log(`📝 Variables:`, response.data.data.variables);
      } else {
        console.log(`❌ Failed to get template variables for ${emailType}`);
      }

    } catch (error) {
      console.error(`❌ Error testing template variables for ${emailType}:`, error.response?.data || error.message);
    }
  }
}

// ============================================
// MAIN TEST RUNNER
// ============================================

async function runAllTests() {
  console.log('🚀 Starting Email API Tests...');
  console.log('============================================');
  
  try {
    // Test template variables first (doesn't require data)
    await testTemplateVariables();
    
    // Test stats endpoints
    await testQueueStats();
    await testEmailStats();
    
    // Test email sending
    await testTestEmail();
    await testBookingConfirmationEmail();
    await testPaymentReceiptEmail();
    await testCheckInReminderEmail();
    
    console.log('\n============================================');
    console.log('✅ All tests completed!');
    
  } catch (error) {
    console.error('❌ Test runner error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// ============================================
// CLI INTERFACE
// ============================================

const args = process.argv.slice(2);
const testName = args[0];

if (testName) {
  switch (testName) {
    case 'booking':
      testBookingConfirmationEmail().then(() => prisma.$disconnect());
      break;
    case 'payment':
      testPaymentReceiptEmail().then(() => prisma.$disconnect());
      break;
    case 'checkin':
      testCheckInReminderEmail().then(() => prisma.$disconnect());
      break;
    case 'test':
      testTestEmail().then(() => prisma.$disconnect());
      break;
    case 'stats':
      testEmailStats().then(() => prisma.$disconnect());
      break;
    case 'queue':
      testQueueStats().then(() => prisma.$disconnect());
      break;
    case 'variables':
      testTemplateVariables().then(() => prisma.$disconnect());
      break;
    default:
      console.log('❌ Unknown test:', testName);
      console.log('Available tests: booking, payment, checkin, test, stats, queue, variables, all');
      process.exit(1);
  }
} else {
  // Run all tests
  runAllTests();
}

module.exports = {
  testBookingConfirmationEmail,
  testPaymentReceiptEmail,
  testCheckInReminderEmail,
  testTestEmail,
  testQueueStats,
  testEmailStats,
  testTemplateVariables,
  runAllTests
};
