const fs = require('fs-extra');
const path = require('path');

class ButtonManager {
  constructor() {
    this.buttonsDir = path.join(__dirname, '../data/buttons');
    fs.ensureDirSync(this.buttonsDir);
  }

  createButton(userId, buttonData) {
    const userDir = path.join(this.buttonsDir, userId.toString());
    fs.ensureDirSync(userDir);
    
    const buttonId = Date.now().toString();
    const buttonPath = path.join(userDir, `${buttonId}.json`);
    
    fs.writeJsonSync(buttonPath, {
      id: buttonId,
      ...buttonData,
      createdAt: new Date()
    });
    
    return buttonId;
  }

  getUserButtons(userId) {
    const userDir = path.join(this.buttonsDir, userId.toString());
    
    if (!fs.existsSync(userDir)) {
      return [];
    }
    
    const buttonFiles = fs.readdirSync(userDir);
    return buttonFiles.map(file => {
      const buttonPath = path.join(userDir, file);
      return fs.readJsonSync(buttonPath);
    });
  }
}

module.exports = new ButtonManager();
