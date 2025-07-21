// Загрузчик модулей (для совместимости без ES6 модулей)
// В реальном проекте лучше использовать ES6 модули или сборщик типа Webpack

// Загружаем все модули в глобальную область видимости
document.addEventListener('DOMContentLoaded', () => {
    // Проверяем, что все модули загружены
    const requiredClasses = [
        'SlideManager',
        'ElementManager', 
        'AnimationManager',
        'RenderManager',
        'ProjectManager'
    ];
    
    const missingClasses = requiredClasses.filter(className => !window[className]);
    
    if (missingClasses.length > 0) {
        console.warn('Отсутствуют модули:', missingClasses);
        console.warn('Убедитесь, что все файлы модулей подключены в HTML');
    } else {
        console.log('Все модули успешно загружены');
    }
});

// Утилита для динамической загрузки скриптов
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Функция для загрузки всех модулей
async function loadAllModules() {
    const modules = [
        'js/modules/SlideManager.js',
        'js/modules/ElementManager.js',
        'js/modules/AnimationManager.js',
        'js/modules/RenderManager.js',
        'js/modules/ProjectManager.js'
    ];
    
    try {
        await Promise.all(modules.map(loadScript));
        console.log('Все модули загружены');
        return true;
    } catch (error) {
        console.error('Ошибка загрузки модулей:', error);
        return false;
    }
}

// Экспортируем для использования
window.ModuleLoader = {
    loadScript,
    loadAllModules
};