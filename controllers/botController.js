const User = require('../models/User');
const Product = require('../models/Product');

class BotController {
  constructor(bot) {
    this.bot = bot;
  }

  async handleStart(msg) {
    const chatId = msg.chat.id;
    const userData = msg.from;
    
    // Получаем или создаем пользователя
    let user = await User.findOne({ telegramId: chatId });
    if (!user) {
      user = new User({
        telegramId: chatId,
        username: userData.username,
        firstName: userData.first_name,
        lastName: userData.last_name,
        isAdmin: chatId.toString() === process.env.ADMIN_ID
      });
      await user.save();
    }
    
    const welcomeText = `🎉 Добро пожаловать в UNIVERSAL SHOP!\n\n` +
      `💰 Баланс: ${user.usdtBalance} USDT\n` +
      `⚡ TON: ${user.tonBalance}\n\n` +
      `🔗 Ваша персональная страница:\n` +
      `${process.env.WEB_APP_URL}/?user=${chatId}`;
    
    const keyboard = {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🎨 Открыть редактор', url: `${process.env.WEB_APP_URL}/?user=${chatId}` }],
          [{ text: '🛒 Магазин', callback_data: 'shop' }],
          [{ text: '🔄 Обменник', callback_data: 'exchange' }],
          [{ text: '👤 Профиль', callback_data: 'profile' }]
        ]
      }
    };
    
    this.bot.sendMessage(chatId, welcomeText, keyboard);
  }

  async handleShop(msg) {
    const chatId = msg.chat.id;
    const products = await Product.find({ isActive: true, stock: { $gt: 0 } });
    
    if (products.length === 0) {
      this.bot.sendMessage(chatId, '🛍️ В магазине пока нет товаров');
      return;
    }
    
    for (const product of products) {
      const text = `🎁 ${product.name}\n` +
        `📝 ${product.description}\n` +
        `💰 Цена: ${product.price} ${product.currency}\n` +
        `📦 Осталось: ${product.stock} шт.`;
      
      const keyboard = {
        reply_markup: {
          inline_keyboard: [[
            { 
              text: `Купить за ${product.price} ${product.currency}`, 
              callback_data: `buy_${product._id}` 
            }
          ]]
        }
      };
      
      this.bot.sendMessage(chatId, text, keyboard);
    }
  }

  async handleCustomize(msg) {
    const chatId = msg.chat.id;
    const personalizeUrl = `${process.env.WEB_APP_URL}/?user=${chatId}`;
    
    this.bot.sendMessage(chatId, 
      `🎨 **Мастерская кастомизации**\n\n` +
      `Перейдите по ссылке для настройки интерфейса:\n` +
      `${personalizeUrl}\n\n` +
      `Возможности:\n` +
      `• Изменение фона\n` +
      `• Добавление кнопок\n` +
      `• Загрузка изображений\n` +
      `• Добавление текста\n` +
      `• Перетаскивание элементов\n`,
      { parse_mode: 'Markdown' }
    );
  }
}

module.exports = BotController;
