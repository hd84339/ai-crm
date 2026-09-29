import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import HCPList from './pages/HCPList';
import HCPProfile from './pages/HCPProfile';
import Interactions from './pages/Interactions';
import FollowUps from './pages/FollowUps';
import Analytics from './pages/Analytics';
import Copilot from './pages/Copilot';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="hcps" element={<HCPList />} />
          <Route path="hcps/:id" element={<HCPProfile />} />
          <Route path="interactions" element={<Interactions />} />
          <Route path="follow-ups" element={<FollowUps />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="copilot" element={<Copilot />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;