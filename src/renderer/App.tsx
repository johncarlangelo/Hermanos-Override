import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { LibraryProvider } from './context/LibraryContext';
import { Shell } from './components/layout/Shell';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LibraryProvider>
        <Shell />
      </LibraryProvider>
    </ThemeProvider>
  );
};

export default App;
