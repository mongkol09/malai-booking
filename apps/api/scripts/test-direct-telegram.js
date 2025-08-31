#!/usr/bin/env node

const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

async function testDirectTelegram() {
  console.log('🧪 ===== DIRECT TELEGRAM NOTIFICATION TEST =====');
  console.log('⏰ Time:', new Date().toLocaleString('th-TH'));
  
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
  
  console.log('🔍 Environment check:');
  console.log('  - TELEGRAM_BOT_TOKEN:', TELEGRAM_BOT_TOKEN ? 'Present' : 'Missing');
  console.log('  - TELEGRAM_CHAT_ID:', TELEGRAM_CHAT_ID ? 'Present' : 'Missing');
  
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error('❌ Missing Telegram configuration in .env file');
    return;
  }

  // Create check-in notification message
  const checkInMessage = `🏨 แจ้งเตือน: ผู้เข้าพักเช็คอิน (Manual Test)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 ผู้เข้าพัก: kaikrob eiei
🏨 หมายเลขห้อง: E2
📋 เลขที่การจอง: BK35130278  
📞 เบอร์โทร: 0815500504
✉️ อีเมล: beameiei@gmai.com
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 วันที่เช็คอิน: 31/8/2568
📅 วันที่เช็คเอาท์: 1/9/2568
👥 จำนวนผู้เข้าพัก: 1 คน
💰 ยอดเงินรวม: 10,000 บาท
💳 สถานะการชำระ: ค้างชำระ 10,000 บาท
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏰ เวลาเช็คอิน: ${new Date().toLocaleString('th-TH')}
👨‍💼 ดำเนินการโดย: Manual Test System
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔧 นี่คือการทดสอบระบบ Check-in Notification`;

  try {
    console.log('📤 Sending test check-in notification...');
    
    const response = await axios.post(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        chat_id: TELEGRAM_CHAT_ID,
        text: checkInMessage,
        parse_mode: 'HTML'
      }
    );

    if (response.data.ok) {
      console.log('✅ Check-in notification sent successfully!');
      console.log('📱 Message ID:', response.data.result.message_id);
      console.log('📅 Sent at:', new Date(response.data.result.date * 1000).toLocaleString('th-TH'));
      
      console.log('\n🎉 SUCCESS! Telegram notification is working!');
      console.log('💡 This proves that:');
      console.log('   ✅ Telegram bot token is correct');
      console.log('   ✅ Telegram chat ID is correct');
      console.log('   ✅ Network connection is working');
      console.log('   ❌ Problem is in the API notification code');
      
    } else {
      console.error('❌ Telegram API returned error:', response.data);
    }
    
  } catch (error) {
    console.error('❌ Failed to send notification:', error.message);
    
    if (error.response) {
      console.error('📋 Error details:', error.response.data);
      
      if (error.response.status === 400) {
        console.log('💡 Possible issues:');
        console.log('   - Invalid bot token');
        console.log('   - Invalid chat ID');
        console.log('   - Bot not added to the chat');
      }
      
      if (error.response.status === 401) {
        console.log('💡 Bot token is invalid or expired');
      }
    }
  }
}

// Run test
if (require.main === module) {
  testDirectTelegram();
}

module.exports = { testDirectTelegram };
