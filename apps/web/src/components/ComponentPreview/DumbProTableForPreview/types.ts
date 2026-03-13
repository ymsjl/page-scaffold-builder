import type { ReactNode } from 'react';
import type { NodeRef, ProCommonColumn } from '@/types';

type PreviewExtras = {
  previewNodeId?: string;
};

export type SerializableProTableProps = PreviewExtras & {
  columns?: ProCommonColumn[];
  rowActions?: NodeRef[];
  headerTitle?: ReactNode;
  ghost?: boolean;
  rowKey?: string;
  search?:
    | {
        layout?: 'vertical' | 'horizontal';
        defaultCollapsed?: boolean;
      }
    | false;
  toolbar?: {
    actions?: unknown;
  };
  pagination?:
    | {
        defaultPageSize?: number;
        showSizeChanger?: boolean;
      }
    | false;
  [key: string]: unknown;
};

export type InlineEditMode =
  | { kind: 'header'; columnKey: string; draft: string }
  | { kind: 'search-label'; columnKey: string; draft: string }
  | null;

export type SearchableColumn = {
  column: ProCommonColumn;
  columnIndex: number;
  dragId: string;
};
