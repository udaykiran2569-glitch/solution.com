const STORAGE_KEY = 'financeTrackerData';
const THEME_KEY = 'financeTrackerTheme';
const PAGE_KEY = 'financeTrackerPage';
const SETTINGS_KEY = 'financeTrackerSettings';

const defaultData = {
  transactions: [
    { date: getToday(-4), type: 'income', category: 'Salary', description: 'August salary', amount: 85000, account: 'Savings' },
    { date: getToday(-3), type: 'expense', category: 'Rent', description: 'Office rent', amount: 18000, account: 'Bank' },
    { date: getToday(-2), type: 'investment', category: 'FD', description: 'Fixed deposit', amount: 25000, account: 'FD Reserve' },
    { date: getToday(-1), type: 'investment', category: 'RD', description: 'Recurring deposit', amount: 12000, account: 'RD Reserve' },
    { date: getToday(), type: 'dividend', category: 'Equity Dividend', description: 'Quarterly payout', amount: 5600, account: 'Portfolio' },
    { date: getToday(), type: 'debt', category: 'Debtor', description: 'Outstanding receivable', amount: 12000, account: 'Receivables' }
  ],
  accounts: [
    { title: 'Savings Account', amount: 43000, type: 'Bank' },
    { title: 'Investment Portfolio', amount: 68000, type: 'Investments' },
    { title: 'FD Reserve', amount: 25000, type: 'FD' },
    { title: 'RD Reserve', amount: 12000, type: 'RD' }
  ],
  dividends: [
    { date: getToday(), source: 'Equity Dividend', amount: 5600, note: 'Quarterly payout' }
  ]
};

const transactionBody = document.getElementById('transactionBody');
const totalBalanceLabel = document.getElementById('totalBalance');
const todayPLLabel = document.getElementById('todayPL');
const totalInvestmentLabel = document.getElementById('totalInvestment');
const creditDebtLabel = document.getElementById('creditDebt');
const accountList = document.getElementById('accountList');
const dividendList = document.getElementById('dividendList');
const investmentList = document.getElementById('investmentList');
const reserveTotalLabel = document.getElementById('reserveTotal');
const portfolioTotalLabel = document.getElementById('portfolioTotal');
const themeToggle = document.getElementById('themeToggle');
const addTransactionBtn = document.getElementById('addTransactionBtn');
const addAccountBtn = document.getElementById('addAccountBtn');
const addInvestmentBtn = document.getElementById('addInvestmentBtn');
const addDividendBtn = document.getElementById('addDividendBtn');
const recordEntryForm = document.getElementById('recordEntryForm');
const recordDate = document.getElementById('recordDate');
const recordType = document.getElementById('recordType');
const recordCategory = document.getElementById('recordCategory');
const recordDescription = document.getElementById('recordDescription');
const recordAmount = document.getElementById('recordAmount');
const recordAccount = document.getElementById('recordAccount');
const investmentEntryForm = document.getElementById('investmentEntryForm');
const investmentDate = document.getElementById('investmentDate');
const investmentType = document.getElementById('investmentType');
const investmentAmount = document.getElementById('investmentAmount');
const investmentAccount = document.getElementById('investmentAccount');
const investmentNotes = document.getElementById('investmentNotes');
const accountEntryForm = document.getElementById('accountEntryForm');
const accountName = document.getElementById('accountName');
const accountBalance = document.getElementById('accountBalance');
const accountType = document.getElementById('accountType');
const accountNotes = document.getElementById('accountNotes');
const dividendEntryForm = document.getElementById('dividendEntryForm');
const dividendDate = document.getElementById('dividendDate');
const dividendSource = document.getElementById('dividendSource');
const dividendAmount = document.getElementById('dividendAmount');
const dividendAccount = document.getElementById('dividendAccount');
const dividendNote = document.getElementById('dividendNote');
const exportDataBtn = document.getElementById('exportDataBtn');
const settingsForm = document.getElementById('settingsForm');
const settingsName = document.getElementById('settingsName');
const settingsDetails = document.getElementById('settingsDetails');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');
const logoutBtn = document.getElementById('logoutBtn');
const filterFrom = document.getElementById('filterFrom');
const filterTo = document.getElementById('filterTo');
const filterButton = document.getElementById('filterButton');
const clearFilterButton = document.getElementById('clearFilterButton');
const filterNote = document.getElementById('filterNote');
const navButtons = document.querySelectorAll('.nav-link');
const pages = document.querySelectorAll('.page');
const trendCtx = document.getElementById('trendChart').getContext('2d');
const categoryCtx = document.getElementById('categoryChart').getContext('2d');

