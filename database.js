const Database = require('better-sqlite3');
const path = require('path');

// Chemin de la base (dans le dossier utilisateur)
const dbPath = path.join(__dirname, 'finance-manager.db');
const db = new Database(dbPath);

// Création des tables si elles n'existent pas
// Comptes
db.prepare(`CREATE TABLE IF NOT EXISTS comptes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nom TEXT NOT NULL,
  solde REAL NOT NULL,
  type TEXT NOT NULL
)`).run();
// Catégories
db.prepare(`CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nom TEXT NOT NULL,
  type TEXT NOT NULL,
  couleur TEXT
)`).run();
// Transactions
db.prepare(`CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  montant REAL NOT NULL,
  categorie TEXT NOT NULL,
  description TEXT,
  compte TEXT NOT NULL,
  type TEXT NOT NULL
)`).run();
// Budgets
db.prepare(`CREATE TABLE IF NOT EXISTS budgets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  categorie TEXT NOT NULL,
  limite REAL NOT NULL,
  utilise REAL NOT NULL
)`).run();
// Settings
db.prepare(`CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT
)`).run();

// Fonctions utilitaires génériques
const dbAPI = {
  // Comptes
  getComptes: () => db.prepare('SELECT * FROM comptes').all(),
  addCompte: (compte) => db.prepare('INSERT INTO comptes (nom, solde, type) VALUES (?, ?, ?)').run(compte.nom, compte.solde, compte.type),
  updateCompte: (compte) => db.prepare('UPDATE comptes SET nom=?, solde=?, type=? WHERE id=?').run(compte.nom, compte.solde, compte.type, compte.id),
  deleteCompte: (id) => db.prepare('DELETE FROM comptes WHERE id=?').run(id),

  // Catégories
  getCategories: () => db.prepare('SELECT * FROM categories').all(),
  addCategorie: (cat) => db.prepare('INSERT INTO categories (nom, type, couleur) VALUES (?, ?, ?)').run(cat.nom, cat.type, cat.couleur),
  updateCategorie: (cat) => db.prepare('UPDATE categories SET nom=?, type=?, couleur=? WHERE id=?').run(cat.nom, cat.type, cat.couleur, cat.id),
  deleteCategorie: (id) => db.prepare('DELETE FROM categories WHERE id=?').run(id),

  // Transactions
  getTransactions: () => db.prepare('SELECT * FROM transactions').all(),
  addTransaction: (t) => db.prepare('INSERT INTO transactions (date, montant, categorie, description, compte, type) VALUES (?, ?, ?, ?, ?, ?)').run(t.date, t.montant, t.categorie, t.description, t.compte, t.type),
  updateTransaction: (t) => db.prepare('UPDATE transactions SET date=?, montant=?, categorie=?, description=?, compte=?, type=? WHERE id=?').run(t.date, t.montant, t.categorie, t.description, t.compte, t.type, t.id),
  deleteTransaction: (id) => db.prepare('DELETE FROM transactions WHERE id=?').run(id),

  // Budgets
  getBudgets: () => db.prepare('SELECT * FROM budgets').all(),
  addBudget: (b) => db.prepare('INSERT INTO budgets (categorie, limite, utilise) VALUES (?, ?, ?)').run(b.categorie, b.limite, b.utilise),
  updateBudget: (b) => db.prepare('UPDATE budgets SET categorie=?, limite=?, utilise=? WHERE id=?').run(b.categorie, b.limite, b.utilise, b.id),
  deleteBudget: (id) => db.prepare('DELETE FROM budgets WHERE id=?').run(id),

  // Settings
  getSettings: () => {
    const rows = db.prepare('SELECT * FROM settings').all();
    const settings = {};
    rows.forEach(row => { settings[row.key] = row.value; });
    return settings;
  },
  setSetting: (key, value) => db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, value),
};

module.exports = dbAPI; 