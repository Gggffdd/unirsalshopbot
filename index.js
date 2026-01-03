require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs-extra');
const botController = require('./controllers/botController');
const adminController = require('./controllers/adminController');
const cryptoBotService = require('./services/cryptoBotService');
const databaseService = require('./services/databaseService');

// Инициализация бота
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
const app = express();

// Подключение к базе данных
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Инициализация контроллеров
botController.init(bot);
adminController.init(bot);

// Обработчики команд бота
bot.onText(/\/start/, (msg) => botController.handleStart(msg));
bot.onText(/\/shop/, (msg) => botController.handleShop(msg));
bot.onText(/\/exchange/, (msg) => botController.handleExchange(msg));
bot.onText(/\/profile/, (msg) => botController.handleProfile(msg));
bot.onText(/\/customize/, (msg) => botController.handleCustomize(msg));
bot.onText(/\/admin/, (msg) => adminController.handleAdminPanel(msg));

// Веб-сервер для Netlify
app.get('/', (req, res) => {
  res.send('UNIVERSAL SHOP Bot is running!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
