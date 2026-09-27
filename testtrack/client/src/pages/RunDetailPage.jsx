import { useEffect, useState, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/client.js';

const STATUS_OPTIONS = ['passed', 'failed', 'blocked', 'retest'];

function ResultForm({ runCase, jiraConfigured, onSubmitted }) {
  const [status, setStatus] = useState('passed');
  const [comment, setComment] = useState('');
  const [tester, setTester] = useState('');
  const [createJira, setCreateJira] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/results', {
        run_case_id: runCase.run_case_id,
        status,
        comment,
        tester,
        create_jira_issue: status === 'failed' && createJira,
      });
      setComment('');
      onSubmitted();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="result-form" onSubmit={submit}>
      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      <input placeholder="Tester name" value={tester} onChange={(e) => setTester(e.target.value)} />
      <input placeholder="Comment (optional)" value={comment} onChange={(e) => setComment(e.target.value)} />
      {status === 'failed' && jiraConfigured && (
        <label className="jira-check">
          <input type="checkbox" checked={createJira} onChange={(e) => setCreateJira(e.target.checked)} />
          Create Jira issue
        </label>
      )}
      <button type="submit" disabled={submitting}>{submitting ? 'Saving…' : 'Record result'}</button>
    </form>
  );
}

export default function RunDetailPage() {
  const { runId } = useParams();
  const [run, setRun] = useState(null);
  const [jiraStatus, setJiraStatus] = useState({ configured: false });
  const [history, setHistory] = useState({}); // run_case_id -> results[]
  const [expanded, setExpanded] = useState(null);
  const [loadError, setLoadError] = useState(null);

  const load = useCallback(async () => {
    try {
      const [runRes, jiraRes] = await Promise.all([
        api.get(`/runs/${runId}`),
        api.get('/jira/status'),
      ]);
      setRun({ ...runRes.data, cases: Array.isArray(runRes.data?.cases) ? runRes.data.cases : [] });
      setJiraStatus(jiraRes.data || { configured: false });
      setLoadError(null);
    } catch (err) {
      setLoadError(err.response?.data?.error || err.message || 'Failed to load run.');
    }
  }, [runId]);

  useEffect(() => { load(); }, [load]);

  const loadHistory = async (runCaseId) => {
    const res = await api.get('/results', { params: { run_case_id: runCaseId } });
    setHistory((prev) => ({ ...prev, [runCaseId]: res.data }));
    setExpanded(runCaseId === expanded ? null : runCaseId);
  };

  const completeRun = async () => {
    await api.put(`/runs/${runId}/complete`);
    load();
  };

  if (loadError) return <p className="notice">Couldn't load this run: {loadError}</p>;
  if (!run) return <p>Loading…</p>;

  const summary = STATUS_OPTIONS.reduce((acc, s) => {
    acc[s] = run.cases.filter((c) => c.status === s).length;
    return acc;
  }, { untested: run.cases.filter((c) => c.status === 'untested').length });

  return (
    <div>
      <p><Link to={`/projects/${run.project_id}`}>&larr; Back to project</Link></p>
      <h1>{run.name}</h1>
      <p className="muted">Status: {run.status}{run.completed_at ? ` · completed ${new Date(run.completed_at).toLocaleString()}` : ''}</p>

      <div className="summary-bar">
        {Object.entries(summary).map(([k, v]) => (
          <span key={k} className={`badge status-${k}`}>{k}: {v}</span>
        ))}
      </div>

      {run.status === 'active' && <button onClick={completeRun}>Mark run complete</button>}

      {!jiraStatus.configured && (
        <p className="notice">Jira isn't configured yet (set JIRA_* env vars on the server) — failed results won't offer to create issues.</p>
      )}

      <ul className="run-case-list">
        {run.cases.map((rc) => (
          <li key={rc.run_case_id} className={`run-case status-${rc.status}`}>
            <div className="run-case-header" onClick={() => loadHistory(rc.run_case_id)}>
              <span className={`badge status-${rc.status}`}>{rc.status}</span>
              <strong>{rc.title}</strong>
              <span className="muted">{rc.priority}</span>
            </div>

            <ResultForm runCase={rc} jiraConfigured={jiraStatus.configured} onSubmitted={() => { load(); loadHistory(rc.run_case_id); }} />

            {expanded === rc.run_case_id && (
              <div className="history">
                {(history[rc.run_case_id] || []).length === 0 ? (
                  <p className="muted">No results recorded yet.</p>
                ) : (
                  <ul>
                    {(history[rc.run_case_id] || []).map((h) => (
                      <li key={h.id}>
                        <span className={`badge status-${h.status}`}>{h.status}</span>{' '}
                        {h.tester && <em>{h.tester}</em>}{' '}
                        {h.comment && <span>— {h.comment}</span>}{' '}
                        {h.issue_key && (
                          <a href={h.issue_url} target="_blank" rel="noreferrer">[{h.issue_key}]</a>
                        )}
                        <span className="muted"> · {new Date(h.created_at).toLocaleString()}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
