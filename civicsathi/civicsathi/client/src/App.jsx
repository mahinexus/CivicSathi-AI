import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import HomePage from './pages/Home.jsx';
import Schemes from './pages/Schemes.jsx';
import Assistant from './pages/Assistant.jsx';
import Documents from './pages/Documents.jsx';
import Track from './pages/Track.jsx';
import Profile from './pages/Profile.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="schemes" element={<Schemes />} />
        <Route path="assistant" element={<Assistant />} />
        <Route path="documents" element={<Documents />} />
        <Route path="track" element={<Track />} />
        <Route path="profile" element={<Profile />} />
        <Route path="*" element={<div className="p-8">Page not found.</div>} />
      </Route>
    </Routes>
  );
}
