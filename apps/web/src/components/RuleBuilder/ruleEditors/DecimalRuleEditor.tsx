import React from 'react';
import { InputNumber } from 'antd';

type Props = {
  params: Record<string, any>;
  updateParams: (next: Record<string, any>) => void;
};

const DecimalRuleEditor: React.FC<Props> = React.memo(({ params, updateParams }) => {
  const precision = params?.precision ?? params?.decimals ?? params?.scale;

  return (
    <InputNumber
      min={0}
      precision={0}
      style={{ width: '100%', marginBottom: 6 }}
      placeholder="小数位数"
      value={precision}
      onChange={(val) => updateParams({ precision: val ?? undefined })}
    />
  );
});

DecimalRuleEditor.displayName = 'DecimalRuleEditor';

export default DecimalRuleEditor;
