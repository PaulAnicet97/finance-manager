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
        // Charger les données depuis SQLite via IPC
        this.data = {
            comptes: await window.api.getComptes(),
            categories: await window.api.getCategories(),
            transactions: await window.api.getTransactions(),
            budgets: await window.api.getBudgets(),
            settings: await window.api.getSettings()
        };
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
                    window.app.showView(view);
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

        // Settings buttons
        const addAccountBtn = document.getElementById('addAccountBtn');
        if (!addAccountBtn) {
            console.warn('Element addAccountBtn introuvable');
        } else {
            addAccountBtn.addEventListener('click', () => {
                this.showAccountModal();
            });
        }

        const addCategoryBtn = document.getElementById('addCategoryBtn');
        if (!addCategoryBtn) {
            console.warn('Element addCategoryBtn introuvable');
        } else {
            addCategoryBtn.addEventListener('click', () => {
                this.showCategoryModal();
            });
        }

        // Account modal
        const closeAccountModal = document.getElementById('closeAccountModal');
        if (!closeAccountModal) {
            console.warn('Element closeAccountModal introuvable');
        } else {
            closeAccountModal.addEventListener('click', () => {
                this.hideAccountModal();
            });
        }
        const cancelAccountModal = document.getElementById('cancelAccountModal');
        if (!cancelAccountModal) {
            console.warn('Element cancelAccountModal introuvable');
        } else {
            cancelAccountModal.addEventListener('click', () => {
                this.hideAccountModal();
            });
        }

        // Category modal
        const closeCategoryModal = document.getElementById('closeCategoryModal');
        if (!closeCategoryModal) {
            console.warn('Element closeCategoryModal introuvable');
        } else {
            closeCategoryModal.addEventListener('click', () => {
                this.hideCategoryModal();
            });
        }
        const cancelCategoryModal = document.getElementById('cancelCategoryModal');
        if (!cancelCategoryModal) {
            console.warn('Element cancelCategoryModal introuvable');
        } else {
            cancelCategoryModal.addEventListener('click', () => {
                this.hideCategoryModal();
            });
        }

        // Settings forms
        const accountForm = document.getElementById('accountForm');
        if (!accountForm) {
            console.warn('Element accountForm introuvable');
        } else {
            accountForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveAccount();
            });
        }

        const categoryForm = document.getElementById('categoryForm');
        if (!categoryForm) {
            console.warn('Element categoryForm introuvable');
        } else {
            categoryForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveCategory();
            });
        }

        const generalSettingsForm = document.getElementById('generalSettingsForm');
        if (!generalSettingsForm) {
            console.warn('Element generalSettingsForm introuvable');
        } else {
            generalSettingsForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveGeneralSettings();
            });
        }

        // Data management buttons
        const exportDataBtn = document.getElementById('exportDataBtn');
        if (!exportDataBtn) {
            console.warn('Element exportDataBtn introuvable');
        } else {
            exportDataBtn.addEventListener('click', () => {
                this.exportData();
            });
        }

        const importDataBtn = document.getElementById('importDataBtn');
        if (!importDataBtn) {
            console.warn('Element importDataBtn introuvable');
        } else {
            importDataBtn.addEventListener('click', () => {
                this.importData();
            });
        }

        const resetDataBtn = document.getElementById('resetDataBtn');
        if (!resetDataBtn) {
            console.warn('Element resetDataBtn introuvable');
        } else {
            resetDataBtn.addEventListener('click', () => {
                this.resetData();
            });
        }

        // Reset filters button
        const resetBtn = document.getElementById('resetFiltersBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', (e) => {
                e.preventDefault();
                document.getElementById('filterCategory').value = '';
                document.getElementById('filterType').value = '';
                document.getElementById('filterAccount').value = '';
                this.loadTransactions();
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
        let targetView = document.getElementById(viewName);
        if (!targetView) {
            console.warn('Element view ' + viewName + ' introuvable. Affichage du dashboard par défaut.');
            this.showNotification(`Vue "${viewName}" introuvable. Retour au tableau de bord.`, 'error');
            targetView = document.getElementById('dashboard');
            if (!targetView) {
                console.error('Vue dashboard introuvable !');
                return;
            }
            viewName = 'dashboard';
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
                this.loadForecastsPage();
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

        // Vérification : au moins une vue doit être active
        const activeViews = document.querySelectorAll('.view.active');
        if (activeViews.length === 0) {
            console.error('Aucune vue active après navigation !');
        }
    }

    // Nouvelle logique Prévisions
    loadForecastsPage() {
        this.renderUpcomingFixedExpenses();
        this.renderEstimatedVariableExpenses();
        this.renderSavingsForecast();
        this.renderGlobalForecastChart();
    }

    renderUpcomingFixedExpenses() {
        const container = document.querySelector('#upcomingFixedExpenses ul');
        const empty = document.querySelector('#upcomingFixedExpenses .empty-state');
        // Dépenses fixes = transactions récurrentes ou catégories fixes (ex: Logement, Assurance)
        const fixedCategories = ['Logement', 'Assurance'];
        const now = new Date();
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const items = this.data.transactions.filter(t =>
            fixedCategories.includes(t.categorie) &&
            t.type === 'depense' &&
            new Date(t.date) >= now && new Date(t.date) < new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 1)
        );
        if (items.length === 0) {
            container.innerHTML = '';
            empty.style.display = '';
        } else {
            empty.style.display = 'none';
            container.innerHTML = items.map(t => `
                <li><span class="forecast-label">${t.categorie}</span><span class="forecast-amount negative">${this.formatCurrency(Math.abs(t.montant))}</span></li>
            `).join('');
        }
    }

    renderEstimatedVariableExpenses() {
        const container = document.querySelector('#estimatedVariableExpenses ul');
        const empty = document.querySelector('#estimatedVariableExpenses .empty-state');
        // Variables = toutes les autres dépenses (hors fixes)
        const fixedCategories = ['Logement', 'Assurance'];
        const now = new Date();
        const last3Months = this.getLastNMonths(3);
        const variableCategories = this.data.categories.filter(c => c.type === 'depense' && !fixedCategories.includes(c.nom));
        const estimates = variableCategories.map(cat => {
            const total = this.data.transactions.filter(t =>
                t.categorie === cat.nom &&
                t.type === 'depense' &&
                last3Months.includes(this.getMonthKey(t.date))
            ).reduce((sum, t) => sum + Math.abs(t.montant), 0);
            return {
                nom: cat.nom,
                moyenne: total / 3
            };
        }).filter(e => e.moyenne > 0);
        if (estimates.length === 0) {
            container.innerHTML = '';
            empty.style.display = '';
        } else {
            empty.style.display = 'none';
            container.innerHTML = estimates.map(e => `
                <li><span class="forecast-label">${e.nom}</span><span class="forecast-amount negative">${this.formatCurrency(e.moyenne)}</span></li>
            `).join('');
        }
    }

    renderSavingsForecast() {
        const container = document.querySelector('#savingsForecast ul');
        const empty = document.querySelector('#savingsForecast .empty-state');
        // Taux d'épargne = (revenus - dépenses) / revenus sur 3 mois
        const last3Months = this.getLastNMonths(3);
        const totalIncome = this.data.transactions.filter(t => t.type === 'revenu' && last3Months.includes(this.getMonthKey(t.date))).reduce((sum, t) => sum + t.montant, 0);
        const totalExpenses = this.data.transactions.filter(t => t.type === 'depense' && last3Months.includes(this.getMonthKey(t.date))).reduce((sum, t) => sum + Math.abs(t.montant), 0);
        const savings = totalIncome - totalExpenses;
        const savingsRate = totalIncome > 0 ? (savings / totalIncome) : 0;
        const avgSavings = savings / 3;
        if (avgSavings <= 0) {
            container.innerHTML = '';
            empty.style.display = '';
        } else {
            empty.style.display = 'none';
            container.innerHTML = `
                <li><span class="forecast-label">Taux d'épargne</span><span class="forecast-amount positive">${(savingsRate*100).toFixed(1)}%</span></li>
                <li><span class="forecast-label">Épargne mensuelle estimée</span><span class="forecast-amount positive">${this.formatCurrency(avgSavings)}</span></li>
            `;
        }
    }

    renderGlobalForecastChart() {
        const canvas = document.getElementById('forecastGlobalChart');
        const empty = canvas.parentElement.querySelector('.empty-state');
        if (!canvas) return;
        if (this.charts.forecastGlobal) this.charts.forecastGlobal.destroy();
        // Projection sur 6 mois
        let currentBalance = this.data.comptes.reduce((sum, c) => sum + c.solde, 0);
        const avgIncome = this.calculateAverageIncome();
        const avgExpenses = this.calculateAverageExpenses();
        const netAverage = avgIncome - avgExpenses;
        const months = [];
        const forecastData = [];
        let runningBalance = currentBalance;
        for (let i = 0; i < 6; i++) {
            const date = new Date();
            date.setMonth(date.getMonth() + i + 1);
            const label = date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
            months.push(label);
            runningBalance += netAverage;
            forecastData.push(runningBalance);
        }
        if (forecastData.every(v => v === currentBalance)) {
            empty.style.display = '';
        } else {
            empty.style.display = 'none';
        }
        this.charts.forecastGlobal = new Chart(canvas.getContext('2d'), {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: 'Projection de solde',
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
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        ticks: {
                            callback: value => value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
                        }
                    }
                }
            }
        });
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
            if (this.editingTransactionId) {
                await window.api.updateTransaction(transaction);
            } else {
                await window.api.addTransaction(transaction);
            }
            await this.refreshData();
            this.hideTransactionModal();
            this.showNotification('Transaction mise à jour avec succès', 'success');
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
            if (this.editingBudgetId) {
                await window.api.updateBudget({ categorie, limite });
            } else {
                await window.api.addBudget({ categorie, limite });
            }
            await this.refreshData();
            this.hideBudgetModal();
            this.showNotification('Budget mis à jour avec succès', 'success');
        } catch (error) {
            this.showNotification(`Erreur: ${error.message}`, 'error');
        }
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

        // Calculer les tendances (comparaison avec le mois précédent)
        const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

        const previousIncome = this.data.transactions
            .filter(t => {
                const date = new Date(t.date);
                return t.type === 'revenu' &&
                       date.getMonth() === previousMonth &&
                       date.getFullYear() === previousYear;
            })
            .reduce((sum, t) => sum + t.montant, 0);

        const previousExpenses = this.data.transactions
            .filter(t => {
                const date = new Date(t.date);
                return t.type === 'depense' &&
                       date.getMonth() === previousMonth &&
                       date.getFullYear() === previousYear;
            })
            .reduce((sum, t) => sum + Math.abs(t.montant), 0);

        // Calculer les variations en pourcentage
        const incomeChange = previousIncome > 0 ? ((monthlyIncome - previousIncome) / previousIncome) * 100 : 0;
        const expenseChange = previousExpenses > 0 ? ((monthlyExpenses - previousExpenses) / previousExpenses) * 100 : 0;

        const monthlyIncomeEl = document.getElementById('monthlyIncome');
        if (!monthlyIncomeEl) {
            console.warn('Element monthlyIncome introuvable');
        } else {
            const trendIcon = incomeChange > 0 ? '↗️' : incomeChange < 0 ? '↘️' : '→';
            const trendClass = incomeChange > 0 ? 'positive' : incomeChange < 0 ? 'negative' : '';
            monthlyIncomeEl.innerHTML = `
                <span class="summary-amount income">+ ${this.formatCurrency(monthlyIncome)}</span>
                <span class="trend ${trendClass}">${trendIcon} ${Math.abs(incomeChange).toFixed(1)}%</span>
            `;
        }

        const monthlyExpensesEl = document.getElementById('monthlyExpenses');
        if (!monthlyExpensesEl) {
            console.warn('Element monthlyExpenses introuvable');
        } else {
            const trendIcon = expenseChange < 0 ? '↗️' : expenseChange > 0 ? '↘️' : '→';
            const trendClass = expenseChange < 0 ? 'positive' : expenseChange > 0 ? 'negative' : '';
            monthlyExpensesEl.innerHTML = `
                <span class="summary-amount expense">- ${this.formatCurrency(monthlyExpenses)}</span>
                <span class="trend ${trendClass}">${trendIcon} ${Math.abs(expenseChange).toFixed(1)}%</span>
            `;
        }

        // Ajouter un indicateur de solde net du mois
        const netIncome = monthlyIncome - monthlyExpenses;
        const netIncomeEl = document.getElementById('netIncome');
        if (netIncomeEl) {
            const netClass = netIncome >= 0 ? 'positive' : 'negative';
            const netIcon = netIncome >= 0 ? '💰' : '💸';
            netIncomeEl.innerHTML = `
                <span class="summary-amount ${netClass}">${netIncome >= 0 ? '+' : ''}${this.formatCurrency(netIncome)}</span>
                <span class="trend">${netIcon}</span>
            `;
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

        // Vérifier s'il y a des données
        if (labels.length === 0) {
            // Afficher un message "Aucune donnée"
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#94a3b8';
            ctx.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Aucune dépense enregistrée', canvas.width / 2, canvas.height / 2 - 10);
            ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            ctx.fillText('Ajoutez des transactions pour voir les graphiques', canvas.width / 2, canvas.height / 2 + 10);
            return;
        }

        this.charts.expensePie = new Chart(ctx, {
            type: 'doughnut',
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
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            padding: 15
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return `${context.label}: ${this.formatCurrency(context.parsed)} (${percentage}%)`;
                            }
                        }
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

        // Calcul du solde initial
        let initialBalance = 0;
        if (this.data.comptes && Array.isArray(this.data.comptes)) {
            initialBalance = this.data.comptes.reduce((sum, compte) => {
                const solde = typeof compte.solde === 'number' ? compte.solde : parseFloat(compte.solde) || 0;
                return sum + solde;
            }, 0);
        }

        // Générer les 6 derniers mois
        const months = [];
        const balances = [];
        let runningBalance = initialBalance;
        const now = new Date();

        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
            const monthName = date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
            months.push(monthName);

            // Transactions du mois
            const monthTransactions = this.data.transactions.filter(t => this.getMonthKey(t.date) === monthKey);
            const monthSum = monthTransactions.reduce((sum, t) => sum + t.montant, 0);

            runningBalance += monthSum;
            balances.push(runningBalance);
        }

        // Vérifier s'il y a des données
        if (this.data.transactions.length === 0) {
            // Afficher un message "Aucune donnée"
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#94a3b8';
            ctx.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Aucune transaction enregistrée', canvas.width / 2, canvas.height / 2 - 10);
            ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            ctx.fillText('Ajoutez des transactions pour voir l\'évolution', canvas.width / 2, canvas.height / 2 + 10);
            return;
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
                    tension: 0.4,
                    pointBackgroundColor: '#1FB8CD',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: false,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            callback: function(value) {
                                return value.toLocaleString('fr-FR', {
                                    style: 'currency',
                                    currency: 'EUR',
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0
                                });
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                return `Solde: ${this.formatCurrency(context.parsed.y)}`;
                            }
                        }
                    }
                }
            }
        });
    }

    generateForecastChart() {
        const canvas = document.getElementById('forecastChart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        if (this.charts.forecast) {
            this.charts.forecast.destroy();
        }

        // Calcul du solde actuel à partir des comptes
        let currentBalance = 0;
        if (this.data.comptes && Array.isArray(this.data.comptes)) {
            currentBalance = this.data.comptes.reduce((sum, compte) => {
                // S'assurer que le solde est bien un nombre
                const solde = typeof compte.solde === 'number' ? compte.solde : parseFloat(compte.solde) || 0;
                return sum + solde;
            }, 0);
        }

        // Moyenne revenus/dépenses sur les 3 derniers mois
        const avgIncome = this.calculateAverageIncome();
        const avgExpenses = this.calculateAverageExpenses();
        const netAverage = avgIncome - avgExpenses;

        // Prévision sur 6 mois
        const months = [];
        const forecastData = [];
        let runningBalance = currentBalance;
        const forecastDetails = [];

        for (let i = 0; i < 6; i++) {
            const date = new Date();
            date.setMonth(date.getMonth() + i + 1);
            const label = date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
            months.push(label);

            runningBalance += netAverage;
            forecastData.push(runningBalance);

            forecastDetails.push({
                label,
                balance: runningBalance
            });
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

        // Affichage du détail sous le graphique
        const detailsContainer = document.getElementById('forecastDetails');
        if (detailsContainer) {
            detailsContainer.innerHTML = forecastDetails.map(item => `
                <div class="forecast-detail-row">
                    <span>${item.label}</span>
                    <span class="${item.balance < 0 ? 'negative' : 'positive'}">
                        ${this.formatCurrency(item.balance)}
                    </span>
                </div>
            `).join('');
        }
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
        
        // Vérifier si on est dans la page paramètres
        const isSettingsView = this.currentView === 'settings';
        
        container.innerHTML = this.data.comptes.map(compte => `
            <div class="account-item">
                <div class="account-info">
                    <div class="account-name">${compte.nom}</div>
                    <div class="account-balance">${this.formatCurrency(compte.solde)}</div>
                </div>
                <div class="account-type">${compte.type}</div>
                ${isSettingsView ? `
                    <div class="account-actions">
                        <button class="btn btn--small btn--secondary" onclick="window.app.showAccountModal(${JSON.stringify(compte).replace(/"/g, '&quot;')})">
                            ✏️
                        </button>
                        <button class="btn btn--small btn--danger" onclick="window.app.deleteAccount(${compte.id})">
                            🗑️
                        </button>
                    </div>
                ` : ''}
            </div>
        `).join('');
    }

    loadCategories() {
        const container = document.getElementById('categoriesList');
        if (!container) {
            console.warn('Element categoriesList introuvable');
            return;
        }
        
        // Vérifier si on est dans la page paramètres
        const isSettingsView = this.currentView === 'settings';
        
        container.innerHTML = this.data.categories.map(category => `
            <div class="category-item">
                <div class="category-info">
                    <div class="category-name">${category.nom}</div>
                    <div class="category-type">${category.type === 'revenu' ? 'Revenu' : 'Dépense'}</div>
                </div>
                <div class="category-color" style="background-color: ${category.couleur}"></div>
                ${isSettingsView ? `
                    <div class="category-actions">
                        <button class="btn btn--small btn--secondary" onclick="window.app.showCategoryModal(${JSON.stringify(category).replace(/"/g, '&quot;')})">
                            ✏️
                        </button>
                        <button class="btn btn--small btn--danger" onclick="window.app.deleteCategory(${category.id})">
                            🗑️
                        </button>
                    </div>
                ` : ''}
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
            
            // Écouter les notifications envoyées par le main process
            if (window.electron && window.electron.ipcRenderer) {
                window.electron.ipcRenderer.on('show-app-notification', (event, message, type = 'info', duration = 3000) => {
                    this.showNotification(message, type, duration, true);
                });
            }
            // Afficher les informations de l'app dans la console
            window.electronAPI.getAppVersion().then(version => {
                console.log(`FinanceApp version ${version}`);
            });
        }
    }

    // Rafraîchir les données après import
    async refreshData() {
        this.data = {
            comptes: await window.api.getComptes(),
            categories: await window.api.getCategories(),
            transactions: await window.api.getTransactions(),
            budgets: await window.api.getBudgets(),
            settings: await window.api.getSettings()
        };
        this.updateDashboard();
        this.loadTransactions();
        this.loadBudgets();
        this.loadAccounts();
        this.loadCategories();
        this.generateCharts();
    }

    // Afficher une notification
    showNotification(message, type = 'info', duration = 3000, fromIPC = false) {
        if (window.electronAPI && !fromIPC) {
            window.electronAPI.showNotification(message, type);
        } else {
            // Fallback pour le développement web ou notification IPC
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
            } else if (type === 'warning') {
                notification.style.backgroundColor = '#f59e0b';
            } else {
                notification.style.backgroundColor = '#3b82f6';
            }
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.animation = 'slideOut 0.3s ease-in';
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        document.body.removeChild(notification);
                    }
                }, 300);
            }, duration);
        }
    }

    // Gestion des comptes
    showAccountModal(account = null) {
        const modal = document.getElementById('accountModal');
        const title = document.getElementById('accountModalTitle');
        const form = document.getElementById('accountForm');
        
        if (!modal || !title || !form) {
            console.warn('Éléments de la modale compte introuvables');
            return;
        }

        if (account) {
            title.textContent = 'Modifier le compte';
            this.editingAccountId = account.id;
            
            const nameEl = document.getElementById('accountName');
            const typeEl = document.getElementById('accountType');
            const balanceEl = document.getElementById('accountBalance');
            
            if (nameEl && typeEl && balanceEl) {
                nameEl.value = account.nom;
                typeEl.value = account.type;
                balanceEl.value = account.solde;
            }
        } else {
            title.textContent = 'Nouveau compte';
            this.editingAccountId = null;
            form.reset();
        }

        modal.style.display = 'block';
    }

    hideAccountModal() {
        const modal = document.getElementById('accountModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    async saveAccount() {
        const nameEl = document.getElementById('accountName');
        const typeEl = document.getElementById('accountType');
        const balanceEl = document.getElementById('accountBalance');
        
        if (!nameEl || !typeEl || !balanceEl) {
            console.warn('Champs du formulaire compte introuvables');
            return;
        }

        const account = {
            nom: nameEl.value,
            type: typeEl.value,
            solde: parseFloat(balanceEl.value)
        };

        try {
            if (this.editingAccountId) {
                await window.api.updateCompte(account);
            } else {
                await window.api.addCompte(account);
            }
            await this.refreshData();
            this.hideAccountModal();
            this.showNotification('Compte mis à jour avec succès', 'success');
        } catch (error) {
            this.showNotification(`Erreur: ${error.message}`, 'error');
        }
    }

    // Gestion des catégories
    showCategoryModal(category = null) {
        const modal = document.getElementById('categoryModal');
        const title = document.getElementById('categoryModalTitle');
        const form = document.getElementById('categoryForm');
        
        if (!modal || !title || !form) {
            console.warn('Éléments de la modale catégorie introuvables');
            return;
        }

        if (category) {
            title.textContent = 'Modifier la catégorie';
            this.editingCategoryId = category.id;
            
            const nameEl = document.getElementById('categoryName');
            const typeEl = document.getElementById('categoryType');
            const colorEl = document.getElementById('categoryColor');
            
            if (nameEl && typeEl && colorEl) {
                nameEl.value = category.nom;
                typeEl.value = category.type;
                colorEl.value = category.couleur;
            }
        } else {
            title.textContent = 'Nouvelle catégorie';
            this.editingCategoryId = null;
            form.reset();
        }

        modal.style.display = 'block';
    }

    hideCategoryModal() {
        const modal = document.getElementById('categoryModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    async saveCategory() {
        const nameEl = document.getElementById('categoryName');
        const typeEl = document.getElementById('categoryType');
        const colorEl = document.getElementById('categoryColor');
        
        if (!nameEl || !typeEl || !colorEl) {
            console.warn('Champs du formulaire catégorie introuvables');
            return;
        }

        const category = {
            nom: nameEl.value,
            type: typeEl.value,
            couleur: colorEl.value
        };

        try {
            if (this.editingCategoryId) {
                await window.api.updateCategorie(category);
            } else {
                await window.api.addCategorie(category);
            }
            await this.refreshData();
            this.hideCategoryModal();
            this.showNotification('Catégorie mise à jour avec succès', 'success');
        } catch (error) {
            this.showNotification(`Erreur: ${error.message}`, 'error');
        }
    }

    // Paramètres généraux
    async saveGeneralSettings() {
        const currencyEl = document.getElementById('currencySetting');
        const languageEl = document.getElementById('languageSetting');
        const notificationsEl = document.getElementById('notificationsSetting');
        const autoBackupEl = document.getElementById('autoBackupSetting');
        const themeEl = document.getElementById('themeSetting');

        if (!currencyEl || !languageEl || !notificationsEl || !autoBackupEl || !themeEl) {
            console.warn('Champs des paramètres généraux introuvables');
            return;
        }

        const settings = {
            currency: currencyEl.value,
            language: languageEl.value,
            notifications: notificationsEl.checked,
            autoBackup: autoBackupEl.checked,
            theme: themeEl.value
        };

        try {
            for (const [key, value] of Object.entries(settings)) {
                await window.api.setSetting(key, value);
            }
            await this.refreshData();
            this.showNotification('Paramètres sauvegardés avec succès', 'success');
        } catch (error) {
            this.showNotification(`Erreur: ${error.message}`, 'error');
        }
    }

    // Import/Export des données
    async exportData() {
        try {
            if (window.electronAPI) {
                const result = await window.electronAPI.exportData();
                if (result.success) {
                    this.showNotification('Données exportées avec succès', 'success');
                } else {
                    this.showNotification(`Erreur: ${result.error}`, 'error');
                }
            } else {
                // Fallback pour le développement web
                const dataStr = JSON.stringify(this.data, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `finance-data-${new Date().toISOString().split('T')[0]}.json`;
                link.click();
                URL.revokeObjectURL(url);
                this.showNotification('Données exportées avec succès', 'success');
            }
        } catch (error) {
            this.showNotification(`Erreur: ${error.message}`, 'error');
        }
    }

    async importData() {
        try {
            if (window.electronAPI) {
                const result = await window.electronAPI.importData();
                if (result.success) {
                    this.showNotification('Données importées avec succès', 'success');
                    await this.refreshData();
                } else {
                    this.showNotification(`Erreur: ${result.error}`, 'error');
                }
            } else {
                // Fallback pour le développement web
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.json';
                input.onchange = (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            try {
                                const data = JSON.parse(e.target.result);
                                this.data = data;
                                this.updateDashboard();
                                this.loadTransactions();
                                this.loadBudgets();
                                this.loadAccounts();
                                this.loadCategories();
                                this.generateCharts();
                                this.showNotification('Données importées avec succès', 'success');
                            } catch (error) {
                                this.showNotification('Erreur lors du parsing du fichier', 'error');
                            }
                        };
                        reader.readAsText(file);
                    }
                };
                input.click();
            }
        } catch (error) {
            this.showNotification(`Erreur: ${error.message}`, 'error');
        }
    }

    async resetData() {
        if (confirm('Êtes-vous sûr de vouloir réinitialiser toutes les données ? Cette action est irréversible.')) {
            try {
                if (window.electronAPI) {
                    const result = await window.electronAPI.resetData();
                    if (result.success) {
                        this.showNotification('Données réinitialisées avec succès', 'success');
                        await this.refreshData();
                    } else {
                        this.showNotification(`Erreur: ${result.error}`, 'error');
                    }
                } else {
                    // Fallback pour le développement web
                    this.data = {
                        comptes: [],
                        categories: [],
                        transactions: [],
                        budgets: [],
                        settings: {
                            currency: "EUR",
                            language: "fr",
                            notifications: true,
                            autoBackup: true,
                            theme: "auto"
                        }
                    };
                    this.updateDashboard();
                    this.loadTransactions();
                    this.loadBudgets();
                    this.loadAccounts();
                    this.loadCategories();
                    this.generateCharts();
                    this.showNotification('Données réinitialisées avec succès', 'success');
                }
            } catch (error) {
                this.showNotification(`Erreur: ${error.message}`, 'error');
            }
        }
    }

    // Suppression des comptes et catégories
    async deleteAccount(accountId) {
        const account = this.data.comptes.find(c => c.id === accountId);
        if (!account) {
            this.showNotification('Compte introuvable', 'error');
            return;
        }

        // Vérifier s'il y a des transactions liées à ce compte
        const hasTransactions = this.data.transactions.some(t => t.compte === account.nom);
        if (hasTransactions) {
            this.showNotification('Impossible de supprimer un compte avec des transactions', 'error');
            return;
        }

        if (confirm(`Êtes-vous sûr de vouloir supprimer le compte "${account.nom}" ?`)) {
            try {
                await window.api.deleteCompte(accountId);
                await this.refreshData();
                this.showNotification('Compte supprimé avec succès', 'success');
            } catch (error) {
                this.showNotification(`Erreur: ${error.message}`, 'error');
            }
        }
    }

    async deleteCategory(categoryId) {
        const category = this.data.categories.find(c => c.id === categoryId);
        if (!category) {
            this.showNotification('Catégorie introuvable', 'error');
            return;
        }

        // Vérifier s'il y a des transactions liées à cette catégorie
        const hasTransactions = this.data.transactions.some(t => t.categorie === category.nom);
        if (hasTransactions) {
            this.showNotification('Impossible de supprimer une catégorie avec des transactions', 'error');
            return;
        }

        // Vérifier s'il y a des budgets liés à cette catégorie
        const hasBudgets = this.data.budgets.some(b => b.categorie === category.nom);
        if (hasBudgets) {
            this.showNotification('Impossible de supprimer une catégorie avec des budgets', 'error');
            return;
        }

        if (confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${category.nom}" ?`)) {
            try {
                await window.api.deleteCategorie(categoryId);
                await this.refreshData();
                this.showNotification('Catégorie supprimée avec succès', 'success');
            } catch (error) {
                this.showNotification(`Erreur: ${error.message}`, 'error');
            }
        }
    }

    loadRecentTransactions() {
        const container = document.getElementById('recentTransactions');
        if (!container) {
            console.warn('Element recentTransactions introuvable');
            return;
        }

        // Trier les transactions par date (plus récentes en premier)
        const recentTransactions = [...this.data.transactions]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5); // Limiter à 5 transactions

        if (recentTransactions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📝</div>
                    <p>Aucune transaction récente</p>
                    <button class="btn btn--primary" onclick="window.app.showTransactionModal()">
                        Ajouter votre première transaction
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = recentTransactions.map(transaction => {
            const isIncome = transaction.type === 'revenu';
            const amountClass = isIncome ? 'positive' : 'negative';
            const amountPrefix = isIncome ? '+' : '-';
            const category = this.data.categories.find(c => c.nom === transaction.categorie);
            const categoryColor = category ? category.couleur : '#94a3b8';
            
            return `
                <div class="transaction-item">
                    <div class="transaction-info">
                        <div class="transaction-category" style="background-color: ${categoryColor}">
                            ${transaction.categorie}
                        </div>
                        <div class="transaction-details">
                            <div class="transaction-description">${transaction.description}</div>
                            <div class="transaction-meta">
                                <span class="transaction-date">${this.formatDate(transaction.date)}</span>
                                <span class="transaction-account">${transaction.compte}</span>
                            </div>
                        </div>
                    </div>
                    <div class="transaction-amount ${amountClass}">
                        ${amountPrefix} ${this.formatCurrency(Math.abs(transaction.montant))}
                    </div>
                    <div class="transaction-actions">
                        <button class="btn btn--small btn--secondary" onclick="window.app.showTransactionModal(${JSON.stringify(transaction).replace(/"/g, '&quot;')})">
                            ✏️
                        </button>
                    </div>
                </div>
            `;
        }).join('') + `
            <div class="view-all-transactions">
                <button class="btn btn--secondary" onclick="window.app.showView('transactions')">
                    Voir toutes les transactions
                </button>
            </div>
        `;
    }

    showBudgetAlerts() {
        const container = document.getElementById('budgetAlerts');
        if (!container) {
            console.warn('Element budgetAlerts introuvable');
            return;
        }

        // Mettre à jour l'utilisation des budgets
        this.updateBudgetUsage();

        // Filtrer les budgets avec des alertes
        const alertBudgets = this.data.budgets.filter(budget => {
            const percentage = (budget.utilise / budget.limite) * 100;
            return percentage >= 80; // Alerte à partir de 80%
        });

        if (alertBudgets.length === 0) {
            container.innerHTML = `
                <div class="card budget-alert-card success">
                    <div class="card__body">
                        <div class="alert-content">
                            <div class="alert-icon">✅</div>
                            <div class="alert-text">
                                <h4>Tous vos budgets sont sous contrôle</h4>
                                <p>Aucune alerte de budget pour le moment</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            return;
        }

        container.innerHTML = alertBudgets.map(budget => {
            const percentage = (budget.utilise / budget.limite) * 100;
            const remaining = budget.limite - budget.utilise;
            const alertType = percentage >= 100 ? 'danger' : percentage >= 90 ? 'warning' : 'info';
            const alertIcon = percentage >= 100 ? '🚨' : percentage >= 90 ? '⚠️' : 'ℹ️';
            const alertTitle = percentage >= 100 ? 'Budget dépassé' : percentage >= 90 ? 'Budget critique' : 'Alerte budget';
            
            return `
                <div class="card budget-alert-card ${alertType}">
                    <div class="card__body">
                        <div class="alert-content">
                            <div class="alert-icon">${alertIcon}</div>
                            <div class="alert-text">
                                <h4>${alertTitle} - ${budget.categorie}</h4>
                                <p>${percentage.toFixed(1)}% utilisé (${this.formatCurrency(budget.utilise)}/${this.formatCurrency(budget.limite)})</p>
                                ${remaining > 0 ? `<p class="remaining">Il reste ${this.formatCurrency(remaining)}</p>` : ''}
                            </div>
                            <div class="alert-progress">
                                <div class="progress-bar">
                                    <div class="progress-fill ${alertType}" style="width: ${Math.min(percentage, 100)}%"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    loadTransactions() {
        const container = document.getElementById('transactionsTable');
        if (!container) {
            console.warn('Element transactionsTable introuvable');
            return;
        }

        // Récupérer les filtres
        const filterCategory = document.getElementById('filterCategory').value;
        const filterType = document.getElementById('filterType').value;
        const filterAccount = document.getElementById('filterAccount').value;

        // Filtrer les transactions
        let filtered = this.data.transactions;
        if (filterCategory) filtered = filtered.filter(t => t.categorie === filterCategory);
        if (filterType) filtered = filtered.filter(t => t.type === filterType);
        if (filterAccount) filtered = filtered.filter(t => t.compte === filterAccount);

        // Afficher ou cacher le bouton de réinitialisation
        const resetBtn = document.getElementById('resetFiltersBtn');
        if (resetBtn) {
            if (filterCategory || filterType || filterAccount) {
                resetBtn.style.display = '';
            } else {
                resetBtn.style.display = 'none';
            }
        }

        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📝</div>
                    <p>Aucune transaction trouvée</p>
                    <button class="btn btn--primary" onclick="window.app.showTransactionModal()">
                        Ajouter une transaction
                    </button>
                </div>
            `;
            return;
        }

        // Générer le tableau
        container.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Catégorie</th>
                        <th>Description</th>
                        <th>Date</th>
                        <th>Compte</th>
                        <th class="amount">Montant</th>
                        <th class="actions"></th>
                    </tr>
                </thead>
                <tbody>
                    ${filtered.map(transaction => {
                        const isIncome = transaction.type === 'revenu';
                        const amountClass = isIncome ? 'positive' : 'negative';
                        const badgeClass = isIncome ? 'badge income' : 'badge expense';
                        const category = this.data.categories.find(c => c.nom === transaction.categorie);
                        const categoryColor = category ? category.couleur : '#94a3b8';
                        return `
                            <tr>
                                <td><span class="${badgeClass}" style="background:${categoryColor}">${transaction.categorie}</span></td>
                                <td>${transaction.description}</td>
                                <td>${this.formatDate(transaction.date)}</td>
                                <td>${transaction.compte}</td>
                                <td class="amount ${amountClass}">${isIncome ? '+' : '-'} ${this.formatCurrency(Math.abs(transaction.montant))}</td>
                                <td class="actions">
                                    <button class="btn btn--small btn--secondary" onclick="window.app.showTransactionModal(${JSON.stringify(transaction).replace(/"/g, '&quot;')})">✏️</button>
                                    <button class="btn btn--small btn--danger" onclick="window.app.deleteTransaction(${transaction.id})">🗑️</button>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
    }

    async deleteTransaction(transactionId) {
        if (!confirm('Voulez-vous vraiment supprimer cette transaction ?')) return;
        try {
            await window.api.deleteTransaction(transactionId);
            await this.refreshData();
            this.showNotification('Transaction supprimée', 'success');
        } catch (error) {
            this.showNotification(`Erreur: ${error.message}`, 'error');
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    window.app = new FinancialApp();
});