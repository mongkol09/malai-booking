// End-to-End Booking Flow Test with NEW Template Structure
require('dotenv').config();
const { MailerSend, EmailParams, Sender, Recipient } = require('mailersend');
const QRCode = require('qrcode');

const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_TOKEN || '',
});

// Simulate real booking flow
async function testRealBookingFlow() {
  try {
    console.log('🏨 Starting REAL Booking Flow Test...\n');
    
    // Step 1: Simulate booking creation
    console.log('📝 Step 1: Creating booking...');
    const bookingData = await simulateBookingCreation();
    console.log(`✅ Booking created: ${bookingData.booking.bookingReferenceId}`);
    
    // Step 2: Generate QR Code for check-in
    console.log('\n🔧 Step 2: Generating QR Code...');
    const qrCodeData = await generateCheckInQRCode(bookingData.booking.bookingReferenceId);
    console.log('✅ QR Code generated successfully');
    
    // Step 3: Prepare email data (using new structure)
    console.log('\n📧 Step 3: Preparing email data...');
    const emailData = prepareBookingConfirmationData(
      bookingData.booking, 
      bookingData.guest, 
      bookingData.roomType, 
      qrCodeData
    );
    console.log('✅ Email data prepared with new nested structure');
    
    // Step 4: Send confirmation email
    console.log('\n📤 Step 4: Sending confirmation email...');
    const emailResult = await sendBookingConfirmationEmail(
      bookingData.guest.email,
      `${bookingData.guest.firstName} ${bookingData.guest.lastName}`,
      bookingData.booking.bookingReferenceId,
      emailData
    );
    
    if (emailResult.success) {
      console.log('✅ Confirmation email sent successfully!');
      console.log(`📧 Email ID: ${emailResult.messageId}`);
      console.log(`📬 Sent to: ${emailResult.sentTo}`);
    } else {
      console.error('❌ Email sending failed:', emailResult.error);
    }
    
    // Step 5: Display booking summary
    console.log('\n📊 Booking Summary:');
    console.log('='.repeat(50));
    console.log(`🏷️  Booking ID: ${bookingData.booking.bookingReferenceId}`);
    console.log(`👤  Guest: ${bookingData.guest.firstName} ${bookingData.guest.lastName}`);
    console.log(`📧  Email: ${bookingData.guest.email}`);
    console.log(`🏠  Room: ${bookingData.roomType.name}`);
    console.log(`📅  Check-in: ${bookingData.booking.checkinDate.toLocaleDateString('th-TH')}`);
    console.log(`📅  Check-out: ${bookingData.booking.checkoutDate.toLocaleDateString('th-TH')}`);
    console.log(`💰  Total: ${Number(bookingData.booking.finalAmount).toLocaleString('th-TH')} บาท`);
    console.log(`👥  Guests: ${bookingData.booking.numAdults + bookingData.booking.numChildren} คน`);
    
    // Step 6: Validate email structure
    console.log('\n🔍 Step 6: Validating email structure...');
    validateEmailStructure(emailData);
    
    console.log('\n🎉 BOOKING FLOW TEST COMPLETED SUCCESSFULLY!');
    console.log('\n📱 Next Steps:');
    console.log('1. Check email in inbox');
    console.log('2. Test QR code scanning');
    console.log('3. Test booking management links');
    console.log('4. Monitor MailerSend dashboard for delivery stats');
    
    return {
      booking: bookingData,
      emailData: emailData,
      emailResult: emailResult
    };
    
  } catch (error) {
    console.error('❌ Booking flow test failed:', error);
    throw error;
  }
}

// Simulate booking creation (like from bookingController)
function simulateBookingCreation() {
  const bookingId = `HTL${Date.now().toString().slice(-8)}`;
  const checkinDate = new Date();
  checkinDate.setDate(checkinDate.getDate() + 7); // 7 days from now
  const checkoutDate = new Date(checkinDate);
  checkoutDate.setDate(checkoutDate.getDate() + 2); // 2 nights
  
  return {
    booking: {
      id: Math.floor(Math.random() * 1000),
      bookingReferenceId: bookingId,
      checkinDate: checkinDate,
      checkoutDate: checkoutDate,
      numAdults: 2,
      numChildren: 0,
      totalPrice: 4500,
      finalAmount: 4500,
      status: 'CONFIRMED'
    },
    guest: {
      firstName: 'สมศรี',
      lastName: 'ใจดี',
      email: 'ruuk@malaikhaoyai.com', // Using admin email for testing
      phone: '+66 89 456 7890',
      city: 'เชียงใหม่',
      country: 'ประเทศไทย',
      postalCode: '50000'
    },
    roomType: {
      name: 'Superior Pool View',
      description: 'ห้องพักหรูพร้อมวิวสระว่ายน้ำ'
    }
  };
}

