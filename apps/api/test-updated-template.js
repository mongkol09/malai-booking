// Test with NEW MailerSend Template Structure
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
      reference: 'HTL240811003',
      timestamp: Date.now()
    };
    
    return await QRCode.toDataURL(JSON.stringify(qrData), {
      width: 300,
      margin: 2,
      color: {
        dark: '#8B4513', // Brown brand color
        light: '#FFFFFF'
      }
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    return '';
  }
}

async function testUpdatedTemplate() {
  try {
    console.log('🌸 Testing UPDATED Malai Khaoyai Template Structure...');
    
    const qrCodeData = await generateTestQRCode();
    
    // New structure matching MailerSend template exactly
    const templateData = {
      // Nested VAT structure
      Vat: {
        tax: '0.00'
      },
      
      // Basic customer info
      name: 'คุณสมชาย ใจดี',
      Customer_name: 'คุณสมชาย ใจดี',
      account_name: 'คุณสมชาย ใจดี',
      customer_email: 'customer@example.com',
      customer_city: 'กรุงเทพมหานคร',
      customer_country: 'ประเทศไทย',
      customer_postal_code: '10110',
      
      // Nested Check-out structure
      Check: {
        out: {
          date: {
            time: '17 สิงหาคม 2568 11:00 น.'
          }
        }
      },
      
      // Nested check-in structure (lowercase)
      check: {
        in: {
          date: {
            time: '15 สิงหาคม 2568 15:00 น.'
          }
        }
      },
      
      // Nested price structure
      price: {
        included: {
          tax: '4,500 บาท'
        }
      },
      
      // Basic booking info
      room_type: 'Deluxe Garden View',
      booking_id: 'HTL240811003',
      
      // Hotel details
      hotel_name: 'Malai Khaoyai Resort',
      hotel_email: process.env.FROM_EMAIL || 'MS_w7nYvI@test-nrw7gymv5mog2k8e.mlsender.net',
      hotel_phone: '+66 44 123 456',
      hotel_address: '199 หมู่ 4 ตำบลโคกกรวด อำเภอปากช่อง จังหวัดนครราชสีมา 30130',
      hotel_website: 'https://malaikhaoyai.com',
      hotel_signature_name: 'ทีมงาน Malai Khaoyai Resort',
      
      // Customer phone (note the typo in MailerSend structure)
      cuntomer_phone: {
        no: '+66 81 234 5678'
      },
      
      // URLs
      receipt_url: `${process.env.FRONTEND_URL || 'https://app.malaikhaoyai.com'}/receipt/HTL240811003`,
      manage_booking_url: `${process.env.FRONTEND_URL || 'https://app.malaikhaoyai.com'}/booking/HTL240811003`,
      
      // Legacy compatibility fields
      check_in_date: '15 สิงหาคม 2568',
      check_in_time: '15:00 น.',
      check_out_date: '17 สิงหาคม 2568',
      check_out_time: '11:00 น.',
      total: '4,500',
      tax: '0',
      qr_code_data: qrCodeData,
      guest_count: '2',
      nights: '2'
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

    console.log('📋 Updated Template Variables Structure:');
    console.log('✅ Nested structures:');
    console.log('  • Vat.tax:', templateData.Vat.tax);
    console.log('  • Check.out.date.time:', templateData.Check.out.date.time);
    console.log('  • check.in.date.time:', templateData.check.in.date.time);
    console.log('  • price.included.tax:', templateData.price.included.tax);
    console.log('  • cuntomer_phone.no:', templateData.cuntomer_phone.no);
    
    console.log('\n✅ Basic fields:');
    console.log('  • name:', templateData.name);
    console.log('  • booking_id:', templateData.booking_id);
    console.log('  • room_type:', templateData.room_type);
    console.log('  • hotel_name:', templateData.hotel_name);

    // Use your actual template ID
    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setReplyTo(sentFrom)
      .setSubject(`🌸 ยืนยันการจอง ${templateData.booking_id} - Malai Khaoyai Resort`)
      .setTemplateId(process.env.BOOKING_CONFIRMATION_TEMPLATE_ID || 'jpzkmgqqwyvg059v')
      .setPersonalization(personalization);

    console.log('\n📤 Sending test email with updated structure...');
    
    const response = await mailerSend.email.send(emailParams);
    
    console.log('✅ Test email sent successfully!');
    console.log('📊 Response:', {
      messageId: response.body?.message_id,
      status: response.statusCode
    });
    
    console.log('\n🎯 Structure Benefits:');
    console.log('✅ Nested objects for complex data');
    console.log('✅ Backward compatibility maintained');
    console.log('✅ Matches MailerSend template exactly');
    console.log('✅ Professional Thai formatting');
    
    console.log('\n📝 Next Steps:');
    console.log('1. ✅ Verify email at ruuk@malaikhaoyai.com');
    console.log('2. 🔄 Update emailController.ts (COMPLETED)');
    console.log('3. 🧪 Test with real booking data');
    console.log('4. 📈 Monitor email delivery rates');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    
    if (error.message?.includes('template')) {
      console.log('\n💡 Template ID might need updating. Check:');
      console.log('- MailerSend dashboard for correct template ID');
      console.log('- .env file BOOKING_CONFIRMATION_TEMPLATE_ID');
    }
  }
}

testUpdatedTemplate();
