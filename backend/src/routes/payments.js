const express = require('express');
const router = express.Router();
const db = require('../models/db');

router.get('/methods', (req, res) => {
  res.json([
    { id: 'dana', name: 'DANA', type: 'ewallet' },
    { id: 'qris', name: 'QRIS', type: 'qris' }
  ]);
});

router.post('/create', (req, res) => {
  try {
    const { order_id, payment_method, amount } = req.body;
    
    const stmt = db.prepare(`INSERT INTO payments (order_id, amount, payment_method, status) VALUES (?, ?, ?, 'pending')`);
    const result = stmt.run(order_id, amount, payment_method);
    const newPayment = db.prepare('SELECT * FROM payments WHERE id = ?').get(result.lastInsertRowid);
    
    res.status(201).json(newPayment);
  } catch (error) {
    res.status(500).json({ message: 'Error creating payment' });
  }
});

router.post('/qris/generate', (req, res) => {
  try {
    const { amount, order_id } = req.body;
    
    const qrisData = {
      qr_string: `00020101021226580009ID.CO.DANA.WWW01189360011999999999020303UMI51440015ID.ECONOMIC010510${amount.toFixed(0).padStart(12, '0')}0302ID5404${amount.toFixed(0)}6304`,
      amount: amount,
      expiry_minutes: 30
    };
    
    res.json(qrisData);
  } catch (error) {
    res.status(500).json({ message: 'Error generating QRIS' });
  }
});

router.post('/callback/dana', (req, res) => {
  try {
    const { transaction_id, status, amount } = req.body;
    console.log('DANA Callback:', { transaction_id, status, amount });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error processing callback' });
  }
});

module.exports = router;
