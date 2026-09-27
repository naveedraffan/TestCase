import { Routes, Route, Link } from 'react-router-dom';
import ProjectsPage from './pages/ProjectsPage.jsx';
import ProjectDetailPage from './pages/ProjectDetailPage.jsx';
import RunDetailPage from './pages/RunDetailPage.jsx';

export default function App() {
  return (
    <div className="app">
      <header className="topbar">
        <Link to="/" className="brand">TestTrack</Link>
        <span className="tag">Node.js test case management</span>
      </header>
      <main className="content">
        <Routes>
          <Route path="/" element={<ProjectsPage />} />
          <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
          <Route path="/runs/:runId" element={<RunDetailPage />} />
        </Routes>
      </main>
    </div>
  );
}
