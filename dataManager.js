let Store;

class DataManager {
    constructor() {
        this.observers = [];
        this.data = null;
        this.store = null;
        // Initialisation asynchrone du store
        this.ready = this.initStore();
    }

    async initStore() {
        // Import dynamique du module ES
        const mod = await import('electron-store');
        Store = mod.default;
        this.store = new Store({
            name: 'finance-data',
            defaults: {
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
            }
        });
        await this.loadData();
    }

    async ensureReady() {
        if (this.ready) await this.ready;
    }

    subscribe(callback) {
        this.observers.push(callback);
        return () => {
            this.observers = this.observers.filter(obs => obs !== callback);
        };
    }

    notify(data) {
        this.observers.forEach(callback => callback(data));
    }

    async loadData() {
        await this.ensureReady();
        this.data = {
            comptes: this.store.get('comptes'),
            categories: this.store.get('categories'),
            transactions: this.store.get('transactions'),
            budgets: this.store.get('budgets'),
            settings: this.store.get('settings')
        };
    }

    async saveData() {
        await this.ensureReady();
        if (!this.data) throw new Error('Les données ne sont pas encore chargées');
        this.store.set('comptes', this.data.comptes);
        this.store.set('categories', this.data.categories);
        this.store.set('transactions', this.data.transactions);
        this.store.set('budgets', this.data.budgets);
        this.store.set('settings', this.data.settings);
        this.notify(this.data);
    }

    validateTransaction(transaction) {
        const errors = [];
        if (!transaction.date) errors.push('Date requise');
        if (!transaction.montant || isNaN(transaction.montant)) errors.push('Montant invalide');
        if (!transaction.categorie) errors.push('Catégorie requise');
        if (!transaction.compte) errors.push('Compte requis');
        if (!transaction.description) errors.push('Description requise');
        return {
            isValid: errors.length === 0,
            errors
        };
    }

