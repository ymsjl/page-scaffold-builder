import type { FormItemProps } from 'antd';
import dayjs from 'dayjs';

export type AntdRule = Exclude<FormItemProps['rules'], undefined>[number];

export type RuleNodeType = 'required' | 'length' | 'range' | 'pattern' | 'email' | 'phone' | 'enum' | 'dateSpan' | 'dateRange' | 'singleDateRange';

export type RuleNodeScope = 'form' | 'search' | 'both';

export type RelativeDateSpec = { type: 'relative'; preset: 'today' | 'yesterday' | 'tomorrow'; offset?: number };

export type RuleNodeParams = {
  // operator: defines comparison type for range-like rules
  operator?: 'between' | 'gte' | 'lte' | 'eq';
  len?: number;
  min?: number;
  max?: number;
  pattern?: string;
  enum?: Array<string | number>;
  valueType?: 'number' | 'string' | 'array' | 'date';
  // date-specific: min/max can be absolute YYYY-MM-DD or RelativeDateSpec
  minDate?: string | RelativeDateSpec;
  maxDate?: string | RelativeDateSpec;
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

// Resolve either an absolute YYYY-MM-DD string or a RelativeDateSpec to a dayjs object (startOf day)
function resolveDateSpec(spec?: string | RelativeDateSpec) {
  if (!spec) return undefined;
  if (typeof spec === 'string') {
    const d = dayjs(spec);
    return d.isValid() ? d.startOf('day') : undefined;
  }
  if (spec.type === 'relative') {
    const base = dayjs().startOf('day');
    let d = base;
    if (spec.preset === 'today') d = base;
    else if (spec.preset === 'yesterday') d = base.add(-1, 'day');
    else if (spec.preset === 'tomorrow') d = base.add(1, 'day');
    if (spec.offset) d = d.add(spec.offset, 'day');
    return d.startOf('day');
  }
  return undefined;
}

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
      if (params?.valueType === 'date') {
        if (params?.minDate && params?.maxDate) return `日期需在 ${stringifyDateSpec(params.minDate)} - ${stringifyDateSpec(params.maxDate)} 之间`;
        if (params?.minDate) return `日期需不早于 ${stringifyDateSpec(params.minDate)}`;
        if (params?.maxDate) return `日期需不晚于 ${stringifyDateSpec(params.maxDate)}`;
        return '日期不符合要求';
      }
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

    case 'dateSpan':
      return '日期跨度不符合要求';
    case 'dateRange':
      if (params?.minDate && params?.maxDate) return `日期需在 ${params.minDate} - ${params.maxDate} 之间`;
      if (params?.minDate) return `日期需不早于 ${params.minDate}`;
      if (params?.maxDate) return `日期需不晚于 ${params.maxDate}`;
      return '日期不符合要求';
    default:
      return '校验未通过';
  }
};

export const getDefaultRuleMessage = (node: RuleNode) => buildDefaultMessage(node);

// helper to display date spec (absolute or relative) in messages
function stringifyDateSpec(s?: string | RelativeDateSpec) {
  if (!s) return '';
  if (typeof s === 'string') return s;
  if (s.type === 'relative') {
    if (s.preset === 'today') return '今天' + (s.offset ? ` ${s.offset > 0 ? `+${s.offset}` : s.offset}天` : '');
    if (s.preset === 'yesterday') return '昨天' + (s.offset ? ` ${s.offset > 0 ? `+${s.offset}` : s.offset}天` : '');
    if (s.preset === 'tomorrow') return '明天' + (s.offset ? ` ${s.offset > 0 ? `+${s.offset}` : s.offset}天` : '');
  }
  return '';
}

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
        const op = rule.min !== undefined && rule.max !== undefined ? (rule.min === rule.max ? 'eq' : 'between') : rule.min !== undefined ? 'gte' : rule.max !== undefined ? 'lte' : 'between';
        acc.push({
          ...baseNode,
          type: 'range',
          params: {
            min: rule.min,
            max: rule.max,
            operator: op,
          },
        });
      } else {
        const op = rule.len !== undefined ? 'eq' : rule.min !== undefined && rule.max !== undefined ? 'between' : rule.min !== undefined ? 'gte' : rule.max !== undefined ? 'lte' : 'between';
        acc.push({
          ...baseNode,
          type: 'length',
          params: {
            len: rule.len,
            min: rule.min,
            max: rule.max,
            operator: op,
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
          if (node.params?.valueType === 'date') {
            return {
              validator: async (_rule: any, value: any): Promise<void> => {
                if (!value) return Promise.resolve();
                const v = dayjs(value);
                if (!v.isValid()) return Promise.reject(message);
                const min = resolveDateSpec(node.params?.minDate);
                const max = resolveDateSpec(node.params?.maxDate);
                if (min && min.isValid() && v.isBefore(min, 'day')) return Promise.reject(message);
                if (max && max.isValid() && v.isAfter(max, 'day')) return Promise.reject(message);
                return Promise.resolve();
              },
            };
          }

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
        case 'dateRange':
          return {
            validator: async (_rule: any, value: any): Promise<void> => {
              if (!value) return Promise.resolve();
              const v = dayjs(value);
              if (!v.isValid()) return Promise.reject(message);
              const min = resolveDateSpec(node.params?.minDate);
              const max = resolveDateSpec(node.params?.maxDate);
              if (min && min.isValid() && v.isBefore(min, 'day')) return Promise.reject(message);
              if (max && max.isValid() && v.isAfter(max, 'day')) return Promise.reject(message);
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