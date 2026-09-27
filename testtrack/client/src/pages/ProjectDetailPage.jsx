import { useEffect, useState, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/client.js';

export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [suites, setSuites] = useState([]);
  const [cases, setCases] = useState({}); // suite_id -> cases[]
  const [runs, setRuns] = useState([]);

  const [suiteName, setSuiteName] = useState('');
  const [activeSuiteId, setActiveSuiteId] = useState(null);
  const [caseForm, setCaseForm] = useState({ title: '', steps: '', expected_result: '', priority: 'medium' });

  const [runName, setRunName] = useState('');
  const [selectedCaseIds, setSelectedCaseIds] = useState([]);
  const [loadError, setLoadError] = useState(null);

  const loadAll = useCallback(async () => {
    try {
      const [projRes, suitesRes, runsRes] = await Promise.all([
        api.get(`/projects/${projectId}`),
        api.get('/suites', { params: { project_id: projectId } }),
        api.get('/runs', { params: { project_id: projectId } }),
      ]);
      const suiteList = Array.isArray(suitesRes.data) ? suitesRes.data : [];
      setProject(projRes.data);
      setSuites(suiteList);
      setRuns(Array.isArray(runsRes.data) ? runsRes.data : []);

      const caseEntries = await Promise.all(
        suiteList.map((s) =>
          api.get('/cases', { params: { suite_id: s.id } }).then((r) => [s.id, Array.isArray(r.data) ? r.data : []])
        )
      );
      setCases(Object.fromEntries(caseEntries));
      setLoadError(null);
    } catch (err) {
      setLoadError(err.response?.data?.error || err.message || 'Failed to load project.');
    }
  }, [projectId]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const createSuite = async (e) => {
    e.preventDefault();
    if (!suiteName.trim()) return;
    await api.post('/suites', { project_id: projectId, name: suiteName });
    setSuiteName('');
    loadAll();
  };

  const createCase = async (e, suiteId) => {
    e.preventDefault();
    if (!caseForm.title.trim()) return;
    await api.post('/cases', { suite_id: suiteId, ...caseForm });
    setCaseForm({ title: '', steps: '', expected_result: '', priority: 'medium' });
    setActiveSuiteId(null);
    loadAll();
  };

  const toggleCaseSelected = (id) => {
    setSelectedCaseIds((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  };

  const createRun = async (e) => {
    e.preventDefault();
    if (!runName.trim() || selectedCaseIds.length === 0) return;
    const res = await api.post('/runs', { project_id: projectId, name: runName, case_ids: selectedCaseIds });
    setRunName('');
    setSelectedCaseIds([]);
    loadAll();
    window.location.href = `/runs/${res.data.id}`;
  };

  if (loadError) return <p className="notice">Couldn't load this project: {loadError}</p>;
  if (!project) return <p>Loading…</p>;

  const allCases = Object.values(cases).flat();

  return (
    <div>
      <p><Link to="/">&larr; All projects</Link></p>
      <h1>{project.name}</h1>
      {project.description && <p className="muted">{project.description}</p>}

      <section>
        <h2>Test suites &amp; cases</h2>
        <form className="inline-form" onSubmit={createSuite}>
          <input placeholder="New suite name" value={suiteName} onChange={(e) => setSuiteName(e.target.value)} />
          <button type="submit">Add suite</button>
        </form>

        {suites.length === 0 && <p className="empty">No suites yet.</p>}

        {suites.map((suite) => (
          <div className="suite-block" key={suite.id}>
            <h3>{suite.name}</h3>
            <ul className="case-list">
              {(cases[suite.id] || []).map((c) => (
                <li key={c.id}>
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedCaseIds.includes(c.id)}
                      onChange={() => toggleCaseSelected(c.id)}
                    />
                    <strong>{c.title}</strong>
                    <span className={`badge priority-${c.priority}`}>{c.priority}</span>
                  </label>
                </li>
              ))}
            </ul>

            {activeSuiteId === suite.id ? (
              <form className="case-form" onSubmit={(e) => createCase(e, suite.id)}>
                <input
                  placeholder="Case title"
                  value={caseForm.title}
                  onChange={(e) => setCaseForm({ ...caseForm, title: e.target.value })}
                />
                <textarea
                  placeholder="Steps"
                  value={caseForm.steps}
                  onChange={(e) => setCaseForm({ ...caseForm, steps: e.target.value })}
                />
                <textarea
                  placeholder="Expected result"
                  value={caseForm.expected_result}
                  onChange={(e) => setCaseForm({ ...caseForm, expected_result: e.target.value })}
                />
                <select
                  value={caseForm.priority}
                  onChange={(e) => setCaseForm({ ...caseForm, priority: e.target.value })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
                <div className="row">
                  <button type="submit">Save case</button>
                  <button type="button" className="secondary" onClick={() => setActiveSuiteId(null)}>Cancel</button>
                </div>
              </form>
            ) : (
              <button className="secondary" onClick={() => setActiveSuiteId(suite.id)}>+ Add case</button>
            )}
          </div>
        ))}
      </section>

      <section>
        <h2>Create a test run</h2>
        <p className="muted">Check cases above, then name and launch a run.</p>
        <form className="inline-form" onSubmit={createRun}>
          <input placeholder="Run name" value={runName} onChange={(e) => setRunName(e.target.value)} />
          <button type="submit" disabled={selectedCaseIds.length === 0}>
            Start run ({selectedCaseIds.length} case{selectedCaseIds.length === 1 ? '' : 's'})
          </button>
        </form>
      </section>

      <section>
        <h2>Runs</h2>
        {runs.length === 0 ? (
          <p className="empty">No runs yet.</p>
        ) : (
          <ul className="card-list">
            {runs.map((r) => (
              <li key={r.id} className="card">
                <div>
                  <Link to={`/runs/${r.id}`} className="card-title">{r.name}</Link>
                  <p className="muted">{r.status} · started {new Date(r.created_at).toLocaleString()}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {allCases.length === 0 && (
        <p className="empty">Add at least one test case before creating a run.</p>
      )}
    </div>
  );
}
