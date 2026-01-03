const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  telegramId: { type: Number, required: true, unique: true },
  username: String,
  firstName: String,
  lastName: String,
  balance: { type: Number, default: 0 },
  usdtBalance: { type: Number, default: 0 },
  tonBalance: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  lastActivity: { type: Date, default: Date.now },
  isAdmin: { type: Boolean, default: false },
  customSettings: {
    background: { type: String, default: 'default' },
    buttons: [{ text: String, url: String }],
    images: [String],
    textElements: [{ id: String, text: String, position: String }]
  }
});

module.exports = mongoose.model('User', userSchema);
