// Financial Management App
class FinancialApp {
    constructor() {
        this.currentView = 'dashboard';
        this.editingTransactionId = null;
        this.charts = {};
        this.data = null;
        
        this.init();
    }

    async init() {
        // Charger les données depuis Electron
        if (window.electronAPI) {
            this.data = await window.electronAPI.getData();
        } else {
            // Fallback pour le développement web
            this.data = {
                comptes: [
                    {"id": 1, "nom": "Compte Courant", "solde": 2450, "type": "courant"},
                    {"id": 2, "nom": "Livret A", "solde": 8200, "type": "epargne"},
                    {"id": 3, "nom": "Espèces", "solde": 150, "type": "especes"}
                ],
                categories: [
                    {"id": 1, "nom": "Salaire", "type": "revenu", "couleur": "#22c55e"},
                    {"id": 2, "nom": "Freelance", "type": "revenu", "couleur": "#3b82f6"},
                    {"id": 3, "nom": "Logement", "type": "depense", "couleur": "#ef4444"},
                    {"id": 4, "nom": "Alimentation", "type": "depense", "couleur": "#f97316"},
                    {"id": 5, "nom": "Transport", "type": "depense", "couleur": "#8b5cf6"},
                    {"id": 6, "nom": "Loisirs", "type": "depense", "couleur": "#ec4899"},
                    {"id": 7, "nom": "Santé", "type": "depense", "couleur": "#06b6d4"},
                    {"id": 8, "nom": "Assurance", "type": "depense", "couleur": "#84cc16"}
                ],
                transactions: [
                    {"id": 1, "date": "2025-06-01", "montant": 2800, "categorie": "Salaire", "description": "Salaire mensuel", "compte": "Compte Courant", "type": "revenu"},
                    {"id": 2, "date": "2025-06-01", "montant": -750, "categorie": "Logement", "description": "Loyer juin", "compte": "Compte Courant", "type": "depense"},
                    {"id": 3, "date": "2025-06-15", "montant": 450, "categorie": "Freelance", "description": "Mission web", "compte": "Compte Courant", "type": "revenu"},
                    {"id": 4, "date": "2025-06-20", "montant": -320, "categorie": "Alimentation", "description": "Courses du mois", "compte": "Compte Courant", "type": "depense"}
                ],
                budgets: [
                    {"categorie": "Logement", "limite": 800, "utilise": 750},
                    {"categorie": "Alimentation", "limite": 400, "utilise": 320},
                    {"categorie": "Transport", "limite": 100, "utilise": 80},
                    {"categorie": "Loisirs", "limite": 200, "utilise": 180}
                ],
                settings: {
                    currency: "EUR",
                    language: "fr",
                    notifications: true,
                    autoBackup: true,
                    theme: "auto"
                }
            };
        }

        this.setupEventListeners();
        this.populateSelects();
        this.showView('dashboard');
        this.updateDashboard();
        this.loadTransactions();
        this.loadBudgets();
        this.loadAccounts();
        this.loadCategories();
        this.generateCharts();
        this.setupElectronEvents();
    }

