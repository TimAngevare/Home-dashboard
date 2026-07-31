import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.jsx';
import { reloadIfNotRecent } from './lib/selfHeal.js';
import './styles/index.css';
import './styles/theme.css';
import './styles/animations.css';

// Kiosk has no keyboard/mouse to recover a stuck tab - errors that happen
// outside React's render (event handlers, timers, rejected promises) never
// reach an ErrorBoundary, so catch them here and self-heal.
window.addEventListener('error', () => reloadIfNotRecent());
window.addEventListener('unhandledrejection', () => reloadIfNotRecent());

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
);
