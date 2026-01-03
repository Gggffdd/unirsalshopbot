const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  telegramId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  username: String,
  firstName: String,
  lastName: String,
  usdtBalance: { 
    type: Number, 
    default: 1000 
  },
  tonBalance: { 
    type: Number, 
    default: 500 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  lastActivity: { 
    type: Date, 
    default: Date.now 
  },
  isAdmin: { 
    type: Boolean, 
    default: false 
  },
  customSettings: {
    background: { 
      type: String, 
      default: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
    },
    buttons: [{
      id: String,
      text: String,
      url: String,
      style: { 
        type: String, 
        default: 'primary' 
      },
      position: {
        x: { type: Number, default: 50 },
        y: { type: Number, default: 100 }
      },
      createdAt: { type: Date, default: Date.now }
    }],
    images: [{
      id: String,
      url: String,
      position: {
        x: { type: Number, default: 100 },
        y: { type: Number, default: 200 }
      },
      size: {
        width: { type: Number, default: 150 },
        height: { type: Number, default: 150 }
      },
      createdAt: { type: Date, default: Date.now }
    }],
    texts: [{
      id: String,
      text: String,
      size: { type: Number, default: 16 },
      color: { type: String, default: '#ffffff' },
      position: {
        x: { type: Number, default: 50 },
        y: { type: Number, default: 500 }
      },
      createdAt: { type: Date, default: Date.now }
    }]
  }
});

// Метод для обновления последней активности
userSchema.methods.updateActivity = function() {
  this.lastActivity = new Date();
  return this.save();
};

module.exports = mongoose.model('User', userSchema);
