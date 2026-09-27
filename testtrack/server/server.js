require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

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

// Serve the built React app (client/dist) when it exists, so this single
// Node.js process can host both the API and the frontend — needed for
// single-service hosts like Cloudways Velocity. In local dev, the client
// runs separately via Vite (npm run dev --prefix client) and this block
// is skipped since client/dist won't exist yet.
const clientDist = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Fallback error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`TestTrack API listening on http://localhost:${PORT}`);
});
