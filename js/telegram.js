// Инициализация Telegram Web App
const tg = window.Telegram.WebApp;

// Основные функции Telegram Web App
function initTelegramApp() {
    console.log('Telegram Web App initialized');
    
    // Расширяем приложение на весь экран
    tg.expand();
    
    // Настройка основной кнопки
    tg.MainButton.setText("Открыть магазин");
    tg.MainButton.onClick(() => {
        openShop();
    });
    
    // Обработка событий Telegram
    tg.onEvent('viewportChanged', (event) => {
        console.log('Viewport changed:', event);
    });
    
    // Получение данных пользователя
    if (tg.initDataUnsafe?.user) {
        const user = tg.initDataUnsafe.user;
        console.log('Telegram user:', user);
        
        // Сохраняем ID пользователя
        userData.id = user.id;
        localStorage.setItem('userId', user.id);
        
        // Обновляем приветствие
        if (document.getElementById('welcome-name')) {
            document.getElementById('welcome-name').textContent = 
                user.first_name || 'Пользователь';
        }
    }
    
    // Показываем кнопку "Назад" при необходимости
    function setupBackButton() {
        if (window.location.hash && window.location.hash !== '#main') {
            tg.BackButton.show();
            tg.BackButton.onClick(() => {
                window.history.back();
            });
        } else {
            tg.BackButton.hide();
        }
    }
    
    // Отслеживаем изменения URL для кнопки "Назад"
    window.addEventListener('hashchange', setupBackButton);
    setupBackButton();
}

// Отправка данных в Telegram
function sendDataToTelegram(data) {
    tg.sendData(JSON.stringify(data));
}

// Закрытие приложения
function closeApp() {
    tg.close();
}

// Показ алерта через Telegram
function showTelegramAlert(message) {
    tg.showAlert(message);
}

// Запрос контакта
function requestContact() {
    tg.requestContact((result) => {
        if (result) {
            console.log('Contact received:', result);
            // Отправляем контакт на сервер
            sendDataToTelegram({ contact: result });
        }
    });
}

// Запрос местоположения
function requestLocation() {
    tg.requestLocation((result) => {
        if (result) {
            console.log('Location received:', result);
            // Отправляем местоположение на сервер
            sendDataToTelegram({ location: result });
        }
    });
}

// Проверка доступности функций
function checkTelegramFeatures() {
    return {
        canRequestContact: tg.isVersionAtLeast('6.1'),
        canRequestLocation: tg.isVersionAtLeast('6.2'),
        canUseQRScanner: tg.isVersionAtLeast('6.4'),
        canUseInvoice: tg.isVersionAtLeast('6.9')
    };
}

// Инициализация при загрузке
if (window.Telegram && window.Telegram.WebApp) {
    document.addEventListener('DOMContentLoaded', initTelegramApp);
}

// Экспорт функций для использования в других файлах
window.TelegramAPI = {
    sendData: sendDataToTelegram,
    closeApp,
    showAlert: showTelegramAlert,
    requestContact,
    requestLocation,
    checkFeatures: checkTelegramFeatures
};