let data = loadData();
let trendChart;
let categoryChart;
const transactionFilter = { from: '', to: '' };

init();

function init() {
  applySavedTheme();
  applySavedPage();
  render();

  addTransactionBtn?.addEventListener('click', () => recordDate?.focus());
  addAccountBtn?.addEventListener('click', () => accountName?.focus());
  addInvestmentBtn?.addEventListener('click', () => investmentDate?.focus());
  addDividendBtn?.addEventListener('click', () => dividendDate?.focus());
  recordEntryForm?.addEventListener('submit', handleAddRecordForm);
  investmentEntryForm?.addEventListener('submit', handleInvestmentForm);
  accountEntryForm?.addEventListener('submit', handleAccountForm);
  dividendEntryForm?.addEventListener('submit', handleDividendForm);
  exportDataBtn?.addEventListener('click', exportData);
  saveSettingsBtn?.addEventListener('click', saveSettings);
  logoutBtn?.addEventListener('click', handleLogout);
  settingsForm?.addEventListener('submit', (e) => e.preventDefault());
  filterButton?.addEventListener('click', applyFilter);
  clearFilterButton?.addEventListener('click', clearFilter);
  themeToggle?.addEventListener('click', toggleTheme);

  navButtons.forEach((button) => {
    button.addEventListener('click', () => switchPage(button.dataset.page));
  });
}

