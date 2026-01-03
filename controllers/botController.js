const User = require('../models/User');
const Product = require('../models/Product');
const Exchange = require('../models/Exchange');
const cryptoBotService = require('../services/cryptoBotService');

class BotController {
  constructor(bot) {
    this.bot = bot;
  }

  async handleStart(msg) {
    const chatId = msg.chat.id;
    const user = await this.getOrCreateUser(msg.from);
    
    const welcomeText = `🎉 Добро пожаловать в UNIVERSAL SHOP!\n\n` +
      `💰 Баланс: ${user.balance} RUB\n` +
      `💵 USDT: ${user.usdtBalance}\n` +
      `⚡ TON: ${user.tonBalance}\n\n` +
      `Выберите действие:`;
    
    const keyboard = {
      reply_markup: {
        keyboard: [
          ['🛒 Магазин', '🔄 Обменник'],
          ['👤 Профиль', '🎨 Кастомизация'],
          ['📞 Поддержка']
        ],
        resize_keyboard: true
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
    
    // Отправка товаров с кнопками покупки
    for (const product of products) {
      const text = `🎁 ${product.name}\n` +
        `📝 ${product.description}\n` +
        `💰 Цена: ${product.price} ${product.currency}\n` +
        `📦 Осталось: ${product.stock} шт.`;
      
      const keyboard = {
        reply_markup: {
          inline_keyboard: [[
            { text: `Купить за ${product.price} ${product.currency}`, callback_data: `buy_${product._id}` }
          ]]
        }
      };
      
      if (product.imageUrl) {
        this.bot.sendPhoto(chatId, product.imageUrl, { caption: text, ...keyboard });
      } else {
        this.bot.sendMessage(chatId, text, keyboard);
      }
    }
  }

  async handleExchange(msg) {
    const chatId = msg.chat.id;
    
    const keyboard = {
      reply_markup: {
        keyboard: [
          ['USDT → TON', 'TON → USDT'],
          ['RUB → USDT', 'RUB → TON'],
          ['↩️ Назад']
        ],
        resize_keyboard: true
      }
    };
    
    this.bot.sendMessage(chatId, '🔄 Выберите тип обмена:', keyboard);
  }

  async handleCustomize(msg) {
    const chatId = msg.chat.id;
    const user = await User.findOne({ telegramId: chatId });
    
    const keyboard = {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🎨 Изменить фон', callback_data: 'custom_bg' }],
          [{ text: '🖼️ Добавить фото', callback_data: 'add_image' }],
          [{ text: '📝 Добавить надпись', callback_data: 'add_text' }],
          [{ text: '🔘 Создать кнопку', callback_data: 'add_button' }],
          [{ text: '⚙️ Мои настройки', callback_data: 'my_settings' }]
        ]
      }
    };
    
    this.bot.sendMessage(chatId, '🎨 Мастерская кастомизации:\n\nЗдесь вы можете полностью настроить интерфейс бота под себя!', keyboard);
  }

  async getOrCreateUser(userData) {
    let user = await User.findOne({ telegramId: userData.id });
    
    if (!user) {
      user = new User({
        telegramId: userData.id,
        username: userData.username,
        firstName: userData.first_name,
        lastName: userData.last_name,
        isAdmin: userData.id.toString() === process.env.ADMIN_ID
      });
      await user.save();
    }
    
    return user;
  }
}

module.exports = new BotController();
