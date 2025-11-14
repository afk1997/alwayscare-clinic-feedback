// Quick script to get your chat ID
const axios = require('axios');

const BOT_TOKEN = '8303766660:AAHMrfz5VvriK03uTevzLdaDfeJGDFjwdps';

async function getChatId() {
  try {
    const response = await axios.get(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates`);
    
    if (response.data.ok && response.data.result.length > 0) {
      console.log('\n📋 Recent chats:\n');
      response.data.result.forEach((update, index) => {
        if (update.message) {
          const chat = update.message.chat;
          console.log(`${index + 1}. Chat ID: ${chat.id}`);
          console.log(`   Type: ${chat.type}`);
          console.log(`   Title/Name: ${chat.title || chat.first_name || 'N/A'}`);
          console.log('');
        }
      });
      
      // Get the most recent chat
      const latestChat = response.data.result[response.data.result.length - 1].message.chat;
      console.log(`\n✅ Most recent chat ID: ${latestChat.id}`);
      console.log(`   Use this in your .env file: TELEGRAM_CHAT_ID=${latestChat.id}\n`);
    } else {
      console.log('\n⚠️  No messages found. Please:');
      console.log('   1. Send a message to your bot (@AlwaysCareClinicBot)');
      console.log('   2. Or add the bot to a group and send a message there');
      console.log('   3. Then run this script again\n');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

getChatId();

