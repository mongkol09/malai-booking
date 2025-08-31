// Test new simplified template
require('dotenv').config();
const { MailerSend, EmailParams, Sender, Recipient } = require('mailersend');
const QRCode = require('qrcode');

const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_TOKEN || '',
});

async function generateTestQRCode() {
  try {
    const qrData = {
      type: 'booking_checkin',
      reference: 'HTL123456',
      timestamp: Date.now()
    };
    
    return await QRCode.toDataURL(JSON.stringify(qrData), {
      width: 300,
      margin: 2,
      color: {
        dark: '#8B4513', // ใช้สีน้ำตาลของ brand
        light: '#FFFFFF'
      }
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    return '';
  }
}

async function testNewTemplate() {
  try {
    console.log('🌸 Testing NEW Malai Khaoyai Template...');
    
    // Generate QR code with brand colors
    const qrCodeData = await generateTestQRCode();
    
    // Test data for new template
    const templateData = {
      // Customer info
      Customer_name: 'คุณสมชาย ใจดี',
      
      // Booking details
      booking_id: 'HTL240811002',
      check_in_date: '15 สิงหาคม 2568',
      check_in_time: '15:00 น.',
      check_out_date: '17 สิงหาคม 2568', 
      check_out_time: '11:00 น.',
      room_type: 'Deluxe Garden View',
      guest_count: '2',
      nights: '2',
      total: '4,500',
      
      // QR Code
      qr_code_data: qrCodeData,
      
      // Action URLs
      manage_booking_url: `${process.env.FRONTEND_URL || 'https://app.malaikhaoyai.com'}/booking/HTL240811002`,
      receipt_url: `${process.env.FRONTEND_URL || 'https://app.malaikhaoyai.com'}/receipt/HTL240811002`,
      
      // Hotel info
      hotel_email: process.env.FROM_EMAIL || 'MS_w7nYvI@test-nrw7gymv5mog2k8e.mlsender.net',
      hotel_phone: '+66 44 123 456',
      hotel_website: 'https://malaikhaoyai.com',
      hotel_name: 'Malai Khaoyai Resort',
      hotel_signature_name: 'ทีมงาน Malai Khaoyai Resort'
    };

    const sentFrom = new Sender(
      process.env.FROM_EMAIL || 'MS_w7nYvI@test-nrw7gymv5mog2k8e.mlsender.net',
      'Malai Khaoyai Resort'
    );

    const recipients = [new Recipient('ruuk@malaikhaoyai.com', 'Test User')];

    const personalization = [{
      email: 'ruuk@malaikhaoyai.com',
      data: templateData
    }];

    console.log('📋 Template Variables:');
    console.log(Object.keys(templateData).map(key => `  ${key}: ${templateData[key]}`).join('\n'));

    // ใช้ template เดิมก่อน แล้วจะสร้างใหม่ใน MailerSend
    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setReplyTo(sentFrom)
      .setSubject(`🌸 ยืนยันการจอง ${templateData.booking_id} - Malai Khaoyai Resort`)
      .setTemplateId(process.env.BOOKING_CONFIRMATION_TEMPLATE_ID || 'jpzkmgqqwyvg059v')
      .setPersonalization(personalization);

    console.log('\n📤 Sending test email with new data structure...');
    
    const response = await mailerSend.email.send(emailParams);
    
    console.log('✅ Test email sent successfully!');
    console.log('📊 Response:', {
      messageId: response.body?.message_id,
      status: response.statusCode
    });
    
    console.log('\n📝 Next Steps:');
    console.log('1. ✅ ตรวจสอบ email ที่ ruuk@malaikhaoyai.com');
    console.log('2. 🎨 สร้าง template ใหม่ใน MailerSend ด้วย HTML ที่ให้ไว้');
    console.log('3. 🔄 อัปเดต Template ID ในไฟล์ .env');
    console.log('4. 🧪 ทดสอบ template ใหม่');
    
    console.log('\n🎯 Template Improvements:');
    console.log('- ลดความยาว 60% (จาก 800+ words เหลือ 300-400 words)');
    console.log('- เพิ่ม QR Code section ที่เด่นชัด');
    console.log('- ใช้สีน้ำตาลที่เข้ากับ brand');
    console.log('- CTA buttons ที่ชัดเจน');
    console.log('- Mobile-responsive design');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testNewTemplate();
