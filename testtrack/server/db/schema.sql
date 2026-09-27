-- TestTrack schema (PostgreSQL)

CREATE TABLE IF NOT EXISTS projects (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  description   TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS suites (
  id              SERIAL PRIMARY KEY,
  project_id      INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  parent_suite_id INTEGER REFERENCES suites(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  description     TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cases (
  id                SERIAL PRIMARY KEY,
  suite_id          INTEGER NOT NULL REFERENCES suites(id) ON DELETE CASCADE,
  title             TEXT NOT NULL,
  preconditions     TEXT,
  steps             TEXT,
  expected_result   TEXT,
  priority          TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high','critical')),
  type              TEXT NOT NULL DEFAULT 'functional',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS runs (
  id            SERIAL PRIMARY KEY,
  project_id    INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  description   TEXT,
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at  TIMESTAMPTZ
);

-- Cases included in a given run, with their current status
CREATE TABLE IF NOT EXISTS run_cases (
  id          SERIAL PRIMARY KEY,
  run_id      INTEGER NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
  case_id     INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  status      TEXT NOT NULL DEFAULT 'untested' CHECK (status IN ('untested','passed','failed','blocked','retest')),
  UNIQUE (run_id, case_id)
);

-- History of every execution/result recorded against a run_case
CREATE TABLE IF NOT EXISTS results (
  id            SERIAL PRIMARY KEY,
  run_case_id   INTEGER NOT NULL REFERENCES run_cases(id) ON DELETE CASCADE,
  status        TEXT NOT NULL CHECK (status IN ('passed','failed','blocked','retest')),
  comment       TEXT,
  elapsed_ms    INTEGER,
  tester        TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Jira issues linked to a given result (e.g. auto-created bug on failure)
CREATE TABLE IF NOT EXISTS jira_links (
  id            SERIAL PRIMARY KEY,
  result_id     INTEGER NOT NULL REFERENCES results(id) ON DELETE CASCADE,
  issue_key     TEXT NOT NULL,
  issue_url     TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_suites_project ON suites(project_id);
CREATE INDEX IF NOT EXISTS idx_cases_suite ON cases(suite_id);
CREATE INDEX IF NOT EXISTS idx_runs_project ON runs(project_id);
CREATE INDEX IF NOT EXISTS idx_run_cases_run ON run_cases(run_id);
CREATE INDEX IF NOT EXISTS idx_results_run_case ON results(run_case_id);
