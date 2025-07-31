import React from 'react';
import { createRoot } from 'react-dom/client';
import OmniHubDashboard from './OmniHubDashboard';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <OmniHubDashboard />
  </React.StrictMode>
);
