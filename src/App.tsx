import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Editor from './pages/Editor';
import Intelligence from './pages/Intelligence';
import About from './pages/About';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/editor" element={<Editor />} />
        <Route path="/intelligence" element={<Intelligence />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Layout>
  );
}
