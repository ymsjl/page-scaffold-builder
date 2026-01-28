import type { FormItemProps } from 'antd';
import dayjs from 'dayjs';

export type AntdRule = Exclude<FormItemProps['rules'], undefined>[number];

export type RuleNodeType = 'required' | 'length' | 'range' | 'pattern' | 'email' | 'phone' | 'enum' | 'dateMin' | 'dateMax' | 'dateSpan';

export type RuleNodeScope = 'form' | 'search' | 'both';

export type RuleNodeParams = {
  len?: number;
  min?: number;
  max?: number;
  pattern?: string;
  enum?: Array<string | number>;
  valueType?: 'number' | 'string' | 'array' | 'date';
  // date-specific
  minDate?: string;
  maxDate?: string;
  minSpan?: number; // days
  maxSpan?: number; // days
};

export interface RuleNode {
  id: string;
  type: RuleNodeType;
  enabled: boolean;
  params: RuleNodeParams;
  message: string;
  scope?: RuleNodeScope;
}

export interface RuleTemplate {
  id: string;
  name: string;
  description?: string;
  nodes: RuleNode[];
  builtIn?: boolean;
}

const DEFAULT_PHONE_PATTERN = /^\+?\d{7,15}$/;
const ALT_PHONE_PATTERN = /^1[3-9]\d{9}$/;

const isRuleConfig = (rule: AntdRule): rule is Exclude<AntdRule, (form: any) => AntdRule> => {
  return typeof rule !== 'function';
};

