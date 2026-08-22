import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { LibraryProvider } from './context/LibraryContext';
import { Shell } from './components/layout/Shell';
import { ErrorBoundary } from './components/ErrorBoundary';

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LibraryProvider>
          <Shell />
        </LibraryProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
