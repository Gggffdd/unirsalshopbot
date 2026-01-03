// Открытие/закрытие редактора
function openEditor() {
    document.getElementById('editor-modal').style.display = 'flex';
    loadUserSettings();
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

// Загрузка настроек пользователя
async function loadUserSettings() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get('user') || localStorage.getItem('userId');
        
        if (!userId) {
            console.log('No user ID found');
            return;
        }
        
        const response = await fetch(`/api/user-settings/${userId}`);
        if (response.ok) {
            const settings = await response.json();
            userData.customSettings = settings;
            
            // Отображаем существующие элементы
            displayExistingElements(settings);
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

// Отображение существующих элементов
function displayExistingElements(settings) {
    // Очищаем контейнеры
    document.getElementById('user-buttons-container').innerHTML = '';
    document.getElementById('user-images-container').innerHTML = '';
    document.getElementById('user-texts-container').innerHTML = '';
    
    // Кнопки
    if (settings.buttons && settings.buttons.length > 0) {
        settings.buttons.forEach(button => {
            createButtonElement(button);
        });
    }
    
    // Изображения
    if (settings.images && settings.images.length > 0) {
        settings.images.forEach(image => {
            createImageElement(image);
        });
    }
    
    // Тексты
    if (settings.texts && settings.texts.length > 0) {
        settings.texts.forEach(text => {
            createTextElementOnPage(text);
        });
    }
    
    // Фон
    if (settings.background) {
        document.getElementById('dynamic-background').style.background = settings.background;
    }
}

// Изменение фона
function changeBackgroundColor(color) {
    document.getElementById('dynamic-background').style.background = color;
    saveSetting('background', color);
}

function setBackgroundGradient() {
    const gradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    document.getElementById('dynamic-background').style.background = gradient;
    saveSetting('background', gradient);
}

async function setBackgroundImage() {
    const url = prompt('Введите URL изображения для фона:');
    if (url) {
        document.getElementById('dynamic-background').style.backgroundImage = `url(${url})`;
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
    document.getElementById('dynamic-background').style.background = randomPattern;
    saveSetting('background', randomPattern);
}

// Создание кнопок
async function createButton() {
    const text = document.getElementById('btn-text').value;
    const url = document.getElementById('btn-url').value;
    const style = document.getElementById('btn-style').value;
    
    if (!text) {
        showNotification('Введите текст кнопки', 'error');
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
    
    // Получаем user ID
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('user') || localStorage.getItem('userId');
    
    if (userId) {
        try {
            const response = await fetch(`/api/add-button/${userId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ button })
            });
            
            if (response.ok) {
                // Добавляем кнопку в локальные настройки
                if (!userData.customSettings.buttons) {
                    userData.customSettings.buttons = [];
                }
                userData.customSettings.buttons.push(button);
                
                // Создаем элемент на странице
                createButtonElement(button);
                
                // Очищаем поля
                document.getElementById('btn-text').value = '';
                document.getElementById('btn-url').value = '';
                
                showNotification('Кнопка создана!', 'success');
            }
        } catch (error) {
            console.error('Error creating button:', error);
            showNotification('Ошибка при создании кнопки', 'error');
        }
    } else {
        showNotification('Не удалось определить пользователя', 'error');
    }
}

function createButtonElement(buttonData) {
    const container = document.getElementById('user-buttons-container');
    const button = document.createElement('button');
    button.id = buttonData.id;
    button.className = `user-button ${buttonData.style}`;
    button.textContent = buttonData.text;
    button.style.position = 'absolute';
    button.style.left = (buttonData.position?.x || 50) + 'px';
    button.style.top = (buttonData.position?.y || 100) + 'px';
    button.style.zIndex = '100';
    
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
    makeDraggable(button, 'button');
    
    container.appendChild(button);
    return button;
}

// Загрузка изображений
async function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('user') || localStorage.getItem('userId');
    
    if (!userId) {
        showNotification('Не удалось определить пользователя', 'error');
        return;
    }
    
    const formData = new FormData();
    formData.append('image', file);
    
    try {
        const response = await fetch(`/api/upload-image/${userId}`, {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            const result = await response.json();
            
            // Добавляем изображение в локальные настройки
            if (!userData.customSettings.images) {
                userData.customSettings.images = [];
            }
            userData.customSettings.images.push(result.image);
            
            // Создаем элемент на странице
            createImageElement(result.image);
            
            showNotification('Изображение загружено!', 'success');
        } else {
            showNotification('Ошибка при загрузке изображения', 'error');
        }
    } catch (error) {
        console.error('Error uploading image:', error);
        showNotification('Ошибка сети', 'error');
    }
}

function createImageElement(imageData) {
    const container = document.getElementById('user-images-container');
    const img = document.createElement('img');
    img.id = imageData.id;
    img.className = 'user-image';
    img.src = imageData.url;
    img.style.position = 'absolute';
    img.style.left = (imageData.position?.x || 100) + 'px';
    img.style.top = (imageData.position?.y || 200) + 'px';
    img.style.width = (imageData.size?.width || 150) + 'px';
    img.style.height = (imageData.size?.height || 150) + 'px';
    img.style.zIndex = '100';
    
    // Делаем перетаскиваемой
    makeDraggable(img, 'image');
    
    container.appendChild(img);
    return img;
}

// Создание текста
async function createTextElement() {
    const text = document.getElementById('text-content').value;
    const size = document.getElementById('text-size').value;
    const color = document.getElementById('text-color').value;
    
    if (!text) {
        showNotification('Введите текст', 'error');
        return;
    }
    
    const textId = 'txt_' + Date.now();
    const textData = {
        id: textId,
        text: text,
        size: parseInt(size),
        color: color,
        position: { x: 50, y: 500 }
    };
    
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('user') || localStorage.getItem('userId');
    
    if (userId) {
        try {
            const response = await fetch(`/api/add-text/${userId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: textData })
            });
            
            if (response.ok) {
                // Добавляем текст в локальные настройки
                if (!userData.customSettings.texts) {
                    userData.customSettings.texts = [];
                }
                userData.customSettings.texts.push(textData);
                
                // Создаем элемент на странице
                createTextElementOnPage(textData);
                
                // Очищаем поле
                document.getElementById('text-content').value = '';
                
                showNotification('Текст добавлен!', 'success');
            }
        } catch (error) {
            console.error('Error adding text:', error);
            showNotification('Ошибка при добавлении текста', 'error');
        }
    }
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
    textElement.style.left = (textData.position?.x || 50) + 'px';
    textElement.style.top = (textData.position?.y || 500) + 'px';
    textElement.style.zIndex = '100';
    
    // Делаем перетаскиваемой
    makeDraggable(textElement, 'text');
    
    container.appendChild(textElement);
    return textElement;
}

// Перетаскивание элементов
function initDraggableElements() {
    // Инициализация будет выполнена после загрузки настроек
}

function makeDraggable(element, type) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    let isDragging = false;
    
    element.onmousedown = dragMouseDown;
    
    function dragMouseDown(e) {
        e.preventDefault();
        
        // Получаем начальную позицию курсора
        pos3 = e.clientX;
        pos4 = e.clientY;
        
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
        
        // Добавляем класс при перетаскивании
        element.classList.add('dragging');
    }
    
    function elementDrag(e) {
        e.preventDefault();
        isDragging = true;
        
        // Вычисляем новую позицию
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        
        // Устанавливаем новую позицию
        const newX = element.offsetLeft - pos1;
        const newY = element.offsetTop - pos2;
        
        element.style.left = newX + "px";
        element.style.top = newY + "px";
    }
    
    async function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
        
        // Убираем класс перетаскивания
        element.classList.remove('dragging');
        
        // Сохраняем позицию только если элемент действительно перемещали
        if (isDragging) {
            const position = {
                x: parseInt(element.style.left),
                y: parseInt(element.style.top)
            };
            
            // Сохраняем позицию элемента
            await saveElementPosition(element.id, position, type);
            isDragging = false;
        }
    }
}

