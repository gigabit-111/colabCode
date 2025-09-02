import { Routes, Route } from 'react-router-dom';
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
      <Route path="/editor" element={<EditorPage />} />
    </Routes>
  );
}
export default App;
