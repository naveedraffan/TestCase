const express = require('express');
const pool = require('../db/pool');
const jira = require('../services/jiraService');

const router = express.Router();

// List result history for a run_case (?run_case_id=)
router.get('/', async (req, res) => {
  const { run_case_id } = req.query;
  if (!run_case_id) return res.status(400).json({ error: 'run_case_id query param required' });
  const { rows } = await pool.query(
    `SELECT r.*, jl.issue_key, jl.issue_url
     FROM results r
     LEFT JOIN jira_links jl ON jl.result_id = r.id
     WHERE r.run_case_id = $1
     ORDER BY r.created_at DESC`,
    [run_case_id]
  );
  res.json(rows);
});

// Record a result: { run_case_id, status, comment, elapsed_ms, tester, create_jira_issue }
router.post('/', async (req, res) => {
  const { run_case_id, status, comment, elapsed_ms, tester, create_jira_issue } = req.body;
  const validStatuses = ['passed', 'failed', 'blocked', 'retest'];
  if (!run_case_id || !validStatuses.includes(status)) {
    return res.status(400).json({ error: `run_case_id and a valid status (${validStatuses.join(', ')}) are required` });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const resultRes = await client.query(
      'INSERT INTO results (run_case_id, status, comment, elapsed_ms, tester) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [run_case_id, status, comment || null, elapsed_ms || null, tester || null]
    );
    const result = resultRes.rows[0];

    await client.query('UPDATE run_cases SET status = $1 WHERE id = $2', [status, run_case_id]);

    let jiraLink = null;
    const shouldCreateJira =
      status === 'failed' &&
      (create_jira_issue === true || process.env.JIRA_AUTO_CREATE_ON_FAIL === 'true') &&
      jira.isConfigured();

    if (shouldCreateJira) {
      const infoRes = await client.query(
        `SELECT c.title AS case_title, r.name AS run_name, p.name AS project_name
         FROM run_cases rc
         JOIN cases c ON c.id = rc.case_id
         JOIN runs r ON r.id = rc.run_id
         JOIN projects p ON p.id = r.project_id
         WHERE rc.id = $1`,
        [run_case_id]
      );
      const info = infoRes.rows[0];
      if (info) {
        const issue = await jira.createIssueForFailure({
          caseTitle: info.case_title,
          runName: info.run_name,
          projectName: info.project_name,
          comment,
          tester,
        });
        const linkRes = await client.query(
          'INSERT INTO jira_links (result_id, issue_key, issue_url) VALUES ($1, $2, $3) RETURNING *',
          [result.id, issue.key, issue.url]
        );
        jiraLink = linkRes.rows[0];
      }
    }

    await client.query('COMMIT');
    res.status(201).json({ ...result, jira: jiraLink });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
