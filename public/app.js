let data = {
    balance: 0,
    transactions: [],
    bills: []
};

let notificationsEnabled = false;

function loadData() {
    try {
        const saved = localStorage.getItem('budgetData');
        if (saved) {
            data = JSON.parse(saved);
            console.log('✅ Данные загружены:', data);
        }
    } catch (e) {
        console.error('Ошибка загрузки данных:', e);
    }
    updateUI();
    requestNotificationPermission();
    checkBillNotifications();
}

function saveData() {
    try {
        localStorage.setItem('budgetData', JSON.stringify(data));
        console.log('💾 Данные сохранены:', data);
        showSyncStatus();
    } catch (e) {
        console.error('Ошибка сохранения данных:', e);
        alert('Ошибка сохранения! Проверьте место в хранилище.');
    }
}

function showSyncStatus() {
    const status = document.getElementById('syncStatus');
    if (status) {
        status.textContent = t('saved');
        setTimeout(() => {
            status.textContent = t('synced');
        }, 1000);
    }
}

async function requestNotificationPermission() {
    if (!('Notification' in window)) {
        console.log('Браузер не поддерживает уведомления');
        return;
    }
    
    if (Notification.permission === 'granted') {
        notificationsEnabled = true;
        return;
    }
    
    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        notificationsEnabled = permission === 'granted';
    }
}

function checkBillNotifications() {
    if (!notificationsEnabled) return;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    data.bills.forEach(bill => {
        if (bill.paid) return;
        
        const dueDate = new Date(bill.due);
        dueDate.setHours(0, 0, 0, 0);
        
        if (dueDate.getTime() === tomorrow.getTime()) {
            showNotification(
                '⏰ Напоминание о счёте',
                `Завтра нужно оплатить: ${bill.name} ($${bill.amount.toFixed(2)})`
            );
        }
        
        if (dueDate < today) {
            showNotification(
                '🚨 Просроченный счёт!',
                `${bill.name} ($${bill.amount.toFixed(2)}) - срок оплаты истёк`
            );
        }
    });
}

function showNotification(title, body) {
    if (!notificationsEnabled) return;
    
    new Notification(title, {
        body: body,
        icon: '💰',
        badge: '💰',
        tag: 'budget-bill',
        requireInteraction: false
    });
}

async function logout() {
    if (confirm(t('confirmLogout') || 'Выйти?')) {
        try {
            await fetch('/api/logout', { method: 'POST' });
            window.location.href = '/login';
        } catch (error) {
            console.error('Logout error:', error);
            window.location.href = '/login';
        }
    }
}

function navigateTo(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById(page + 'Page').classList.add('active');
    event.currentTarget.classList.add('active');
    updateUI();
}

function switchTab(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById(tab + 'Tab').classList.add('active');
}

document.getElementById('incomeForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const amount = parseFloat(document.getElementById('incomeAmount').value);
    const description = document.getElementById('incomeDescription').value || t('income');
    const date = document.getElementById('incomeDate').value;
    
    data.transactions.push({
        id: Date.now(),
        type: 'income',
        amount: amount,
        description: description,
        date: date,
        category: 'income'
    });
    
    data.balance += amount;
    saveData();
    updateUI();
    this.reset();
    document.getElementById('incomeDate').valueAsDate = new Date();
    alert(t('incomeAdded') || 'Доход добавлен!');
});

document.getElementById('expenseForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const amount = parseFloat(document.getElementById('expenseAmount').value);
    const category = document.getElementById('expenseCategory').value;
    const description = document.getElementById('expenseDescription').value || getCategoryName(category);
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
    alert(t('expenseAdded') || 'Расход добавлен!');
});

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
    checkBillNotifications();
    this.reset();
    alert(t('billAdded') || 'Счёт добавлен!');
});

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
        const nextDue = new Date(bill.due);
        nextDue.setMonth(nextDue.getMonth() + 1);
        bill.due = nextDue.toISOString().split('T')[0];
        bill.paid = false;
    } else {
        data.bills = data.bills.filter(b => b.id !== billId);
    }
    
    saveData();
    updateUI();
    alert(t('billPaid') || 'Счёт оплачен!');
}

function deleteBill(billId) {
    if (confirm(t('confirmDelete') || 'Удалить счёт?')) {
        data.bills = data.bills.filter(b => b.id !== billId);
        saveData();
        updateUI();
    }
}

function updateUI() {
    updateBalance();
    updateSavingsCalculator();
    updateSubscriptions();
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
            if (t.type === 'income') monthIncome += t.amount;
            else monthExpense += t.amount;
        }
    });
    
    document.getElementById('monthIncome').textContent = '$' + monthIncome.toFixed(2);
    document.getElementById('monthExpense').textContent = '$' + monthExpense.toFixed(2);
}

