const express = require('express');
const router = express.Router();
const db = require('../models/db');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const adminMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

router.get('/dashboard', adminMiddleware, (req, res) => {
  try {
    const stats = {};
    
    stats.totalAccounts = db.prepare('SELECT COUNT(*) as count FROM game_accounts').get().count;
    stats.availableAccounts = db.prepare("SELECT COUNT(*) as count FROM game_accounts WHERE status = 'available'").get().count;
    stats.totalOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get().count;
    stats.pendingOrders = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status IN ('pending', 'waiting_confirmation')").get().count;
    
    const revenue = db.prepare("SELECT COALESCE(SUM(total_price), 0) as total FROM orders WHERE status = 'completed'").get();
    stats.totalRevenue = revenue.total;
    
    const monthlyRevenue = db.prepare(`SELECT COALESCE(SUM(total_price), 0) as total FROM orders WHERE status = 'completed' AND date(created_at) >= date('now', 'start of month')`).get();
    stats.monthlyRevenue = monthlyRevenue.total;
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard stats' });
  }
});

router.get('/orders', adminMiddleware, (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT o.*, u.username, u.whatsapp, ga.title as account_title, g.name as game_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN game_accounts ga ON o.account_id = ga.id
      LEFT JOIN games g ON ga.game_id = g.id
    `;
    
    if (status) {
      query += ` WHERE o.status = '${status}'`;
    }
    
    query += ' ORDER BY o.created_at DESC';
    
    const orders = db.prepare(query).all();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

router.put('/orders/:id/status', adminMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const { status, account_credentials } = req.body;
    
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    let updateQuery, params;
    
    if (status === 'approved' && account_credentials) {
      updateQuery = 'UPDATE orders SET status = ?, account_credentials = ? WHERE id = ?';
      params = [status, account_credentials, id];
    } else if (status === 'active') {
      updateQuery = 'UPDATE orders SET status = ?, rental_start = datetime("now"), rental_end = datetime("now", "+" || ? || " hours") WHERE id = ?';
      params = [status, order.duration_hours, id];
    } else if (status === 'completed') {
      updateQuery = 'UPDATE orders SET status = ? WHERE id = ?';
      params = [status, id];
    } else {
      updateQuery = 'UPDATE orders SET status = ? WHERE id = ?';
      params = [status, id];
    }
    
    db.prepare(updateQuery).run(...params);
    
    if (status === 'approved') {
      db.prepare("UPDATE game_accounts SET status = 'rented' WHERE id = ?").run(order.account_id);
    } else if (status === 'active') {
      db.prepare("UPDATE game_accounts SET status = 'rented' WHERE id = ?").run(order.account_id);
    } else if (status === 'completed' || status === 'rejected' || status === 'cancelled') {
      db.prepare("UPDATE game_accounts SET status = 'available' WHERE id = ?").run(order.account_id);
    }
    
    const updatedOrder = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/accounts/:id/status', adminMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    db.prepare('UPDATE game_accounts SET status = ? WHERE id = ?').run(status, id);
    
    const updatedAccount = db.prepare('SELECT * FROM game_accounts WHERE id = ?').get(id);
    
    if (!updatedAccount) {
      return res.status(404).json({ message: 'Account not found' });
    }
    
    res.json(updatedAccount);
  } catch (error) {
    res.status(500).json({ message: 'Error updating account status' });
  }
});

router.get('/users', adminMiddleware, (req, res) => {
  try {
    const users = db.prepare('SELECT id, username, email, role, whatsapp, created_at FROM users ORDER BY created_at DESC').all();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

router.get('/stats/monthly', adminMiddleware, (req, res) => {
  try {
    const stats = db.prepare(`
      SELECT 
        strftime('%Y-%m', created_at) as month,
        COUNT(*) as total_orders,
        SUM(total_price) as revenue
      FROM orders
      WHERE status = 'completed'
      GROUP BY strftime('%Y-%m', created_at)
      ORDER BY month DESC
      LIMIT 12
    `).all();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching monthly stats' });
  }
});

module.exports = router;
