// Открытие/закрытие редактора
function openEditor() {
    document.getElementById('editor-modal').style.display = 'flex';
    loadExistingButtons();
    loadExistingImages();
}

function closeEditor() {
    document.getElementById('editor-modal').style.display = 'none';
}

// Управление вкладками редактора
function openEditorTab(tabName) {
    // Скрыть все вкладки
    document.querySelectorAll('.editor-tab').forEach(tab => {
        tab.classList.remove('active');
        tab.style.display = 'none';
    });
    
    // Убрать активный класс у всех кнопок
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Показать выбранную вкладку
    document.getElementById(`editor-${tabName}`).classList.add('active');
    document.getElementById(`editor-${tabName}`).style.display = 'block';
    
    // Активная кнопка
    event.target.classList.add('active');
}

// Изменение фона
function changeBackgroundColor(color) {
    document.querySelector('.dynamic-background').style.background = color;
    saveSetting('background', color);
}

function setBackgroundGradient() {
    const gradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    document.querySelector('.dynamic-background').style.background = gradient;
    saveSetting('background', gradient);
}

function setBackgroundImage() {
    const url = prompt('Введите URL изображения для фона:');
    if (url) {
        document.querySelector('.dynamic-background').style.backgroundImage = `url(${url})`;
        saveSetting('background', `url(${url})`);
    }
}

function setBackgroundPattern() {
    const patterns = [
        'linear-gradient(45deg, #f06, transparent), linear-gradient(135deg, #0f6, transparent), linear-gradient(225deg, #60f, transparent), linear-gradient(315deg, #06f, transparent)',
        'radial-gradient(circle at 20% 80%, #ff6b6b, #4ecdc4)',
        'conic-gradient(from 0deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)'
    ];
    const randomPattern = patterns[Math.floor(Math.random() * patterns.length)];
    document.querySelector('.dynamic-background').style.background = randomPattern;
    saveSetting('background', randomPattern);
}

// Создание кнопок
function createButton() {
    const text = document.getElementById('btn-text').value;
    const url = document.getElementById('btn-url').value;
    const style = document.getElementById('btn-style').value;
    
    if (!text) {
        alert('Введите текст кнопки');
        return;
    }
    
    const buttonId = 'btn_' + Date.now();
    const button = {
        id: buttonId,
        text: text,
        url: url,
        style: style,
        position: { x: 50, y: 100 }
    };
    
    // Добавляем в массив
    userData.customSettings.buttons.push(button);
    
    // Сохраняем
    saveSetting('buttons', userData.customSettings.buttons);
    
    // Создаем элемент на странице
    createButtonElement(button);
    
    // Очищаем поля
    document.getElementById('btn-text').value = '';
    document.getElementById('btn-url').value = '';
    
    showNotification('Кнопка создана!');
}

function createButtonElement(buttonData) {
    const container = document.getElementById('user-buttons-container');
    const button = document.createElement('button');
    button.id = buttonData.id;
    button.className = `user-button ${buttonData.style}`;
    button.textContent = buttonData.text;
    button.style.position = 'absolute';
    button.style.left = buttonData.position.x + 'px';
    button.style.top = buttonData.position.y + 'px';
    
    // Обработчик клика
    button.onclick = function() {
        if (buttonData.url) {
            if (buttonData.url.startsWith('http')) {
                window.open(buttonData.url, '_blank');
            } else if (buttonData.url.startsWith('/')) {
                showSection(buttonData.url.substring(1));
            } else if (buttonData.url === 'shop') {
                openShop();
            } else if (buttonData.url === 'exchange') {
                openExchange();
            } else if (buttonData.url === 'wallet') {
                openWallet();
            }
        }
    };
    
    // Делаем перетаскиваемой
    makeDraggable(button);
    
    container.appendChild(button);
}

function loadExistingButtons() {
    const container = document.getElementById('existing-buttons');
    container.innerHTML = '';
    
    userData.customSettings.buttons.forEach(button => {
        const buttonElement = document.createElement('div');
        buttonElement.className = 'existing-button';
        buttonElement.innerHTML = `
            <span>${button.text}</span>
            <button onclick="deleteButton('${button.id}')" class="delete-btn">×</button>
        `;
        container.appendChild(buttonElement);
    });
}

function deleteButton(buttonId) {
    userData.customSettings.buttons = userData.customSettings.buttons.filter(b => b.id !== buttonId);
    saveSetting('buttons', userData.customSettings.buttons);
    
    // Удаляем со страницы
    const buttonElement = document.getElementById(buttonId);
    if (buttonElement) {
        buttonElement.remove();
    }
    
    loadExistingButtons();
    showNotification('Кнопка удалена');
}

// Работа с изображениями
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const imageId = 'img_' + Date.now();
        const imageData = {
            id: imageId,
            url: e.target.result,
            position: { x: 100, y: 200 }
        };
        
        // Добавляем в массив
        userData.customSettings.images.push(imageData);
        saveSetting('images', userData.customSettings.images);
        
        // Создаем элемент на странице
        createImageElement(imageData);
        
        showNotification('Изображение загружено!');
    };
    reader.readAsDataURL(file);
}

