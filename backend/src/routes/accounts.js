const express = require('express');
const router = express.Router();
const db = require('../models/db');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

router.get('/', (req, res) => {
  try {
    const { game_id, status } = req.query;
    let query = 'SELECT ga.*, g.name as game_name, g.slug as game_slug FROM game_accounts ga JOIN games g ON ga.game_id = g.id WHERE 1=1';
    const params = [];
    
    if (game_id) {
      params.push(game_id);
      query += ` AND ga.game_id = ?`;
    }
    
    if (status) {
      params.push(status);
      query += ` AND ga.status = ?`;
    } else {
      query += " AND ga.status = 'available'";
    }
    
    query += ' ORDER BY ga.created_at DESC';
    
    const accounts = db.prepare(query).all(...params);
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching accounts' });
  }
});

router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const account = db.prepare('SELECT ga.*, g.name as game_name, g.slug as game_slug FROM game_accounts ga JOIN games g ON ga.game_id = g.id WHERE ga.id = ?').get(id);
    
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }
    
    res.json(account);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching account' });
  }
});

router.post('/', (req, res) => {
  try {
    const { game_id, title, description, rank, hero_count, skin_count, price_per_hour, image_url, account_username, account_password } = req.body;
    
    const stmt = db.prepare(`INSERT INTO game_accounts (game_id, title, description, rank, hero_count, skin_count, price_per_hour, image_url, account_username, account_password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    const result = stmt.run(game_id, title, description, rank, hero_count || 0, skin_count || 0, price_per_hour, image_url, account_username, account_password);
    const newAccount = db.prepare('SELECT * FROM game_accounts WHERE id = ?').get(result.lastInsertRowid);
    
    res.status(201).json(newAccount);
  } catch (error) {
    res.status(500).json({ message: 'Error creating account' });
  }
});

router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { game_id, title, description, rank, hero_count, skin_count, price_per_hour, image_url, account_username, account_password, status } = req.body;
    
    const stmt = db.prepare(`UPDATE game_accounts SET game_id = ?, title = ?, description = ?, rank = ?, hero_count = ?, skin_count = ?, price_per_hour = ?, image_url = ?, account_username = ?, account_password = ?, status = ? WHERE id = ?`);
    stmt.run(game_id, title, description, rank, hero_count || 0, skin_count || 0, price_per_hour, image_url, account_username, account_password, status || 'available', id);
    
    const updatedAccount = db.prepare('SELECT * FROM game_accounts WHERE id = ?').get(id);
    
    if (!updatedAccount) {
      return res.status(404).json({ message: 'Account not found' });
    }
    
    res.json(updatedAccount);
  } catch (error) {
    res.status(500).json({ message: 'Error updating account' });
  }
});

router.patch('/:id/status', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['available', 'rented', 'booked', 'maintenance'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    db.prepare('UPDATE game_accounts SET status = ? WHERE id = ?').run(status, id);
    
    const updatedAccount = db.prepare('SELECT ga.*, g.name as game_name, g.slug as game_slug FROM game_accounts ga JOIN games g ON ga.game_id = g.id WHERE ga.id = ?').get(id);
    
    if (!updatedAccount) {
      return res.status(404).json({ message: 'Account not found' });
    }
    
    res.json(updatedAccount);
  } catch (error) {
    res.status(500).json({ message: 'Error updating account status' });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const result = db.prepare('DELETE FROM game_accounts WHERE id = ?').run(id);
    
    if (result.changes === 0) {
      return res.status(404).json({ message: 'Account not found' });
    }
    
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting account' });
  }
});

module.exports = router;
