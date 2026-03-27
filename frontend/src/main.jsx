import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import axios from 'axios'

// Global Axios configuration to bypass localtunnel warning page
axios.interceptors.request.use(config => {
  config.headers['Bypass-Tunnel-Reminder'] = 'true';
  return config;
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