const createRuleNodeId = (seed?: string | number) => {
  if (seed !== undefined) {
    return `rule_${seed}`;
  }
  return `rule_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
};

const isNumberRule = (rule: AntdRule) => (rule as any).type === 'number' || (rule as any).type === 'integer';

const toMessage = (message: any) => (typeof message === 'string' ? message : '');

const serializePattern = (pattern?: RegExp) => {
  if (!pattern) return undefined;
  return pattern.toString();
};

const parsePattern = (pattern?: string) => {
  if (!pattern) return undefined;
  if (pattern.startsWith('/') && pattern.lastIndexOf('/') > 0) {
    const lastSlashIndex = pattern.lastIndexOf('/');
    const source = pattern.slice(1, lastSlashIndex);
    const flags = pattern.slice(lastSlashIndex + 1);
    try {
      return new RegExp(source, flags);
    } catch (error) {
      return undefined;
    }
  }
  try {
    return new RegExp(pattern);
  } catch (error) {
    return undefined;
  }
};

const isPhonePattern = (pattern?: RegExp) => {
  if (!pattern) return false;
  return (
    (pattern.source === DEFAULT_PHONE_PATTERN.source && pattern.flags === DEFAULT_PHONE_PATTERN.flags) ||
    (pattern.source === ALT_PHONE_PATTERN.source && pattern.flags === ALT_PHONE_PATTERN.flags)
  );
};

const buildDefaultMessage = (node: RuleNode) => {
  const { type, params } = node;
  const min = params?.min;
  const max = params?.max;
  const len = params?.len;

  switch (type) {
    case 'required':
      return '此字段为必填项';
    case 'length':
      if (len !== undefined) {
        return `长度需为 ${len}`;
      }
      if (min !== undefined && max !== undefined) {
        return `长度需在 ${min}-${max} 之间`;
      }
      if (min !== undefined) {
        return `长度需至少 ${min}`;
      }
      if (max !== undefined) {
        return `长度需不超过 ${max}`;
      }
      return '长度不符合要求';
    case 'range':
      if (min !== undefined && max !== undefined) {
        return `范围需在 ${min}-${max} 之间`;
      }
      if (min !== undefined) {
        return `范围需不小于 ${min}`;
      }
      if (max !== undefined) {
        return `范围需不大于 ${max}`;
      }
      return '范围不符合要求';
    case 'pattern':
      return '格式不正确';
    case 'email':
      return '邮箱格式不正确';
    case 'phone':
      return '手机号格式不正确';
    case 'dateMin':
      return '日期早于允许范围';
    case 'dateMax':
      return '日期晚于允许范围';
    case 'dateSpan':
      return '日期跨度不符合要求';
    default:
      return '校验未通过';
  }
};

export const getDefaultRuleMessage = (node: RuleNode) => buildDefaultMessage(node);

export const rulesToNodes = (rules: AntdRule[] = []): RuleNode[] => {
  return rules.reduce<RuleNode[]>((acc, rule, index) => {
    if (!isRuleConfig(rule)) {
      return acc;
    }

    const message = toMessage(rule.message);
    const baseNode: Omit<RuleNode, 'type' | 'params'> = {
      id: createRuleNodeId(index),
      enabled: true,
      message: message || '',
    };

    if (rule.type === 'email') {
      acc.push({
        ...baseNode,
        type: 'email',
        params: {},
      });
      return acc;
    }

    if (rule.type === 'enum' || Array.isArray(rule.enum)) {
      acc.push({
        ...baseNode,
        type: 'enum',
        params: { enum: Array.isArray(rule.enum) ? rule.enum : [] },
      });
      return acc;
    }

    if (rule.pattern) {
      if (isPhonePattern(rule.pattern)) {
        acc.push({
          ...baseNode,
          type: 'phone',
          params: {},
        });
      } else {
        acc.push({
          ...baseNode,
          type: 'pattern',
          params: { pattern: serializePattern(rule.pattern) },
        });
      }
      return acc;
    }

    if (rule.len !== undefined || rule.min !== undefined || rule.max !== undefined) {
      if (isNumberRule(rule)) {
        acc.push({
          ...baseNode,
          type: 'range',
          params: {
            min: rule.min,
            max: rule.max,
          },
        });
      } else {
        acc.push({
          ...baseNode,
          type: 'length',
          params: {
            len: rule.len,
            min: rule.min,
            max: rule.max,
          },
        });
      }
      return acc;
    }

    if (rule.required) {
      acc.push({
        ...baseNode,
        type: 'required',
        params: {},
      });
      return acc;
    }

    return acc;
  }, []);
};

export const nodesToRules = (nodes: RuleNode[] = []): AntdRule[] => {
  const result = nodes
    .filter(node => node.enabled)
    .map(node => {
      const message = node.message || buildDefaultMessage(node);

      switch (node.type) {
        case 'required':
          return {
            required: true,
            message,
          };
        case 'length':
          return {
            type: 'string',
            len: node.params.len,
            min: node.params.min,
            max: node.params.max,
            message,
          };
        case 'range':
          return {
            type: node.params.valueType ?? 'number',
            min: node.params.min,
            max: node.params.max,
            message,
          };
        case 'pattern':
          return {
            type: 'string',
            pattern: parsePattern(node.params.pattern),
            message,
          };
        case 'enum':
          return {
            type: 'enum',
            enum: node.params.enum || [],
            message,
          };
        case 'email':
          return {
            type: 'email',
            message,
          };
        case 'phone':
          return {
            type: 'string',
            pattern: DEFAULT_PHONE_PATTERN,
            message,
          };
        case 'dateMin':
          return {
            validator: async (_rule: any, value: any): Promise<void> => {
              if (!value) return Promise.resolve();
              const v = dayjs(value);
              if (!v.isValid()) return Promise.reject(message);
              const min = dayjs(node.params?.minDate);
              if (!min.isValid()) return Promise.resolve();
              if (v.isBefore(min, 'day')) return Promise.reject(message);
              return Promise.resolve();
            },
          };
        case 'dateMax':
          return {
            validator: async (_rule: any, value: any): Promise<void> => {
              if (!value) return Promise.resolve();
              const v = dayjs(value);
              if (!v.isValid()) return Promise.reject(message);
              const max = dayjs(node.params?.maxDate);
              if (!max.isValid()) return Promise.resolve();
              if (v.isAfter(max, 'day')) return Promise.reject(message);
              return Promise.resolve();
            },
          };
        case 'dateSpan':
          return {
            validator: async (_rule: any, value: any): Promise<void> => {
              if (!value) return Promise.resolve();
              const [start, end] = value || [];
              if (!start || !end) return Promise.resolve();
              const s = dayjs(start);
              const e = dayjs(end);
              if (!s.isValid() || !e.isValid()) return Promise.reject(message);
              const diff = e.diff(s, 'day');
              if (node.params?.minSpan !== undefined && diff < node.params.minSpan) return Promise.reject(message);
              if (node.params?.maxSpan !== undefined && diff > node.params.maxSpan) return Promise.reject(message);
              return Promise.resolve();
            },
          };
        default:
          return {
            message,
          };
      }
    })
    .filter(rule => Object.keys(rule).length > 0);

  return result as unknown as AntdRule[];
};

export { DEFAULT_PHONE_PATTERN };