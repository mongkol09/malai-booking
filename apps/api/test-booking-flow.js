// Test complete booking flow with email
require('dotenv').config();

// Since we can't directly require TypeScript modules, let's test using MailerSend directly
const { MailerSend, EmailParams, Sender, Recipient } = require('mailersend');
const QRCode = require('qrcode');

const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_TOKEN || '',
});

async function generateCheckInQRCode(bookingReference) {
  try {
    const qrData = {
      type: 'booking_checkin',
      reference: bookingReference,
      timestamp: Date.now()
    };
    
    const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrData), {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    return '';
  }
}

async function prepareBookingConfirmationData(booking, guest, roomType, qrCodeData) {
  const checkinDate = new Date(booking.checkinDate);
  const checkoutDate = new Date(booking.checkoutDate);
  const nights = Math.ceil((checkoutDate.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24));
  
  return {
    // Basic booking info
    booking_id: booking.bookingReferenceId,
    Customer_name: `${guest.firstName} ${guest.lastName}`,
    name: `${guest.firstName} ${guest.lastName}`,
    customer_email: guest.email,
    customer_city: guest.country || '',
    customer_country: guest.country || '',
    account_name: `${guest.firstName} ${guest.lastName}`,
    
    // Hotel info
    hotel_name: process.env.FROM_NAME || 'Malai Resort',
    hotel_email: process.env.FROM_EMAIL || 'MS_w7nYvI@test-nrw7gymv5mog2k8e.mlsender.net',
    hotel_phone: '+66 XX XXX XXXX',
    hotel_address: 'Malai Khaoyai Resort Address',
    hotel_website: 'https://malaikhaoyai.com',
    hotel_signature_name: 'Malai Resort Team',
    
    // Room and stay details
    room_type: roomType.name,
    guest_count: (booking.numAdults + booking.numChildren).toString(),
    nights: nights.toString(),
    
    // Dates and times
    check_in_date: checkinDate.toLocaleDateString('th-TH'),
    check_in_time: '15:00',
    check_out_date: checkoutDate.toLocaleDateString('th-TH'),
    check_out_time: '11:00',
    
    // Financial info
    price: Number(booking.totalPrice).toLocaleString('th-TH'),
    total: Number(booking.finalAmount || booking.totalPrice).toLocaleString('th-TH'),
    tax: '0',
    
    // QR Code for check-in
    qr_code_data: qrCodeData,
    
    // Additional URLs
    receipt_url: `${process.env.FRONTEND_URL || 'https://app.malaikhaoyai.com'}/receipt/${booking.id}`,
    manage_booking_url: `${process.env.FRONTEND_URL || 'https://app.malaikhaoyai.com'}/booking/${booking.bookingReferenceId}`,
  };
}

async function sendBookingConfirmationEmail(booking, guest, roomType) {
  try {
    console.log(`📧 Sending booking confirmation email for ${booking.bookingReferenceId}`);
    
    // Generate QR Code for check-in
    const qrCodeData = await generateCheckInQRCode(booking.bookingReferenceId);
    
    // Prepare email data
    const emailData = await prepareBookingConfirmationData(booking, guest, roomType, qrCodeData);
    
    // For trial accounts, send to admin email instead of customer email
    const recipientEmail = process.env.NODE_ENV === 'production' ? guest.email : (process.env.ADMIN_EMAIL || 'ruuk@malaikhaoyai.com');
    const recipientName = process.env.NODE_ENV === 'production' ? `${guest.firstName} ${guest.lastName}` : `Test: ${guest.firstName} ${guest.lastName}`;
    
    const sentFrom = new Sender(
      process.env.FROM_EMAIL || 'MS_w7nYvI@test-nrw7gymv5mog2k8e.mlsender.net',
      process.env.FROM_NAME || 'Malai Resort'
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
      .setSubject(`ยืนยันการจองหมายเลข ${booking.bookingReferenceId} ที่ ${process.env.FROM_NAME || 'Malai Resort'}`)
      .setTemplateId(process.env.BOOKING_CONFIRMATION_TEMPLATE_ID || 'jpzkmgqqwyvg059v')
      .setPersonalization(personalization);

    const response = await mailerSend.email.send(emailParams);
    
    console.log(`✅ Booking confirmation email sent successfully to ${recipientEmail}`);
    
    if (process.env.NODE_ENV !== 'production') {
      console.log(`📝 Note: Trial account - email sent to admin (${recipientEmail}) instead of customer (${guest.email})`);
    }
    
    return {
      success: true,
      messageId: response.body?.message_id || 'unknown',
      response: response
    };

  } catch (error) {
    console.error('❌ Error in sendBookingConfirmationEmail:', error);
    throw error;
  }
}

async function testBookingEmailFlow() {
  try {
    console.log('🧪 Testing complete booking flow with email...');
    
    // Mock booking data (similar to what bookingController would create)
    const mockBooking = {
      id: 'booking-test-' + Date.now(),
      bookingReferenceId: 'HTL' + Date.now().toString().slice(-6),
      checkinDate: new Date('2025-08-15'),
      checkoutDate: new Date('2025-08-17'),
      numAdults: 2,
      numChildren: 0,
      totalPrice: 4500,
      finalAmount: 4500,
      status: 'Confirmed'
    };
    
    const mockGuest = {
      id: 'guest-test-' + Date.now(),
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phoneNumber: '+66812345678',
      country: 'Thailand'
    };
    
    const mockRoomType = {
      id: 'roomtype-test-' + Date.now(),
      name: 'Deluxe Garden View',
      description: 'Beautiful garden view room with modern amenities',
      baseRate: 2250
    };
    
    console.log('📋 Mock data created:');
    console.log('- Booking:', mockBooking.bookingReferenceId);
    console.log('- Guest:', `${mockGuest.firstName} ${mockGuest.lastName} (${mockGuest.email})`);
    console.log('- Room:', mockRoomType.name);
    
    // Test email sending
    console.log('\n📧 Calling sendBookingConfirmationEmail...');
    await sendBookingConfirmationEmail(mockBooking, mockGuest, mockRoomType);
    
    console.log('\n✅ Booking flow with email test completed successfully!');
    console.log('\n📝 Check the following:');
    console.log('1. Email received at ruuk@malaikhaoyai.com');
    console.log('2. All booking details populated correctly');
    console.log('3. QR code generated and displayed');
    console.log('4. Template formatting looks good');
    
  } catch (error) {
    console.error('❌ Booking flow test failed:', error);
  }
}

testBookingEmailFlow();
