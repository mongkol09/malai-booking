#!/usr/bin/env node

/**
 * 🧪 ทดสอบการส่ง Email ด้วยข้อมูล Booking จริงของผู้ใช้
 * Booking ID: BK02316084 หรือ BK02229520
 */

const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');
dotenv.config();

// Import email service
const { emailService } = require('./dist/services/emailService');

const prisma = new PrismaClient();

async function testRealBookingEmail() {
  console.log('🧪 Testing Real Booking Email...');
  console.log('=====================================');

  try {
    // 1. ดึงข้อมูล booking ล่าสุดของ Mongkol
    console.log('📋 Fetching latest booking...');
    
    const latestBooking = await prisma.booking.findFirst({
      where: {
        guest: {
          email: 'mongkol09ms@gmail.com'
        }
      },
      include: {
        guest: true,
        room: {
          include: {
            roomType: true
          }
        },
        roomType: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!latestBooking) {
      console.log('❌ No booking found for mongkol09ms@gmail.com');
      return;
    }

    console.log('✅ Found booking:', latestBooking.bookingReferenceId);
    console.log('📧 Guest email:', latestBooking.guest.email);
    console.log('🏨 Room:', latestBooking.room?.roomNumber || 'TBD');
    console.log('🛏️ Room Type:', latestBooking.roomType?.name || 'Unknown');

    // 2. เตรียมข้อมูลสำหรับ Email Template
    const templateData = {
      guest_name: `${latestBooking.guest.firstName} ${latestBooking.guest.lastName}`,
      guest_email: latestBooking.guest.email,
      booking_id: latestBooking.bookingReferenceId,
      room_type: latestBooking.roomType?.name || 'Standard Room',
      room_number: latestBooking.room?.roomNumber || 'จะแจ้งให้ทราบ',
      checkin_date: latestBooking.checkinDate ? new Date(latestBooking.checkinDate).toLocaleDateString('th-TH') : 'ไม่ระบุ',
      checkout_date: latestBooking.checkoutDate ? new Date(latestBooking.checkoutDate).toLocaleDateString('th-TH') : 'ไม่ระบุ',
      num_adults: String(latestBooking.numAdults || 1),
      num_children: String(latestBooking.numChildren || 0),
      total_amount: `฿${(latestBooking.finalAmount || 0).toLocaleString()}`,
      hotel_name: 'Malai Khaoyai Resort',
      current_date: new Date().toLocaleDateString('th-TH')
    };

    console.log('');
    console.log('📋 Template Data:');
    console.log(JSON.stringify(templateData, null, 2));

    // 3. ส่ง Email ด้วย MailerSend Template
    console.log('');
    console.log('📤 Sending email with MailerSend Template...');
    
    const emailData = {
      type: 'BOOKING_CONFIRMATION',
      to: latestBooking.guest.email,
      toName: templateData.guest_name,
      subject: `ยืนยันการจอง ${latestBooking.bookingReferenceId} - Malai Khaoyai Resort`,
      templateId: process.env.BOOKING_CONFIRMATION_TEMPLATE_ID || 'z3m5jgrq390ldpyo',
      templateData: templateData
    };

    const result = await emailService.sendTemplateEmail(emailData);

    console.log('');
    if (result.success) {
      console.log('✅ Email sent successfully!');
      console.log(`📨 Message ID: ${result.messageId}`);
      console.log(`📧 Sent to: ${latestBooking.guest.email}`);
      console.log(`📋 Template: ${emailData.templateId}`);
      
      console.log('');
      console.log('🎯 Test Summary:');
      console.log('• ✅ Real booking data retrieved');
      console.log('• ✅ MailerSend template email sent');
      console.log('• 🔍 Check the recipient email inbox!');
      
    } else {
      console.log('❌ Email sending failed!');
      console.log('Error:', result.error);
    }

  } catch (error) {
    console.error('');
    console.error('❌ Test failed:');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);

    console.error('');
    console.error('🔧 Troubleshooting:');
    console.error('1. Check database connection');
    console.error('2. Verify MailerSend configuration');
    console.error('3. Check template ID exists');
    console.error('4. Verify email service initialization');
  } finally {
    await prisma.$disconnect();
  }
}

// รัน test
testRealBookingEmail()
  .then(() => {
    console.log('');
    console.log('🏁 Test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  });