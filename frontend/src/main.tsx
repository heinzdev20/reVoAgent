import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { TestApp } from './TestApp.tsx'
import SimpleApp from './SimpleApp.tsx'
import { DemoLoginApp } from './DemoLoginApp.tsx'
import DebugApp from './DebugApp.tsx'
import SimpleDebugApp from './SimpleDebugApp.tsx'
import MinimalApp from './MinimalApp.tsx'
import WorkingApp from './WorkingApp.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WorkingApp />
  </React.StrictMode>,
)