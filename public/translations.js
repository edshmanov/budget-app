// Translations
const translations = {
    ru: {
        currentBalance: 'Текущий баланс',
        synced: 'Синхронизировано',
        monthIncome: 'Доход (месяц)',
        monthExpense: 'Расход (месяц)',
        upcomingBills: 'Предстоящие счета',
        navHome: 'Главная',
        navAdd: 'Добавить',
        navHistory: 'История',
        navStats: 'Статистика'
    },
    en: {
        currentBalance: 'Current Balance',
        synced: 'Synced',
        monthIncome: 'Income (month)',
        monthExpense: 'Expense (month)',
        upcomingBills: 'Upcoming Bills',
        navHome: 'Home',
        navAdd: 'Add',
        navHistory: 'History',
        navStats: 'Stats'
    },
    uk: {
        currentBalance: 'Поточний баланс',
        synced: 'Синхронізовано',
        monthIncome: 'Дохід (місяць)',
        monthExpense: 'Витрати (місяць)',
        upcomingBills: 'Майбутні рахунки',
        navHome: 'Головна',
        navAdd: 'Додати',
        navHistory: 'Історія',
        navStats: 'Статистика'
    }
};

let currentLang = localStorage.getItem('budgetAppLang') || 'ru';
let currentTheme = localStorage.getItem('budgetAppTheme') || 'light';

// Apply theme on load
if (currentTheme === 'dark') {
    document.body.classList.add('dark-theme');
}

// Theme toggle
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
        localStorage.setItem('budgetAppTheme', currentTheme);
    });
}

// Language selector
const langSelector = document.getElementById('langSelector');
if (langSelector) {
    langSelector.value = currentLang;
    langSelector.addEventListener('change', (e) => {
        currentLang = e.target.value;
        localStorage.setItem('budgetAppLang', currentLang);
        updateLanguage();
    });
}

function updateLanguage() {
    const t = translations[currentLang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) el.textContent = t[key];
    });
}

function t(key) {
    return translations[currentLang][key] || key;
}

setTimeout(updateLanguage, 100);
