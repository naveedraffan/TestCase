const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

// List runs for a project (?project_id=)
router.get('/', async (req, res) => {
  const { project_id } = req.query;
  const { rows } = await pool.query(
    project_id
      ? 'SELECT * FROM runs WHERE project_id = $1 ORDER BY created_at DESC'
      : 'SELECT * FROM runs ORDER BY created_at DESC',
    project_id ? [project_id] : []
  );
  res.json(rows);
});

// Get a run with all its cases + current status + case details
router.get('/:id', async (req, res) => {
  const runRes = await pool.query('SELECT * FROM runs WHERE id = $1', [req.params.id]);
  if (!runRes.rows.length) return res.status(404).json({ error: 'Run not found' });

  const casesRes = await pool.query(
    `SELECT rc.id AS run_case_id, rc.status, c.id AS case_id, c.title, c.priority, c.type, c.expected_result, c.steps
     FROM run_cases rc
     JOIN cases c ON c.id = rc.case_id
     WHERE rc.run_id = $1
     ORDER BY c.id`,
    [req.params.id]
  );

  res.json({ ...runRes.rows[0], cases: casesRes.rows });
});

// Create a run: { project_id, name, description, case_ids: [1,2,3] }
router.post('/', async (req, res) => {
  const { project_id, name, description, case_ids } = req.body;
  if (!project_id || !name || !Array.isArray(case_ids) || !case_ids.length) {
    return res.status(400).json({ error: 'project_id, name, and a non-empty case_ids array are required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const runRes = await client.query(
      'INSERT INTO runs (project_id, name, description) VALUES ($1, $2, $3) RETURNING *',
      [project_id, name, description || null]
    );
    const run = runRes.rows[0];

    for (const caseId of case_ids) {
      await client.query(
        'INSERT INTO run_cases (run_id, case_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [run.id, caseId]
      );
    }

    await client.query('COMMIT');
    res.status(201).json(run);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// Mark a run completed
router.put('/:id/complete', async (req, res) => {
  const { rows } = await pool.query(
    "UPDATE runs SET status = 'completed', completed_at = now() WHERE id = $1 RETURNING *",
    [req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'Run not found' });
  res.json(rows[0]);
});

router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM runs WHERE id = $1', [req.params.id]);
  res.status(204).end();
});

module.exports = router;
