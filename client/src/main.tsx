import React from 'react';
import ReactDOM from 'react-dom/client';
import { Capacitor } from '@capacitor/core';
import App from './App';
import './index.css';
import { RootErrorBoundary } from './components/ui/RootErrorBoundary';
import { ThemeProvider } from './context/ThemeContext';
import { checkUrlKillSwitch, unregisterServiceWorkers, clearAllCaches } from './utils/serviceWorkerKillSwitch';

// Check if user requested a cache purge / service-worker reset via query param
checkUrlKillSwitch();

// In native Capacitor builds, purge any stale webview service-workers or CacheStorage
// to ensure the app always uses fresh assets bundled directly in the APK
if (Capacitor.isNativePlatform()) {
  unregisterServiceWorkers().catch(() => {});
  clearAllCaches().catch(() => {});
}

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