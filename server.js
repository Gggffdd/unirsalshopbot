require('dotenv').config();
const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');

// Инициализация
const app = express();
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Подключение к базе данных
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('✅ MongoDB подключена'))
  .catch(err => console.error('❌ Ошибка MongoDB:', err));

// Модели
const UserSchema = new mongoose.Schema({
  telegramId: { type: String, required: true, unique: true },
  username: String,
  firstName: String,
  lastName: String,
  usdtBalance: { type: Number, default: 1000 },
  tonBalance: { type: Number, default: 500 },
  customSettings: {
    background: { type: String, default: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    buttons: [{
      id: String,
      text: String,
      url: String,
      style: String,
      position: { x: Number, y: Number }
    }],
    images: [{
      id: String,
      url: String,
      position: { x: Number, y: Number }
    }],
    texts: [{
      id: String,
      text: String,
      size: Number,
      color: String,
      position: { x: Number, y: Number }
    }]
  },
  createdAt: { type: Date, default: Date.now }
});

const ProductSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  currency: { type: String, enum: ['USDT', 'TON', 'RUB'], default: 'USDT' },
  image: String,
  stock: { type: Number, default: 10 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const Product = mongoose.model('Product', ProductSchema);

// Настройка загрузки файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userId = req.params.userId;
    const dir = `uploads/${userId}`;
    fs.ensureDirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// API Роуты

// Получить/создать пользователя
app.get('/api/user/:telegramId', async (req, res) => {
  try {
    let user = await User.findOne({ telegramId: req.params.telegramId });
    
    if (!user) {
      user = new User({
        telegramId: req.params.telegramId,
        customSettings: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          buttons: [],
          images: [],
          texts: []
        }
      });
      await user.save();
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error in /api/user:', error);
    res.status(500).json({ error: error.message });
  }
});

// Получить настройки пользователя
app.get('/api/user-settings/:telegramId', async (req, res) => {
  try {
    const user = await User.findOne({ telegramId: req.params.telegramId });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user.customSettings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Сохранить настройки
app.post('/api/save-settings/:telegramId', async (req, res) => {
  try {
    const { settings } = req.body;
    const user = await User.findOneAndUpdate(
      { telegramId: req.params.telegramId },
      { customSettings: settings },
      { new: true }
    );
    res.json({ success: true, user });
  } catch (error) {
    console.error('Error saving settings:', error);
    res.status(500).json({ error: error.message });
  }
});

// Загрузить изображение
app.post('/api/upload-image/:userId', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const userId = req.params.userId;
    const imageUrl = `/uploads/${userId}/${req.file.filename}`;
    const imageId = 'img_' + Date.now();
    
    const user = await User.findOne({ telegramId: userId });
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    user.customSettings.images.push({
      id: imageId,
      url: imageUrl,
      position: { x: 100, y: 200 }
    });
    
    await user.save();
    
    res.json({ 
      success: true, 
      image: { 
        id: imageId, 
        url: imageUrl, 
        position: { x: 100, y: 200 } 
      } 
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: error.message });
  }
});

// Добавить кнопку
app.post('/api/add-button/:telegramId', async (req, res) => {
  try {
    const { button } = req.body;
    const user = await User.findOne({ telegramId: req.params.telegramId });
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    user.customSettings.buttons.push(button);
    await user.save();
    
    res.json({ success: true, button });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Добавить текст
app.post('/api/add-text/:telegramId', async (req, res) => {
  try {
    const { text } = req.body;
    const user = await User.findOne({ telegramId: req.params.telegramId });
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    user.customSettings.texts.push(text);
    await user.save();
    
    res.json({ success: true, text });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить продукты
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find({ isActive: true, stock: { $gt: 0 } });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Создать продукт (для админа)
app.post('/api/products', async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Обновить баланс
app.post('/api/update-balance/:telegramId', async (req, res) => {
  try {
    const { usdtBalance, tonBalance } = req.body;
    const user = await User.findOneAndUpdate(
      { telegramId: req.params.telegramId },
      { usdtBalance, tonBalance },
      { new: true }
    );
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Обработчики Telegram бота

// Команда /start
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const user = msg.from;
  
  // Сохраняем пользователя в БД
  let dbUser = await User.findOne({ telegramId: chatId.toString() });
  if (!dbUser) {
    dbUser = new User({
      telegramId: chatId.toString(),
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name,
      isAdmin: chatId.toString() === process.env.ADMIN_ID
    });
    await dbUser.save();
  }
  
  // Отправляем приветственное сообщение
  const welcomeText = `🎉 Добро пожаловать в UNIVERSAL SHOP, ${user.first_name}!\n\n` +
    `💰 Ваш баланс:\n` +
    `💵 USDT: ${dbUser.usdtBalance}\n` +
    `⚡ TON: ${dbUser.tonBalance}\n\n` +
    `🔗 Ваша персональная страница:\n` +
    `${process.env.WEB_APP_URL}/?user=${chatId}\n\n` +
    `Перейдите по ссылке для настройки интерфейса!`;
  
  const keyboard = {
    reply_markup: {
      inline_keyboard: [
        [{ text: '🎨 Открыть редактор', url: `${process.env.WEB_APP_URL}/?user=${chatId}` }],
        [{ text: '🛒 Магазин', callback_data: 'shop' }],
        [{ text: '🔄 Обменник', callback_data: 'exchange' }]
      ]
    }
  };
  
  bot.sendMessage(chatId, welcomeText, keyboard);
});

// Команда /customize
bot.onText(/\/customize/, (msg) => {
  const chatId = msg.chat.id;
  const personalizeUrl = `${process.env.WEB_APP_URL}/?user=${chatId}`;
  
  bot.sendMessage(chatId, `🎨 Ваша мастерская кастомизации:\n\n${personalizeUrl}\n\nНажмите на ссылку, чтобы начать настройку интерфейса!`);
});

// Обработка callback-ов
bot.on('callback_query', async (callbackQuery) => {
  const msg = callbackQuery.message;
  const data = callbackQuery.data;
  
  if (data === 'shop') {
    const products = await Product.find({ isActive: true, stock: { $gt: 0 } });
    let message = '🛒 **Доступные товары:**\n\n';
    
    products.forEach((product, index) => {
      message += `${index + 1}. ${product.name}\n` +
                `   💰 ${product.price} ${product.currency}\n` +
                `   📦 Осталось: ${product.stock} шт.\n\n`;
    });
    
    bot.sendMessage(msg.chat.id, message, { parse_mode: 'Markdown' });
  }
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Сервер запущен на порту ${PORT}`);
  console.log(`🌐 Веб-приложение доступно по адресу: ${process.env.WEB_APP_URL || 'http://localhost:' + PORT}`);
});
