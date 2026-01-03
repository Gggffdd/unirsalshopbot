// Основные переменные
let userData = {
    telegramId: null,
    usdtBalance: 0,
    tonBalance: 0,
    customSettings: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        buttons: [],
        images: [],
        texts: []
    }
};

// Инициализация приложения
document.addEventListener('DOMContentLoaded', async function() {
    console.log('UNIVERSAL SHOP начал загрузку...');
    
    // Получаем ID пользователя из URL
    const urlParams = new URLSearchParams(window.location.search);
    const telegramId = urlParams.get('user');
    
    if (telegramId) {
        userData.telegramId = telegramId;
        localStorage.setItem('userId', telegramId);
        
        // Загружаем данные пользователя
        await loadUserData(telegramId);
        
        // Обновляем приветствие
        updateWelcomeMessage();
    } else {
        // Показываем сообщение о необходимости начать с бота
        showTelegramRequiredMessage();
    }
    
    // Загрузка курсов обмена
    await loadExchangeRates();
    
    // Загрузка магазина
    await loadShopProducts();
    
    // Инициализация перетаскивания
    initDraggableElements();
});

// Загрузка данных пользователя
async function loadUserData(telegramId) {
    try {
        console.log('Загрузка данных пользователя:', telegramId);
        const response = await fetch(`/api/user/${telegramId}`);
        
        if (response.ok) {
            const data = await response.json();
            
            userData.usdtBalance = data.usdtBalance || 0;
            userData.tonBalance = data.tonBalance || 0;
            
            // Загружаем кастомные настройки
            await loadUserSettings(telegramId);
            
            updateUI();
            
            console.log('Данные пользователя загружены:', data);
        } else {
            console.error('Ошибка загрузки пользователя:', response.status);
        }
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

// Загрузка кастомных настроек
async function loadUserSettings(telegramId) {
    try {
        const response = await fetch(`/api/user-settings/${telegramId}`);
        if (response.ok) {
            const settings = await response.json();
            userData.customSettings = settings;
            
            // Применяем настройки
            applyCustomSettings(settings);
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

// Применение кастомных настроек
function applyCustomSettings(settings) {
    if (!settings) return;
    
    // Применяем фон
    if (settings.background) {
        const bgElement = document.getElementById('dynamic-background');
        if (bgElement) {
            bgElement.style.background = settings.background;
        }
    }
    
    // Применяем кнопки
    if (settings.buttons && settings.buttons.length > 0) {
        const container = document.getElementById('user-buttons-container');
        if (container) {
            container.innerHTML = '';
            settings.buttons.forEach(button => {
                createButtonElement(button);
            });
        }
    }
    
    // Применяем изображения
    if (settings.images && settings.images.length > 0) {
        const container = document.getElementById('user-images-container');
        if (container) {
            container.innerHTML = '';
            settings.images.forEach(image => {
                createImageElement(image);
            });
        }
    }
    
    // Применяем текст
    if (settings.texts && settings.texts.length > 0) {
        const container = document.getElementById('user-texts-container');
        if (container) {
            container.innerHTML = '';
            settings.texts.forEach(text => {
                createTextElementOnPage(text);
            });
        }
    }
}

// Функции для создания элементов (должны совпадать с editor.js)
function createButtonElement(buttonData) {
    const container = document.getElementById('user-buttons-container');
    const button = document.createElement('button');
    button.id = buttonData.id;
    button.className = `user-button ${buttonData.style || 'primary'}`;
    button.textContent = buttonData.text;
    button.style.position = 'absolute';
    button.style.left = (buttonData.position?.x || 50) + 'px';
    button.style.top = (buttonData.position?.y || 100) + 'px';
    button.style.zIndex = '100';
    
    // Обработчик клика
    button.onclick = function() {
        if (buttonData.url) {
            handleButtonClick(buttonData.url);
        }
    };
    
    container.appendChild(button);
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
    
    container.appendChild(img);
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
    
    container.appendChild(textElement);
}

// Обработка клика по кнопке
function handleButtonClick(url) {
    if (!url) return;
    
    if (url.startsWith('http')) {
        window.open(url, '_blank');
    } else if (url.startsWith('/')) {
        showSection(url.substring(1));
    } else if (url === 'shop') {
        openShop();
    } else if (url === 'exchange') {
        openExchange();
    } else if (url === 'wallet') {
        openWallet();
    } else if (url === 'editor') {
        openEditor();
    } else {
        // Пробуем найти секцию с таким ID
        const section = document.getElementById(url + '-section');
        if (section) {
            showSection(url + '-section');
        } else {
            showNotification(`Кнопка "${url}" не настроена`, 'info');
        }
    }
}

// Обновление приветственного сообщения
function updateWelcomeMessage() {
    const nameElement = document.getElementById('welcome-name');
    if (nameElement) {
        nameElement.textContent = userData.firstName || 'Пользователь';
    }
}

// Сообщение о необходимости Telegram
function showTelegramRequiredMessage() {
    const welcomeSection = document.getElementById('welcome-section');
    if (welcomeSection) {
        welcomeSection.innerHTML = `
            <h1>UNIVERSAL SHOP</h1>
            <p>Для использования кастомизации необходимо:</p>
            <div style="margin: 20px 0; padding: 20px; background: rgba(255,255,255,0.1); border-radius: 10px;">
                <p>1. Откройте Telegram</p>
                <p>2. Найдите бота: <strong>@universal_shop_bot</strong></p>
                <p>3. Нажмите /start</p>
                <p>4. Нажмите кнопку "🎨 Открыть редактор"</p>
            </div>
            <a href="https://t.me/universal_shop_bot" target="_blank" 
               style="display: inline-block; background: #0088cc; color: white; 
                      padding: 15px 30px; border-radius: 25px; text-decoration: none;
                      font-weight: bold; margin-top: 20px;">
                Открыть бота в Telegram
            </a>
        `;
    }
}

// Остальные функции (оставлены без изменений)
async function loadExchangeRates() {
    try {
        const response = await fetch('/api/exchange-rates');
        if (response.ok) {
            const rates = await response.json();
            const usdtToTon = rates.find(r => r.pair === 'USDT_TON');
            if (usdtToTon) {
                const rateElement = document.getElementById('exchange-rate');
                if (rateElement) {
                    rateElement.textContent = `1 USDT = ${usdtToTon.rate} TON`;
                }
            }
        }
    } catch (error) {
        console.error('Error loading exchange rates:', error);
    }
}

async function loadShopProducts() {
    try {
        const response = await fetch('/api/products');
        if (response.ok) {
            const products = await response.json();
            const container = document.getElementById('products-grid');
            if (container) {
                container.innerHTML = '';
                
                products.forEach(product => {
                    const productCard = `
                        <div class="product-card">
                            ${product.image ? `<img src="${product.image}" class="product-image" alt="${product.name}">` : ''}
                            <div class="product-info">
                                <h3>${product.name}</h3>
                                <p>${product.description}</p>
                                <div class="product-price">${product.price} ${product.currency}</div>
                                <button onclick="buyProduct('${product._id}')" class="buy-btn">Купить</button>
                            </div>
                        </div>
                    `;
                    container.innerHTML += productCard;
                });
            }
        }
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Функции навигации
function openShop() {
    showSection('shop-section');
}

function openExchange() {
    showSection('exchange-section');
    calculateExchange();
}

function openWallet() {
    showSection('wallet-section');
    updateWalletDisplay();
}

function showSection(sectionId) {
    // Скрываем все секции
    document.querySelectorAll('.content-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Показываем нужную секцию
    const section = document.getElementById(sectionId);
    if (section) {
        section.style.display = 'block';
    }
    
    // Возвращаемся к началу
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
        mainContent.scrollIntoView({ behavior: 'smooth' });
    }
}

// Обновление UI
function updateUI() {
    const usdtElement = document.getElementById('balance-usdt');
    const tonElement = document.getElementById('balance-ton');
    const walletUsdt = document.getElementById('wallet-usdt');
    const walletTon = document.getElementById('wallet-ton');
    
    if (usdtElement) usdtElement.textContent = `${userData.usdtBalance} USDT`;
    if (tonElement) tonElement.textContent = `${userData.tonBalance} TON`;
    if (walletUsdt) walletUsdt.textContent = `${userData.usdtBalance} USDT`;
    if (walletTon) walletTon.textContent = `${userData.tonBalance} TON`;
}

// Уведомления
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    if (!notification) {
        // Создаем элемент уведомления, если его нет
        const notificationEl = document.createElement('div');
        notificationEl.id = 'notification';
        notificationEl.className = 'notification';
        notificationEl.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #3742fa;
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
            z-index: 3000;
            display: none;
        `;
        document.body.appendChild(notificationEl);
    }
    
    const notificationElement = document.getElementById('notification');
    notificationElement.textContent = message;
    notificationElement.style.background = type === 'error' ? '#ff4757' : 
                                         type === 'success' ? '#2ed573' : 
                                         '#3742fa';
    notificationElement.style.display = 'block';
    
    setTimeout(() => {
        notificationElement.style.display = 'none';
    }, 3000);
}

// Экспорт функций
window.openShop = openShop;
window.openExchange = openExchange;
window.openWallet = openWallet;
window.showNotification = showNotification;
