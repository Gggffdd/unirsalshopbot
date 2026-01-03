const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(process.env.BOT_TOKEN);

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    
    if (body.message) {
      const msg = body.message;
      const chatId = msg.chat.id;
      
      // Обработка сообщений
      if (msg.text === '/start') {
        await bot.sendMessage(chatId, 'Привет! Я UNIVERSAL SHOP бот!');
      }
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
