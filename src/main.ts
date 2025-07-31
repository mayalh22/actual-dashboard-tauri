import React from 'react';
import ReactDOM from 'react-dom/client';
import OmniHubDashboard from './OmniHubDashboard';
import './style.css'; // or whatever your CSS file is called

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <OmniHubDashboard />
  </React.StrictMode>
);