    validateBudget(budget) {
        const errors = [];
        if (!budget.categorie) errors.push('Catégorie requise');
        if (!budget.limite || isNaN(budget.limite) || budget.limite <= 0) {
            errors.push('Limite invalide');
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }

    async addTransaction(transaction) {
        await this.ensureReady();
        if (!this.data) throw new Error('Les données ne sont pas encore chargées');
        const validation = this.validateTransaction(transaction);
        if (!validation.isValid) {
            throw new Error(`Validation échouée: ${validation.errors.join(', ')}`);
        }
        transaction.id = this.getNextId('transactions');
        transaction.date = new Date(transaction.date).toISOString().split('T')[0];
        this.data.transactions.push(transaction);
        this.updateAccountBalance(transaction);
        this.updateBudgetUsage(transaction);
        await this.saveData();
        return transaction;
    }

    async updateTransaction(id, updates) {
        await this.ensureReady();
        if (!this.data) throw new Error('Les données ne sont pas encore chargées');
        const index = this.data.transactions.findIndex(t => t.id === id);
        if (index === -1) throw new Error('Transaction non trouvée');
        const oldTransaction = this.data.transactions[index];
        const newTransaction = { ...oldTransaction, ...updates };
        const validation = this.validateTransaction(newTransaction);
        if (!validation.isValid) {
            throw new Error(`Validation échouée: ${validation.errors.join(', ')}`);
        }
        this.updateAccountBalance(oldTransaction, true);
        this.updateBudgetUsage(oldTransaction, true);
        this.data.transactions[index] = newTransaction;
        this.updateAccountBalance(newTransaction);
        this.updateBudgetUsage(newTransaction);
        await this.saveData();
        return newTransaction;
    }

    async deleteTransaction(id) {
        await this.ensureReady();
        if (!this.data) throw new Error('Les données ne sont pas encore chargées');
        const index = this.data.transactions.findIndex(t => t.id === id);
        if (index === -1) throw new Error('Transaction non trouvée');
        const transaction = this.data.transactions[index];
        this.data.transactions.splice(index, 1);
        this.updateAccountBalance(transaction, true);
        this.updateBudgetUsage(transaction, true);
        await this.saveData();
    }

    async addAccount(account) {
        await this.ensureReady();
        if (!this.data) throw new Error('Les données ne sont pas encore chargées');
        account.id = this.getNextId('comptes');
        this.data.comptes.push(account);
        await this.saveData();
        return account;
    }

    async updateAccount(id, updates) {
        await this.ensureReady();
        if (!this.data) throw new Error('Les données ne sont pas encore chargées');
        const index = this.data.comptes.findIndex(c => c.id === id);
        if (index === -1) throw new Error('Compte non trouvé');
        this.data.comptes[index] = { ...this.data.comptes[index], ...updates };
        await this.saveData();
        return this.data.comptes[index];
    }

    async deleteAccount(id) {
        await this.ensureReady();
        if (!this.data) throw new Error('Les données ne sont pas encore chargées');
        const index = this.data.comptes.findIndex(c => c.id === id);
        if (index === -1) throw new Error('Compte non trouvé');
        const hasTransactions = this.data.transactions.some(t => t.compte === this.data.comptes[index].nom);
        if (hasTransactions) {
            throw new Error('Impossible de supprimer un compte avec des transactions');
        }
        this.data.comptes.splice(index, 1);
        await this.saveData();
    }

    async addCategory(category) {
        await this.ensureReady();
        if (!this.data) throw new Error('Les données ne sont pas encore chargées');
        category.id = this.getNextId('categories');
        this.data.categories.push(category);
        await this.saveData();
        return category;
    }

    async updateCategory(id, updates) {
        await this.ensureReady();
        if (!this.data) throw new Error('Les données ne sont pas encore chargées');
        const index = this.data.categories.findIndex(c => c.id === id);
        if (index === -1) throw new Error('Catégorie non trouvée');
        this.data.categories[index] = { ...this.data.categories[index], ...updates };
        await this.saveData();
        return this.data.categories[index];
    }

    async deleteCategory(id) {
        await this.ensureReady();
        if (!this.data) throw new Error('Les données ne sont pas encore chargées');
        const index = this.data.categories.findIndex(c => c.id === id);
        if (index === -1) throw new Error('Catégorie non trouvée');
        const hasTransactions = this.data.transactions.some(t => t.categorie === this.data.categories[index].nom);
        if (hasTransactions) {
            throw new Error('Impossible de supprimer une catégorie avec des transactions');
        }
        this.data.categories.splice(index, 1);
        await this.saveData();
    }

    async addBudget(budget) {
        await this.ensureReady();
        if (!this.data) throw new Error('Les données ne sont pas encore chargées');
        const validation = this.validateBudget(budget);
        if (!validation.isValid) {
            throw new Error(`Validation échouée: ${validation.errors.join(', ')}`);
        }
        budget.utilise = this.calculateCategoryUsage(budget.categorie);
        this.data.budgets.push(budget);
        await this.saveData();
        return budget;
    }

    async updateBudget(categorie, updates) {
        await this.ensureReady();
        if (!this.data) throw new Error('Les données ne sont pas encore chargées');
        const index = this.data.budgets.findIndex(b => b.categorie === categorie);
        if (index === -1) throw new Error('Budget non trouvé');
        this.data.budgets[index] = { ...this.data.budgets[index], ...updates };
        await this.saveData();
        return this.data.budgets[index];
    }

    async deleteBudget(categorie) {
        await this.ensureReady();
        if (!this.data) throw new Error('Les données ne sont pas encore chargées');
        const index = this.data.budgets.findIndex(b => b.categorie === categorie);
        if (index === -1) throw new Error('Budget non trouvé');
        this.data.budgets.splice(index, 1);
        await this.saveData();
    }

    getNextId(type) {
        if (!this.data) throw new Error('Les données ne sont pas encore chargées');
        const items = this.data[type];
        return items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : 1;
    }

    updateAccountBalance(transaction, reverse = false) {
        if (!this.data) throw new Error('Les données ne sont pas encore chargées');
        const compte = this.data.comptes.find(c => c.nom === transaction.compte);
        if (!compte) console.warn(`Compte "${transaction.compte}" introuvable`);
        else {
            const multiplier = reverse ? -1 : 1;
            compte.solde += transaction.montant * multiplier;
        }
    }

    updateBudgetUsage(transaction, reverse = false) {
        if (!this.data) throw new Error('Les données ne sont pas encore chargées');
        const budget = this.data.budgets.find(b => b.categorie === transaction.categorie);
        if (!budget) console.warn(`Budget pour "${transaction.categorie}" introuvable`);
        else if (transaction.type === 'depense') {
            const multiplier = reverse ? 1 : -1;
            budget.utilise += Math.abs(transaction.montant) * multiplier;
        }
    }

    calculateCategoryUsage(categorie) {
        if (!this.data) throw new Error('Les données ne sont pas encore chargées');
        return this.data.transactions
            .filter(t => t.categorie === categorie && t.type === 'depense')
            .reduce((sum, t) => sum + Math.abs(t.montant), 0);
    }

    getTotalBalance() {
        if (!this.data) throw new Error('Les données ne sont pas encore chargées');
        return this.data.comptes.reduce((sum, compte) => sum + compte.solde, 0);
    }

    getMonthlyIncome() {
        if (!this.data) throw new Error('Les données ne sont pas encore chargées');
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        return this.data.transactions
            .filter(t => {
                const date = new Date(t.date);
                return date.getMonth() === currentMonth && 
                       date.getFullYear() === currentYear && 
                       t.type === 'revenu';
            })
            .reduce((sum, t) => sum + t.montant, 0);
    }

    getMonthlyExpenses() {
        if (!this.data) throw new Error('Les données ne sont pas encore chargées');
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        return this.data.transactions
            .filter(t => {
                const date = new Date(t.date);
                return date.getMonth() === currentMonth && 
                       date.getFullYear() === currentYear && 
                       t.type === 'depense';
            })
            .reduce((sum, t) => sum + Math.abs(t.montant), 0);
    }

    exportData() {
        if (!this.data) throw new Error('Les données ne sont pas encore chargées');
        return JSON.stringify(this.data, null, 2);
    }

    async importData(jsonData) {
        await this.ensureReady();
        if (!this.data) throw new Error('Les données ne sont pas encore chargées');
        try {
            const importedData = JSON.parse(jsonData);
            const requiredKeys = ['comptes', 'categories', 'transactions', 'budgets', 'settings'];
            for (const key of requiredKeys) {
                if (!(key in importedData)) {
                    throw new Error(`Clé manquante dans les données importées : ${key}`);
                }
            }
            this.data = { ...this.data, ...importedData };
            await this.saveData();
            return true;
        } catch (error) {
            throw new Error('Format de données invalide');
        }
    }

    async enableAutoBackup() {
        await this.ensureReady();
        if (!this.data) throw new Error('Les données ne sont pas encore chargées');
        this.data.settings.autoBackup = true;
        await this.saveData();
    }

    async disableAutoBackup() {
        await this.ensureReady();
        if (!this.data) throw new Error('Les données ne sont pas encore chargées');
        this.data.settings.autoBackup = false;
        await this.saveData();
    }
}

// Export unique
module.exports = DataManager; 