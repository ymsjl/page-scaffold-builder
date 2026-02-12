import { createRoot } from 'react-dom/client';
import 'antd/dist/reset.css';
import './styles.css';
import { PageScaffoldBuilderLayout } from './Layout';
import { Provider } from 'react-redux';
import store from './store/store';
import ComponentPreview from './components/ComponentPreview/ComponentPreview';
import { componentTreeActions } from './store/componentTree/componentTreeSlice';

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

function App() {
  const { previewOnly } = getPreviewOnlyParams();
  if (previewOnly) {
    return (
      <div style={{ height: '100vh' }}>
        <ComponentPreview initialMode="pure" hideToolbar containerVariant="final" />
      </div>
    );
  }

  return <PageScaffoldBuilderLayout />;
}

const { previewOnly, sid } = getPreviewOnlyParams();
if (previewOnly && sid) {
  hydrateStoreFromPreviewSnapshot(sid);
}

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <App />
  </Provider>,
);
