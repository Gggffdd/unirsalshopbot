require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const axios = require('axios');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Подключение к MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/universal_shop');

// Модели (упрощенные)
const UserSchema = new mongoose.Schema({
    telegramId: String,
    username: String,
    usdtBalance: { type: Number, default: 0 },
    tonBalance: { type: Number, default: 0 },
    customSettings: Object,
    createdAt: { type: Date, default: Date.now }
});

const ProductSchema = new mongoose.Schema({
    name: String,
    description: String,
    price: Number,
    currency: String,
    image: String,
    stock: Number,
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const Product = mongoose.model('Product', ProductSchema);

// Crypto Bot API
const CRYPTO_BOT_API = 'https://pay.crypt.bot/api';
const CRYPTO_BOT_KEY = process.env.CRYPTO_BOT_API_KEY;

// Маршруты API
app.get('/api/user/:id', async (req, res) => {
    try {
        let user = await User.findOne({ telegramId: req.params.id });
        
        if (!user) {
            user = new User({
                telegramId: req.params.id,
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
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/save-settings', async (req, res) => {
    try {
        const { userId, settings } = req.body;
        await User.findOneAndUpdate(
            { telegramId: userId },
            { customSettings: settings },
            { new: true }
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find({ stock: { $gt: 0 } });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/buy', async (req, res) => {
    try {
        const { userId, productId } = req.body;
        
        // Находим пользователя и товар
        const user = await User.findOne({ telegramId: userId });
        const product = await Product.findById(productId);
        
        if (!user || !product) {
            return res.status(404).json({ error: 'Not found' });
        }
        
        // Проверяем баланс
        if (product.currency === 'USDT' && user.usdtBalance < product.price) {
            return res.status(400).json({ error: 'Insufficient balance' });
        }
        
        if (product.currency === 'TON' && user.tonBalance < product.price) {
            return res.status(400).json({ error: 'Insufficient balance' });
        }
        
        // Создаем счет через Crypto Bot
        const invoice = await axios.post(`${CRYPTO_BOT_API}/createInvoice`, {
            amount: product.price,
            currency: product.currency,
            description: `Покупка: ${product.name}`
        }, {
            headers: { 'Crypto-Pay-API-Token': CRYPTO_BOT_KEY }
        });
        
        res.json({
            invoiceUrl: invoice.data.result.bot_invoice_url,
            success: true
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/exchange', async (req, res) => {
    try {
        const { userId, fromCurrency, toCurrency, amount } = req.body;
        
        // Получаем актуальный курс
        const rates = await axios.get(`${CRYPTO_BOT_API}/getExchangeRates`, {
            headers: { 'Crypto-Pay-API-Token': CRYPTO_BOT_KEY }
        });
        
        // Находим нужный курс
        const rate = rates.data.result.find(r => 
            r.source === fromCurrency && r.target === toCurrency
        );
        
        if (!rate) {
            return res.status(400).json({ error: 'Exchange rate not found' });
        }
        
        // Обновляем баланс пользователя
        const user = await User.findOne({ telegramId: userId });
        
        if (fromCurrency === 'USDT') {
            user.usdtBalance -= amount;
            user.tonBalance += amount * rate.rate;
        } else {
            user.tonBalance -= amount;
            user.usdtBalance += amount * rate.rate;
        }
        
        await user.save();
        
        res.json({
            success: true,
            amount: amount * rate.rate,
            currency: toCurrency
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/exchange-rates', async (req, res) => {
    try {
        const response = await axios.get(`${CRYPTO_BOT_API}/getExchangeRates`, {
            headers: { 'Crypto-Pay-API-Token': CRYPTO_BOT_KEY }
        });
        res.json(response.data.result);
    } catch (error) {
        // Fallback rates
        res.json([
            { pair: 'USDT_TON', rate: 2.5 },
            { pair: 'TON_USDT', rate: 0.4 }
        ]);
    }
});

// Загрузка файлов
const upload = multer({ dest: 'uploads/' });

app.post('/api/upload', upload.single('file'), (req, res) => {
    try {
        const file = req.file;
        // Сохраняем файл и возвращаем URL
        const fileUrl = `/uploads/${file.filename}`;
        res.json({ url: fileUrl });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Статические файлы
app.use('/uploads', express.static('uploads'));

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
