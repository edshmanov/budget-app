const translations = {
    ru: {
        balance: 'Текущий баланс', synced: 'Синхронизировано', saved: 'Сохранено',
        monthIncome: 'Доход (месяц)', monthExpense: 'Расход (месяц)',
        upcomingBills: 'Предстоящие счета', recentTrans: 'Последние транзакции',
        income: 'Доход', expense: 'Расход', bill: 'Счёт',
        amount: 'Сумма ($)', description: 'Описание', date: 'Дата', category: 'Категория',
        addIncome: 'Добавить доход', addExpense: 'Добавить расход', addBill: 'Добавить счёт',
        billName: 'Название счёта', dueDate: 'Срок оплаты', recurring: 'Регулярный платёж',
        allTrans: 'Все транзакции', categoryStats: 'Расходы по категориям',
        home: 'Главная', add: 'Добавить', history: 'История', stats: 'Статистика',
        pay: 'Оплатить', delete: 'Удалить',
        utilities: 'Коммуналка', education: 'Школа', subscriptions: 'Подписки',
        creditCards: 'Кредитки', groceries: 'Продукты', transport: 'Транспорт',
        entertainment: 'Развлечения', health: 'Здоровье', other: 'Другое',
        noBills: 'Нет предстоящих счетов', noTrans: 'Нет транзакций',
        noStats: 'Нет расходов для анализа',
        overdue: 'Просрочен!', today: 'Сегодня', tomorrow: 'Завтра',
        canSave: 'Можно отложить', currentBal: 'Текущий баланс',
        unpaidBills: 'Неоплаченные счета', freeAmount: 'Свободно',
        incomeAdded: 'Доход добавлен!', expenseAdded: 'Расход добавлен!',
        billAdded: 'Счёт добавлен!', billPaid: 'Счёт оплачен!',
        confirmDelete: 'Удалить этот счёт?', confirmLogout: 'Вы уверены, что хотите выйти?'
    },
    en: {
        balance: 'Current Balance', synced: 'Synced', saved: 'Saved',
        monthIncome: 'Income (month)', monthExpense: 'Expense (month)',
        upcomingBills: 'Upcoming Bills', recentTrans: 'Recent Transactions',
        income: 'Income', expense: 'Expense', bill: 'Bill',
        amount: 'Amount ($)', description: 'Description', date: 'Date', category: 'Category',
        addIncome: 'Add Income', addExpense: 'Add Expense', addBill: 'Add Bill',
        billName: 'Bill Name', dueDate: 'Due Date', recurring: 'Recurring payment',
        allTrans: 'All Transactions', categoryStats: 'Expenses by Category',
        home: 'Home', add: 'Add', history: 'History', stats: 'Stats',
        pay: 'Pay', delete: 'Delete',
        utilities: 'Utilities', education: 'Education', subscriptions: 'Subscriptions',
        creditCards: 'Credit Cards', groceries: 'Groceries', transport: 'Transport',
        entertainment: 'Entertainment', health: 'Health', other: 'Other',
        noBills: 'No upcoming bills', noTrans: 'No transactions',
        noStats: 'No expenses to analyze',
        overdue: 'Overdue!', today: 'Today', tomorrow: 'Tomorrow',
        canSave: 'Can Save', currentBal: 'Current Balance',
        unpaidBills: 'Unpaid Bills', freeAmount: 'Available',
        incomeAdded: 'Income added!', expenseAdded: 'Expense added!',
        billAdded: 'Bill added!', billPaid: 'Bill paid!',
        confirmDelete: 'Delete this bill?', confirmLogout: 'Are you sure you want to log out?'
    },
    uk: {
        balance: 'Поточний баланс', synced: 'Синхронізовано', saved: 'Збережено',
        monthIncome: 'Дохід (місяць)', monthExpense: 'Витрати (місяць)',
        upcomingBills: 'Майбутні рахунки', recentTrans: 'Останні транзакції',
        income: 'Дохід', expense: 'Витрата', bill: 'Рахунок',
        amount: 'Сума ($)', description: 'Опис', date: 'Дата', category: 'Категорія',
        addIncome: 'Додати дохід', addExpense: 'Додати витрату', addBill: 'Додати рахунок',
        billName: 'Назва рахунку', dueDate: 'Термін оплати', recurring: 'Регулярний платіж',
        allTrans: 'Всі транзакції', categoryStats: 'Витрати за категоріями',
        home: 'Головна', add: 'Додати', history: 'Історія', stats: 'Статистика',
        pay: 'Оплатити', delete: 'Видалити',
        utilities: 'Комунальні', education: 'Школа', subscriptions: 'Підписки',
        creditCards: 'Кредитки', groceries: 'Продукти', transport: 'Транспорт',
        entertainment: 'Розваги', health: 'Здоров\'я', other: 'Інше',
        noBills: 'Немає майбутніх рахунків', noTrans: 'Немає транзакцій',
        noStats: 'Немає витрат для аналізу',
        overdue: 'Прострочено!', today: 'Сьогодні', tomorrow: 'Завтра',
        canSave: 'Можна відкласти', currentBal: 'Поточний баланс',
        unpaidBills: 'Неоплачені рахунки', freeAmount: 'Вільно',
        incomeAdded: 'Дохід додано!', expenseAdded: 'Витрату додано!',
        billAdded: 'Рахунок додано!', billPaid: 'Рахунок оплачено!',
        confirmDelete: 'Видалити цей рахунок?', confirmLogout: 'Ви впевнені, що хочете вийти?'
    }
};

