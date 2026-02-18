// Инициализация данных
let data = {
    balance: 0,
    transactions: [],
    bills: []
};

// Загрузка данных из localStorage
function loadData() {
    const saved = localStorage.getItem('budgetData');
    if (saved) {
        data = JSON.parse(saved);
    }
    updateUI();
}

// Сохранение данных в localStorage
function saveData() {
    localStorage.setItem('budgetData', JSON.stringify(data));
    showSyncStatus();
}

// Показать статус синхронизации
function showSyncStatus() {
    const status = document.getElementById('syncStatus');
    if (status) {
        status.textContent = '✓ Сохранено';
        setTimeout(() => {
            status.textContent = '✓ Синхронизировано';
        }, 1000);
    }
}

// Выход из системы
async function logout() {
    if (confirm('Вы уверены, что хотите выйти?')) {
        try {
            await fetch('/api/logout', { method: 'POST' });
            window.location.href = '/login';
        } catch (error) {
            console.error('Logout error:', error);
            window.location.href = '/login';
        }
    }
}

// Навигация
function navigateTo(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    
    document.getElementById(page + 'Page').classList.add('active');
    event.currentTarget.classList.add('active');
    
    updateUI();
}

// Переключение вкладок
function switchTab(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(tab + 'Tab').classList.add('active');
}

// Форма дохода
document.getElementById('incomeForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const amount = parseFloat(document.getElementById('incomeAmount').value);
    const description = document.getElementById('incomeDescription').value || 'Доход';
    const date = document.getElementById('incomeDate').value;
    
    data.transactions.push({
        id: Date.now(),
        type: 'income',
        amount: amount,
        description: description,
        date: date,
        category: 'Доход'
    });
    
    data.balance += amount;
    saveData();
    updateUI();
    
    this.reset();
    document.getElementById('incomeDate').valueAsDate = new Date();
    alert('Доход добавлен!');
});

// Форма расхода
document.getElementById('expenseForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const amount = parseFloat(document.getElementById('expenseAmount').value);
    const category = document.getElementById('expenseCategory').value;
    const description = document.getElementById('expenseDescription').value || category;
    const date = document.getElementById('expenseDate').value;
    
    data.transactions.push({
        id: Date.now(),
        type: 'expense',
        amount: amount,
        description: description,
        date: date,
        category: category
    });
    
    data.balance -= amount;
    saveData();
    updateUI();
    
    this.reset();
    document.getElementById('expenseDate').valueAsDate = new Date();
    alert('Расход добавлен!');
});

// Форма счёта
document.getElementById('billForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('billName').value;
    const amount = parseFloat(document.getElementById('billAmount').value);
    const due = document.getElementById('billDue').value;
    const category = document.getElementById('billCategory').value;
    const recurring = document.getElementById('billRecurring').checked;
    
    data.bills.push({
        id: Date.now(),
        name: name,
        amount: amount,
        due: due,
        category: category,
        recurring: recurring,
        paid: false
    });
    
    saveData();
    updateUI();
    
    this.reset();
    alert('Счёт добавлен!');
});

// Оплатить счёт
function payBill(billId) {
    const bill = data.bills.find(b => b.id === billId);
    if (!bill) return;
    
    data.transactions.push({
        id: Date.now(),
        type: 'expense',
        amount: bill.amount,
        description: bill.name,
        date: new Date().toISOString().split('T')[0],
        category: bill.category
    });
    
    data.balance -= bill.amount;
    
    if (bill.recurring) {
        // Переносим дату на следующий месяц
        const nextDue = new Date(bill.due);
        nextDue.setMonth(nextDue.getMonth() + 1);
        bill.due = nextDue.toISOString().split('T')[0];
        bill.paid = false;
    } else {
        // Удаляем разовый счёт
        data.bills = data.bills.filter(b => b.id !== billId);
    }
    
    saveData();
    updateUI();
    alert('Счёт оплачен!');
}

// Удалить счёт
function deleteBill(billId) {
    if (confirm('Удалить этот счёт?')) {
        data.bills = data.bills.filter(b => b.id !== billId);
        saveData();
        updateUI();
    }
}

// Обновление UI
function updateUI() {
    updateBalance();
    updateUpcomingBills();
    updateRecentTransactions();
    updateAllTransactions();
    updateCategoryStats();
}

