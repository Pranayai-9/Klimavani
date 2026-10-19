import React from 'react';
import { HomePage } from './pages/HomePage';
import { Analytics } from '@vercel/analytics/react';

export const App: React.FC = () => {
  return (
    <>
      <HomePage />
      <Analytics />
    </>
  );
};

export default App;
