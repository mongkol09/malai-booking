const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

// Telegram Bot Token จาก .env
const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  console.error('❌ Please set TELEGRAM_BOT_TOKEN in your .env file');
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

console.log('🤖 Telegram Bot is running...');
console.log('📝 To find your chat ID:');
console.log('1. Add this bot to your admin group/channel');
console.log('2. Send any message in the group');  
console.log('3. The chat ID will be displayed below');
console.log('4. Press Ctrl+C to stop');
console.log('----------------------------------------');

// Listen for any kind of message
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const chatType = msg.chat.type;
  const chatTitle = msg.chat.title || `${msg.chat.first_name} ${msg.chat.last_name}`;
  
  console.log('📨 New message received:');
  console.log(`   Chat ID: ${chatId}`);
  console.log(`   Chat Type: ${chatType}`);
  console.log(`   Chat Title: ${chatTitle}`);
  console.log(`   Message: ${msg.text}`);
  console.log('----------------------------------------');
  
  // Send a response
  bot.sendMessage(chatId, `✅ Bot is working!\n\n📋 Your Chat ID: ${chatId}\n🏨 Hotel Admin Bot is ready!`);
});

// Error handling
bot.on('error', (error) => {
  console.error('❌ Bot error:', error);
});

bot.on('polling_error', (error) => {
  console.error('❌ Polling error:', error);
});
