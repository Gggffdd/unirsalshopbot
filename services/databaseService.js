const mongoose = require('mongoose');

class DatabaseService {
  async connect() {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.error('❌ Database connection error:', error);
      process.exit(1);
    }
  }
}

module.exports = new DatabaseService();
