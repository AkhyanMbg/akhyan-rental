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

const generateConfirmationCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'AKH-';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

router.get('/', authMiddleware, (req, res) => {
  try {
    const orders = db.prepare(`SELECT o.*, ga.title as account_title, g.name as game_name, g.slug as game_slug FROM orders o LEFT JOIN game_accounts ga ON o.account_id = ga.id LEFT JOIN games g ON ga.game_id = g.id WHERE o.user_id = ? ORDER BY o.created_at DESC`).all(req.user.id);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

router.post('/', authMiddleware, (req, res) => {
  try {
    const { account_id, duration_hours, payment_method } = req.body;
    
    const account = db.prepare('SELECT * FROM game_accounts WHERE id = ?').get(account_id);
    if (!account) {
      return res.status(400).json({ message: 'Account not found' });
    }
    
    if (account.status !== 'available') {
      return res.status(400).json({ message: 'Account is not available' });
    }
    
    const total_price = duration_hours * parseFloat(account.price_per_hour);
    const confirmation_code = generateConfirmationCode();
    
    const stmt = db.prepare(`INSERT INTO orders (user_id, account_id, duration_hours, total_price, payment_method, confirmation_code, status) VALUES (?, ?, ?, ?, ?, ?, 'pending')`);
    const result = stmt.run(req.user.id, account_id, duration_hours, total_price, payment_method, confirmation_code);
    
    db.prepare("UPDATE game_accounts SET status = 'booked' WHERE id = ?").run(account_id);
    
    const newOrder = db.prepare('SELECT * FROM orders WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/confirm/:code', (req, res) => {
  try {
    const { code } = req.params;
    const order = db.prepare(`SELECT o.*, ga.title as account_title, g.name as game_name, u.username, u.whatsapp FROM orders o LEFT JOIN game_accounts ga ON o.account_id = ga.id LEFT JOIN games g ON ga.game_id = g.id LEFT JOIN users u ON o.user_id = u.id WHERE o.confirmation_code = ?`).get(code);
    
    if (!order) {
      return res.status(404).json({ message: 'Kode konfirmasi tidak ditemukan' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order' });
  }
});

router.post('/confirm/:code/payment', (req, res) => {
  try {
    const { code } = req.params;
    const { payment_proof } = req.body;
    
    const order = db.prepare('SELECT * FROM orders WHERE confirmation_code = ?').get(code);
    if (!order) {
      return res.status(404).json({ message: 'Kode konfirmasi tidak ditemukan' });
    }
    
    if (order.payment_confirmed) {
      return res.status(400).json({ message: 'Pembayaran sudah dikonfirmasi' });
    }
    
    db.prepare(`UPDATE orders SET payment_proof = ?, status = 'waiting_confirmation', payment_confirmed = 1 WHERE confirmation_code = ?`).run(payment_proof, code);
    
    const updatedOrder = db.prepare(`SELECT o.*, ga.title as account_title, g.name as game_name FROM orders o LEFT JOIN game_accounts ga ON o.account_id = ga.id LEFT JOIN games g ON ga.game_id = g.id WHERE o.confirmation_code = ?`).get(code);
    
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Error confirming payment' });
  }
});

router.get('/:id', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const order = db.prepare(`SELECT o.*, ga.title as account_title, ga.account_username, ga.account_password, g.name as game_name FROM orders o LEFT JOIN game_accounts ga ON o.account_id = ga.id LEFT JOIN games g ON ga.game_id = g.id WHERE o.id = ? AND o.user_id = ?`).get(id, req.user.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order' });
  }
});

router.post('/:id/confirm-payment', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const { payment_proof } = req.body;
    
    const result = db.prepare(`UPDATE orders SET payment_proof = ?, status = 'waiting_confirmation', payment_confirmed = 1 WHERE id = ? AND user_id = ?`).run(payment_proof, id, req.user.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    const updatedOrder = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Error confirming payment' });
  }
});

module.exports = router;
