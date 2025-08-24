import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { Toaster } from 'react-hot-toast';
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Toaster
      toastOptions={{
        style: {
          backgroundColor: '#000000',
          color: '#fff',
        },
      }} />
  </StrictMode>,
)
