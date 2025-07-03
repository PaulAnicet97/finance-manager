const { contextBridge, ipcRenderer } = require('electron');

// Exposer les APIs Electron de manière sécurisée
contextBridge.exposeInMainWorld('electronAPI', {
    // Informations sur l'application
    getAppVersion: () => ipcRenderer.invoke('get-app-version'),
    getAppName: () => ipcRenderer.invoke('get-app-name'),
    
    // Gestion des données
    getData: () => ipcRenderer.invoke('get-data'),
    addTransaction: (transaction) => ipcRenderer.invoke('add-transaction', transaction),
    updateTransaction: (id, updates) => ipcRenderer.invoke('update-transaction', id, updates),
    deleteTransaction: (id) => ipcRenderer.invoke('delete-transaction', id),
    addBudget: (budget) => ipcRenderer.invoke('add-budget', budget),
    updateBudget: (categorie, updates) => ipcRenderer.invoke('update-budget', categorie, updates),
    deleteBudget: (categorie) => ipcRenderer.invoke('delete-budget', categorie),
    
    // Notifications
    showNotification: (message, type) => ipcRenderer.invoke('show-notification', message, type),
    enableNotifications: () => ipcRenderer.invoke('enable-notifications'),
    disableNotifications: () => ipcRenderer.invoke('disable-notifications'),
    
    // Événements du menu
    onNewTransaction: (callback) => ipcRenderer.on('new-transaction', callback),
    onNewBudget: (callback) => ipcRenderer.on('new-budget', callback),
    onOpenSettings: (callback) => ipcRenderer.on('open-settings', callback),
    onDataImported: (callback) => ipcRenderer.on('data-imported', callback),
    
    // Supprimer les listeners
    removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
}); 