function createImageElement(imageData) {
    const container = document.getElementById('user-images-container');
    const img = document.createElement('img');
    img.id = imageData.id;
    img.className = 'user-image';
    img.src = imageData.url;
    img.style.position = 'absolute';
    img.style.left = imageData.position.x + 'px';
    img.style.top = imageData.position.y + 'px';
    
    // Делаем перетаскиваемой
    makeDraggable(img);
    
    container.appendChild(img);
}

function loadExistingImages() {
    const container = document.getElementById('uploaded-images');
    container.innerHTML = '';
    
    userData.customSettings.images.forEach(image => {
        const imageElement = document.createElement('div');
        imageElement.className = 'existing-image';
        imageElement.innerHTML = `
            <img src="${image.url}" style="width: 100px; height: 100px; object-fit: cover;">
            <button onclick="deleteImage('${image.id}')" class="delete-btn">×</button>
        `;
        container.appendChild(imageElement);
    });
}

function deleteImage(imageId) {
    userData.customSettings.images = userData.customSettings.images.filter(img => img.id !== imageId);
    saveSetting('images', userData.customSettings.images);
    
    // Удаляем со страницы
    const imageElement = document.getElementById(imageId);
    if (imageElement) {
        imageElement.remove();
    }
    
    loadExistingImages();
    showNotification('Изображение удалено');
}

// Работа с текстом
function createTextElement() {
    const text = document.getElementById('text-content').value;
    const size = document.getElementById('text-size').value;
    const color = document.getElementById('text-color').value;
    
    if (!text) {
        alert('Введите текст');
        return;
    }
    
    const textId = 'txt_' + Date.now();
    const textData = {
        id: textId,
        text: text,
        size: size,
        color: color,
        position: { x: 50, y: 500 }
    };
    
    // Добавляем в массив
    userData.customSettings.texts.push(textData);
    saveSetting('texts', userData.customSettings.texts);
    
    // Создаем элемент на странице
    createTextElementOnPage(textData);
    
    // Очищаем поле
    document.getElementById('text-content').value = '';
    
    showNotification('Текст добавлен!');
}

function createTextElementOnPage(textData) {
    const container = document.getElementById('user-texts-container');
    const textElement = document.createElement('div');
    textElement.id = textData.id;
    textElement.className = 'user-text';
    textElement.textContent = textData.text;
    textElement.style.fontSize = textData.size + 'px';
    textElement.style.color = textData.color;
    textElement.style.position = 'absolute';
    textElement.style.left = textData.position.x + 'px';
    textElement.style.top = textData.position.y + 'px';
    
    // Делаем перетаскиваемой
    makeDraggable(textElement);
    
    container.appendChild(textElement);
}

// Перетаскивание элементов
function initDraggableElements() {
    userData.customSettings.buttons.forEach(createButtonElement);
    userData.customSettings.images.forEach(createImageElement);
    userData.customSettings.texts.forEach(createTextElementOnPage);
}

function makeDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    
    element.onmousedown = dragMouseDown;
    
    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        
        // Получаем начальную позицию курсора
        pos3 = e.clientX;
        pos4 = e.clientY;
        
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }
    
    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        
        // Вычисляем новую позицию
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        
        // Устанавливаем новую позицию
        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";
        
        // Сохраняем позицию в настройках
        saveElementPosition(element.id, {
            x: element.offsetLeft - pos1,
            y: element.offsetTop - pos2
        });
    }
    
    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

// Сохранение настроек
function saveSetting(key, value) {
    userData.customSettings[key] = value;
    localStorage.setItem('userSettings', JSON.stringify(userData.customSettings));
    
    // Сохраняем на сервере
    if (userData.id) {
        saveSettingsToServer();
    }
}

function saveElementPosition(elementId, position) {
    // Находим элемент в массиве и обновляем позицию
    const elementType = elementId.startsWith('btn_') ? 'buttons' :
                       elementId.startsWith('img_') ? 'images' : 'texts';
    
    const element = userData.customSettings[elementType].find(el => el.id === elementId);
    if (element) {
        element.position = position;
        saveSetting(elementType, userData.customSettings[elementType]);
    }
}

async function saveSettingsToServer() {
    try {
        await fetch('/api/save-settings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: userData.id,
                settings: userData.customSettings
            })
        });
    } catch (error) {
        console.error('Error saving settings:', error);
    }
}

function loadUserSettings() {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
        userData.customSettings = JSON.parse(savedSettings);
        
        // Применяем настройки фона
        if (userData.customSettings.background) {
            document.querySelector('.dynamic-background').style.background = 
                userData.customSettings.background;
        }
    }
}

// Обработчики событий для загрузки файлов
document.addEventListener('DOMContentLoaded', function() {
    // Фон
    document.getElementById('bg-upload').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.querySelector('.dynamic-background').style.backgroundImage = 
                    `url(${e.target.result})`;
                saveSetting('background', `url(${e.target.result})`);
                showNotification('Фон обновлен!');
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Изображения
    document.getElementById('image-upload').addEventListener('change', handleImageUpload);
});
