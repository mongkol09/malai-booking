/**
 * Simple Dual Bot Test - ทดสอบง่ายๆ ทั้งสอง Bot
 */

const axios = require('axios');

const CEO_BOT = {
  token: '8090902784:AAHqVuSWGscl_CSG2ojmqF5A7NMmUFxAEA8',
  chatId: '-1002579208700',
  name: 'CEO Bot (agentM)'
};

const STAFF_BOT = {
  token: '8236751083:AAGOS9YE_VdOo-mBQ3cMQ9dr1DYRXdzbNgI',
  chatId: '-1002926114573',
  name: 'Staff Bot (staffnoti)'
};

async function sendSimpleMessage(bot, type) {
  try {
    const timestamp = new Date().toLocaleString('th-TH');
    
    let message;
    if (type === 'ceo') {
      message = `🏨 *CEO LEVEL NOTIFICATION*

💼 Executive Report
📊 Financial Data Access: ✅ Enabled
💰 Revenue Information: ✅ Available
👤 Full Customer Details: ✅ Accessible
🔒 Sensitive Data: ✅ Authorized

⏰ ${timestamp}
🤖 Bot: ${bot.name}`;
    } else {
      message = `🏨 *STAFF LEVEL NOTIFICATION*

👨‍💼 Operational Alert
🧹 Housekeeping Tasks: ✅ Available
🏠 Room Status Updates: ✅ Enabled
👤 Guest Info: ✅ First Name Only
🔒 Privacy Filter: ✅ Active

⏰ ${timestamp}
🤖 Bot: ${bot.name}`;
    }

    const response = await axios.post(`https://api.telegram.org/bot${bot.token}/sendMessage`, {
      chat_id: bot.chatId,
      text: message,
      parse_mode: 'Markdown'
    });

    return response.data.ok;
  } catch (error) {
    console.error(`Error sending to ${bot.name}:`, error.message);
    return false;
  }
}

async function testDualSystem() {
  console.log('🤖 DUAL BOT SIMPLE TEST');
  console.log('='.repeat(40));

  console.log('\n1️⃣ Testing CEO Bot...');
  const ceoResult = await sendSimpleMessage(CEO_BOT, 'ceo');
  console.log(`   👔 CEO Bot: ${ceoResult ? '✅ Success' : '❌ Failed'}`);

  console.log('\n2️⃣ Testing Staff Bot...');
  const staffResult = await sendSimpleMessage(STAFF_BOT, 'staff');
  console.log(`   🏨 Staff Bot: ${staffResult ? '✅ Success' : '❌ Failed'}`);

  console.log('\n📊 FINAL RESULTS:');
  console.log('='.repeat(25));
  
  if (ceoResult && staffResult) {
    console.log('🎉 DUAL BOT SYSTEM WORKING!');
    console.log('✅ CEO Bot: Executive level ready');
    console.log('✅ Staff Bot: Operational level ready');
    console.log('📱 Check messages in both Telegram groups');
    
    // Test Housekeeping notification
    console.log('\n🧹 Testing Housekeeping Notification...');
    await testHousekeeping();
    
  } else {
    console.log('❌ SYSTEM ISSUES DETECTED');
    console.log(`CEO Bot: ${ceoResult ? 'OK' : 'FAILED'}`);
    console.log(`Staff Bot: ${staffResult ? 'OK' : 'FAILED'}`);
  }
}

async function testHousekeeping() {
  const message = `🧹 *แจ้งเตือนทำความสะอาดห้อง*

🔴 *ห้อง: A101*
🏠 ประเภทห้อง: Grand Serenity
👤 ลูกค้า: คุณทดสอบ
🚪 เช็คเอาท์: ${new Date().toLocaleTimeString('th-TH')}
📊 ระดับความสำคัญ: สูง

✅ กรุณาทำความสะอาดห้องและอัปเดตสถานะเมื่อเสร็จสิ้น

#RoomCleaning #RoomA101 #TestMode`;

  try {
    const response = await axios.post(`https://api.telegram.org/bot${STAFF_BOT.token}/sendMessage`, {
      chat_id: STAFF_BOT.chatId,
      text: message,
      parse_mode: 'Markdown'
    });

    console.log(`   🧹 Housekeeping Alert: ${response.data.ok ? '✅ Sent' : '❌ Failed'}`);
  } catch (error) {
    console.log('   🧹 Housekeeping Alert: ❌ Error -', error.message);
  }
}

// Run test
testDualSystem();
