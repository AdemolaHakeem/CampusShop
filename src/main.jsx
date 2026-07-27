import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import * as Sentry from '@sentry/react';
import App from './App.jsx';
import './index.css';

// Sentry error tracking — catches runtime errors in production
// Go to https://sentry.io to create a project and get your DSN.
// Then add VITE_SENTRY_DSN to your Vercel environment variables.
const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;
if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    integrations: [Sentry.replayIntegration()],
    tracesSampleRate: 0.2,          // 20% of transactions for performance
    replaysSessionSampleRate: 0.1,  // 10% of sessions replayed
    replaysOnErrorSampleRate: 1.0,  // 100% of errors replayed
    environment: import.meta.env.MODE || 'development',
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
