import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client.js';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const load = () =>
    api
      .get('/projects')
      .then((r) => {
        setProjects(Array.isArray(r.data) ? r.data : []);
        setLoadError(Array.isArray(r.data) ? null : 'Unexpected response from server.');
      })
      .catch((err) => {
        setProjects([]);
        setLoadError(err.response?.data?.error || err.message || 'Failed to load projects.');
      })
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const createProject = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    await api.post('/projects', { name, description });
    setName('');
    setDescription('');
    load();
  };

  const removeProject = async (id) => {
    if (!confirm('Delete this project and all its suites/cases/runs?')) return;
    await api.delete(`/projects/${id}`);
    load();
  };

  return (
    <div>
      <h1>Projects</h1>
      <form className="inline-form" onSubmit={createProject}>
        <input placeholder="Project name" value={name} onChange={(e) => setName(e.target.value)} />
        <input placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
        <button type="submit">Create project</button>
      </form>

      {loadError && <p className="notice">Couldn't load projects: {loadError}</p>}

      {loading ? (
        <p>Loading…</p>
      ) : projects.length === 0 ? (
        <p className="empty">No projects yet. Create one above.</p>
      ) : (
        <ul className="card-list">
          {projects.map((p) => (
            <li key={p.id} className="card">
              <div>
                <Link to={`/projects/${p.id}`} className="card-title">{p.name}</Link>
                {p.description && <p className="muted">{p.description}</p>}
              </div>
              <button className="danger" onClick={() => removeProject(p.id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
