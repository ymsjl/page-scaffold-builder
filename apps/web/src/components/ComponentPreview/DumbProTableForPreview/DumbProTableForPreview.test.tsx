import React from 'react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { RenderNodeRefProvider } from '@/components/ComponentPreview/propResolvers';
import { baseApi } from '@/store/api/baseApi';
import { rootReducer } from '@/store/rootReducer';
import type { ProCommonColumn } from '@/types';
import { DumbProTableForPreview } from './DumbProTableForPreview';

const createTestStore = () => {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }).concat(baseApi.middleware),
  });
};

const columns: ProCommonColumn[] = [
  {
    title: '姓名',
    dataIndex: 'name',
    valueType: 'text',
    key: 'name',
    width: 160,
  },
  {
    title: '年龄',
    dataIndex: 'age',
    valueType: 'digit',
    key: 'age',
    width: 120,
  },
];

const getSelectableShell = (element: HTMLElement): HTMLElement => {
  const shell = element.closest<HTMLElement>('[data-selected]');
  if (!shell) {
    throw new Error('Selectable shell not found');
  }

  return shell;
};

const getHeaderButton = (label: string): HTMLElement => {
  const heading = screen.getByRole('heading', { name: '示意表格' });
  const tableSection = heading.parentElement?.parentElement?.parentElement;

  if (!(tableSection instanceof HTMLElement)) {
    throw new Error('Table section not found');
  }

  const headerButton = within(tableSection).getByRole('button', { name: label });

  if (!(headerButton instanceof HTMLElement)) {
    throw new Error(`Header button not found for ${label}`);
  }

  return headerButton;
};

const renderPreview = (store = createTestStore()) => {
  return render(
    <Provider store={store}>
      <RenderNodeRefProvider renderNodeRef={() => null}>
        <DumbProTableForPreview previewNodeId="table-node" columns={columns} />
      </RenderNodeRefProvider>
    </Provider>,
  );
};

describe('DumbProTableForPreview selection surfaces', () => {
  it('clicking a search field only selects the search field shell', async () => {
    const user = userEvent.setup();
    const store = createTestStore();

    renderPreview(store);

    const headerShell = getSelectableShell(getHeaderButton('姓名'));
    const searchInput = screen.getByPlaceholderText('请输入 name');
    const searchShell = getSelectableShell(searchInput);

    await user.click(headerShell);

    expect(headerShell).toHaveAttribute('data-selected', 'true');
    expect(searchShell).toHaveAttribute('data-selected', 'false');

    await user.click(searchShell);

    expect(searchShell).toHaveAttribute('data-selected', 'true');
    expect(headerShell).toHaveAttribute('data-selected', 'false');
    expect(document.querySelectorAll('[data-selected="true"]')).toHaveLength(1);
  });

  it('shows the header context menu only for the selected header surface', async () => {
    const user = userEvent.setup();
    const store = createTestStore();

    renderPreview(store);

    const headerShell = getSelectableShell(getHeaderButton('姓名'));

    fireEvent.contextMenu(headerShell);
    expect(screen.queryByText('编辑该列')).not.toBeInTheDocument();

    await user.click(headerShell);
    fireEvent.contextMenu(headerShell);

    expect(await screen.findByText('编辑该列')).toBeInTheDocument();
    expect(screen.queryByText('编辑字段')).not.toBeInTheDocument();
  });

  it('shows the search field context menu only for the selected search surface', async () => {
    const user = userEvent.setup();
    const store = createTestStore();

    renderPreview(store);

    const searchInput = screen.getByPlaceholderText('请输入 name');
    const searchShell = getSelectableShell(searchInput);

    fireEvent.contextMenu(searchShell);
    expect(screen.queryByText('编辑字段')).not.toBeInTheDocument();

    await user.click(searchShell);
    fireEvent.contextMenu(searchShell);

    expect(await screen.findByText('编辑字段')).toBeInTheDocument();
    expect(screen.queryByText('编辑该列')).not.toBeInTheDocument();
  });
});
