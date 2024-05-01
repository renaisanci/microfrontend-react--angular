import React from 'react';
import { createRoot } from 'react-dom/client';
import { AppProviders } from './app.providers';
import { AppRouter } from './app.router';

import 'core/i18n/i18n.config'; // ⚠ Make sure i18n instance is configured before anything else.

const App = () => (
  <React.Suspense fallback={null}>
    <AppProviders>
      <AppRouter />
    </AppProviders>
  </React.Suspense>
);

createRoot(document.getElementById('root')).render(<App />);