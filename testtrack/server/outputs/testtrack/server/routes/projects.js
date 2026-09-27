const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

// List all projects
router.get('/', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM projects ORDER BY created_at DESC');
  res.json(rows);
});

// Get one project
router.get('/:id', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM projects WHERE id = $1', [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: 'Project not found' });
  res.json(rows[0]);
});

// Create project
router.post('/', async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  const { rows } = await pool.query(
    'INSERT INTO projects (name, description) VALUES ($1, $2) RETURNING *',
    [name, description || null]
  );
  res.status(201).json(rows[0]);
});

// Update project
router.put('/:id', async (req, res) => {
  const { name, description } = req.body;
  const { rows } = await pool.query(
    'UPDATE projects SET name = COALESCE($1, name), description = COALESCE($2, description) WHERE id = $3 RETURNING *',
    [name, description, req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'Project not found' });
  res.json(rows[0]);
});

// Delete project
router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM projects WHERE id = $1', [req.params.id]);
  res.status(204).end();
});

module.exports = router;