// Generate QR Code for check-in (same as emailController)
async function generateCheckInQRCode(bookingReference) {
  try {
    const qrData = {
      type: 'booking_checkin',
      reference: bookingReference,
      timestamp: Date.now(),
      hotel: 'malai_khaoyai_resort'
    };
    
    return await QRCode.toDataURL(JSON.stringify(qrData), {
      width: 300,
      margin: 2,
      color: {
        dark: '#8B4513', // Brand brown color
        light: '#FFFFFF'
      }
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    return '';
  }
}

// Prepare email data (same structure as emailController)
function prepareBookingConfirmationData(booking, guest, roomType, qrCodeData) {
  const checkinDate = new Date(booking.checkinDate);
  const checkoutDate = new Date(booking.checkoutDate);
  const nights = Math.ceil((checkoutDate.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24));
  
  return {
    // Basic booking info
    booking_id: booking.bookingReferenceId,
    name: `${guest.firstName} ${guest.lastName}`,
    Customer_name: `${guest.firstName} ${guest.lastName}`,
    account_name: `${guest.firstName} ${guest.lastName}`,
    customer_email: guest.email,
    customer_city: guest.city || guest.country || '',
    customer_country: guest.country || 'Thailand',
    customer_postal_code: guest.postalCode || '',
    room_type: roomType.name,
    
    // Nested structures for VAT/Tax
    Vat: {
      tax: '0.00'
    },
    
    // Nested structures for Check-in/out dates and times
    Check: {
      out: {
        date: {
          time: checkoutDate.toLocaleDateString('th-TH') + ' 11:00 น.'
        }
      }
    },
    check: {
      in: {
        date: {
          time: checkinDate.toLocaleDateString('th-TH') + ' 15:00 น.'
        }
      }
    },
    
    // Nested structure for pricing
    price: {
      included: {
        tax: Number(booking.finalAmount || booking.totalPrice).toLocaleString('th-TH') + ' บาท'
        }
    },
    
    // Customer phone (note: typo in MailerSend structure "cuntomer")
    cuntomer_phone: {
      no: guest.phone || '+66-XX-XXX-XXXX'
    },
    
    // Hotel info
    hotel_name: process.env.FROM_NAME || 'Malai Khaoyai Resort',
    hotel_email: process.env.FROM_EMAIL || 'center@malaikhaoyai.com',
    hotel_phone: '+66 44 123 456',
    hotel_address: '199 หมู่ 4 ตำบลโคกกรวด อำเภอปากช่อง จังหวัดนครราชสีมา 30130',
    hotel_website: 'https://malaikhaoyai.com',
    hotel_signature_name: 'ทีมงาน Malai Khaoyai Resort',
    
    // URLs  
    receipt_url: `${process.env.FRONTEND_URL || 'https://app.malaikhaoyai.com'}/receipt/${booking.id}`,
    manage_booking_url: `${process.env.FRONTEND_URL || 'https://app.malaikhaoyai.com'}/booking/${booking.bookingReferenceId}`,
    
    // Legacy flat fields for backward compatibility
    check_in_date: checkinDate.toLocaleDateString('th-TH'),
    check_in_time: '15:00 น.',
    check_out_date: checkoutDate.toLocaleDateString('th-TH'), 
    check_out_time: '11:00 น.',
    total: Number(booking.finalAmount || booking.totalPrice).toLocaleString('th-TH'),
    tax: '0',
    qr_code_data: qrCodeData,
    guest_count: (booking.numAdults + booking.numChildren).toString(),
    nights: nights.toString()
  };
}

// Send booking confirmation email
async function sendBookingConfirmationEmail(customerEmail, customerName, bookingId, emailData) {
  try {
    // For trial account, send to admin email
    const recipientEmail = process.env.NODE_ENV === 'production' ? customerEmail : process.env.ADMIN_EMAIL;
    const recipientName = process.env.NODE_ENV === 'production' ? customerName : `Test: ${customerName}`;
    
    const sentFrom = new Sender(
      process.env.FROM_EMAIL || 'center@malaikhaoyai.com',
      process.env.FROM_NAME || 'Malai Khaoyai Resort'
    );

    const recipients = [new Recipient(recipientEmail, recipientName)];

    const personalization = [{
      email: recipientEmail,
      data: emailData
    }];

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setReplyTo(sentFrom)
      .setSubject(`🌸 ยืนยันการจอง ${bookingId} - Malai Khaoyai Resort`)
      .setTemplateId(process.env.BOOKING_CONFIRMATION_TEMPLATE_ID || 'jpzkmgqqwyvg059v')
      .setPersonalization(personalization);

    const response = await mailerSend.email.send(emailParams);
    
    return {
      success: true,
      messageId: response.body?.message_id || 'unknown',
      response: response,
      sentTo: recipientEmail
    };

  } catch (error) {
    return {
      success: false,
      error: error.message,
      sentTo: null
    };
  }
}

// Validate email structure
function validateEmailStructure(emailData) {
  const checks = [
    { name: 'Nested Vat.tax', value: emailData.Vat?.tax, expected: 'string' },
    { name: 'Nested Check.out.date.time', value: emailData.Check?.out?.date?.time, expected: 'string' },
    { name: 'Nested check.in.date.time', value: emailData.check?.in?.date?.time, expected: 'string' },
    { name: 'Nested price.included.tax', value: emailData.price?.included?.tax, expected: 'string' },
    { name: 'Customer name', value: emailData.name, expected: 'string' },
    { name: 'Booking ID', value: emailData.booking_id, expected: 'string' },
    { name: 'Hotel name', value: emailData.hotel_name, expected: 'string' },
    { name: 'QR Code data', value: emailData.qr_code_data, expected: 'string' }
  ];

  console.log('📋 Email Structure Validation:');
  checks.forEach(check => {
    const isValid = check.value && typeof check.value === check.expected;
    const status = isValid ? '✅' : '❌';
    const displayValue = check.value ? (check.value.length > 30 ? check.value.substring(0, 30) + '...' : check.value) : 'undefined';
    console.log(`   ${status} ${check.name}: ${displayValue}`);
  });

  const allValid = checks.every(check => check.value && typeof check.value === check.expected);
  console.log(`\n🎯 Overall Validation: ${allValid ? '✅ PASSED' : '❌ FAILED'}`);
  
  return allValid;
}

// Run the test
console.log('🚀 Starting Real Booking Flow Test...');
console.log('This will simulate the complete booking process from creation to email confirmation.\n');

testRealBookingFlow()
  .then(result => {
    console.log('\n✨ Test completed successfully!');
    console.log('📧 Check your email inbox for the confirmation email.');
  })
  .catch(error => {
    console.error('\n💥 Test failed:', error.message);
  });
