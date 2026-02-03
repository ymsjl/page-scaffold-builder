import type { RuleNode } from "@/components/RuleBuilder/RuleParamsDateSchema";
import { ruleNodeContext } from "@/components/RuleBuilder/strategies";
import { FormItemPropsZ, ProCommonColumn } from "@/types/tableColumsTypes";

export const ruleNodesToColumnProps = (
  nodes: RuleNode[]
): {
  formItemProps?: FormItemPropsZ;
  fieldProps?: Record<string, any>;
} => {
  if (!nodes || nodes.length === 0) return {};

  const enabledRuleNodes = nodes.filter((n) => n.enabled);

  const formItemProps: Partial<FormItemPropsZ> = {
    rules: enabledRuleNodes?.map((node) => ruleNodeContext.toRule(node, node.message))
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

export const mapProCommonColumnToProps = (column: Partial<ProCommonColumn>): Omit<ProCommonColumn, 'ruleNodes'> => {
  const { ruleNodes, formItemProps, fieldProps, ...restColumnProps } = column;
  const columnPropsCalcByRules = ruleNodesToColumnProps(ruleNodes || []);
  return ({
    ...({ title: '', dataIndex: '', key: '', }),
    ...restColumnProps,
    formItemProps: Object.assign({}, columnPropsCalcByRules.formItemProps, formItemProps),
    fieldProps: Object.assign({}, columnPropsCalcByRules.fieldProps, fieldProps),
  });
};

