import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { RootErrorBoundary } from './components/ui/RootErrorBoundary';
import { ThemeProvider } from './context/ThemeContext';
import { checkUrlKillSwitch } from './utils/serviceWorkerKillSwitch';

// Check if user requested a cache purge / service-worker reset via query param
checkUrlKillSwitch();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <RootErrorBoundary>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </RootErrorBoundary>
  </React.StrictMode>
);