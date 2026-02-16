import type { FormItemProps } from 'antd';
import type React from 'react';
import { type RuleNode, type RuleNodeType } from '../RuleParamsDateSchema';

export type AntdRule = Exclude<FormItemProps['rules'], undefined>[number];
export type RuleDescriptor = Pick<RuleNode, 'type' | 'params' | 'message'>;

export type RuleEditorProps = {
  params: Record<string, any>;
  updateParams: (next: Record<string, any>) => void;
};

export interface RuleNodeStrategy {
  type: RuleNodeType;
  Editor?: React.FC<RuleEditorProps> | null;
  buildDefaultMessage(node: Pick<RuleNode, 'type' | 'params'>): string;
  toRule(node: RuleNode, message: string): AntdRule | null;
  applyFieldProps(node: RuleNode, fieldProps: Record<string, any>): void;
}
