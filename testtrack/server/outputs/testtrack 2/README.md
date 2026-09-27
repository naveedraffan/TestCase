# TestTrack

A lightweight, self-hosted test case management tool — like TestRail — built with Node.js/Express, PostgreSQL, and React. Includes optional Jira integration so failed test results can automatically create a bug in Jira.

## Features

- Projects → Test suites → Test cases hierarchy
- Test runs: pick a set of cases and execute them
- Record results per case (passed / failed / blocked / retest) with tester name, comment, and history
- Auto-create a Jira issue when a result is marked "failed" (opt-in per result, or globally via env var)

## Stack

- **Server:** Node.js, Express, `pg` (PostgreSQL driver), `axios` (Jira REST API calls)
- **Client:** React + Vite, `react-router-dom`
- **Database:** PostgreSQL

## Project structure

```
testtrack/
  server/
    db/           schema.sql, connection pool, init script
    routes/       projects, suites, cases, runs, results, jira
    services/     jiraService.js (Jira Cloud REST API v3)
    server.js
  client/
    src/
      pages/      ProjectsPage, ProjectDetailPage, RunDetailPage
      api/        axios client
```

## Setup

### 1. Database

Create a PostgreSQL database (locally or hosted):

```bash
createdb testtrack
```

### 2. Server

```bash
cd server
cp .env.example .env      # edit with your DB credentials and (optionally) Jira details
npm install
npm run db:init           # applies schema.sql
npm run dev                # starts API on http://localhost:4000
```

### 3. Client

In a second terminal:

```bash
cd client
npm install
npm run dev                # starts Vite dev server on http://localhost:5173
```

Open http://localhost:5173 — the Vite dev server proxies `/api` requests to the Express server on port 4000.

## Jira integration

1. Create an [Atlassian API token](https://id.atlassian.com/manage-profile/security/api-tokens).
2. In `server/.env`, set:
   ```
   JIRA_BASE_URL=https://your-domain.atlassian.net
   JIRA_EMAIL=you@example.com
   JIRA_API_TOKEN=your_token
   JIRA_PROJECT_KEY=QA
   JIRA_ISSUE_TYPE=Bug
   JIRA_AUTO_CREATE_ON_FAIL=false   # or true to auto-create on every failure
   ```
3. Restart the server. When a result is marked "failed" in the UI, you'll see a "Create Jira issue" checkbox (or, if `JIRA_AUTO_CREATE_ON_FAIL=true`, it happens automatically). The created issue key/link is shown in that case's result history.

If Jira env vars are left blank, the app works normally — the Jira checkbox and auto-create are simply disabled.

## API overview

| Method | Path | Purpose |
|---|---|---|
| GET/POST | `/api/projects` | List / create projects |
| GET/PUT/DELETE | `/api/projects/:id` | Manage a project |
| GET/POST | `/api/suites?project_id=` | List / create suites |
| GET/POST | `/api/cases?suite_id=` | List / create test cases |
| GET/POST | `/api/runs?project_id=` | List / create test runs (`case_ids: [...]`) |
| GET | `/api/runs/:id` | Run detail with cases + statuses |
| PUT | `/api/runs/:id/complete` | Mark a run completed |
| GET/POST | `/api/results?run_case_id=` | Result history / record a new result |
| GET | `/api/jira/status` | Whether Jira integration is configured |

## Notes / what's not included

This is a functional starting point, not a production-hardened clone of TestRail. Not included (yet): authentication/user accounts, role-based permissions, attachments, milestones, reporting/analytics, or a Playwright/CI integration to auto-submit automated test results. The `results` API is generic enough that a CI job (e.g. a Playwright test runner) could POST results to `/api/results` directly to wire that up later.
