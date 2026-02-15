import { useCallback, useState } from 'react';
import { message } from 'antd';

import { entityModelActions } from '@/store/entityModelSlice/entityModelSlice';
import { mapParsedSqlToEntityModel } from '@/components/EntityModelDesigner/sqlMapping';
import { parseSqlToEntityModel } from '@/utils/sqlParser';

export function useSqlImportModal(params: { dispatch: (action: any) => void }) {
  const { dispatch } = params;
  const [isOpen, setIsOpen] = useState(false);
  const [sqlInput, setSqlInput] = useState('');
  const [isParsing, setIsParsing] = useState(false);

  const open = useCallback(() => {
    setSqlInput('');
    setIsOpen(true);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  const importSql = useCallback(async () => {
    const trimmed = sqlInput.trim();
    if (!trimmed) {
      message.warning('请输入 SQL 建表语句');
      return;
    }

    try {
      setIsParsing(true);
      const response = await parseSqlToEntityModel(trimmed);
      const entity = mapParsedSqlToEntityModel(response.model);
      dispatch(entityModelActions.applyEntityModelChange(entity));
      if (response.warnings?.length) {
        message.warning(response.warnings.join('\n'));
      } else {
        message.success('SQL 解析完成，已生成实体模型');
      }
      setIsOpen(false);
    } catch (error) {
      message.error((error as Error)?.message || 'SQL 解析失败');
    } finally {
      setIsParsing(false);
    }
  }, [dispatch, sqlInput]);

  return {
    isOpen,
    sqlInput,
    setSqlInput,
    isParsing,
    open,
    close,
    importSql,
  };
}
