/**
 * ทดสอบทั้งสอง Bot โดยตรง (ไม่ผ่าน API server)
 */

const axios = require('axios');

// Bot Configurations
const CEO_BOT = {
  token: '8090902784:AAHqVuSWGscl_CSG2ojmqF5A7NMmUFxAEA8',
  chatId: '-1002579208700',
  name: 'CEO Bot (agentM)',
  level: 'Executive'
};

const STAFF_BOT = {
  token: '8236751083:AAGOS9YE_VdOo-mBQ3cMQ9dr1DYRXdzbNgI',
  chatId: '-1002926114573',
  name: 'Staff Bot (staffnoti)',
  level: 'Operational'
};

async function testBot(bot) {
  try {
    console.log(`\n🧪 Testing ${bot.name}...`);
    console.log(`   Level: ${bot.level}`);
    console.log(`   Chat ID: ${bot.chatId}`);
    
    const apiUrl = `https://api.telegram.org/bot${bot.token}/sendMessage`;
    const timestamp = new Date().toLocaleString('th-TH');
    
    const message = `
🧪 *Bot Test - ${bot.level} Level*

✅ Dual Bot System Test
🤖 Bot: ${bot.name}
📱 Chat ID: ${bot.chatId}
⏰ เวลา: ${timestamp}

📋 ระบบพร้อมใช้งาน!
    `.trim();

    const response = await axios.post(apiUrl, {
      chat_id: bot.chatId,
      text: message,
      parse_mode: 'Markdown',
      disable_web_page_preview: true
    });

    if (response.data.ok) {
      console.log(`   ✅ ${bot.level} Bot: ส่งข้อความสำเร็จ`);
      return true;
    } else {
      console.log(`   ❌ ${bot.level} Bot: ล้มเหลว -`, response.data);
      return false;
    }

  } catch (error) {
    console.log(`   ❌ ${bot.level} Bot: Error -`, error.message);
    return false;
  }
}

async function testDualBotSystem() {
  console.log('🤖 DUAL BOT DIRECT TEST');
  console.log('='.repeat(50));
  
  // Test both bots
  const ceoResult = await testBot(CEO_BOT);
  const staffResult = await testBot(STAFF_BOT);
  
  console.log('\n📊 TEST RESULTS:');
  console.log('='.repeat(30));
  console.log(`👔 CEO Bot (Executive): ${ceoResult ? '✅ Working' : '❌ Failed'}`);
  console.log(`🏨 Staff Bot (Operational): ${staffResult ? '✅ Working' : '❌ Failed'}`);
  
  if (ceoResult && staffResult) {
    console.log('\n🎉 DUAL BOT SYSTEM READY!');
    console.log('✅ ระบบทั้งสองระดับพร้อมใช้งาน');
    console.log('📱 ตรวจสอบข้อความใน Telegram groups');
    
    // Test booking notification simulation
    console.log('\n🧪 ทดสอบ Booking Notification...');
    await testBookingNotification();
    
  } else {
    console.log('\n❌ SYSTEM NOT READY');
    console.log('🔧 ตรวจสอบ Bot tokens และ Chat IDs');
  }
}

async function testBookingNotification() {
  const timestamp = new Date().toLocaleString('th-TH');
  
  // CEO Bot - Full booking data
  const ceoMessage = `🏨 *MALAI RESORT - การจองใหม่!*

🆕 *การจองสำเร็จ*

📋 *รายละเอียดการจอง:*
🔖 *หมายเลขการจอง:* #TEST_${Date.now()}
👤 *ชื่อผู้จอง:* คุณทดสอบ ระบบ
📧 *อีเมล:* test@malairesort.com
📱 *เบอร์โทรศัพท์:* 081-234-5678

📅 *วันที่เข้าพัก:* ${new Date().toLocaleDateString('th-TH')}
📅 *วันที่ออก:* ${new Date(Date.now() + 24*60*60*1000).toLocaleDateString('th-TH')}
🏠 *ประเภทห้อง:* Grand Serenity Suite
👥 *จำนวนผู้เข้าพัก:* 2 คน

💰 *ราคารวม:* ฿3,500
💳 *สถานะการชำระ:* ทดสอบระบบ

📝 *หมายเหตุ:* การทดสอบระบบ Dual Bot

⏰ *เวลาที่จอง:* ${timestamp}

✅ *สถานะ:* การจองได้รับการยืนยันแล้ว
🔔 *การแจ้งเตือน:* Executive Level Notification`;

  // Staff Bot - Filtered operational data
  const staffMessage = `📋 *การจองใหม่ - เตรียมความพร้อม*

🏠 *ห้อง:* A101
👤 *ลูกค้า:* คุณทดสอบ
📝 *การดำเนินการ:* การจองใหม่
⏰ *เวลา:* ${timestamp}
📋 *หมายเหตุ:* การทดสอบระบบ Dual Bot

#NewBooking #RoomA101 #TestBooking`;

  try {
    // Send to CEO Bot
    const ceoResponse = await axios.post(`https://api.telegram.org/bot${CEO_BOT.token}/sendMessage`, {
      chat_id: CEO_BOT.chatId,
      text: ceoMessage,
      parse_mode: 'Markdown'
    });

    // Send to Staff Bot
    const staffResponse = await axios.post(`https://api.telegram.org/bot${STAFF_BOT.token}/sendMessage`, {
      chat_id: STAFF_BOT.chatId,
      text: staffMessage,
      parse_mode: 'Markdown'
    });

    console.log(`   👔 CEO Notification: ${ceoResponse.data.ok ? '✅ Sent' : '❌ Failed'}`);
    console.log(`   🏨 Staff Notification: ${staffResponse.data.ok ? '✅ Sent' : '❌ Failed'}`);

  } catch (error) {
    console.log('   ❌ Booking notification test failed:', error.message);
  }
}

// Run the test
testDualBotSystem();
