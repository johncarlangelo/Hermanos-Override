import React from 'react';
import { LibraryProvider } from './context/LibraryContext';
import { Shell } from './components/layout/Shell';
import { ErrorBoundary } from './components/ErrorBoundary';

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <LibraryProvider>
        <Shell />
      </LibraryProvider>
    </ErrorBoundary>
  );
};

export default App;
