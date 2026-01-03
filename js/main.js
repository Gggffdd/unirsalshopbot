// Основные переменные
let userData = {
    id: null,
    usdtBalance: 0,
    tonBalance: 0,
    customSettings: {
        background: 'gradient',
        buttons: [],
        images: [],
        texts: []
    }
};

// Telegram Web App
let tg = window.Telegram.WebApp;

// Инициализация приложения
document.addEventListener('DOMContentLoaded', async function() {
    // Инициализация Telegram Web App
    tg.expand();
    tg.BackButton.hide();
    
    // Получение данных пользователя
    const userId = tg.initDataUnsafe?.user?.id || localStorage.getItem('userId');
    if (userId) {
        await loadUserData(userId);
    }
    
    // Загрузка курсов обмена
    await loadExchangeRates();
    
    // Загрузка магазина
    await loadShopProducts();
    
    // Восстановление пользовательских настроек
    loadUserSettings();
    
    // Инициализация перетаскивания
    initDraggableElements();
    
    // Обновление баланса каждые 30 секунд
    setInterval(updateBalances, 30000);
});

// Загрузка данных пользователя
async function loadUserData(userId) {
    try {
        const response = await fetch(`/api/user/${userId}`);
        if (response.ok) {
            userData = await response.json();
            updateUI();
            localStorage.setItem('userId', userId);
            localStorage.setItem('userSettings', JSON.stringify(userData.customSettings));
        }
    } catch (error) {
        console.error('Error loading user data:', error);
        // Используем данные по умолчанию
        userData.id = userId;
    }
}

// Загрузка курсов обмена
async function loadExchangeRates() {
    try {
        const response = await fetch('/api/exchange-rates');
        if (response.ok) {
            const rates = await response.json();
            const usdtToTon = rates.find(r => r.pair === 'USDT_TON');
            if (usdtToTon) {
                document.getElementById('exchange-rate').textContent = 
                    `1 USDT = ${usdtToTon.rate} TON`;
            }
        }
    } catch (error) {
        console.error('Error loading exchange rates:', error);
    }
}

// Загрузка товаров магазина
async function loadShopProducts() {
    try {
        const response = await fetch('/api/products');
        if (response.ok) {
            const products = await response.json();
            const container = document.getElementById('products-grid');
            container.innerHTML = '';
            
            products.forEach(product => {
                const productCard = `
                    <div class="product-card">
                        ${product.image ? `<img src="${product.image}" class="product-image" alt="${product.name}">` : ''}
                        <div class="product-info">
                            <h3>${product.name}</h3>
                            <p>${product.description}</p>
                            <div class="product-price">${product.price} ${product.currency}</div>
                            <button onclick="buyProduct('${product.id}')" class="buy-btn">Купить</button>
                        </div>
                    </div>
                `;
                container.innerHTML += productCard;
            });
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
    document.getElementById(sectionId).style.display = 'block';
    
    // Возвращаемся к началу
    document.getElementById('main-content').scrollIntoView({ behavior: 'smooth' });
}

// Обмен валюты
function calculateExchange() {
    const amount = parseFloat(document.getElementById('exchange-amount').value) || 0;
    const from = document.getElementById('exchange-from').value;
    const to = document.getElementById('exchange-to').value;
    
    // В реальном приложении здесь будет запрос к API
    let result = amount;
    if (from === 'USDT' && to === 'TON') {
        result = amount * 2.5; // Примерный курс
    } else if (from === 'TON' && to === 'USDT') {
        result = amount / 2.5;
    }
    
    document.getElementById('exchange-result').value = result.toFixed(2);
}

async function performExchange() {
    const amount = parseFloat(document.getElementById('exchange-amount').value);
    const from = document.getElementById('exchange-from').value;
    const to = document.getElementById('exchange-to').value;
    
    if (!amount || amount <= 0) {
        showNotification('Введите корректную сумму', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/exchange', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: userData.id,
                fromCurrency: from,
                toCurrency: to,
                amount: amount
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            showNotification(`Обмен выполнен! Получено: ${result.amount} ${to}`, 'success');
            updateBalances();
        } else {
            showNotification('Ошибка при обмене', 'error');
        }
    } catch (error) {
        console.error('Error performing exchange:', error);
        showNotification('Ошибка сети', 'error');
    }
}

// Уведомления
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.style.background = type === 'error' ? '#ff4757' : 
                                   type === 'success' ? '#2ed573' : 
                                   '#3742fa';
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Обновление UI
function updateUI() {
    document.getElementById('balance-usdt').textContent = `${userData.usdtBalance} USDT`;
    document.getElementById('balance-ton').textContent = `${userData.tonBalance} TON`;
    document.getElementById('wallet-usdt').textContent = `${userData.usdtBalance} USDT`;
    document.getElementById('wallet-ton').textContent = `${userData.tonBalance} TON`;
}

async function updateBalances() {
    if (userData.id) {
        await loadUserData(userData.id);
    }
}

function updateWalletDisplay() {
    document.getElementById('wallet-usdt').textContent = `${userData.usdtBalance} USDT`;
    document.getElementById('wallet-ton').textContent = `${userData.tonBalance} TON`;
}
