const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

// List suites for a project (?project_id=)
router.get('/', async (req, res) => {
  const { project_id } = req.query;
  const { rows } = await pool.query(
    project_id
      ? 'SELECT * FROM suites WHERE project_id = $1 ORDER BY created_at'
      : 'SELECT * FROM suites ORDER BY created_at',
    project_id ? [project_id] : []
  );
  res.json(rows);
});

router.get('/:id', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM suites WHERE id = $1', [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: 'Suite not found' });
  res.json(rows[0]);
});

router.post('/', async (req, res) => {
  const { project_id, name, description, parent_suite_id } = req.body;
  if (!project_id || !name) return res.status(400).json({ error: 'project_id and name are required' });
  const { rows } = await pool.query(
    'INSERT INTO suites (project_id, name, description, parent_suite_id) VALUES ($1, $2, $3, $4) RETURNING *',
    [project_id, name, description || null, parent_suite_id || null]
  );
  res.status(201).json(rows[0]);
});

router.put('/:id', async (req, res) => {
  const { name, description } = req.body;
  const { rows } = await pool.query(
    'UPDATE suites SET name = COALESCE($1, name), description = COALESCE($2, description) WHERE id = $3 RETURNING *',
    [name, description, req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'Suite not found' });
  res.json(rows[0]);
});

router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM suites WHERE id = $1', [req.params.id]);
  res.status(204).end();
});

module.exports = router;
