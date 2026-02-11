import type { RuleNode } from "@/components/RuleBuilder/RuleParamsDateSchema";
import { ruleNodeContext } from "@/components/RuleBuilder/strategies";
import { FormItemPropsZ, ProCommonColumn } from "@/types/tableColumsTypes";
import { ProFieldValueType, ProSchema } from "@ant-design/pro-components";

export const ruleNodesToColumnProps = (
  nodes: RuleNode[],
): {
  formItemProps?: FormItemPropsZ;
  fieldProps?: Record<string, any>;
} => {
  if (!nodes || nodes.length === 0) return {};

  const enabledRuleNodes = nodes.filter((n) => n.enabled);

  const formItemProps: Partial<FormItemPropsZ> = {
    rules: enabledRuleNodes?.map((node) =>
      ruleNodeContext.toRule(node, node.message),
    ),
  };

  const fieldProps: Record<string, any> = {};

  for (const node of enabledRuleNodes) {
    ruleNodeContext.applyFieldProps(node, fieldProps);
  }

  const result: {
    formItemProps?: FormItemPropsZ;
    fieldProps?: Record<string, any>;
  } = { formItemProps: {}, fieldProps: {} };
  if (formItemProps.rules && formItemProps.rules.length > 0)
    result.formItemProps = formItemProps as FormItemPropsZ;
  if (Object.keys(fieldProps).length > 0) result.fieldProps = fieldProps;

  return result;
};

export const mapProCommonColumnToProps = (
  column: Partial<ProCommonColumn>,
): ProSchema<Record<string, any>> => {
  const {
    ruleNodes,
    formItemProps,
    fieldProps,
    valueType,
    ...restColumnProps
  } = column;
  const columnPropsCalcByRules = ruleNodesToColumnProps(ruleNodes || []);
  return {
    ...{ title: "", dataIndex: "", key: "" },
    valueType: valueType as ProFieldValueType,
    ...restColumnProps,
    formItemProps: Object.assign(
      {},
      columnPropsCalcByRules.formItemProps,
      formItemProps,
    ),
    fieldProps: Object.assign(
      {},
      columnPropsCalcByRules.fieldProps,
      fieldProps,
    ),
  };
};
