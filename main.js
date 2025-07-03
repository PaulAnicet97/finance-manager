const { app, BrowserWindow, Menu, shell, ipcMain, dialog } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const DataManager = require('./dataManager');
const NotificationManager = require('./notificationManager');

let mainWindow;
let dataManager;
let notificationManager;

async function createWindow() {
    // Initialiser les gestionnaires
    dataManager = new DataManager();
    await dataManager.ready;
    notificationManager = new NotificationManager(dataManager);

    // Créer la fenêtre du navigateur
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, 'preload.js')
        },
        icon: path.join(__dirname, 'assets/icon.png'), // Icône de l'app (optionnel)
        titleBarStyle: 'hiddenInset', // Style macOS natif
        show: false // Ne pas afficher avant d'être prêt
    });

    // Charger l'application
    mainWindow.loadFile('index.html');

    // Afficher la fenêtre quand elle est prête
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        
        // Ouvrir les outils de développement en mode développement
        if (isDev) {
            mainWindow.webContents.openDevTools();
        }

        // Démarrer les vérifications périodiques
        notificationManager.startPeriodicChecks();
    });

    // Gérer la fermeture de la fenêtre
    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Empêcher la navigation vers des URLs externes
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });
}

// Créer le menu de l'application
function createMenu() {
    const template = [
        {
            label: 'FinanceApp',
            submenu: [
                {
                    label: 'À propos de FinanceApp',
                    role: 'about'
                },
                { type: 'separator' },
                {
                    label: 'Préférences...',
                    accelerator: 'Cmd+,',
                    click: () => {
                        // Ouvrir les paramètres
                        if (mainWindow) {
                            mainWindow.webContents.send('open-settings');
                        }
                    }
                },
                { type: 'separator' },
                {
                    label: 'Services',
                    role: 'services',
                    submenu: []
                },
                { type: 'separator' },
                {
                    label: 'Masquer FinanceApp',
                    accelerator: 'Cmd+H',
                    role: 'hide'
                },
                {
                    label: 'Masquer les autres',
                    accelerator: 'Cmd+Alt+H',
                    role: 'hideothers'
                },
                {
                    label: 'Afficher tout',
                    role: 'unhide'
                },
                { type: 'separator' },
                {
                    label: 'Quitter FinanceApp',
                    accelerator: 'Cmd+Q',
                    click: () => {
                        app.quit();
                    }
                }
            ]
        },
        {
            label: 'Fichier',
            submenu: [
                {
                    label: 'Nouvelle transaction',
                    accelerator: 'Cmd+N',
                    click: () => {
                        if (mainWindow) {
                            mainWindow.webContents.send('new-transaction');
                        }
                    }
                },
                {
                    label: 'Nouveau budget',
                    accelerator: 'Cmd+Shift+N',
                    click: () => {
                        if (mainWindow) {
                            mainWindow.webContents.send('new-budget');
                        }
                    }
                },
                { type: 'separator' },
                {
                    label: 'Exporter les données',
                    accelerator: 'Cmd+E',
                    click: async () => {
                        try {
                            const data = await dataManager.exportData();
                            const { filePath } = await dialog.showSaveDialog(mainWindow, {
                                title: 'Exporter les données',
                                defaultPath: `finance-data-${new Date().toISOString().split('T')[0]}.json`,
                                filters: [
                                    { name: 'JSON', extensions: ['json'] }
                                ]
                            });
                            
                            if (filePath) {
                                const fs = require('fs');
                                fs.writeFileSync(filePath, data);
                                notificationManager.showSystemNotification(
                                    '✅ Export réussi',
                                    'Les données ont été exportées avec succès'
                                );
                            }
                        } catch (error) {
                            notificationManager.showSystemNotification(
                                '❌ Erreur d\'export',
                                'Impossible d\'exporter les données'
                            );
                        }
                    }
                },
                {
                    label: 'Importer les données',
                    accelerator: 'Cmd+I',
                    click: async () => {
                        try {
                            const { filePaths } = await dialog.showOpenDialog(mainWindow, {
                                title: 'Importer les données',
                                filters: [
                                    { name: 'JSON', extensions: ['json'] }
                                ],
                                properties: ['openFile']
                            });
                            
                            if (filePaths.length > 0) {
                                const fs = require('fs');
                                const data = fs.readFileSync(filePaths[0], 'utf8');
                                await dataManager.importData(data);
                                notificationManager.showSystemNotification(
                                    '✅ Import réussi',
                                    'Les données ont été importées avec succès'
                                );
                                if (mainWindow) {
                                    mainWindow.webContents.send('data-imported');
                                }
                            }
                        } catch (error) {
                            notificationManager.showSystemNotification(
                                '❌ Erreur d\'import',
                                'Impossible d\'importer les données'
                            );
                        }
                    }
                }
            ]
        },
        {
            label: 'Édition',
            submenu: [
                { label: 'Annuler', accelerator: 'Cmd+Z', role: 'undo' },
                { label: 'Rétablir', accelerator: 'Shift+Cmd+Z', role: 'redo' },
                { type: 'separator' },
                { label: 'Couper', accelerator: 'Cmd+X', role: 'cut' },
                { label: 'Copier', accelerator: 'Cmd+C', role: 'copy' },
                { label: 'Coller', accelerator: 'Cmd+V', role: 'paste' },
                { label: 'Sélectionner tout', accelerator: 'Cmd+A', role: 'selectall' }
            ]
        },
        {
            label: 'Affichage',
            submenu: [
                { label: 'Recharger', accelerator: 'Cmd+R', role: 'reload' },
                { label: 'Forcer le rechargement', accelerator: 'Cmd+Shift+R', role: 'forceReload' },
                { label: 'Outils de développement', accelerator: 'F12', role: 'toggleDevTools' },
                { type: 'separator' },
                { label: 'Zoom avant', accelerator: 'Cmd+Plus', role: 'zoomIn' },
                { label: 'Zoom arrière', accelerator: 'Cmd+-', role: 'zoomOut' },
                { label: 'Taille réelle', accelerator: 'Cmd+0', role: 'resetZoom' },
                { type: 'separator' },
                { label: 'Plein écran', accelerator: 'Ctrl+Cmd+F', role: 'togglefullscreen' }
            ]
        },
        {
            label: 'Fenêtre',
            submenu: [
                { label: 'Minimiser', accelerator: 'Cmd+M', role: 'minimize' },
                { label: 'Fermer', accelerator: 'Cmd+W', role: 'close' },
                { type: 'separator' },
                { label: 'Apporter au premier plan', role: 'front' }
            ]
        },
        {
            label: 'Aide',
            submenu: [
                {
                    label: 'Documentation',
                    click: () => {
                        shell.openExternal('https://github.com/votre-repo/finance-app');
                    }
                },
                {
                    label: 'Signaler un problème',
                    click: () => {
                        shell.openExternal('https://github.com/votre-repo/finance-app/issues');
                    }
                },
                { type: 'separator' },
                {
                    label: 'À propos de FinanceApp',
                    role: 'about'
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

// Événements de l'application
app.whenReady().then(async () => {
    await createWindow();
    createMenu();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Gestion des événements IPC
ipcMain.handle('get-app-version', () => {
    return app.getVersion();
});

ipcMain.handle('get-app-name', () => {
    return app.getName();
});

// Gestion des données
ipcMain.handle('get-data', async () => {
    return await dataManager.data;
});

ipcMain.handle('add-transaction', async (event, transaction) => {
    try {
        const newTransaction = await dataManager.addTransaction(transaction);
        notificationManager.showTransactionAdded(newTransaction);
        return { success: true, data: newTransaction };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('update-transaction', async (event, id, updates) => {
    try {
        const updatedTransaction = await dataManager.updateTransaction(id, updates);
        return { success: true, data: updatedTransaction };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('delete-transaction', async (event, id) => {
    try {
        const transaction = dataManager.data.transactions.find(t => t.id === id);
        await dataManager.deleteTransaction(id);
        if (transaction) {
            notificationManager.showTransactionDeleted(transaction);
        }
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('add-budget', async (event, budget) => {
    try {
        const newBudget = await dataManager.addBudget(budget);
        return { success: true, data: newBudget };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('update-budget', async (event, categorie, updates) => {
    try {
        const updatedBudget = await dataManager.updateBudget(categorie, updates);
        return { success: true, data: updatedBudget };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('delete-budget', async (event, categorie) => {
    try {
        await dataManager.deleteBudget(categorie);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

// Gestion des notifications
ipcMain.handle('show-notification', (event, message, type) => {
    notificationManager.showAppNotification(message, type);
});

ipcMain.handle('enable-notifications', () => {
    notificationManager.enableNotifications();
});

ipcMain.handle('disable-notifications', () => {
    notificationManager.disableNotifications();
});