function updateBalance() {
    document.getElementById('currentBalance').textContent = '$' + data.balance.toFixed(2);
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    let monthIncome = 0;
    let monthExpense = 0;
    
    data.transactions.forEach(t => {
        const tDate = new Date(t.date);
        if (tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear) {
            if (t.type === 'income') {
                monthIncome += t.amount;
            } else {
                monthExpense += t.amount;
            }
        }
    });
    
    document.getElementById('monthIncome').textContent = '$' + monthIncome.toFixed(2);
    document.getElementById('monthExpense').textContent = '$' + monthExpense.toFixed(2);
}

function updateUpcomingBills() {
    const container = document.getElementById('upcomingBills');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const upcomingBills = data.bills
        .filter(b => !b.paid)
        .sort((a, b) => new Date(a.due) - new Date(b.due));
    
    if (upcomingBills.length === 0) {
        container.innerHTML = '<div class="empty-state">Нет предстоящих счетов</div>';
        return;
    }
    
    container.innerHTML = upcomingBills.map(bill => {
        const dueDate = new Date(bill.due);
        const isOverdue = dueDate < today;
        const daysUntil = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
        
        let dueText = '';
        if (isOverdue) {
            dueText = `<span class="bill-overdue">Просрочен!</span>`;
        } else if (daysUntil === 0) {
            dueText = 'Сегодня';
        } else if (daysUntil === 1) {
            dueText = 'Завтра';
        } else {
            dueText = `Через ${daysUntil} дн.`;
        }
        
        return `
            <div class="bill-item">
                <div class="bill-header">
                    <span class="bill-name">${bill.name}</span>
                    <span class="bill-amount">$${bill.amount.toFixed(2)}</span>
                </div>
                <div class="bill-due">${dueText} • ${bill.category}</div>
                <button class="btn-pay" onclick="payBill(${bill.id})">Оплатить</button>
                <button class="btn-delete" onclick="deleteBill(${bill.id})">Удалить</button>
            </div>
        `;
    }).join('');
}

function updateRecentTransactions() {
    const container = document.getElementById('recentTransactions');
    const recent = [...data.transactions]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
    
    if (recent.length === 0) {
        container.innerHTML = '<div class="empty-state">Нет транзакций</div>';
        return;
    }
    
    container.innerHTML = recent.map(t => `
        <div class="transaction-item">
            <div class="transaction-info">
                <div class="transaction-title">${t.description}</div>
                <div class="transaction-meta">${t.category} • ${formatDate(t.date)}</div>
            </div>
            <div class="transaction-amount ${t.type}">
                ${t.type === 'income' ? '+' : '-'}$${t.amount.toFixed(2)}
            </div>
        </div>
    `).join('');
}

function updateAllTransactions() {
    const container = document.getElementById('allTransactions');
    const all = [...data.transactions]
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (all.length === 0) {
        container.innerHTML = '<div class="empty-state">Нет транзакций</div>';
        return;
    }
    
    container.innerHTML = all.map(t => `
        <div class="transaction-item">
            <div class="transaction-info">
                <div class="transaction-title">${t.description}</div>
                <div class="transaction-meta">${t.category} • ${formatDate(t.date)}</div>
            </div>
            <div class="transaction-amount ${t.type}">
                ${t.type === 'income' ? '+' : '-'}$${t.amount.toFixed(2)}
            </div>
        </div>
    `).join('');
}

function updateCategoryStats() {
    const container = document.getElementById('categoryStats');
    
    const categoryTotals = {};
    let totalExpense = 0;
    
    data.transactions.forEach(t => {
        if (t.type === 'expense') {
            categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
            totalExpense += t.amount;
        }
    });
    
    if (totalExpense === 0) {
        container.innerHTML = '<div class="empty-state">Нет расходов для анализа</div>';
        return;
    }
    
    const sorted = Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1]);
    
    container.innerHTML = sorted.map(([category, amount]) => {
        const percentage = (amount / totalExpense * 100).toFixed(1);
        return `
            <div class="category-item">
                <div>
                    <strong>${category}</strong>
                    <div style="font-size: 12px; color: #666;">${percentage}%</div>
                </div>
                <div style="text-align: right;">
                    <strong>$${amount.toFixed(2)}</strong>
                </div>
            </div>
            <div class="category-bar">
                <div class="category-fill" style="width: ${percentage}%"></div>
            </div>
        `;
    }).join('');
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    const options = { day: 'numeric', month: 'short' };
    return date.toLocaleDateString('ru-RU', options);
}

// Установка текущей даты по умолчанию
document.getElementById('incomeDate').valueAsDate = new Date();
document.getElementById('expenseDate').valueAsDate = new Date();

// Загрузка данных при старте
loadData();