function updateSavingsCalculator() {
    const unpaidBills = data.bills.filter(b => !b.paid);
    const totalBills = unpaidBills.reduce((sum, bill) => sum + bill.amount, 0);
    const savingsAmount = data.balance - totalBills;
    
    document.getElementById('savingsAmount').textContent = '$' + savingsAmount.toFixed(2);
    document.getElementById('calcBalanceAmount').textContent = '$' + data.balance.toFixed(2);
    document.getElementById('calcBillsAmount').textContent = '-$' + totalBills.toFixed(2);
    document.getElementById('calcFreeAmount').textContent = '$' + savingsAmount.toFixed(2);
    
    const calcAmount = document.getElementById('savingsAmount');
    const calcFree = document.getElementById('calcFreeAmount');
    if (savingsAmount < 0) {
        calcAmount.style.color = '#fbb6ce';
        calcFree.style.color = '#fbb6ce';
    } else {
        calcAmount.style.color = 'white';
        calcFree.style.color = 'white';
    }
}

// ПОДПИСКИ
function updateSubscriptions() {
    const container = document.getElementById('subscriptionsList');
    const subscriptions = data.bills.filter(b => b.category === 'subscriptions' && b.recurring);
    
    const totalMonth = subscriptions.reduce((sum, sub) => sum + sub.amount, 0);
    document.getElementById('subsTotal').textContent = '$' + totalMonth.toFixed(2);
    
    if (subscriptions.length === 0) {
        container.innerHTML = `<div class="subscription-empty">${t('noSubscriptions') || 'Нет активных подписок'}</div>`;
        return;
    }
    
    container.innerHTML = subscriptions.map(sub => {
        const nextDate = new Date(sub.due);
        const dateStr = formatDate(sub.due);
        
        return `
            <div class="subscription-item">
                <div class="subscription-info">
                    <div class="subscription-name">${sub.name}</div>
                    <div class="subscription-next">${t('nextPayment') || 'Следующий платёж'}: ${dateStr}</div>
                </div>
                <div class="subscription-price">$${sub.amount.toFixed(2)}</div>
            </div>
        `;
    }).join('');
}

function updateUpcomingBills() {
    const container = document.getElementById('upcomingBills');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcomingBills = data.bills.filter(b => !b.paid).sort((a, b) => new Date(a.due) - new Date(b.due));
    
    if (upcomingBills.length === 0) {
        container.innerHTML = '<div class="empty-state">' + t('noBills') + '</div>';
        return;
    }
    
    container.innerHTML = upcomingBills.map(bill => {
        const dueDate = new Date(bill.due);
        const isOverdue = dueDate < today;
        const daysUntil = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
        let dueText = '';
        if (isOverdue) dueText = `<span class="bill-overdue">${t('overdue')}</span>`;
        else if (daysUntil === 0) dueText = t('today');
        else if (daysUntil === 1) dueText = t('tomorrow');
        else dueText = `${daysUntil} ${t('daysLeft') || 'дн.'}`;
        
        return `
            <div class="bill-item">
                <div class="bill-header">
                    <span class="bill-name">${bill.name}</span>
                    <span class="bill-amount">$${bill.amount.toFixed(2)}</span>
                </div>
                <div class="bill-due">${dueText} • ${getCategoryName(bill.category)}</div>
                <button class="btn-pay" onclick="payBill(${bill.id})">${t('pay')}</button>
                <button class="btn-delete" onclick="deleteBill(${bill.id})">${t('delete')}</button>
            </div>
        `;
    }).join('');
}

function updateRecentTransactions() {
    const container = document.getElementById('recentTransactions');
    const recent = [...data.transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
    if (recent.length === 0) {
        container.innerHTML = '<div class="empty-state">' + t('noTrans') + '</div>';
        return;
    }
    container.innerHTML = recent.map(t => `
        <div class="transaction-item">
            <div class="transaction-info">
                <div class="transaction-title">${t.description}</div>
                <div class="transaction-meta">${getCategoryName(t.category)} • ${formatDate(t.date)}</div>
            </div>
            <div class="transaction-amount ${t.type}">
                ${t.type === 'income' ? '+' : '-'}$${t.amount.toFixed(2)}
            </div>
        </div>
    `).join('');
}

function updateAllTransactions() {
    const container = document.getElementById('allTransactions');
    const all = [...data.transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
    if (all.length === 0) {
        container.innerHTML = '<div class="empty-state">' + t('noTrans') + '</div>';
        return;
    }
    container.innerHTML = all.map(t => `
        <div class="transaction-item">
            <div class="transaction-info">
                <div class="transaction-title">${t.description}</div>
                <div class="transaction-meta">${getCategoryName(t.category)} • ${formatDate(t.date)}</div>
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
        container.innerHTML = '<div class="empty-state">' + t('noStats') + '</div>';
        return;
    }
    
    const sorted = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
    container.innerHTML = sorted.map(([category, amount]) => {
        const percentage = (amount / totalExpense * 100).toFixed(1);
        return `
            <div class="category-item">
                <div>
                    <strong>${getCategoryName(category)}</strong>
                    <div style="font-size: 12px; color: var(--text-light);">${percentage}%</div>
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
    return date.toLocaleDateString(currentLang === 'ru' ? 'ru-RU' : currentLang === 'uk' ? 'uk-UA' : 'en-US', options);
}

document.getElementById('incomeDate').valueAsDate = new Date();
document.getElementById('expenseDate').valueAsDate = new Date();

setInterval(() => {
    if (data.transactions.length > 0 || data.bills.length > 0) {
        saveData();
    }
}, 30000);

setInterval(checkBillNotifications, 6 * 60 * 60 * 1000);

loadData();