function getToday(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

function loadData() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
    return JSON.parse(JSON.stringify(defaultData));
  }

  try {
    return JSON.parse(stored);
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
    return JSON.parse(JSON.stringify(defaultData));
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function render() {
  renderTransactions();
  renderSummaries();
  renderAccounts();
  renderDividends();
  renderInvestments();
  renderReports();
  renderCharts();
}

function getFilteredTransactions() {
  return data.transactions
    .filter((txn) => {
      if (transactionFilter.from && txn.date < transactionFilter.from) return false;
      if (transactionFilter.to && txn.date > transactionFilter.to) return false;
      return true;
    })
    .slice()
    .reverse();
}

function renderTransactions() {
  const transactions = getFilteredTransactions();
  transactionBody.innerHTML = '';

  if (!transactions.length) {
    const message = transactionFilter.from || transactionFilter.to
      ? 'No records match the selected date range.'
      : 'No records yet. Add a transaction to begin.';
    transactionBody.innerHTML = `<tr><td colspan="6" class="empty-row">${message}</td></tr>`;
    updateFilterNote();
    return;
  }

  transactions.forEach((txn) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${txn.date}</td>
      <td>${capitalize(txn.type)}</td>
      <td>${txn.category}</td>
      <td>${txn.description || '-'}</td>
      <td>${formatAmount(txn.type, txn.amount)}</td>
      <td>${txn.account}</td>
    `;
    transactionBody.appendChild(row);
  });
}

function applyFilter() {
  transactionFilter.from = filterFrom?.value || '';
  transactionFilter.to = filterTo?.value || '';
  render();
}

function clearFilter() {
  if (filterFrom) filterFrom.value = '';
  if (filterTo) filterTo.value = '';
  transactionFilter.from = '';
  transactionFilter.to = '';
  render();
}

function updateFilterNote() {
  if (!filterNote) return;
  if (transactionFilter.from || transactionFilter.to) {
    const from = transactionFilter.from || 'Any';
    const to = transactionFilter.to || 'Any';
    filterNote.textContent = `Showing records from ${from} to ${to}.`;
  } else {
    filterNote.textContent = '';
  }
}

function handleAddRecordForm(event) {
  event.preventDefault();
  const date = recordDate?.value || getToday();
  const type = recordType?.value || 'income';
  const category = recordCategory?.value.trim() || 'General';
  const description = recordDescription?.value.trim() || '';
  const amount = Number(recordAmount?.value) || 0;
  const account = recordAccount?.value.trim() || 'Cash';

  if (!date || amount <= 0) {
    alert('Please enter a valid date and amount.');
    return;
  }

  const newRecord = { date, type, category, description, amount, account };
  data.transactions.push(newRecord);

  if (type === 'investment') {
    addAccountValue(account, amount, 'Investments');
  }
  if (type === 'dividend') {
    data.dividends.push({ date, source: category, amount, note: description || 'Dividend payout' });
  }
  if (type === 'expense') {
    addAccountValue(account, -amount);
  }
  if (type === 'income') {
    addAccountValue(account, amount);
  }
  if (type === 'debt') {
    addAccountValue(account, -amount);
  }
  if (type === 'credit') {
    addAccountValue(account, amount);
  }

  saveData();
  recordEntryForm.reset();
  recordDate.value = getToday();
  render();
}

function handleInvestmentForm(event) {
  event.preventDefault();
  const date = investmentDate?.value || getToday();
  const category = investmentType?.value || 'FD';
  const amount = Number(investmentAmount?.value) || 0;
  const account = investmentAccount?.value.trim() || 'Investment Portfolio';
  const description = investmentNotes?.value.trim() || 'Investment record';

  if (!date || amount <= 0) {
    alert('Please enter a valid investment date and amount.');
    return;
  }

  data.transactions.push({ date, type: 'investment', category, description, amount, account });
  addAccountValue(account, amount, 'Investments');
  saveData();
  investmentEntryForm.reset();
  investmentDate.value = getToday();
  render();
}

function handleAccountForm(event) {
  event.preventDefault();
  const title = accountName?.value.trim();
  const amount = Number(accountBalance?.value) || 0;
  const type = accountType?.value || 'Bank';

  if (!title || amount < 0) {
    alert('Please enter a valid account name and balance.');
    return;
  }

  data.accounts.push({ title, amount, type });
  saveData();
  accountEntryForm.reset();
  render();
}

function handleDividendForm(event) {
  event.preventDefault();
  const date = dividendDate?.value || getToday();
  const source = dividendSource?.value.trim() || 'Dividend';
  const amount = Number(dividendAmount?.value) || 0;
  const account = dividendAccount?.value.trim() || 'Portfolio';
  const note = dividendNote?.value.trim() || 'Dividend receipt';

  if (!date || amount <= 0) {
    alert('Please enter a valid dividend date and amount.');
    return;
  }

  data.transactions.push({ date, type: 'dividend', category: source, description: note, amount, account });
  data.dividends.push({ date, source, amount, note });
  saveData();
  dividendEntryForm.reset();
  dividendDate.value = getToday();
  render();
}

function exportData() {
  const csvRows = [
    ['Date', 'Type', 'Category', 'Description', 'Amount', 'Account'],
    ...data.transactions.map((txn) => [txn.date, txn.type, txn.category, txn.description || '', txn.amount, txn.account])
  ];
  const csv = csvRows.map((row) => row.map((item) => `"${String(item).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `finance-export-${new Date().toISOString().slice(0,10)}.csv`;
  link.click();
}

function saveSettings() {
  const settings = {
    name: settingsName?.value.trim() || '',
    details: settingsDetails?.value.trim() || ''
  };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  alert('Settings saved.');
}

function loadSettings() {
  const stored = localStorage.getItem(SETTINGS_KEY);
  if (!stored) return;
  try {
    const settings = JSON.parse(stored);
    if (settingsName) settingsName.value = settings.name || '';
    if (settingsDetails) settingsDetails.value = settings.details || '';
  } catch {
    /* ignore */
  }
}

function handleLogout() {
  localStorage.removeItem(SETTINGS_KEY);
  alert('Logged out. Refreshing page.');
  window.location.reload();
}

function promptAddAccount() {
  accountName?.focus();
}

function promptAddInvestment() {
  investmentDate?.focus();
}

function promptAddDividend() {
  dividendDate?.focus();
}

function renderSummaries() {
  const date = prompt('Investment date (YYYY-MM-DD)', getToday());
  if (!date) return;
  const category = prompt('Investment type (FD, RD, Equity)', 'FD') || 'FD';
  const amount = Number(prompt('Amount', '0'));
  if (!amount || amount <= 0) {
    alert('Please enter a valid positive amount.');
    return;
  }
  const account = prompt('Account', 'Investment Portfolio') || 'Investment Portfolio';

  data.transactions.push({ date, type: 'investment', category, description: 'Manual investment', amount, account });
  addAccountValue(account, amount, 'Investments');
  saveData();
  render();
}

function promptAddDividend() {
  const date = prompt('Dividend date (YYYY-MM-DD)', getToday());
  if (!date) return;
  const source = prompt('Dividend source', 'Equity Dividend') || 'Dividend';
  const amount = Number(prompt('Amount', '0'));
  if (!amount || amount <= 0) {
    alert('Please enter a valid positive amount.');
    return;
  }
  const account = prompt('Account', 'Portfolio') || 'Portfolio';
  const note = prompt('Note', 'Dividend payout') || 'Dividend payout';

  data.transactions.push({ date, type: 'dividend', category: source, description: note, amount, account });
  data.dividends.push({ date, source, amount, note });
  saveData();
  render();
}

function renderSummaries() {
  const totalBalance = data.accounts.reduce((sum, item) => sum + item.amount, 0);
  const today = getToday();
  const todayPL = data.transactions
    .filter((txn) => txn.date === today)
    .reduce((sum, txn) => sum + (txn.type === 'expense' || txn.type === 'debt' ? -txn.amount : txn.amount), 0);
  const investments = data.transactions
    .filter((txn) => txn.type === 'investment')
    .reduce((sum, txn) => sum + txn.amount, 0);
  const creditDebt = data.transactions
    .filter((txn) => txn.type === 'credit' || txn.type === 'debt')
    .reduce((sum, txn) => sum + (txn.type === 'debt' ? -txn.amount : txn.amount), 0);

  totalBalanceLabel.textContent = `₹${formatNumber(totalBalance)}`;
  todayPLLabel.textContent = `₹${formatNumber(todayPL)}`;
  totalInvestmentLabel.textContent = `₹${formatNumber(investments)}`;
  creditDebtLabel.textContent = `₹${formatNumber(creditDebt)}`;
}

function renderAccounts() {
  accountList.innerHTML = '';
  data.accounts.forEach((account) => {
    const block = document.createElement('div');
    const typeClass = account.type.toLowerCase().includes('bank') ? 'bank-account' : account.type.toLowerCase().includes('fd') ? 'fd-balance' : '';
    block.className = `account-card ${typeClass}`.trim();
    block.innerHTML = `
      <strong>${account.title}</strong>
      <span>${account.type}</span>
      <p>₹${formatNumber(account.amount)}</p>
    `;
    accountList.appendChild(block);
  });
}

function renderDividends() {
  dividendList.innerHTML = '';
  if (!data.dividends.length) {
    dividendList.innerHTML = '<div class="dividend-card"><span>No dividend records available.</span></div>';
    return;
  }

  data.dividends.slice().reverse().forEach((dividend) => {
    const block = document.createElement('div');
    block.className = 'dividend-card';
    block.innerHTML = `
      <strong>${dividend.source}</strong>
      <span>${dividend.date} • ${dividend.note}</span>
      <p>₹${formatNumber(dividend.amount)}</p>
    `;
    dividendList.appendChild(block);
  });
}

function renderInvestments() {
  investmentList.innerHTML = '';
  const investmentTransactions = data.transactions.filter((txn) => txn.type === 'investment');
  const reserveTotal = investmentTransactions
    .filter((txn) => ['FD', 'RD'].includes(txn.category) || txn.account.includes('Reserve'))
    .reduce((sum, txn) => sum + txn.amount, 0);
  const portfolioTotal = data.accounts
    .filter((account) => account.type === 'Investments')
    .reduce((sum, account) => sum + account.amount, 0);

  reserveTotalLabel.textContent = `₹${formatNumber(reserveTotal)}`;
  portfolioTotalLabel.textContent = `₹${formatNumber(portfolioTotal)}`;

  if (!investmentTransactions.length) {
    investmentList.innerHTML = '<li>No investment records recorded yet.</li>';
    return;
  }

  investmentTransactions.forEach((txn) => {
    const item = document.createElement('li');
    item.innerHTML = `
      <strong>${txn.category}</strong>
      <span>${txn.date} • ${txn.account}</span>
      <p>${formatAmount(txn.type, txn.amount)} • ${txn.description || 'Investment record'}</p>
    `;
    investmentList.appendChild(item);
  });
}

function renderReports() {
  const totalAssets = data.accounts.reduce((sum, account) => sum + account.amount, 0);
  const totalLiabilities = data.transactions
    .filter((txn) => txn.type === 'debt')
    .reduce((sum, txn) => sum + txn.amount, 0);
  const profitLoss = data.transactions
    .reduce((sum, txn) => sum + (txn.type === 'expense' || txn.type === 'debt' ? -txn.amount : txn.amount), 0);
  const netWorth = totalAssets - totalLiabilities;

  const netWorthLabel = document.getElementById('netWorth');
  const totalAssetsLabel = document.getElementById('totalAssets');
  const totalLiabilitiesLabel = document.getElementById('totalLiabilities');
  const profitLossLabel = document.getElementById('profitLoss');
  const balanceSheetSummaryLabel = document.getElementById('balanceSheetSummary');

  if (netWorthLabel) netWorthLabel.textContent = `₹${formatNumber(netWorth)}`;
  if (totalAssetsLabel) totalAssetsLabel.textContent = `₹${formatNumber(totalAssets)}`;
  if (totalLiabilitiesLabel) totalLiabilitiesLabel.textContent = `₹${formatNumber(totalLiabilities)}`;
  if (profitLossLabel) profitLossLabel.textContent = `₹${formatNumber(profitLoss)}`;
  if (balanceSheetSummaryLabel) {
    balanceSheetSummaryLabel.textContent = `Assets ₹${formatNumber(totalAssets)}, Liabilities ₹${formatNumber(totalLiabilities)}, Net Worth ₹${formatNumber(netWorth)}.`;
  }
}

function renderCharts() {
  const monthlyTrend = getMonthlyTrend();
  const categoryAllocation = getCategoryAllocation();

  if (trendChart) trendChart.destroy();
  if (categoryChart) categoryChart.destroy();

  trendChart = new Chart(trendCtx, {
    type: 'line',
    data: {
      labels: monthlyTrend.labels,
      datasets: [
        {
          label: 'Net daily change',
          data: monthlyTrend.values,
          borderColor: '#60a5fa',
          backgroundColor: 'rgba(96, 165, 250, 0.22)',
          fill: true,
          tension: 0.32,
          pointRadius: 4,
          pointBackgroundColor: '#93c5fd'
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: { mode: 'index', intersect: false }
      },
      scales: {
        x: { grid: { color: 'rgba(255, 255, 255, 0.06)' } },
        y: { grid: { color: 'rgba(255, 255, 255, 0.06)' }, ticks: { callback: (val) => `₹${val}` } }
      }
    }
  });

  categoryChart = new Chart(categoryCtx, {
    type: 'doughnut',
    data: {
      labels: categoryAllocation.labels,
      datasets: [
        {
          label: 'Category allocation',
          data: categoryAllocation.values,
          backgroundColor: ['#38bdf8', '#60a5fa', '#a78bfa', '#f472b6', '#fbbf24', '#34d399'],
          borderWidth: 0
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom', labels: { color: '#cbd5e1' } }
      }
    }
  });
}

function getMonthlyTrend() {
  const dates = [...new Set(data.transactions.map((item) => item.date))].sort();
  const grouped = dates.map((date) => {
    const total = data.transactions
      .filter((txn) => txn.date === date)
      .reduce((sum, txn) => sum + (txn.type === 'expense' || txn.type === 'debt' ? -txn.amount : txn.amount), 0);
    return { date, total };
  });

  return {
    labels: grouped.map((item) => item.date),
    values: grouped.map((item) => item.total)
  };
}

function getCategoryAllocation() {
  const map = {};
  data.transactions.forEach((txn) => {
    map[txn.category] = (map[txn.category] || 0) + txn.amount;
  });
  return {
    labels: Object.keys(map),
    values: Object.values(map)
  };
}


function addAccountValue(title, amount, typeOverride) {
  const existing = data.accounts.find((account) => account.title.toLowerCase() === title.toLowerCase());
  if (existing) {
    existing.amount += amount;
    return;
  }
  data.accounts.push({ title, amount, type: typeOverride || 'Account' });
}

function resetData() {
  if (!confirm('Reset all finance data and restore sample records?')) return;
  data = JSON.parse(JSON.stringify(defaultData));
  saveData();
  render();
}

function capitalize(value) {
  return value.replace(/(^|\s)\S/g, (letter) => letter.toUpperCase());
}

function formatNumber(value) {
  return Number(value).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

function formatAmount(type, amount) {
  const sign = type === 'expense' || type === 'debt' ? '-' : '+';
  return `${sign}₹${formatNumber(amount)}`;
}

function switchPage(pageId) {
  const matchingPage = Array.from(pages).find((page) => page.id === pageId);
  const targetPage = matchingPage ? pageId : 'dashboardPage';

  pages.forEach((page) => page.classList.toggle('active', page.id === targetPage));
  navButtons.forEach((button) => button.classList.toggle('active', button.dataset.page === targetPage));
  localStorage.setItem(PAGE_KEY, targetPage);
}

function applySavedPage() {
  const savedPage = localStorage.getItem(PAGE_KEY) || 'dashboardPage';
  switchPage(savedPage);
}

function toggleTheme() {
  const body = document.body;
  const nextTheme = body.classList.contains('theme-dark') ? 'theme-light' : 'theme-dark';
  body.classList.toggle('theme-dark', nextTheme === 'theme-dark');
  body.classList.toggle('theme-light', nextTheme === 'theme-light');
  themeToggle.textContent = nextTheme === 'theme-dark' ? '☀️' : '🌙';
  localStorage.setItem(THEME_KEY, nextTheme);
}

function applySavedTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY) || 'theme-light';
  document.body.classList.toggle('theme-dark', savedTheme === 'theme-dark');
  document.body.classList.toggle('theme-light', savedTheme === 'theme-light');
  themeToggle.textContent = savedTheme === 'theme-dark' ? '☀️' : '🌙';
}
