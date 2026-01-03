const User = require('../models/User');
const Product = require('../models/Product');
const Exchange = require('../models/Exchange');

class AdminController {
  constructor(bot) {
    this.bot = bot;
  }

  async handleAdminPanel(msg) {
    const chatId = msg.chat.id;
    const user = await User.findOne({ telegramId: chatId });
    
    if (!user || !user.isAdmin) {
      this.bot.sendMessage(chatId, '⛔ У вас нет прав администратора');
      return;
    }
    
    const keyboard = {
      reply_markup: {
        inline_keyboard: [
          [{ text: '📊 Статистика', callback_data: 'admin_stats' }],
          [{ text: '➕ Добавить товар', callback_data: 'admin_add_product' }],
          [{ text: '📦 Управление товарами', callback_data: 'admin_products' }],
          [{ text: '💱 Обмены', callback_data: 'admin_exchanges' }],
          [{ text: '👥 Пользователи', callback_data: 'admin_users' }],
          [{ text: '⚙️ Настройки', callback_data: 'admin_settings' }]
        ]
      }
    };
    
    this.bot.sendMessage(chatId, '👑 Панель администратора:', keyboard);
  }

  async handleAddProduct(chatId) {
    // Логика добавления товара
    this.bot.sendMessage(chatId, 'Введите название товара:');
    // Здесь должна быть логика сохранения товара
  }
}

module.exports = new AdminController();
