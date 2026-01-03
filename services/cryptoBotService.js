const axios = require('axios');

class CryptoBotService {
  constructor() {
    this.apiKey = process.env.CRYPTO_BOT_API_KEY;
    this.apiUrl = process.env.CRYPTO_BOT_API_URL;
    this.client = axios.create({
      baseURL: this.apiUrl,
      headers: {
        'Crypto-Pay-API-Token': this.apiKey
      }
    });
  }

  async createInvoice(amount, currency = 'USDT', description = 'Пополнение баланса') {
    try {
      const response = await this.client.post('/createInvoice', {
        amount,
        currency,
        description
      });
      return response.data.result;
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  }

  async getExchangeRates() {
    try {
      const response = await this.client.get('/getExchangeRates');
      return response.data.result;
    } catch (error) {
      console.error('Error getting exchange rates:', error);
      throw error;
    }
  }

  async getBalance() {
    try {
      const response = await this.client.get('/getBalance');
      return response.data.result;
    } catch (error) {
      console.error('Error getting balance:', error);
      throw error;
    }
  }
}

module.exports = new CryptoBotService();
