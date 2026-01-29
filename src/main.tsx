import React from 'react';
import { createRoot } from 'react-dom/client';
import 'antd/dist/reset.css';
import './styles.css';
import { PageScaffoldBuilderLayout } from './Layout';
import { Provider } from 'react-redux';
import store from './store/store';

function App() {
  return <PageScaffoldBuilderLayout />;
}

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <App />
  </Provider>,
);
