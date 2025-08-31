/**
 * Script สำหรับหา Chat ID ของ Telegram Bot
 * ใช้สำหรับ Staff Bot: 8236751083:AAGOS9YE_VdOo-mBQ3cMQ9dr1DYRXdzbNgI
 */

const axios = require('axios');

const STAFF_BOT_TOKEN = '8236751083:AAGOS9YE_VdOo-mBQ3cMQ9dr1DYRXdzbNgI';
const TELEGRAM_API_URL = `https://api.telegram.org/bot${STAFF_BOT_TOKEN}`;

async function getChatId() {
  console.log('🤖 Telegram Chat ID Finder');
  console.log('='.repeat(50));
  console.log('📱 Bot Token:', STAFF_BOT_TOKEN);
  console.log('🔗 Bot Name: staffnoti');
  console.log('');

  try {
    // 1. Get Bot Info
    console.log('1️⃣ ตรวจสอบข้อมูล Bot...');
    const botInfoResponse = await axios.get(`${TELEGRAM_API_URL}/getMe`);
    const botInfo = botInfoResponse.data.result;
    
    console.log('✅ Bot Information:');
    console.log(`   🆔 Bot ID: ${botInfo.id}`);
    console.log(`   👤 Bot Username: @${botInfo.username}`);
    console.log(`   📝 Bot Name: ${botInfo.first_name}`);
    console.log('');

    // 2. Get Updates (Recent Messages)
    console.log('2️⃣ ดึงข้อความล่าสุด...');
    const updatesResponse = await axios.get(`${TELEGRAM_API_URL}/getUpdates?limit=10`);
    const updates = updatesResponse.data.result;

    if (updates.length === 0) {
      console.log('⚠️  ไม่พบข้อความใหม่');
      console.log('');
      console.log('📋 ขั้นตอนการหา Chat ID:');
      console.log('1. สร้างกลุ่ม Telegram ใหม่');
      console.log('2. เพิ่ม Bot @staffnoti เข้าในกลุ่ม');
      console.log('3. ส่งข้อความใดๆ ในกลุ่ม เช่น "Hello Bot"');
      console.log('4. รันสคริปต์นี้อีกครั้ง');
      console.log('');
      return;
    }

    console.log(`✅ พบข้อความ ${updates.length} ข้อความ`);
    console.log('');

    // 3. Extract Chat IDs
    console.log('3️⃣ Chat IDs ที่พบ:');
    console.log('━'.repeat(80));
    
    const uniqueChats = new Map();
    
    updates.forEach((update, index) => {
      if (update.message && update.message.chat) {
        const chat = update.message.chat;
        const chatId = chat.id;
        const chatType = chat.type;
        const chatTitle = chat.title || chat.first_name || 'Private Chat';
        
        if (!uniqueChats.has(chatId)) {
          uniqueChats.set(chatId, {
            id: chatId,
            type: chatType,
            title: chatTitle,
            lastMessage: update.message.text || '[Media/Other]',
            date: new Date(update.message.date * 1000).toLocaleString('th-TH')
          });
        }
      }
    });

    if (uniqueChats.size === 0) {
      console.log('❌ ไม่พบ Chat ใดๆ');
      return;
    }

    // Display found chats
    Array.from(uniqueChats.values()).forEach((chat, index) => {
      console.log(`📱 Chat ${index + 1}:`);
      console.log(`   🆔 Chat ID: ${chat.id}`);
      console.log(`   📝 ชื่อ: ${chat.title}`);
      console.log(`   🏷️  ประเภท: ${chat.type}`);
      console.log(`   💬 ข้อความล่าสุด: ${chat.lastMessage}`);
      console.log(`   ⏰ เวลา: ${chat.date}`);
      
      // Highlight group chats (recommended for staff)
      if (chat.type === 'group' || chat.type === 'supergroup') {
        console.log(`   ⭐ แนะนำ: ใช้ Chat ID นี้สำหรับ Staff Bot`);
        console.log(`   🔧 Environment Variable:`);
        console.log(`      STAFF_TELEGRAM_CHAT_ID="${chat.id}"`);
      }
      
      console.log('');
    });

    // 4. Provide instructions
    console.log('4️⃣ คำแนะนำ:');
    console.log('━'.repeat(50));
    
    const groupChats = Array.from(uniqueChats.values()).filter(
      chat => chat.type === 'group' || chat.type === 'supergroup'
    );
    
    if (groupChats.length > 0) {
      console.log('✅ พบกลุ่มสำหรับ Staff:');
      groupChats.forEach(chat => {
        console.log(`   🎯 "${chat.title}" - Chat ID: ${chat.id}`);
      });
      console.log('');
      console.log('🔧 เพิ่มใน environment variables:');
      console.log(`STAFF_TELEGRAM_CHAT_ID="${groupChats[0].id}"`);
    } else {
      console.log('⚠️  ไม่พบกลุ่ม (Group) สำหรับ Staff');
      console.log('📋 ขั้นตอนสร้างกลุ่ม Staff:');
      console.log('1. สร้างกลุ่ม Telegram ใหม่');
      console.log('2. ตั้งชื่อ เช่น "Malai Resort - Operations"');
      console.log('3. เพิ่ม @staffnoti เข้าในกลุ่ม');
      console.log('4. ให้สิทธิ์ Admin แก่ Bot');
      console.log('5. ส่งข้อความในกลุ่ม');
      console.log('6. รันสคริปต์นี้อีกครั้ง');
    }
    
    console.log('');
    
    // 5. Test message option
    if (groupChats.length > 0) {
      console.log('5️⃣ ต้องการทดสอบส่งข้อความไหม?');
      console.log('รันคำสั่ง:');
      console.log(`node scripts/test-send-message.js "${groupChats[0].id}"`);
    }

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
    
    if (error.response) {
      console.error('📄 Response:', error.response.data);
    }
    
    console.log('');
    console.log('🔧 วิธีแก้ไข:');
    console.log('1. ตรวจสอบ Bot Token ให้ถูกต้อง');
    console.log('2. ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต');
    console.log('3. ตรวจสอบว่า Bot ยังใช้งานได้');
  }
}

// Helper function สำหรับทดสอบส่งข้อความ
async function testSendMessage(chatId, message = '🧪 Test message from Staff Bot') {
  try {
    const response = await axios.post(`${TELEGRAM_API_URL}/sendMessage`, {
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown'
    });
    
    if (response.data.ok) {
      console.log('✅ ส่งข้อความทดสอบสำเร็จ!');
      return true;
    } else {
      console.log('❌ ส่งข้อความไม่สำเร็จ:', response.data);
      return false;
    }
  } catch (error) {
    console.error('❌ Error sending test message:', error.message);
    return false;
  }
}

// Check command line arguments
const args = process.argv.slice(2);
if (args.length > 0 && args[0] === 'test') {
  const chatId = args[1];
  if (chatId) {
    console.log(`🧪 Testing message to Chat ID: ${chatId}`);
    testSendMessage(chatId);
  } else {
    console.log('❌ Please provide Chat ID for testing');
    console.log('Usage: node get-telegram-chat-id.js test [CHAT_ID]');
  }
} else {
  // Run main function
  getChatId();
}

module.exports = { getChatId, testSendMessage };
