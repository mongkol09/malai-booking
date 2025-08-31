#!/usr/bin/env node

const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

async function testBookingEmailFlow() {
  console.log('🧪 ===== BOOKING EMAIL FLOW TEST =====\n');
  
  try {
    const { Resend } = require('resend');
    
    if (!process.env.RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY missing');
      return;
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    // ใช้ sandbox domain ชั่วคราว
    const fromEmail = 'onboarding@resend.dev';
    const fromName = 'Malai Khaoyai Resort';
    const testEmail = process.env.TEST_EMAIL || 'delivered@resend.dev';

    console.log('📧 Testing booking confirmation email flow...');
    console.log(`   From: ${fromName} <${fromEmail}>`);
    console.log(`   To: ${testEmail}`);

    // สร้าง booking data ตัวอย่าง
    const bookingData = {
      bookingReferenceId: 'BK35130278',
      guestName: 'kaikrob eiei',
      roomType: 'Serenity Villa',
      roomNumber: 'E2',
      checkinDate: '31/08/2024',
      checkoutDate: '01/09/2024',
      totalAmount: 10000,
      numAdults: 1,
      numChildren: 0
    };

    // สร้าง HTML template
    const bookingHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>ยืนยันการจอง - ${fromName}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f8f9fa; }
        .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #1e3a8a, #3b82f6); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { font-size: 28px; margin-bottom: 8px; }
        .header p { font-size: 16px; opacity: 0.9; }
        .content { padding: 40px 30px; }
        .welcome { margin-bottom: 30px; }
        .welcome h2 { color: #1f2937; font-size: 24px; margin-bottom: 10px; }
        .welcome p { color: #6b7280; font-size: 16px; line-height: 1.6; }
        .booking-card { background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 8px; padding: 25px; margin: 25px 0; }
        .booking-title { color: #1f2937; font-size: 18px; font-weight: 600; margin-bottom: 20px; display: flex; align-items: center; }
        .detail-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { color: #374151; font-weight: 500; }
        .detail-value { color: #1f2937; font-weight: 600; }
        .total-section { background: linear-gradient(135deg, #059669, #10b981); color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 25px 0; }
        .total-amount { font-size: 28px; font-weight: bold; margin: 5px 0; }
        .checkin-info { background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 20px; margin: 25px 0; }
        .checkin-info h3 { color: #92400e; margin-bottom: 10px; }
        .checkin-info p { color: #92400e; margin: 5px 0; }
        .contact-section { background: #f3f4f6; border-radius: 8px; padding: 20px; margin: 25px 0; }
        .contact-section h3 { color: #1f2937; margin-bottom: 15px; }
        .contact-item { margin: 8px 0; color: #4b5563; }
        .footer { background: #1f2937; color: #9ca3af; padding: 30px; text-align: center; }
        .footer p { margin: 5px 0; }
        .status-badge { background: #22c55e; color: white; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: 500; }
        .test-notice { background: #fef2f2; border: 1px solid #fca5a5; color: #b91c1c; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏨 ยืนยันการจอง</h1>
            <p>${fromName}</p>
        </div>
        
        <div class="content">
            <div class="test-notice">
                <strong>🧪 นี่คืออีเมลทดสอบจาก Resend Email Service</strong><br>
                ระบบ email confirmation พร้อมใช้งานแล้ว!
            </div>
            
            <div class="welcome">
                <h2>เรียน คุณ${bookingData.guestName}</h2>
                <p>ขอบคุณที่ท่านเลือกใช้บริการของเรา การจองของท่านได้รับการยืนยันแล้ว</p>
            </div>
            
            <div class="booking-card">
                <div class="booking-title">
                    📋 รายละเอียดการจอง
                </div>
                <div class="detail-row">
                    <span class="detail-label">เลขที่การจอง</span>
                    <span class="detail-value">${bookingData.bookingReferenceId}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">ประเภทห้อง</span>
                    <span class="detail-value">${bookingData.roomType}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">หมายเลขห้อง</span>
                    <span class="detail-value">${bookingData.roomNumber}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">วันที่เช็คอิน</span>
                    <span class="detail-value">${bookingData.checkinDate}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">วันที่เช็คเอาท์</span>
                    <span class="detail-value">${bookingData.checkoutDate}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">จำนวนผู้เข้าพัก</span>
                    <span class="detail-value">${bookingData.numAdults} ผู้ใหญ่${bookingData.numChildren > 0 ? `, ${bookingData.numChildren} เด็ก` : ''}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">สถานะ</span>
                    <span class="status-badge">ยืนยันแล้ว</span>
                </div>
            </div>
            
            <div class="total-section">
                <h3>💰 ยอดเงินรวม</h3>
                <div class="total-amount">${bookingData.totalAmount.toLocaleString()} บาท</div>
            </div>
            
            <div class="checkin-info">
                <h3>⏰ ข้อมูลการเช็คอิน</h3>
                <p><strong>เวลาเช็คอิน:</strong> 14:00 น.</p>
                <p><strong>เวลาเช็คเอาท์:</strong> 12:00 น.</p>
                <p><strong>การยกเลิก:</strong> สามารถยกเลิกได้ก่อนวันเข้าพัก 24 ชั่วโมง</p>
            </div>
            
            <div class="contact-section">
                <h3>📞 ติดต่อเรา</h3>
                <div class="contact-item"><strong>โทรศัพท์:</strong> 02-XXX-XXXX</div>
                <div class="contact-item"><strong>อีเมล:</strong> info@malaikhaoyai.com</div>
                <div class="contact-item"><strong>เว็บไซต์:</strong> www.malaikhaoyai.com</div>
                <div class="contact-item"><strong>ที่อยู่:</strong> 123 Khao Yai, Nakhon Ratchasima</div>
            </div>
        </div>
        
        <div class="footer">
            <p>© 2024 ${fromName}. All rights reserved.</p>
            <p>🔧 Powered by Resend Email Service</p>
            <p>📧 Email sent at: ${new Date().toLocaleString('th-TH')}</p>
        </div>
    </div>
</body>
</html>`;

    console.log('\n📤 Sending booking confirmation email...');
    
    const response = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: testEmail,
      subject: `ยืนยันการจอง ${bookingData.bookingReferenceId} ที่ ${fromName}`,
      html: bookingHTML
    });

    if (response.data?.id) {
      console.log('\n🎉 BOOKING EMAIL SENT SUCCESSFULLY!');
      console.log('📨 Message ID:', response.data.id);
      console.log('📧 Email sent to:', testEmail);
      
      console.log('\n✅ Email Booking Flow Test PASSED!');
      
      console.log('\n🎯 ระบบพร้อมใช้งาน:');
      console.log('1. ✅ Resend API integration working');
      console.log('2. ✅ Booking confirmation email template ready');
      console.log('3. ✅ Email sent successfully');
      console.log('4. 🔄 รอ domain verification เสร็จแล้วเปลี่ยน FROM_EMAIL');
      
      console.log('\n🚀 Next Steps:');
      console.log('• ✅ Test check-in notification (Telegram)');
      console.log('• ✅ Test booking creation email');
      console.log('• 🌐 Wait for domain verification');
      console.log('• 🔄 Switch to production domain');
      
    } else {
      console.error('\n❌ Email sending failed');
      console.error('Response:', response);
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Full error:', error);
  }
}

if (require.main === module) {
  testBookingEmailFlow();
}

module.exports = { testBookingEmailFlow };
