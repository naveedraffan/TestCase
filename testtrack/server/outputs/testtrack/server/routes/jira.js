const express = require('express');
const jira = require('../services/jiraService');

const router = express.Router();

// Report whether Jira integration is configured (used by the frontend to show/hide UI)
router.get('/status', (req, res) => {
  res.json({
    configured: jira.isConfigured(),
    autoCreateOnFail: process.env.JIRA_AUTO_CREATE_ON_FAIL === 'true',
  });
});

module.exports = router;
