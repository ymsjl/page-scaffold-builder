import type { RuleNode, RuleTemplate } from './ruleMapping';

const createTemplateNodeId = (seed: string) => `template_${seed}`;

const createNode = (type: RuleNode['type'], params: RuleNode['params'] = {}, message = ''): RuleNode => ({
  id: createTemplateNodeId(type),
  type,
  enabled: true,
  params,
  message,
});

export const BUILT_IN_RULE_TEMPLATES: RuleTemplate[] = [
  {
    id: 'required',
    name: '必填',
    description: '字段不能为空',
    builtIn: true,
    nodes: [createNode('required')],
  },
  {
    id: 'length',
    name: '长度',
    description: '限制字符串长度范围',
    builtIn: true,
    nodes: [createNode('length', { min: 2, max: 50 })],
  },
  {
    id: 'range',
    name: '范围',
    description: '限制数值范围',
    builtIn: true,
    nodes: [createNode('range', { min: 0, max: 100 })],
  },
  {
    id: 'pattern',
    name: '正则',
    description: '使用正则表达式校验',
    builtIn: true,
    nodes: [createNode('pattern', { pattern: '/^[a-zA-Z0-9_]+$/' })],
  },
  {
    id: 'enum',
    name: '枚举',
    description: '限制可选值',
    builtIn: true,
    nodes: [createNode('enum', { enum: ['A', 'B'] })],
  },
  {
    id: 'email',
    name: '邮箱',
    description: '校验邮箱格式',
    builtIn: true,
    nodes: [createNode('email')],
  },
  {
    id: 'phone',
    name: '手机号',
    description: '校验手机号格式',
    builtIn: true,
    nodes: [createNode('phone')],
  },
];