require('dotenv').config();
const express = require('express');
const cors = require('cors');

const projectsRouter = require('./routes/projects');
const suitesRouter = require('./routes/suites');
const casesRouter = require('./routes/cases');
const runsRouter = require('./routes/runs');
const resultsRouter = require('./routes/results');
const jiraRouter = require('./routes/jira');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/projects', projectsRouter);
app.use('/api/suites', suitesRouter);
app.use('/api/cases', casesRouter);
app.use('/api/runs', runsRouter);
app.use('/api/results', resultsRouter);
app.use('/api/jira', jiraRouter);

// Fallback error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`TestTrack API listening on http://localhost:${PORT}`);
});
