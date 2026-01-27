import React from 'react';
import { createRoot } from 'react-dom/client';
import 'antd/dist/reset.css';
import './styles.css';
import { PageScaffoldBuilderLayout } from './PageScaffoldBuilder/Layout';

function App() {
  return <PageScaffoldBuilderLayout />;
}

createRoot(document.getElementById('root')!).render(<App />);
