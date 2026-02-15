import { type WritableDraft } from 'immer';
import type { ProCommonColumn } from '@/types';
import type { ComponentNodeWithColumns } from '@/types/Component';
import { ProCommonColumnSchema } from '@/types/tableColumsTypes';
import { makeColumnId } from '@/utils/makeIdCreator';

export const upsertColumnOnNode = (
  props: WritableDraft<ComponentNodeWithColumns['props']>,
  changes: Partial<ProCommonColumn>,
  insertPos?: number,
) => {
  props.columns = props?.columns ?? [];
  const idx = props.columns.findIndex((c) => c.key === changes.key);
  if (idx >= 0) {
    Object.assign(props.columns[idx], changes);
  } else {
    const validatedChanges = ProCommonColumnSchema.parse({
      ...changes,
      key: changes.key ?? makeColumnId(),
    });
    if (typeof insertPos === 'number' && insertPos >= 0 && insertPos <= props.columns.length) {
      props.columns.splice(insertPos, 0, validatedChanges);
    } else {
      props.columns.push(validatedChanges);
    }
  }
};
