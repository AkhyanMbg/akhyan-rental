const express = require('express');
const router = express.Router();
const db = require('../models/db');

router.get('/', (req, res) => {
  try {
    const games = db.prepare('SELECT * FROM games ORDER BY name').all();
    res.json(games);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching games' });
  }
});

router.get('/:slug', (req, res) => {
  try {
    const { slug } = req.params;
    const game = db.prepare('SELECT * FROM games WHERE slug = ?').get(slug);
    
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }
    
    const accounts = db.prepare('SELECT * FROM game_accounts WHERE game_id = ? AND status = ? ORDER BY created_at DESC').all(game.id, 'available');
    
    res.json({
      game,
      accounts
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching game details' });
  }
});

router.post('/', (req, res) => {
  try {
    const { name, slug, image_url, description } = req.body;
    const stmt = db.prepare('INSERT INTO games (name, slug, image_url, description) VALUES (?, ?, ?, ?)');
    const result = stmt.run(name, slug, image_url, description);
    const newGame = db.prepare('SELECT * FROM games WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newGame);
  } catch (error) {
    if (error.message.includes('UNIQUE constraint')) {
      return res.status(400).json({ message: 'Game with this slug already exists' });
    }
    res.status(500).json({ message: 'Error creating game' });
  }
});

router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, image_url, description } = req.body;
    
    const stmt = db.prepare('UPDATE games SET name = ?, slug = ?, image_url = ?, description = ? WHERE id = ?');
    stmt.run(name, slug, image_url, description, id);
    
    const updatedGame = db.prepare('SELECT * FROM games WHERE id = ?').get(id);
    
    if (!updatedGame) {
      return res.status(404).json({ message: 'Game not found' });
    }
    
    res.json(updatedGame);
  } catch (error) {
    res.status(500).json({ message: 'Error updating game' });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const result = db.prepare('DELETE FROM games WHERE id = ?').run(id);
    
    if (result.changes === 0) {
      return res.status(404).json({ message: 'Game not found' });
    }
    
    res.json({ message: 'Game deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting game' });
  }
});

module.exports = router;
