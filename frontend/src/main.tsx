import React from 'react'
import ReactDOM from 'react-dom/client'
import { EnterpriseApp } from './EnterpriseApp.tsx'
import { enterpriseWebSocket } from './services/enterpriseWebSocket'
import './index.css'

// Initialize enterprise WebSocket connection for real-time updates
enterpriseWebSocket.connect().catch(error => {
  console.error('Failed to connect to Enterprise WebSocket:', error);
});

// Production Enterprise Application
const ProductionApp = () => {
  return <EnterpriseApp />;
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ProductionApp />
  </React.StrictMode>,
)