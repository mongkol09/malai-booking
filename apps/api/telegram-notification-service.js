#!/usr/bin/env node

/**
 * Telegram Notification Service for Hotel Booking
 * 
 * Sends booking notifications to Telegram channel
 */

require('dotenv').config();
const https = require('https');

class TelegramNotificationService {
  constructor() {
    this.botToken = process.env.TELEGRAM_BOT_TOKEN;
    this.chatId = process.env.TELEGRAM_CHAT_ID;
    this.baseUrl = `https://api.telegram.org/bot${this.botToken}`;
  }
  
  async sendMessage(message, parseMode = 'HTML') {
    try {
      const payload = {
        chat_id: this.chatId,
        text: message,
        parse_mode: parseMode,
        disable_web_page_preview: false,
      };
      
      const result = await this.makeRequest('sendMessage', payload);
      
      if (result.ok) {
        console.log('✅ Telegram message sent successfully');
        console.log('📧 Message ID:', result.result.message_id);
        return { success: true, messageId: result.result.message_id };
      } else {
        console.error('❌ Telegram API error:', result.description);
        return { success: false, error: result.description };
      }
      
    } catch (error) {
      console.error('💥 Failed to send Telegram message:', error.message);
      return { success: false, error: error.message };
    }
  }
  
  async makeRequest(method, data) {
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify(data);
      
      const options = {
        hostname: 'api.telegram.org',
        port: 443,
        path: `/bot${this.botToken}/${method}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
        },
      };
      
      const req = https.request(options, (res) => {
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        
        res.on('end', () => {
          try {
            const parsedData = JSON.parse(responseData);
            resolve(parsedData);
          } catch (error) {
            reject(new Error('Invalid JSON response'));
          }
        });
      });
      
      req.on('error', (error) => {
        reject(error);
      });
      
      req.write(postData);
      req.end();
    });
  }
  
  async sendBookingNotification(bookingData) {
    console.log('🤖 Sending Telegram booking notification...');
    
    const message = this.formatBookingMessage(bookingData);
    return await this.sendMessage(message);
  }
  
  formatBookingMessage(booking) {
    const checkInDate = new Date(booking.checkIn || booking.checkInDate).toLocaleDateString('th-TH');
    const checkOutDate = new Date(booking.checkOut || booking.checkOutDate).toLocaleDateString('th-TH');
    const createdDate = new Date().toLocaleString('th-TH');
    
    return `
🏨 <b>MALAI RESORT - การจองใหม่!</b>

🆕 <b>การจองสำเร็จ</b>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 <b>รายละเอียดการจอง:</b>
🔖 <b>หมายเลขการจอง:</b> #${booking.id || 'AUTO_GEN'}
👤 <b>ชื่อผู้จอง:</b> ${booking.customerName || booking.guestName || 'ไม่ระบุ'}
📧 <b>อีเมล:</b> ${booking.email || 'ไม่ระบุ'}
📱 <b>เบอร์โทรศัพท์:</b> ${booking.phone || booking.phoneNumber || 'ไม่ระบุ'}

📅 <b>วันที่เข้าพัก:</b> ${checkInDate}
📅 <b>วันที่ออก:</b> ${checkOutDate}
🏠 <b>ประเภทห้อง:</b> ${booking.roomType || booking.roomTypeName || 'Standard Room'}
👥 <b>จำนวนผู้เข้าพัก:</b> ${booking.guests || booking.guestCount || '1'} คน

💰 <b>ราคารวม:</b> ฿${booking.totalPrice || booking.totalAmount || 'ไม่ระบุ'}
💳 <b>สถานะการชำระ:</b> ${booking.paymentStatus || 'รอการยืนยัน'}

📝 <b>หมายเหตุ:</b> ${booking.notes || booking.specialRequests || 'ไม่มี'}

⏰ <b>เวลาที่จอง:</b> ${createdDate}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ <b>สถานะ:</b> การจองได้รับการยืนยันแล้ว
🔔 <b>การแจ้งเตือน:</b> Admin Panel Notification
`;
  }
  
  async sendSystemNotification(title, message, type = 'info') {
    const emoji = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
    
    const formattedMessage = `
${emoji} <b>${title}</b>

${message}

🕒 <b>เวลา:</b> ${new Date().toLocaleString('th-TH')}
🏨 <b>ระบบ:</b> Hotel Booking Management
`;
    
    return await this.sendMessage(formattedMessage);
  }
  
  async testConnection() {
    console.log('🧪 Testing Telegram Bot Connection...');
    console.log('='.repeat(50));
    
    console.log('📋 Configuration:');
    console.log('Bot Token:', this.botToken ? '***configured***' : 'NOT SET');
    console.log('Chat ID:', this.chatId);
    
    try {
      // Test bot info
      const botInfo = await this.makeRequest('getMe', {});
      
      if (botInfo.ok) {
        console.log('\n✅ Bot Information:');
        console.log('🤖 Bot Name:', botInfo.result.first_name);
        console.log('🆔 Bot Username:', '@' + botInfo.result.username);
        console.log('🔑 Bot ID:', botInfo.result.id);
        
        // Test sending message
        console.log('\n📤 Sending test message...');
        const testResult = await this.sendSystemNotification(
          'ระบบทดสอบ Telegram',
          'การเชื่อมต่อ Telegram Bot สำเร็จ! 🎉\n\nระบบพร้อมส่งการแจ้งเตือนการจองแล้ว',
          'success'
        );
        
        if (testResult.success) {
          console.log('🎉 Telegram notification system is ready!');
          return { success: true, bot: botInfo.result };
        } else {
          console.log('❌ Failed to send test message:', testResult.error);
          return { success: false, error: testResult.error };
        }
        
      } else {
        console.log('❌ Bot connection failed:', botInfo.description);
        return { success: false, error: botInfo.description };
      }
      
    } catch (error) {
      console.error('💥 Connection test failed:', error.message);
      return { success: false, error: error.message };
    }
  }
}

// Test function
async function testTelegramService() {
  console.log('🚀 Telegram Booking Notification Test');
  console.log('='.repeat(60));
  
  const telegramService = new TelegramNotificationService();
  
  // Test connection first
  const connectionTest = await telegramService.testConnection();
  
  if (!connectionTest.success) {
    console.log('\n🔧 Setup Required:');
    console.log('1. Check TELEGRAM_BOT_TOKEN in .env');
    console.log('2. Check TELEGRAM_CHAT_ID in .env');
    console.log('3. Make sure bot is added to the channel/group');
    return;
  }
  
  // Test booking notification
  console.log('\n📝 Testing booking notification...');
  
  const sampleBooking = {
    id: 'TG001',
    customerName: 'คุณทดสอบ ระบบแจ้งเตือน',
    email: 'test@example.com',
    phone: '081-234-5678',
    checkIn: '2025-08-25',
    checkOut: '2025-08-27',
    roomType: 'Deluxe Room',
    guests: 2,
    totalPrice: '3,500',
    paymentStatus: 'รอการชำระเงิน',
    notes: 'ขอเตียงเสริม 1 เตียง'
  };
  
  const bookingResult = await telegramService.sendBookingNotification(sampleBooking);
  
  if (bookingResult.success) {
    console.log('\n🎯 Integration Status:');
    console.log('✅ Telegram notification working');
    console.log('✅ Ready for booking integration');
    console.log('✅ Admin will receive real-time notifications');
    
    console.log('\n📱 Next Steps:');
    console.log('1. Integrate with booking controller');
    console.log('2. Add error handling and retry logic');
    console.log('3. Configure notification templates');
    
  } else {
    console.log('❌ Booking notification failed:', bookingResult.error);
  }
}

// Export for use in other files
module.exports = TelegramNotificationService;

// Run test if called directly
if (require.main === module) {
  testTelegramService();
}
