// netlify/functions/bot.js
const TelegramBot = require('node-telegram-bot-api');

// Инициализация бота
const token = process.env.BOT_TOKEN || '7762911922:AAHdyGVZRwCkI_WtcGW1MPbIdhrcDBpKNvE';
const bot = token ? new TelegramBot(token) : null;

// Обработчик для Netlify Functions
exports.handler = async (event, context) => {
  try {
    const body = JSON.parse(event.body || '{}');
    
    // Если бот не инициализирован
    if (!bot) {
      return {
        statusCode: 200,
        body: JSON.stringify({ 
          ok: true, 
          message: 'Bot is running in webhook mode' 
        })
      };
    }
    
    // Обработка обновлений от Telegram
    if (body.update_id) {
      const msg = body.message || body.callback_query?.message;
      
      if (msg) {
        const chatId = msg.chat.id;
        
        // Простая обработка команд
        if (msg.text === '/start') {
          await bot.sendMessage(chatId, '🚀 Добро пожаловать в UNIVERSAL SHOP!\n\nОткройте веб-приложение: https://universal-shop.netlify.app');
        }
        
        if (msg.text === '/shop') {
          await bot.sendMessage(chatId, '🛒 Магазин временно доступен только в веб-версии:\nhttps://universal-shop.netlify.app');
        }
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
