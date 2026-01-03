const sharp = require('sharp');
const fs = require('fs-extra');
const path = require('path');

class ImageEditor {
  constructor() {
    this.imagesDir = path.join(__dirname, '../public/images');
    fs.ensureDirSync(this.imagesDir);
  }

  async processUserImage(userId, imageBuffer, options = {}) {
    const userDir = path.join(this.imagesDir, userId.toString());
    fs.ensureDirSync(userDir);
    
    const filename = `${Date.now()}.png`;
    const imagePath = path.join(userDir, filename);
    
    let image = sharp(imageBuffer);
    
    // Применяем эффекты если есть
    if (options.resize) {
      image = image.resize(options.resize.width, options.resize.height);
    }
    
    if (options.background) {
      image = image.flatten({ background: options.background });
    }
    
    if (options.text) {
      // Добавление текста на изображение
      // Здесь нужно реализовать добавление текста
    }
    
    await image.png().toFile(imagePath);
    
    return `/images/${userId}/${filename}`;
  }
}

module.exports = new ImageEditor();
