import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
 import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
    <Toaster
      toastOptions={{
        style: {
          backgroundColor: '#000000',
          color: '#fff',
        },
      }} />
  </StrictMode>,
)
