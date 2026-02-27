import { Routes, Route, Navigate } from 'react-router-dom';
import InitialPage from './pages/InitialPage';
import JoinPage from './pages/JoinPage';
import CreatePage from './pages/CreatePage';
import EditorPage from './pages/EditorPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<InitialPage />} />
      <Route path="/join" element={<JoinPage />} />
      <Route path="/create" element={<CreatePage />} />
      {/* use a standard path with a route parameter */}
      <Route path="/room/:roomId" element={<EditorPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
export default App;
