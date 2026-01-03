const API_BASE_URL = 'https://your-api-server.com'; // Замените на ваш API

// Общие настройки API
const apiConfig = {
    botToken: '7762911922:AAHdyGVZRwCkI_WtcGW1MPbIdhrcDBpKNvE',
    adminId: '896706118',
    cryptoBotApiKey: '504330:AAdzUOhbrK97NOorYohsGBVBCgjbpYPedAZ'
};

// Функции для работы с магазином
async function buyProduct(productId) {
    try {
        const userId = userData.id || localStorage.getItem('userId');
        
        const response = await fetch(`${API_BASE_URL}/api/buy`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: userId,
                productId: productId
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            
            if (result.invoiceUrl) {
                // Открываем платежную ссылку в новом окне
                window.open(result.invoiceUrl, '_blank');
                showNotification('Перейдите по ссылке для оплаты', 'info');
            } else if (result.success) {
                showNotification('Покупка успешно завершена!', 'success');
                updateBalances();
            }
        } else {
            showNotification('Ошибка при покупке', 'error');
        }
    } catch (error) {
        console.error('Error buying product:', error);
        showNotification('Ошибка сети', 'error');
    }
}

// Пополнение криптовалютой
async function depositCrypto(currency) {
    try {
        const userId = userData.id || localStorage.getItem('userId');
        
        const response = await fetch(`${API_BASE_URL}/api/deposit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: userId,
                currency: currency,
                amount: 0 // Пользователь введет сумму в Crypto Bot
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            
            if (result.invoiceUrl) {
                // Если используем Crypto Bot
                window.open(result.invoiceUrl, '_blank');
                showNotification('Перейдите по ссылке для пополнения', 'info');
            } else if (result.address) {
                // Если даем адрес для перевода
                showNotification(`Отправьте ${currency} на адрес: ${result.address}`, 'info');
                navigator.clipboard.writeText(result.address);
                showNotification('Адрес скопирован в буфер обмена');
            }
        }
    } catch (error) {
        console.error('Error depositing crypto:', error);
        showNotification('Ошибка сети', 'error');
    }
}

// Вывод криптовалюты
async function withdrawCrypto() {
    const amount = prompt('Введите сумму для вывода:');
    const address = prompt('Введите адрес кошелька для вывода:');
    
    if (!amount || !address) {
        showNotification('Заполните все поля', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/withdraw`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: userData.id,
                amount: parseFloat(amount),
                address: address
            })
        });
        
        if (response.ok) {
            showNotification('Запрос на вывод отправлен', 'success');
        } else {
            showNotification('Ошибка при выводе', 'error');
        }
    } catch (error) {
        console.error('Error withdrawing crypto:', error);
        showNotification('Ошибка сети', 'error');
    }
}

// Получение актуальных курсов
async function getCurrentRates() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/rates`);
        if (response.ok) {
            return await response.json();
        }
    } catch (error) {
        console.error('Error getting rates:', error);
    }
    return { USDT_TON: 2.5, TON_USDT: 0.4 }; // Запасные значения
}

// Обновление курса на странице
async function updateExchangeRateDisplay() {
    const rates = await getCurrentRates();
    const rateElement = document.getElementById('exchange-rate');
    
    if (rates.USDT_TON) {
        rateElement.textContent = `1 USDT = ${rates.USDT_TON.toFixed(4)} TON`;
    }
}
