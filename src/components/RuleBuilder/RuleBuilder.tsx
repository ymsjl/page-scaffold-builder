import React, { useEffect, useRef } from "react";
import { Space } from "antd";
import { useAppDispatch } from "@/store/hooks";
import RulePreview from "./RulePreview";
import RuleLibrary from "./RuleLibrary";
import RuleCanvas from "./RuleCanvas";
import { componentTreeActions } from "@/store/slices/componentTree/componentTreeSlice";

interface RuleBuilderProps {
  name: string;
  label: string;
  valueType?: string;
}

const RuleBuilder: React.FC<RuleBuilderProps> = React.memo(({ name, label, valueType }) => {
  const dispatch = useAppDispatch();
  const lastValueTypeRef = useRef(valueType);

  // 在打开该弹窗时，会初始化表单值，此时不触发规则节点重置，以免 ruleNodes 刚被初始化就被清空
  useEffect(() => {
    if (lastValueTypeRef.current !== valueType) {
      // 只有在不是第一次打开弹窗时，才重置规则节点
      if (!(lastValueTypeRef.current === undefined && valueType !== undefined)) {
        dispatch(componentTreeActions.updateEditingColumn({ ruleNodes: [] }));
      }
      lastValueTypeRef.current = valueType;
    }
  }, [valueType, dispatch]);

  return (
    <Space
      direction="vertical"
      style={{ width: "100%" }}
      size="middle"
    >
      <RulePreview
        name={name}
        label={label}
        valueType={valueType}
      />
      <RuleLibrary valueType={valueType} />
      <RuleCanvas />
    </Space>
  )
});

RuleBuilder.displayName = "RuleBuilder";

export default RuleBuilder;