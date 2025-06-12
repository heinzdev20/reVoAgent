import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Initialize unified WebSocket connection
import { unifiedWebSocketService } from './services/unifiedWebSocketService'

unifiedWebSocketService.connect().catch(error => {
  console.error('Failed to connect to WebSocket:', error);
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)