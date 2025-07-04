const { Notification } = require('electron');

class NotificationManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.notifications = [];
        this.settings = dataManager.data ? dataManager.data.settings : {};
        
        // S'abonner aux changements de données
        this.dataManager.subscribe(() => {
            this.checkBudgetAlerts();
        });
    }

    // Notification système
    showSystemNotification(title, body, options = {}) {
        if (!this.settings || !this.settings.notifications) return;

        const notification = new Notification({
            title,
            body,
            icon: options.icon || 'assets/icon.png',
            silent: options.silent || false,
            timeoutType: options.timeoutType || 'default'
        });

        notification.show();
        return notification;
    }

    // Notification dans l'app (supprimée du main process)
    // showAppNotification(message, type = 'info', duration = 3000) {
    //     ...
    // }

    // Vérifier les alertes de budget
    checkBudgetAlerts() {
        if (!this.dataManager.data || !Array.isArray(this.dataManager.data.budgets)) return;
        const budgets = this.dataManager.data.budgets;
        
        budgets.forEach(budget => {
            if (!budget || typeof budget.utilise !== 'number' || typeof budget.limite !== 'number') return;
            const percentage = (budget.utilise / budget.limite) * 100;
            
            // Alerte à 80% du budget
            if (percentage >= 80 && percentage < 100) {
                this.showBudgetWarning(budget, percentage);
            }
            
            // Alerte à 100% du budget
            if (percentage >= 100) {
                this.showBudgetExceeded(budget, percentage);
            }
        });
    }

    // Alerte de dépassement de budget
    showBudgetWarning(budget, percentage) {
        const message = `Budget ${budget.categorie} : ${percentage.toFixed(1)}% utilisé (${this.formatCurrency(budget.utilise)}/${this.formatCurrency(budget.limite)})`;
        this.showSystemNotification(
            '⚠️ Alerte Budget',
            message,
            { timeoutType: 'never' }
        );
        if (this.sendToRenderer) {
            this.sendToRenderer('show-app-notification', message, 'warning', 5000);
        }
    }

    // Alerte de dépassement de budget
    showBudgetExceeded(budget, percentage) {
        const message = `Budget ${budget.categorie} dépassé ! ${percentage.toFixed(1)}% utilisé (${this.formatCurrency(budget.utilise)}/${this.formatCurrency(budget.limite)})`;
        
        this.showSystemNotification(
            '🚨 Budget Dépassé',
            message,
            { timeoutType: 'never' }
        );
        
        if (this.sendToRenderer) {
            this.sendToRenderer('show-app-notification', message, 'error', 8000);
        }
    }

    // Notification de transaction ajoutée
    showTransactionAdded(transaction) {
        const type = transaction.type === 'revenu' ? '💰 Revenu ajouté' : '💸 Dépense ajoutée';
        const message = `${transaction.description} : ${this.formatCurrency(transaction.montant)}`;
        
        this.showSystemNotification(type, message);
        if (this.sendToRenderer) {
            this.sendToRenderer('show-app-notification', message, 'success');
        }
    }

    // Notification de transaction supprimée
    showTransactionDeleted(transaction) {
        const message = `Transaction supprimée : ${transaction.description}`;
        if (this.sendToRenderer) {
            this.sendToRenderer('show-app-notification', message, 'info');
        }
    }

    // Notification de solde faible
    checkLowBalance() {
        if (!this.dataManager.data || !Array.isArray(this.dataManager.data.comptes)) return;
        const comptes = this.dataManager.data.comptes;
        
        comptes.forEach(compte => {
            if (!compte || typeof compte.solde !== 'number' || !compte.type || !compte.nom) return;
            if (compte.solde < 100 && compte.type === 'courant') {
                this.showSystemNotification(
                    '⚠️ Solde Faible',
                    `Compte ${compte.nom} : ${this.formatCurrency(compte.solde)}`,
                    { timeoutType: 'never' }
                );
            }
        });
    }

    // Notification de revenus récurrents
    checkRecurringIncome() {
        const today = new Date();
        const dayOfMonth = today.getDate();
        
        // Vérifier les salaires mensuels (généralement versés le 1er ou le 15)
        if (dayOfMonth === 1 || dayOfMonth === 15) {
            this.showSystemNotification(
                '📅 Rappel',
                'Vérifiez vos revenus récurrents (salaire, etc.)',
                { timeoutType: 'default' }
        );
        }
    }

    // Notification de factures à venir
    checkUpcomingBills() {
        const today = new Date();
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        const daysUntilEndOfMonth = endOfMonth.getDate() - today.getDate();
        
        if (daysUntilEndOfMonth <= 7) {
            this.showSystemNotification(
                '📋 Fin de mois',
                'Pensez à vos factures récurrentes (loyer, électricité, etc.)',
                { timeoutType: 'default' }
            );
        }
    }

    // Notification d'objectifs financiers
    checkFinancialGoals() {
        if (!this.dataManager.data || !Array.isArray(this.dataManager.data.comptes)) return;
        const totalBalance = this.dataManager.getTotalBalance ? this.dataManager.getTotalBalance() : 0;
        const monthlyIncome = this.dataManager.getMonthlyIncome ? this.dataManager.getMonthlyIncome() : 0;
        
        // Objectif d'épargne (exemple : 20% des revenus)
        const savingsGoal = monthlyIncome * 0.2;
        const currentSavings = this.dataManager.data.comptes
            .filter(c => c && c.type === 'epargne' && typeof c.solde === 'number')
            .reduce((sum, c) => sum + c.solde, 0);
        
        if (currentSavings < savingsGoal) {
            this.showSystemNotification(
                '🎯 Objectif Épargne',
                `Objectif : ${this.formatCurrency(savingsGoal)} | Actuel : ${this.formatCurrency(currentSavings)}`,
                { timeoutType: 'default' }
            );
        }
    }

    // Vérifications périodiques
    startPeriodicChecks() {
        // Vérifier le solde toutes les heures
        setInterval(() => {
            this.checkLowBalance();
        }, 60 * 60 * 1000);

        // Vérifier les revenus récurrents quotidiennement
        setInterval(() => {
            this.checkRecurringIncome();
        }, 24 * 60 * 60 * 1000);

        // Vérifier les factures à venir quotidiennement
        setInterval(() => {
            this.checkUpcomingBills();
        }, 24 * 60 * 60 * 1000);

        // Vérifier les objectifs financiers hebdomadairement
        setInterval(() => {
            this.checkFinancialGoals();
        }, 7 * 24 * 60 * 60 * 1000);
    }

    // Activer/désactiver les notifications
    enableNotifications() {
        if (!this.settings) this.settings = {};
        this.settings.notifications = true;
        this.dataManager.saveData();
        if (this.sendToRenderer) {
            this.sendToRenderer('show-app-notification', 'Notifications activées', 'success');
        }
    }

    disableNotifications() {
        if (!this.settings) this.settings = {};
        this.settings.notifications = false;
        this.dataManager.saveData();
        if (this.sendToRenderer) {
            this.sendToRenderer('show-app-notification', 'Notifications désactivées', 'info');
        }
    }

    // Formater la monnaie
    formatCurrency(amount) {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: (this.settings && this.settings.currency) || 'EUR'
        }).format(amount);
    }

    // Nettoyer les notifications
    clearAllNotifications() {
        this.notifications.forEach(notification => {
            if (notification && !notification.isDestroyed()) {
                notification.close();
            }
        });
        this.notifications = [];
    }

    // Ajouter une méthode pour envoyer des notifications au renderer
    setRendererSender(sender) {
        this.sendToRenderer = sender;
    }
}

module.exports = NotificationManager; 