import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: '14px',
          borderRadius: '10px',
        },
        success: { iconTheme: { primary: '#4F46E5', secondary: '#fff' } },
      }}
    />
  </React.StrictMode>,
)
