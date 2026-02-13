import React from "react";
import { Select } from "antd";

type Option = { label: string; value: string };

type Props = {
  value?: string;
  onChange: (op: string) => void;
  options: Option[];
  style?: React.CSSProperties;
};

export default React.memo(function OperatorSelect({
  value,
  onChange,
  options,
  style,
}: Props) {
  return (
    <Select
      value={value}
      onChange={onChange}
      options={options}
      style={{ width: "100%", marginBottom: 6, ...(style || {}) }}
    />
  );
});
