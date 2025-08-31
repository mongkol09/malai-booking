// Simple Variable Test - Fix Template Variables Issue
require('dotenv').config();
const { MailerSend, EmailParams, Sender, Recipient } = require('mailersend');

const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_TOKEN || '',
});

async function fixTemplateVariables() {
  console.log('🔧 Fixing Template Variables Issue...\n');
  
  try {
    // มาลองส่งแบบที่ MailerSend ชอบ
    console.log('📧 Test 1: ส่งด้วยโครงสร้างที่ MailerSend คาดหวัง...');
    
    const correctData = {
      // ตัวแปรหลักที่เห็นใน template
      name: 'คุณสมชาย ใจดี',
      booking_id: 'HTL240811999',
      hotel_name: 'Malai Khaoyai Resort',
      
      // ข้อมูลลูกค้า
      Customer_name: 'คุณสมชาย ใจดี',
      customer_email: 'customer@example.com',
      customer_city: 'กรุงเทพมหานคร',
      customer_country: 'ประเทศไทย',
      customer_postal_code: '10110',
      
      // ข้อมูลห้องพัก
      room_type: 'Deluxe Garden View',
      
      // วันที่ check-in/out (ลองแบบง่ายๆ ก่อน)
      check_in_date: '15 สิงหาคม 2568',
      check_in_time: '15:00 น.',
      check_out_date: '17 สิงหาคม 2568', 
      check_out_time: '11:00 น.',
      
      // ข้อมูลราคา
      price: '4,500 บาท',
      
      // ข้อมูลโรงแรม
      hotel_phone: '+66 44 123 456',
      hotel_email: 'center@malaikhaoyai.com',
      hotel_website: 'https://malaikhaoyai.com',
      hotel_address: '199 หมู่ 4 ตำบลโคกกรวด อำเภอปากช่อง จังหวัดนครราชสีมา 30130',
      hotel_signature_name: 'ทีมงาน Malai Khaoyai Resort',
      
      // URLs
      manage_booking_url: 'https://app.malaikhaoyai.com/booking/HTL240811999',
      receipt_url: 'https://app.malaikhaoyai.com/receipt/HTL240811999'
    };

    const result1 = await sendCorrectTest(correctData);
    console.log(`   ${result1.success ? '✅' : '❌'} การส่งแบบปกติ: ${result1.success ? 'สำเร็จ' : result1.error}\n`);
    
    // ลองแบบที่ 2: ส่งทั้ง flat และ nested
    console.log('📧 Test 2: ส่งทั้ง flat และ nested variables...');
    
    const hybridData = {
      ...correctData,
      
      // เพิ่ม nested structures ที่ template อาจต้องการ
      Vat: {
        tax: '0.00'
      },
      
      Check: {
        out: {
          date: {
            time: '17 สิงหาคม 2568 11:00 น.'
          }
        }
      },
      
      check: {
        in: {
          date: {
            time: '15 สิงหาคม 2568 15:00 น.'
          }
        }
      },
      
      cuntomer_phone: {
        no: '+66 89 123 4567'
      },
      
      // เพิ่มฟิลด์ flat สำหรับ price
      'Vat.tax': '0.00',
      'price.included.tax': '4,500 บาท',
      'check.in.date.time': '15 สิงหาคม 2568 15:00 น.',
      'Check.out.date.time': '17 สิงหาคม 2568 11:00 น.',
      'cuntomer_phone.no': '+66 89 123 4567'
    };

    const result2 = await sendCorrectTest(hybridData);
    console.log(`   ${result2.success ? '✅' : '❌'} การส่งแบบ hybrid: ${result2.success ? 'สำเร็จ' : result2.error}\n`);
    
    // ลองแบบที่ 3: ส่งแบบง่ายที่สุด
    console.log('📧 Test 3: ส่งแบบง่ายที่สุด...');
    
    const simpleData = {
      name: 'ทดสอบง่าย',
      booking_id: 'SIMPLE123',
      hotel_name: 'Malai Resort'
    };

    const result3 = await sendCorrectTest(simpleData);
    console.log(`   ${result3.success ? '✅' : '❌'} การส่งแบบง่าย: ${result3.success ? 'สำเร็จ' : result3.error}\n`);
    
    // ลองส่งโดยไม่ใช้ template
    console.log('📧 Test 4: ส่งโดยไม่ใช้ template (HTML โดยตรง)...');
    const result4 = await sendWithoutTemplate();
    console.log(`   ${result4.success ? '✅' : '❌'} ส่งโดยไม่ใช้ template: ${result4.success ? 'สำเร็จ' : result4.error}\n`);
    
    console.log('🎯 สรุปการทดสอบ:');
    console.log('1. ตรวจสอบ email ที่ได้รับในกล่องจดหมาย');
    console.log('2. ดูว่า email ไหนแสดงข้อมูลจริงแทน {{placeholder}}');
    console.log('3. ถ้ายังไม่ได้ อาจจะต้องตรวจสอบ MailerSend template configuration');
    
  } catch (error) {
    console.error('❌ การทดสอบล้มเหลว:', error);
  }
}