    setupEventListeners() {
        // Navigation
        const navLinks = document.querySelectorAll('.nav-link');
        if (navLinks.length === 0) {
            console.warn('Aucun élément .nav-link trouvé');
        } else {
            navLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const view = link.dataset.view;
                    this.showView(view);
                });
            });
        }

        // Sidebar toggle
        const sidebarToggle = document.getElementById('sidebarToggle');
        const sidebar = document.getElementById('sidebar');
        if (!sidebarToggle) {
            console.warn('Element sidebarToggle introuvable');
        } else {
            sidebarToggle.addEventListener('click', () => {
                if (sidebar) {
                    sidebar.classList.toggle('open');
                } else {
                    console.warn('Element sidebar introuvable');
                }
            });
        }

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (
                window.innerWidth <= 768 &&
                sidebar &&
                !sidebar.contains(e.target) &&
                sidebarToggle &&
                !sidebarToggle.contains(e.target)
            ) {
                sidebar.classList.remove('open');
            }
        });

        // Transaction modal
        const addTransactionBtn = document.getElementById('addTransactionBtn');
        if (!addTransactionBtn) {
            console.warn('Element addTransactionBtn introuvable');
        } else {
            addTransactionBtn.addEventListener('click', () => {
                this.showTransactionModal();
            });
        }
        const addTransactionBtn2 = document.getElementById('addTransactionBtn2');
        if (!addTransactionBtn2) {
            console.warn('Element addTransactionBtn2 introuvable');
        } else {
            addTransactionBtn2.addEventListener('click', () => {
                this.showTransactionModal();
            });
        }
        const closeModal = document.getElementById('closeModal');
        if (!closeModal) {
            console.warn('Element closeModal introuvable');
        } else {
            closeModal.addEventListener('click', () => {
                this.hideTransactionModal();
            });
        }
        const cancelModal = document.getElementById('cancelModal');
        if (!cancelModal) {
            console.warn('Element cancelModal introuvable');
        } else {
            cancelModal.addEventListener('click', () => {
                this.hideTransactionModal();
            });
        }

        // Budget modal
        const addBudgetBtn = document.getElementById('addBudgetBtn');
        if (!addBudgetBtn) {
            console.warn('Element addBudgetBtn introuvable');
        } else {
            addBudgetBtn.addEventListener('click', () => {
                this.showBudgetModal();
            });
        }
        const closeBudgetModal = document.getElementById('closeBudgetModal');
        if (!closeBudgetModal) {
            console.warn('Element closeBudgetModal introuvable');
        } else {
            closeBudgetModal.addEventListener('click', () => {
                this.hideBudgetModal();
            });
        }
        const cancelBudgetModal = document.getElementById('cancelBudgetModal');
        if (!cancelBudgetModal) {
            console.warn('Element cancelBudgetModal introuvable');
        } else {
            cancelBudgetModal.addEventListener('click', () => {
                this.hideBudgetModal();
            });
        }

        // Forms
        const transactionForm = document.getElementById('transactionForm');
        if (!transactionForm) {
            console.warn('Element transactionForm introuvable');
        } else {
            transactionForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveTransaction();
            });
        }
        const budgetForm = document.getElementById('budgetForm');
        if (!budgetForm) {
            console.warn('Element budgetForm introuvable');
        } else {
            budgetForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveBudget();
            });
        }

        // Transaction type change
        const transactionType = document.getElementById('transactionType');
        if (!transactionType) {
            console.warn('Element transactionType introuvable');
        } else {
            transactionType.addEventListener('change', () => {
                this.updateCategoryOptions();
            });
        }

        // Recurring checkbox
        const isRecurring = document.getElementById('isRecurring');
        const recurringOptions = document.getElementById('recurringOptions');
        if (!isRecurring) {
            console.warn('Element isRecurring introuvable');
        } else if (!recurringOptions) {
            console.warn('Element recurringOptions introuvable');
        } else {
            isRecurring.addEventListener('change', (e) => {
                recurringOptions.style.display =
                    e.target.checked ? 'block' : 'none';
            });
        }

        // Filters
        const filterCategory = document.getElementById('filterCategory');
        if (!filterCategory) {
            console.warn('Element filterCategory introuvable');
        } else {
            filterCategory.addEventListener('change', () => {
                this.filterTransactions();
            });
        }
        const filterType = document.getElementById('filterType');
        if (!filterType) {
            console.warn('Element filterType introuvable');
        } else {
            filterType.addEventListener('change', () => {
                this.filterTransactions();
            });
        }
        const filterAccount = document.getElementById('filterAccount');
        if (!filterAccount) {
            console.warn('Element filterAccount introuvable');
        } else {
            filterAccount.addEventListener('change', () => {
                this.filterTransactions();
            });
        }
    }

    showView(viewName) {
        // Hide all views
        const views = document.querySelectorAll('.view');
        if (views.length === 0) {
            console.warn('Aucun élément .view trouvé');
        } else {
            views.forEach(view => {
                view.classList.remove('active');
            });
        }
        // Show selected view
        const targetView = document.getElementById(viewName);
        if (!targetView) {
            console.warn('Element view ' + viewName + ' introuvable');
            return;
        }
        targetView.classList.add('active');

        // Update navigation
        const navLinks = document.querySelectorAll('.nav-link');
        if (navLinks.length === 0) {
            console.warn('Aucun élément .nav-link trouvé');
        } else {
            navLinks.forEach(link => {
                link.classList.remove('active');
            });
        }
        const navActive = document.querySelector(`[data-view="${viewName}"]`);
        if (navActive) {
            navActive.classList.add('active');
        } else {
            console.warn('Navigation pour la vue ' + viewName + ' introuvable');
        }

        this.currentView = viewName;
        // Load view-specific data
        switch(viewName) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'transactions':
                this.loadTransactions();
                break;
            case 'forecasts':
                this.generateForecastChart();
                this.updateForecastSummary();
                break;
            case 'budgets':
                this.loadBudgets();
                break;
            case 'reports':
                this.generateReportCharts();
                break;
            case 'settings':
                this.loadAccounts();
                this.loadCategories();
                break;
        }
    }

    populateSelects() {
        // Categories for transaction modal
        const categorySelect = document.getElementById('transactionCategory');
        const filterCategorySelect = document.getElementById('filterCategory');
        const budgetCategorySelect = document.getElementById('budgetCategory');

        // Accounts for transaction modal
        const accountSelect = document.getElementById('transactionAccount');
        const filterAccountSelect = document.getElementById('filterAccount');

        if (!categorySelect) console.warn('Element transactionCategory introuvable');
        if (!filterCategorySelect) console.warn('Element filterCategory introuvable');
        if (!budgetCategorySelect) console.warn('Element budgetCategory introuvable');
        if (!accountSelect) console.warn('Element transactionAccount introuvable');
        if (!filterAccountSelect) console.warn('Element filterAccount introuvable');

        // Populate categories
        this.data.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.nom;
            option.textContent = category.nom;
            if (categorySelect) categorySelect.appendChild(option.cloneNode(true));
            if (filterCategorySelect) filterCategorySelect.appendChild(option.cloneNode(true));
            if (budgetCategorySelect && category.type === 'depense') budgetCategorySelect.appendChild(option.cloneNode(true));
        });

        // Populate accounts
        this.data.comptes.forEach(compte => {
            const option = document.createElement('option');
            option.value = compte.nom;
            option.textContent = compte.nom;
            if (accountSelect) accountSelect.appendChild(option.cloneNode(true));
            if (filterAccountSelect) filterAccountSelect.appendChild(option.cloneNode(true));
        });
    }

    updateCategoryOptions() {
        const typeEl = document.getElementById('transactionType');
        const categorySelect = document.getElementById('transactionCategory');
        if (!typeEl) {
            console.warn('Element transactionType introuvable');
            return;
        }
        if (!categorySelect) {
            console.warn('Element transactionCategory introuvable');
            return;
        }
        const type = typeEl.value;
        categorySelect.innerHTML = '';
        this.data.categories
            .filter(cat => cat.type === type)
            .forEach(category => {
                const option = document.createElement('option');
                option.value = category.nom;
                option.textContent = category.nom;
                categorySelect.appendChild(option);
            });
    }

    showTransactionModal(transaction = null) {
        const modal = document.getElementById('transactionModal');
        const form = document.getElementById('transactionForm');
        const title = document.getElementById('modalTitle');
        if (!modal) {
            console.warn('Element transactionModal introuvable');
            return;
        }
        if (!form) {
            console.warn('Element transactionForm introuvable');
            return;
        }
        if (!title) {
            console.warn('Element modalTitle introuvable');
            return;
        }
        if (transaction) {
            title.textContent = 'Modifier la transaction';
            this.editingTransactionId = transaction.id;

            const typeEl = document.getElementById('transactionType');
            const amountEl = document.getElementById('transactionAmount');
            const categoryEl = document.getElementById('transactionCategory');
            const descEl = document.getElementById('transactionDescription');
            const dateEl = document.getElementById('transactionDate');
            const accountEl = document.getElementById('transactionAccount');
            if (!typeEl || !amountEl || !categoryEl || !descEl || !dateEl || !accountEl) {
                console.warn('Un ou plusieurs champs du formulaire transaction introuvables');
                return;
            }
            typeEl.value = transaction.type;
            this.updateCategoryOptions();
            amountEl.value = Math.abs(transaction.montant);
            categoryEl.value = transaction.categorie;
            descEl.value = transaction.description;
            dateEl.value = transaction.date;
            accountEl.value = transaction.compte;
        } else {
            title.textContent = 'Ajouter une transaction';
            this.editingTransactionId = null;
            form.reset();
            const dateEl = document.getElementById('transactionDate');
            if (dateEl) {
                dateEl.value = new Date().toISOString().split('T')[0];
            } else {
                console.warn('Element transactionDate introuvable');
            }
            this.updateCategoryOptions();
        }
        modal.classList.add('active');
    }

    hideTransactionModal() {
        const modal = document.getElementById('transactionModal');
        const recurringOptions = document.getElementById('recurringOptions');
        const isRecurring = document.getElementById('isRecurring');
        if (!modal) {
            console.warn('Element transactionModal introuvable');
            return;
        }
        modal.classList.remove('active');
        if (recurringOptions) recurringOptions.style.display = 'none';
        if (isRecurring) isRecurring.checked = false;
    }

    showBudgetModal() {
        const modal = document.getElementById('budgetModal');
        if (!modal) {
            console.warn('Element budgetModal introuvable');
            return;
        }
        modal.classList.add('active');
    }

    hideBudgetModal() {
        const modal = document.getElementById('budgetModal');
        const form = document.getElementById('budgetForm');
        if (!modal) {
            console.warn('Element budgetModal introuvable');
            return;
        }
        modal.classList.remove('active');
        if (form) form.reset();
    }

    async saveTransaction() {
        const form = document.getElementById('transactionForm');
        if (!form) {
            console.warn('Element transactionForm introuvable');
            return;
        }
        const typeEl = document.getElementById('transactionType');
        const amountEl = document.getElementById('transactionAmount');
        const dateEl = document.getElementById('transactionDate');
        const categoryEl = document.getElementById('transactionCategory');
        const descEl = document.getElementById('transactionDescription');
        const accountEl = document.getElementById('transactionAccount');
        if (!typeEl || !amountEl || !dateEl || !categoryEl || !descEl || !accountEl) {
            console.warn('Un ou plusieurs champs du formulaire transaction introuvables');
            return;
        }
        const type = typeEl.value;
        const amount = parseFloat(amountEl.value);
        const montant = type === 'revenu' ? amount : -amount;
        const transaction = {
            date: dateEl.value,
            montant: montant,
            categorie: categoryEl.value,
            description: descEl.value,
            compte: accountEl.value,
            type: type
        };
        
        try {
            if (window.electronAPI) {
                if (this.editingTransactionId) {
                    const result = await window.electronAPI.updateTransaction(this.editingTransactionId, transaction);
                    if (result.success) {
                        this.showNotification('Transaction mise à jour avec succès', 'success');
                    } else {
                        this.showNotification(`Erreur: ${result.error}`, 'error');
                        return;
                    }
                } else {
                    const result = await window.electronAPI.addTransaction(transaction);
                    if (result.success) {
                        this.showNotification('Transaction ajoutée avec succès', 'success');
                    } else {
                        this.showNotification(`Erreur: ${result.error}`, 'error');
                        return;
                    }
                }
                
                // Rafraîchir les données
                await this.refreshData();
            } else {
                // Fallback pour le développement web
                if (this.editingTransactionId) {
                    const index = this.data.transactions.findIndex(t => t.id === this.editingTransactionId);
                    this.data.transactions[index] = { ...transaction, id: this.editingTransactionId };
                } else {
                    transaction.id = Date.now();
                    this.data.transactions.push(transaction);
                }
                
                this.updateAccountBalances();
                this.updateBudgetUsage();
            }
            
            this.hideTransactionModal();
            this.updateDashboard();
            this.loadTransactions();
            
        } catch (error) {
            this.showNotification(`Erreur: ${error.message}`, 'error');
        }
    }

    async saveBudget() {
        const catEl = document.getElementById('budgetCategory');
        const limitEl = document.getElementById('budgetLimit');
        if (!catEl || !limitEl) {
            console.warn('Element budgetCategory ou budgetLimit introuvable');
            return;
        }
        const categorie = catEl.value;
        const limite = parseFloat(limitEl.value);
        
        try {
            if (window.electronAPI) {
                const existingBudget = this.data.budgets.find(b => b.categorie === categorie);
                
                if (existingBudget) {
                    const result = await window.electronAPI.updateBudget(categorie, { limite });
                    if (result.success) {
                        this.showNotification('Budget mis à jour avec succès', 'success');
                    } else {
                        this.showNotification(`Erreur: ${result.error}`, 'error');
                        return;
                    }
                } else {
                    const result = await window.electronAPI.addBudget({ categorie, limite });
                    if (result.success) {
                        this.showNotification('Budget ajouté avec succès', 'success');
                    } else {
                        this.showNotification(`Erreur: ${result.error}`, 'error');
                        return;
                    }
                }
                
                // Rafraîchir les données
                await this.refreshData();
            } else {
                // Fallback pour le développement web
                const existingBudget = this.data.budgets.find(b => b.categorie === categorie);
                if (existingBudget) {
                    existingBudget.limite = limite;
                } else {
                    this.data.budgets.push({
                        categorie: categorie,
                        limite: limite,
                        utilise: this.calculateCategoryUsage(categorie)
                    });
                }
            }
            
            this.hideBudgetModal();
            this.loadBudgets();
            this.updateDashboard();
            
        } catch (error) {
            this.showNotification(`Erreur: ${error.message}`, 'error');
        }
    }

    updateAccountBalances() {
        // Reset account balances to initial values
        this.data.comptes.forEach(compte => {
            const initialBalance = compte.id === 1 ? 2450 : compte.id === 2 ? 8200 : 150;
            compte.solde = initialBalance;
        });
        
        // Apply all transactions
        this.data.transactions.forEach(transaction => {
            const compte = this.data.comptes.find(c => c.nom === transaction.compte);
            if (compte) {
                compte.solde += transaction.montant;
            }
        });
    }

    updateBudgetUsage() {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        this.data.budgets.forEach(budget => {
            const monthlyExpenses = this.data.transactions
                .filter(t => {
                    const transactionDate = new Date(t.date);
                    return t.categorie === budget.categorie && 
                           t.type === 'depense' &&
                           transactionDate.getMonth() === currentMonth &&
                           transactionDate.getFullYear() === currentYear;
                })
                .reduce((sum, t) => sum + Math.abs(t.montant), 0);
            
            budget.utilise = monthlyExpenses;
        });
    }

    calculateCategoryUsage(categorie) {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        return this.data.transactions
            .filter(t => {
                const transactionDate = new Date(t.date);
                return t.categorie === categorie && 
                       t.type === 'depense' &&
                       transactionDate.getMonth() === currentMonth &&
                       transactionDate.getFullYear() === currentYear;
            })
            .reduce((sum, t) => sum + Math.abs(t.montant), 0);
    }

    updateDashboard() {
        this.updateSummaryCards();
        this.generateCharts();
        this.loadRecentTransactions();
        this.showBudgetAlerts();
    }

    updateSummaryCards() {
        const totalBalance = this.data.comptes.reduce((sum, compte) => sum + compte.solde, 0);
        const totalBalanceEl = document.getElementById('totalBalance');
        if (!totalBalanceEl) {
            console.warn('Element totalBalance introuvable');
            return;
        }
        totalBalanceEl.textContent = this.formatCurrency(totalBalance);

        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        const monthlyIncome = this.data.transactions
            .filter(t => {
                const date = new Date(t.date);
                return t.type === 'revenu' &&
                       date.getMonth() === currentMonth &&
                       date.getFullYear() === currentYear;
            })
            .reduce((sum, t) => sum + t.montant, 0);

        const monthlyExpenses = this.data.transactions
            .filter(t => {
                const date = new Date(t.date);
                return t.type === 'depense' &&
                       date.getMonth() === currentMonth &&
                       date.getFullYear() === currentYear;
            })
            .reduce((sum, t) => sum + Math.abs(t.montant), 0);

        const monthlyIncomeEl = document.getElementById('monthlyIncome');
        if (!monthlyIncomeEl) {
            console.warn('Element monthlyIncome introuvable');
        } else {
            monthlyIncomeEl.textContent = '+ ' + this.formatCurrency(monthlyIncome);
        }
        const monthlyExpensesEl = document.getElementById('monthlyExpenses');
        if (!monthlyExpensesEl) {
            console.warn('Element monthlyExpenses introuvable');
        } else {
            monthlyExpensesEl.textContent = '- ' + this.formatCurrency(monthlyExpenses);
        }
    }

    generateCharts() {
        this.generateExpensePieChart();
        this.generateBalanceLineChart();
    }

    generateExpensePieChart() {
        const canvas = document.getElementById('expensePieChart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        if (this.charts.expensePie) {
            this.charts.expensePie.destroy();
        }

        const expenses = this.data.transactions
            .filter(t => t.type === 'depense')
            .reduce((acc, t) => {
                acc[t.categorie] = (acc[t.categorie] || 0) + Math.abs(t.montant);
                return acc;
            }, {});

        const labels = Object.keys(expenses);
        const data = Object.values(expenses);
        const colors = labels.map(label => {
            const category = this.data.categories.find(c => c.nom === label);
            return category ? category.couleur : '#94a3b8';
        });

        this.charts.expensePie = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    generateBalanceLineChart() {
        const canvas = document.getElementById('balanceLineChart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        if (this.charts.balanceLine) {
            this.charts.balanceLine.destroy();
        }

        // Generate 6 months of data
        const months = [];
        const balances = [];
        const now = new Date();

        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthName = date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
            months.push(monthName);

            // Calculate balance for this month (simplified)
            const baseBalance = 10800;
            const variation = (Math.random() - 0.5) * 2000;
            balances.push(baseBalance + variation - (i * 100));
        }

        this.charts.balanceLine = new Chart(ctx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: 'Solde total',
                    data: balances,
                    borderColor: '#1FB8CD',
                    backgroundColor: 'rgba(31, 184, 205, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
                        ticks: {
                            callback: function(value) {
                                return value.toLocaleString('fr-FR', {
                                    style: 'currency',
                                    currency: 'EUR'
                                });
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    loadRecentTransactions() {
        const container = document.getElementById('recentTransactions');
        if (!container) {
            console.warn('Element recentTransactions introuvable');
            return;
        }
        const recentTransactions = this.data.transactions
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);
        container.innerHTML = recentTransactions.map(transaction => `
            <div class="transaction-item">
                <div class="transaction-info">
                    <div class="transaction-category">${transaction.categorie}</div>
                    <div class="transaction-description">${transaction.description}</div>
                </div>
                <div>
                    <div class="transaction-amount ${transaction.type}">
                        ${transaction.type === 'revenu' ? '+' : ''}${this.formatCurrency(Math.abs(transaction.montant))}
                    </div>
                    <div class="transaction-date">${this.formatDate(transaction.date)}</div>
                </div>
            </div>
        `).join('');
    }

    showBudgetAlerts() {
        const container = document.getElementById('budgetAlerts');
        if (!container) {
            console.warn('Element budgetAlerts introuvable');
            return;
        }
        const overBudgets = this.data.budgets.filter(budget => budget.utilise > budget.limite);
        if (overBudgets.length > 0) {
            container.innerHTML = overBudgets.map(budget => `
                <div class="alert alert-warning">
                    <div class="alert-icon">⚠️</div>
                    <div>
                        Budget dépassé pour <strong>${budget.categorie}</strong>: 
                        ${this.formatCurrency(budget.utilise)} / ${this.formatCurrency(budget.limite)}
                    </div>
                </div>
            `).join('');
        } else {
            container.innerHTML = '';
        }
    }

    loadTransactions() {
        const container = document.getElementById('transactionsTable');
        if (!container) {
            console.warn('Element transactionsTable introuvable');
            return;
        }
        const sortedTransactions = [...this.data.transactions]
            .sort((a, b) => new Date(b.date) - new Date(a.date));
        container.innerHTML = `
            <table class="table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Catégorie</th>
                        <th>Compte</th>
                        <th>Montant</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${sortedTransactions.map(t => `
                        <tr data-transaction-id="${t.id}">
                            <td>${this.formatDate(t.date)}</td>
                            <td>${t.description}</td>
                            <td>${t.categorie}</td>
                            <td>${t.compte}</td>
                            <td class="transaction-amount ${t.type}">
                                ${t.type === 'revenu' ? '+' : ''}${this.formatCurrency(Math.abs(t.montant))}
                            </td>
                            <td class="table-actions">
                                <button class="btn btn--sm btn--secondary" onclick="app.editTransaction(${t.id})">
                                    Modifier
                                </button>
                                <button class="btn btn--sm btn--outline" onclick="app.deleteTransaction(${t.id})">
                                    Supprimer
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    filterTransactions() {
        const categoryEl = document.getElementById('filterCategory');
        const typeEl = document.getElementById('filterType');
        const accountEl = document.getElementById('filterAccount');
        if (!categoryEl || !typeEl || !accountEl) {
            console.warn('Un ou plusieurs éléments de filtre introuvables');
            return;
        }
        const categoryFilter = categoryEl.value;
        const typeFilter = typeEl.value;
        const accountFilter = accountEl.value;

        const filteredTransactions = this.data.transactions.filter(t => {
            return (!categoryFilter || t.categorie === categoryFilter) &&
                   (!typeFilter || t.type === typeFilter) &&
                   (!accountFilter || t.compte === accountFilter);
        });

        // Update table with filtered results
        const tbody = document.querySelector('#transactionsTable tbody');
        if (!tbody) {
            console.warn('Element tbody de transactionsTable introuvable');
            return;
        }
        tbody.innerHTML = filteredTransactions
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map(t => `
                <tr data-transaction-id="${t.id}">
                    <td>${this.formatDate(t.date)}</td>
                    <td>${t.description}</td>
                    <td>${t.categorie}</td>
                    <td>${t.compte}</td>
                    <td class="transaction-amount ${t.type}">
                        ${t.type === 'revenu' ? '+' : ''}${this.formatCurrency(Math.abs(t.montant))}
                    </td>
                    <td class="table-actions">
                        <button class="btn btn--sm btn--secondary" onclick="app.editTransaction(${t.id})">
                            Modifier
                        </button>
                        <button class="btn btn--sm btn--outline" onclick="app.deleteTransaction(${t.id})">
                            Supprimer
                        </button>
                    </td>
                </tr>
            `).join('');
    }

    editTransaction(id) {
        const transaction = this.data.transactions.find(t => t.id === id);
        if (transaction) {
            this.showTransactionModal(transaction);
        }
    }

    async deleteTransaction(id) {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette transaction ?')) {
            try {
                if (window.electronAPI) {
                    const result = await window.electronAPI.deleteTransaction(id);
                    if (result.success) {
                        this.showNotification('Transaction supprimée avec succès', 'success');
                        await this.refreshData();
                    } else {
                        this.showNotification(`Erreur: ${result.error}`, 'error');
                        return;
                    }
                } else {
                    // Fallback pour le développement web
                    this.data.transactions = this.data.transactions.filter(t => t.id !== id);
                    this.updateAccountBalances();
                    this.updateBudgetUsage();
                }
                
                this.loadTransactions();
                this.updateDashboard();
                
            } catch (error) {
                this.showNotification(`Erreur: ${error.message}`, 'error');
            }
        }
    }

    loadBudgets() {
        const container = document.getElementById('budgetsGrid');
        
        container.innerHTML = this.data.budgets.map(budget => {
            const percentage = (budget.utilise / budget.limite) * 100;
            const isOverBudget = percentage > 100;
            
            return `
                <div class="card budget-card">
                    <div class="card__body">
                        <div class="budget-header">
                            <div class="budget-category">${budget.categorie}</div>
                            <div class="budget-amount">
                                ${this.formatCurrency(budget.utilise)} / ${this.formatCurrency(budget.limite)}
                            </div>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill ${isOverBudget ? 'over-budget' : ''}" 
                                 style="width: ${Math.min(percentage, 100)}%"></div>
                        </div>
                        <div class="budget-status ${isOverBudget ? 'over-budget' : 'on-track'}">
                            ${isOverBudget ? 
                                `Dépassé de ${this.formatCurrency(budget.utilise - budget.limite)}` : 
                                `Reste ${this.formatCurrency(budget.limite - budget.utilise)}`
                            }
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    generateForecastChart() {
        const canvas = document.getElementById('forecastChart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        if (this.charts.forecast) {
            this.charts.forecast.destroy();
        }

        // Generate forecast data based on historical averages
        const months = [];
        const forecastData = [];
        const currentBalance = this.data.comptes.reduce((sum, compte) => sum + compte.solde, 0);

        // Calculate monthly averages
        const avgIncome = this.calculateAverageIncome();
        const avgExpenses = this.calculateAverageExpenses();
        const netAverage = avgIncome - avgExpenses;

        let runningBalance = currentBalance;

        for (let i = 0; i < 6; i++) {
            const date = new Date();
            date.setMonth(date.getMonth() + i + 1);
            months.push(date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }));

            runningBalance += netAverage;
            forecastData.push(runningBalance);
        }

        this.charts.forecast = new Chart(ctx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: 'Prévision de solde',
                    data: forecastData,
                    borderColor: '#1FB8CD',
                    backgroundColor: 'rgba(31, 184, 205, 0.1)',
                    fill: true,
                    tension: 0.4,
                    borderDash: [5, 5]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        ticks: {
                            callback: function(value) {
                                return value.toLocaleString('fr-FR', {
                                    style: 'currency',
                                    currency: 'EUR'
                                });
                            }
                        }
                    }
                }
            }
        });
    }

    updateForecastSummary() {
        const container = document.getElementById('forecastSummary');
        if (!container) {
            console.warn('Element forecastSummary introuvable');
            return;
        }
        const avgIncome = this.calculateAverageIncome();
        const avgExpenses = this.calculateAverageExpenses();
        const netAverage = avgIncome - avgExpenses;
        const currentBalance = this.data.comptes.reduce((sum, compte) => sum + compte.solde, 0);
        const futureBalance = currentBalance + (netAverage * 6);
        container.innerHTML = `
            <div class="card forecast-card">
                <div class="card__body">
                    <h4>Revenus moyens mensuels</h4>
                    <div class="forecast-value positive">${this.formatCurrency(avgIncome)}</div>
                </div>
            </div>
            <div class="card forecast-card">
                <div class="card__body">
                    <h4>Dépenses moyennes mensuelles</h4>
                    <div class="forecast-value negative">${this.formatCurrency(avgExpenses)}</div>
                </div>
            </div>
            <div class="card forecast-card">
                <div class="card__body">
                    <h4>Solde prévu dans 6 mois</h4>
                    <div class="forecast-value ${futureBalance > currentBalance ? 'positive' : 'negative'}">
                        ${this.formatCurrency(futureBalance)}
                    </div>
                </div>
            </div>
        `;
    }

    calculateAverageIncome() {
        const last3Months = this.getLastNMonths(3);
        const totalIncome = this.data.transactions
            .filter(t => t.type === 'revenu' && last3Months.includes(this.getMonthKey(t.date)))
            .reduce((sum, t) => sum + t.montant, 0);
        return totalIncome / 3;
    }

    calculateAverageExpenses() {
        const last3Months = this.getLastNMonths(3);
        const totalExpenses = this.data.transactions
            .filter(t => t.type === 'depense' && last3Months.includes(this.getMonthKey(t.date)))
            .reduce((sum, t) => sum + Math.abs(t.montant), 0);
        return totalExpenses / 3;
    }

    getLastNMonths(n) {
        const months = [];
        const now = new Date();
        for (let i = 0; i < n; i++) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            months.push(`${date.getFullYear()}-${date.getMonth()}`);
        }
        return months;
    }

    getMonthKey(dateString) {
        const date = new Date(dateString);
        return `${date.getFullYear()}-${date.getMonth()}`;
    }

    generateReportCharts() {
        this.generateMonthlyChart();
        this.generateCategoryChart();
    }

    generateMonthlyChart() {
        const canvas = document.getElementById('monthlyChart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        if (this.charts.monthly) {
            this.charts.monthly.destroy();
        }

        const last6Months = this.getLastNMonths(6);
        const monthlyData = last6Months.map(monthKey => {
            const income = this.data.transactions
                .filter(t => t.type === 'revenu' && this.getMonthKey(t.date) === monthKey)
                .reduce((sum, t) => sum + t.montant, 0);

            const expenses = this.data.transactions
                .filter(t => t.type === 'depense' && this.getMonthKey(t.date) === monthKey)
                .reduce((sum, t) => sum + Math.abs(t.montant), 0);

            const [year, month] = monthKey.split('-');
            const date = new Date(parseInt(year), parseInt(month));
            const label = date.toLocaleDateString('fr-FR', { month: 'short' });

            return { label, income, expenses };
        }).reverse();

        this.charts.monthly = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: monthlyData.map(d => d.label),
                datasets: [
                    {
                        label: 'Revenus',
                        data: monthlyData.map(d => d.income),
                        backgroundColor: '#22c55e'
                    },
                    {
                        label: 'Dépenses',
                        data: monthlyData.map(d => d.expenses),
                        backgroundColor: '#ef4444'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        ticks: {
                            callback: function(value) {
                                return value.toLocaleString('fr-FR', {
                                    style: 'currency',
                                    currency: 'EUR'
                                });
                            }
                        }
                    }
                }
            }
        });
    }

    generateCategoryChart() {
        const canvas = document.getElementById('categoryChart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        if (this.charts.category) {
            this.charts.category.destroy();
        }

        const categoryTotals = this.data.categories
            .filter(cat => cat.type === 'depense')
            .map(category => {
                const total = this.data.transactions
                    .filter(t => t.categorie === category.nom && t.type === 'depense')
                    .reduce((sum, t) => sum + Math.abs(t.montant), 0);
                return { name: category.nom, total, color: category.couleur };
            })
            .filter(cat => cat.total > 0)
            .sort((a, b) => b.total - a.total);

        this.charts.category = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: categoryTotals.map(c => c.name),
                datasets: [{
                    data: categoryTotals.map(c => c.total),
                    backgroundColor: categoryTotals.map(c => c.color),
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    loadAccounts() {
        const container = document.getElementById('accountsList');
        if (!container) {
            console.warn('Element accountsList introuvable');
            return;
        }
        container.innerHTML = this.data.comptes.map(compte => `
            <div class="account-item">
                <div class="account-info">
                    <div class="account-name">${compte.nom}</div>
                    <div class="account-balance">${this.formatCurrency(compte.solde)}</div>
                </div>
                <div class="account-type">${compte.type}</div>
            </div>
        `).join('');
    }

    loadCategories() {
        const container = document.getElementById('categoriesList');
        if (!container) {
            console.warn('Element categoriesList introuvable');
            return;
        }
        container.innerHTML = this.data.categories.map(category => `
            <div class="category-item">
                <div class="category-info">
                    <div class="category-name">${category.nom}</div>
                    <div class="category-type">${category.type === 'revenu' ? 'Revenu' : 'Dépense'}</div>
                </div>
                <div class="category-color" style="background-color: ${category.couleur}"></div>
            </div>
        `).join('');
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount);
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('fr-FR');
    }

    // Configuration des événements Electron
    setupElectronEvents() {
        if (window.electronAPI) {
            // Écouter les événements du menu
            window.electronAPI.onNewTransaction(() => {
                this.showTransactionModal();
            });
            
            window.electronAPI.onNewBudget(() => {
                this.showBudgetModal();
            });
            
            window.electronAPI.onOpenSettings(() => {
                this.showView('settings');
            });
            
            window.electronAPI.onDataImported(() => {
                this.refreshData();
            });
            
            // Afficher les informations de l'app dans la console
            window.electronAPI.getAppVersion().then(version => {
                console.log(`FinanceApp version ${version}`);
            });
        }
    }

    // Rafraîchir les données après import
    async refreshData() {
        if (window.electronAPI) {
            this.data = await window.electronAPI.getData();
            this.updateDashboard();
            this.loadTransactions();
            this.loadBudgets();
            this.loadAccounts();
            this.loadCategories();
            this.generateCharts();
        }
    }

    // Afficher une notification
    showNotification(message, type = 'info') {
        if (window.electronAPI) {
            window.electronAPI.showNotification(message, type);
        } else {
            // Fallback pour le développement web
            const notification = document.createElement('div');
            notification.className = `notification notification--${type}`;
            notification.textContent = message;
            
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 12px 20px;
                border-radius: 8px;
                color: white;
                font-weight: 500;
                z-index: 10000;
                animation: slideIn 0.3s ease-out;
            `;
            
            if (type === 'success') {
                notification.style.backgroundColor = '#22c55e';
            } else if (type === 'error') {
                notification.style.backgroundColor = '#ef4444';
            } else {
                notification.style.backgroundColor = '#3b82f6';
            }
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.animation = 'slideOut 0.3s ease-in';
                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 300);
            }, 3000);
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new FinancialApp();
});