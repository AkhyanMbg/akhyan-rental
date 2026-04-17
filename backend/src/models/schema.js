const db = require('./db');
const bcrypt = require('bcryptjs');

const createTables = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      whatsapp TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS games (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      image_url TEXT,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS game_accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      rank TEXT,
      hero_count INTEGER DEFAULT 0,
      skin_count INTEGER DEFAULT 0,
      price_per_hour REAL NOT NULL,
      image_url TEXT,
      account_username TEXT,
      account_password TEXT,
      status TEXT DEFAULT 'available',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      account_id INTEGER REFERENCES game_accounts(id) ON DELETE SET NULL,
      duration_hours INTEGER NOT NULL,
      total_price REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      payment_method TEXT,
      payment_proof TEXT,
      confirmation_code TEXT UNIQUE,
      payment_confirmed INTEGER DEFAULT 0,
      rental_start DATETIME,
      rental_end DATETIME,
      account_credentials TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
      amount REAL NOT NULL,
      payment_method TEXT NOT NULL,
      payment_proof TEXT,
      status TEXT DEFAULT 'pending',
      transaction_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS admin_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      value TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const tableInfo = db.prepare("PRAGMA table_info(orders)").all();
  const columns = tableInfo.map(col => col.name);

  if (!columns.includes('confirmation_code')) {
    db.exec("ALTER TABLE orders ADD COLUMN confirmation_code TEXT UNIQUE");
  }
  if (!columns.includes('payment_confirmed')) {
    db.exec("ALTER TABLE orders ADD COLUMN payment_confirmed INTEGER DEFAULT 0");
  }

  const existingAdmin = db.prepare('SELECT * FROM users WHERE username = ?').get('admin@akhyan.com');
  if (!existingAdmin) {
    const hashedPassword = bcrypt.hashSync('Akhyan2112RC', 10);
    db.prepare('INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)').run('admin@akhyan.com', 'admin@akhyan.com', hashedPassword, 'admin');
  }

  const existingGames = db.prepare('SELECT COUNT(*) as count FROM games').get();
  if (existingGames.count === 0) {
    const insertGame = db.prepare('INSERT INTO games (name, slug, image_url, description) VALUES (?, ?, ?, ?)');
    insertGame.run('Mobile Legends', 'mobile-legends', '', 'Game MOBA mobile paling populer di Indonesia');
    insertGame.run('PUBG Mobile', 'pubg-mobile', '', 'Game battle royale mobile dari Tencent');
    insertGame.run('Valorant', 'valorant', '', 'Game FPS tactical dari Riot Games');
    insertGame.run('Genshin Impact', 'genshin-impact', '', 'Open world RPG dari miHoYo');
  }

  const existingAccounts = db.prepare('SELECT COUNT(*) as count FROM game_accounts').get();
  if (existingAccounts.count === 0) {
    const mlGame = db.prepare('SELECT id FROM games WHERE slug = ?').get('mobile-legends');
    const pubgGame = db.prepare('SELECT id FROM games WHERE slug = ?').get('pubg-mobile');
    const valGame = db.prepare('SELECT id FROM games WHERE slug = ?').get('valorant');
    const genshinGame = db.prepare('SELECT id FROM games WHERE slug = ?').get('genshin-impact');

    const insertAccount = db.prepare(`INSERT INTO game_accounts (game_id, title, description, rank, hero_count, skin_count, price_per_hour, account_username, account_password, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

    if (mlGame) {
      insertAccount.run(mlGame.id, 'ML Epic Legend - Full Skin', 'Akun ML Epic dengan 80+ hero dan 200+ skin', 'Epic Legend', 85, 210, 5000, 'gameuser001', 'pass123', 'available');
      insertAccount.run(mlGame.id, 'ML Mythic Glory', 'Akun Mythic dengan build lengkap', 'Mythic Glory', 90, 180, 15000, 'gameuser002', 'pass456', 'available');
    }
    if (pubgGame) {
      insertAccount.run(pubgGame.id, 'PUBG Ace Crown', 'Akun PUBG Ace dengan UC 5000', 'Ace Crown', 0, 50, 8000, 'pubguser001', 'pass789', 'available');
    }
    if (valGame) {
      insertAccount.run(valGame.id, 'Valorant Diamond', 'Akun Valorant Diamond rank', 'Diamond', 0, 30, 12000, 'valuser001', 'passabc', 'available');
    }
    if (genshinGame) {
      insertAccount.run(genshinGame.id, 'Genshin AR60 - C6 Roster', 'Akun Genshin AR60 dengan roster C6', 'AR60', 0, 500, 25000, 'genshinuser001', 'passxyz', 'available');
    }
  }

  console.log('Database initialized successfully');
};

createTables();

module.exports = { createTables };