async function sendCorrectTest(data) {
  try {
    const sentFrom = new Sender(
      process.env.FROM_EMAIL || 'center@malaikhaoyai.com',
      'Malai Khaoyai Resort'
    );

    const recipients = [new Recipient('ruuk@malaikhaoyai.com', 'ทดสอบ Variables')];

    // สร้าง personalization ที่ถูกต้อง
    const personalization = [{
      email: 'ruuk@malaikhaoyai.com',
      data: data
    }];

    console.log('   📋 ข้อมูลที่ส่งไป:');
    Object.keys(data).slice(0, 5).forEach(key => {
      const value = typeof data[key] === 'object' ? JSON.stringify(data[key]) : data[key];
      console.log(`      ${key}: ${value}`);
    });
    console.log(`      ... และอีก ${Object.keys(data).length - 5} ฟิลด์`);

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setReplyTo(sentFrom)
      .setSubject(`🔧 ทดสอบ Variables - ${new Date().toLocaleTimeString('th-TH')}`)
      .setTemplateId(process.env.BOOKING_CONFIRMATION_TEMPLATE_ID || 'jpzkmgqqwyvg059v')
      .setPersonalization(personalization);

    const response = await mailerSend.email.send(emailParams);
    
    return {
      success: true,
      messageId: response.body?.message_id || 'unknown',
      status: response.statusCode
    };

  } catch (error) {
    console.error('   ❌ Error details:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

async function sendWithoutTemplate() {
  try {
    const sentFrom = new Sender(
      process.env.FROM_EMAIL || 'center@malaikhaoyai.com', 
      'Malai Khaoyai Resort'
    );

    const recipients = [new Recipient('ruuk@malaikhaoyai.com', 'ทดสอบ HTML')];

    const htmlContent = `
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #8B4513;">🌸 Malai Khaoyai Resort</h1>
        <h2>การยืนยันการจอง</h2>
        
        <p>สวัสดีครับ คุณทดสอบ</p>
        
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3>ข้อมูลการจอง</h3>
          <p><strong>หมายเลขการจอง:</strong> TEST123456</p>
          <p><strong>ประเภทห้อง:</strong> Deluxe Garden View</p>
          <p><strong>วันเข้าพัก:</strong> 15 สิงหาคม 2568</p>
          <p><strong>วันออก:</strong> 17 สิงหาคม 2568</p>
          <p><strong>ราคารวม:</strong> 4,500 บาท</p>
        </div>
        
        <div style="background: #8B4513; color: white; padding: 15px; text-align: center; border-radius: 5px;">
          <p>นี่คือ email ทดสอบที่ไม่ใช้ template</p>
          <p>หากคุณเห็นข้อความนี้แสดงว่า email service ทำงานปกติ</p>
        </div>
        
        <p style="margin-top: 20px;">
          <strong>ติดต่อเรา:</strong><br>
          📞 +66 44 123 456<br>
          📧 center@malaikhaoyai.com<br>
          🌐 https://malaikhaoyai.com
        </p>
      </div>
    </body>
    </html>`;

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setReplyTo(sentFrom)
      .setSubject('🔧 ทดสอบ HTML โดยตรง - Malai Khaoyai Resort')
      .setHtml(htmlContent)
      .setText('นี่คือ email ทดสอบแบบ plain text');

    const response = await mailerSend.email.send(emailParams);
    
    return {
      success: true,
      messageId: response.body?.message_id || 'unknown',
      status: response.statusCode
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// รัน function หลัก
fixTemplateVariables();
