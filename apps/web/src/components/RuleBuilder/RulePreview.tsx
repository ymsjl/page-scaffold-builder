import React, { useMemo } from 'react';
import { Card } from 'antd';
import { BetaSchemaForm } from '@ant-design/pro-components';
import { useAppSelector } from '@/store/hooks';
import { selectEditingColumnProps } from '@/store/componentTreeSlice/componentTreeSelectors';

const RulePreview: React.FC<{
  name: string;
  label: string;
  valueType?: string;
}> = React.memo(({ name, label, valueType }) => {
  const columnProps = useAppSelector(selectEditingColumnProps);

  const mergedColumnProps = useMemo(() => {
    return {
      ...columnProps,
      name,
      valueType,
      formItemProps: {
        ...(columnProps?.formItemProps ?? {}),
        name,
        label,
      },
      fieldProps: {
        ...(columnProps?.fieldProps ?? {}),
        style: { width: '100%' },
      },
    };
  }, [columnProps, name, label, valueType]);

  const columns = useMemo(() => [mergedColumnProps], [mergedColumnProps]);

  return (
    <Card size="small" title="规则预览">
      <BetaSchemaForm columns={columns} />
    </Card>
  );
});

RulePreview.displayName = 'RulePreview';

export default RulePreview;