// Сохранение позиции элемента
async function saveElementPosition(elementId, position, type) {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('user') || localStorage.getItem('userId');
    
    if (!userId) return;
    
    // Обновляем позицию в локальных настройках
    const elementType = type === 'button' ? 'buttons' :
                       type === 'image' ? 'images' : 'texts';
    
    if (userData.customSettings[elementType]) {
        const element = userData.customSettings[elementType].find(el => el.id === elementId);
        if (element) {
            element.position = position;
            
            // Сохраняем все настройки на сервере
            await saveAllSettings(userId);
        }
    }
}

// Сохранение всех настроек
async function saveAllSettings(userId) {
    try {
        const response = await fetch(`/api/save-settings/${userId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                settings: userData.customSettings
            })
        });
        
        if (!response.ok) {
            console.error('Error saving settings');
        }
    } catch (error) {
        console.error('Error saving settings:', error);
    }
}

// Сохранение отдельной настройки
async function saveSetting(key, value) {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('user') || localStorage.getItem('userId');
    
    if (!userId) {
        console.log('No user ID for saving');
        return;
    }
    
    // Обновляем локальные настройки
    userData.customSettings[key] = value;
    
    // Сохраняем на сервере
    await saveAllSettings(userId);
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    // Загрузка изображений
    document.getElementById('image-upload').addEventListener('change', handleImageUpload);
    
    // Загрузка фона
    document.getElementById('bg-upload').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('dynamic-background').style.backgroundImage = 
                    `url(${e.target.result})`;
                saveSetting('background', `url(${e.target.result})`);
                showNotification('Фон обновлен!', 'success');
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Инициализация перетаскивания после загрузки настроек
    setTimeout(initDraggableElements, 1000);
});

// Экспорт функций
window.openEditor = openEditor;
window.closeEditor = closeEditor;
window.openEditorTab = openEditorTab;
window.changeBackgroundColor = changeBackgroundColor;
window.setBackgroundGradient = setBackgroundGradient;
window.setBackgroundImage = setBackgroundImage;
window.setBackgroundPattern = setBackgroundPattern;
window.createButton = createButton;
window.createTextElement = createTextElement;
