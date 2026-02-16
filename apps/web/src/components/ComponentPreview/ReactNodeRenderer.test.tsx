import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { rootReducer } from '@/store/rootReducer';
import { addNode } from '@/store/componentTreeSlice/componentTreeSlice';
import { ReactNodeRenderer } from './ReactNodeRenderer';

const buildStoreWithNestedPage = () => {
  const store = configureStore({ reducer: rootReducer });
  store.dispatch(addNode({ parentId: null, type: 'Page' }));
  const rootId = store.getState().componentTree.normalizedTree.result[0];
  store.dispatch(addNode({ parentId: rootId, type: 'Page' }));
  const childId =
    store.getState().componentTree.normalizedTree.entities.nodes[rootId]?.childrenIds[0];
  if (!childId) {
    throw new Error('Expected child Page node to exist');
  }
  return { store, childId };
};

describe('ReactNodeRenderer', () => {
  it('renders nested node slots with drop zones', () => {
    const { store, childId } = buildStoreWithNestedPage();

    render(
      <Provider store={store}>
        <ReactNodeRenderer nodeRefs={[{ type: 'nodeRef', nodeId: childId }]} />
      </Provider>,
    );

    // slot label may render as visible text or title attribute depending on DropZone
    expect(screen.getByTitle('页面内容')).toBeInTheDocument();
  });
});