let currentLang = localStorage.getItem('budgetAppLang') || 'ru';
let currentTheme = localStorage.getItem('budgetAppTheme') || 'light';

if (currentTheme === 'dark') {
    document.body.classList.add('dark-theme');
    const btn = document.getElementById('themeBtn');
    if (btn) btn.textContent = '☀️';
}

function updateAppLanguage() {
    const t = translations[currentLang];
    const els = {
        balanceLabel: t.balance, syncStatus: t.synced,
        incomeLabel: t.monthIncome, expenseLabel: t.monthExpense,
        billsTitle: t.upcomingBills, transTitle: t.recentTrans,
        tabIncome: t.income, tabExpense: t.expense, tabBill: t.bill,
        amountLabel1: t.amount, amountLabel2: t.amount, amountLabel3: t.amount,
        descLabel1: t.description, descLabel2: t.description,
        dateLabel1: t.date, dateLabel2: t.date,
        categoryLabel: t.category, categoryLabel2: t.category,
        addIncomeBtn: t.addIncome, addExpenseBtn: t.addExpense, addBillBtn: t.addBill,
        billNameLabel: t.billName, dueLabel: t.dueDate, recurringLabel: t.recurring,
        allTransTitle: t.allTrans, statsTitle: t.categoryStats,
        navHome: t.home, navAdd: t.add, navHistory: t.history, navStats: t.stats,
        calcTitle: t.canSave, calcBalance: t.currentBal,
        calcBills: t.unpaidBills, calcFree: t.freeAmount
    };
    Object.keys(els).forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = els[id];
    });
    
    const cats = [
        ['utilities', t.utilities], ['education', t.education],
        ['subscriptions', t.subscriptions], ['creditCards', t.creditCards],
        ['groceries', t.groceries], ['transport', t.transport],
        ['entertainment', t.entertainment], ['health', t.health],
        ['other', t.other]
    ];
    ['expenseCategory', 'billCategory'].forEach(id => {
        const sel = document.getElementById(id);
        if (sel) {
            const val = sel.value;
            sel.innerHTML = cats.map(([v, n]) => `<option value="${v}">${n}</option>`).join('');
            sel.value = val || 'utilities';
        }
    });
    
    document.querySelectorAll('.lang-btn-app').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === currentLang);
    });
}

function t(key) {
    return translations[currentLang][key] || key;
}

function getCategoryName(key) {
    return translations[currentLang][key] || key;
}

setTimeout(() => {
    updateAppLanguage();
    
    document.querySelectorAll('.lang-btn-app').forEach(btn => {
        btn.addEventListener('click', () => {
            currentLang = btn.dataset.lang;
            localStorage.setItem('budgetAppLang', currentLang);
            updateAppLanguage();
            if (window.updateUI) updateUI();
        });
    });
    
    const themeBtn = document.getElementById('themeBtn');
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
            currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
            localStorage.setItem('budgetAppTheme', currentTheme);
            themeBtn.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
        });
    }
}, 100);
