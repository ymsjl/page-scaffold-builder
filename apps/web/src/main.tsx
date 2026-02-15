import { createRoot } from 'react-dom/client';
import 'antd/dist/reset.css';
import './styles.css';
import { Provider } from 'react-redux';
import { PageScaffoldBuilderLayout } from './Layout';
import { store } from './store/store';
import ComponentPreview from './components/ComponentPreview/ComponentPreview';
import { componentTreeActions } from './store/componentTreeSlice/componentTreeSlice';
import { preloadComponents } from './preloadComponents';

const getPreviewOnlyParams = () => {
  const params = new URLSearchParams(window.location.search);
  const previewOnly = params.get('previewOnly') === '1';
  const sid = params.get('sid');
  return { previewOnly, sid };
};

const hydrateStoreFromPreviewSnapshot = (sid: string) => {
  const storageKey = `psb.previewSnapshot.${sid}`;
  const raw = localStorage.getItem(storageKey);
  if (!raw) return;

  try {
    const snapshot = JSON.parse(raw) as {
      componentTree?: any;
    };
    if (snapshot?.componentTree) {
      store.dispatch(componentTreeActions.hydrateFromSnapshot(snapshot.componentTree));
    }
  } finally {
    // best-effort cleanup
    localStorage.removeItem(storageKey);
  }
};

const App = () => {
  const { previewOnly } = getPreviewOnlyParams();
  if (previewOnly) {
    return (
      <div style={{ height: '100vh' }}>
        <ComponentPreview initialMode="pure" hideToolbar containerVariant="final" />
      </div>
    );
  }

  return <PageScaffoldBuilderLayout />;
};

const { previewOnly, sid } = getPreviewOnlyParams();
if (previewOnly && sid) {
  hydrateStoreFromPreviewSnapshot(sid);
}

// 预加载所有组件以避免运行时警告
preloadComponents().then(() => {
  createRoot(document.getElementById('root')!).render(
    <Provider store={store}>
      <App />
    </Provider>,
  );
});
