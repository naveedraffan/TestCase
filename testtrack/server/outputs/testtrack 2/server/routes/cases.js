const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

// List cases for a suite (?suite_id=)
router.get('/', async (req, res) => {
  const { suite_id } = req.query;
  const { rows } = await pool.query(
    suite_id
      ? 'SELECT * FROM cases WHERE suite_id = $1 ORDER BY created_at'
      : 'SELECT * FROM cases ORDER BY created_at',
    suite_id ? [suite_id] : []
  );
  res.json(rows);
});

router.get('/:id', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM cases WHERE id = $1', [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: 'Case not found' });
  res.json(rows[0]);
});

router.post('/', async (req, res) => {
  const { suite_id, title, preconditions, steps, expected_result, priority, type } = req.body;
  if (!suite_id || !title) return res.status(400).json({ error: 'suite_id and title are required' });
  const { rows } = await pool.query(
    `INSERT INTO cases (suite_id, title, preconditions, steps, expected_result, priority, type)
     VALUES ($1, $2, $3, $4, $5, COALESCE($6, 'medium'), COALESCE($7, 'functional')) RETURNING *`,
    [suite_id, title, preconditions || null, steps || null, expected_result || null, priority, type]
  );
  res.status(201).json(rows[0]);
});

router.put('/:id', async (req, res) => {
  const { title, preconditions, steps, expected_result, priority, type } = req.body;
  const { rows } = await pool.query(
    `UPDATE cases SET
       title = COALESCE($1, title),
       preconditions = COALESCE($2, preconditions),
       steps = COALESCE($3, steps),
       expected_result = COALESCE($4, expected_result),
       priority = COALESCE($5, priority),
       type = COALESCE($6, type)
     WHERE id = $7 RETURNING *`,
    [title, preconditions, steps, expected_result, priority, type, req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'Case not found' });
  res.json(rows[0]);
});

router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM cases WHERE id = $1', [req.params.id]);
  res.status(204).end();
});

module.exports = router;
