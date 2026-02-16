import { PATTERN_PRESETS as VALIDATE_PRESETS } from '../../utils/validate';

// Hoist static presets to avoid recreating them on each render
export const UI_PATTERN_PRESETS = [
  {
    key: 'phoneNigeria',
    label: '尼日利亚手机号',
    value: VALIDATE_PRESETS?.phoneNigeria?.pattern?.source ?? '^0(70|80|81|90|91|98)\\d{8}$',
  },
  {
    key: 'phoneChina',
    label: '中国手机号',
    value: VALIDATE_PRESETS?.phoneChina?.pattern?.source ?? '^1[3-9]\\d{9}$',
  },
  {
    key: 'email',
    label: '邮箱',
    value: VALIDATE_PRESETS?.email?.pattern?.source ?? '^[\\w.-]+@[\\w.-]+\\.[A-Za-z]{2,}$',
  },
  {
    key: 'alpha',
    label: '字母',
    value: VALIDATE_PRESETS?.alpha?.pattern?.source ?? '^[A-Za-z]+$',
  },
  {
    key: 'numeric',
    label: '数字',
    value: VALIDATE_PRESETS?.numeric?.pattern?.source ?? '^\\d+$',
  },

  {
    key: 'alphanumeric',
    label: '字母和数字',
    value: VALIDATE_PRESETS?.alphanumeric?.pattern?.source ?? '^[A-Za-z0-9]+$',
  },
  { key: 'custom', label: '自定义', value: '' },
];

// Small helpers to keep rendering logic readable and memoizable
export const getLengthDefaultOperator = (params: any) => {
  if (params?.operator) return params.operator;
  if (params?.len !== undefined) return 'eq';
  if (params?.min !== undefined && params?.max !== undefined) return 'between';
  if (params?.min !== undefined) return 'gte';
  if (params?.max !== undefined) return 'lte';
  return 'between';
};

export const getRangeDefaultOperator = (params: any) => {
  if (params?.operator) return params.operator;
  if (params?.min !== undefined && params?.max !== undefined)
    return params.min === params.max ? 'eq' : 'between';
  if (params?.min !== undefined) return 'gte';
  if (params?.max !== undefined) return 'lte';
  return 'between';
};

export const getDateDefaultOperator = (params: any) => {
  if (params?.operator) return params.operator;
  if (params?.minDate && params?.maxDate)
    return params.minDate === params.maxDate ? 'eq' : 'between';
  if (params?.minDate) return 'gte';
  if (params?.maxDate) return 'lte';
  return 'between';
};

// Shared options to keep labels consistent and avoid repetition
export const RANGE_OPTIONS = [
  { label: '介于', value: 'between' },
  { label: '等于', value: 'eq' },
  { label: '大于或等于', value: 'gte' },
  { label: '小于或等于', value: 'lte' },
];

export const DATE_RANGE_OPTIONS = [
  { label: '介于', value: 'between' },
  { label: '等于', value: 'eq' },
  { label: '晚于或等于', value: 'gte' },
  { label: '早于或等于', value: 'lte' },
];

/**
 * Compute a minimal params patch when operator changes.
 * - minKey / maxKey: keys to use for range values (e.g. 'min'/'max' or 'minDate'/'maxDate')
 * - eqKey: optional key to use for equality mode (e.g. 'len')
 */
export function computeOperatorParams(
  op: string,
  params: Record<string, any>,
  minKey = 'min',
  maxKey = 'max',
  eqKey?: string,
) {
  if (op === 'eq') {
    const v =
      (eqKey && params[eqKey] !== undefined ? params[eqKey] : (params[minKey] ?? params[maxKey])) ??
      undefined;
    const result: Record<string, any> = { operator: 'eq' };
    if (eqKey) {
      result[eqKey] = v;
      result[minKey] = undefined;
      result[maxKey] = undefined;
    } else {
      result[minKey] = v;
      result[maxKey] = v;
      if (eqKey && params[eqKey] !== undefined) result[eqKey] = undefined;
    }
    return result;
  }
  if (op === 'between') {
    const result: Record<string, any> = {
      operator: 'between',
      [minKey]: params[minKey] ?? undefined,
      [maxKey]: params[maxKey] ?? undefined,
    };
    if (eqKey) result[eqKey] = undefined;
    return result;
  }
  if (op === 'gte') {
    const result: Record<string, any> = {
      operator: 'gte',
      [minKey]: params[minKey] ?? undefined,
      [maxKey]: undefined,
    };
    if (eqKey) result[eqKey] = undefined;
    return result;
  }
  // lte
  const result: Record<string, any> = {
    operator: 'lte',
    [maxKey]: params[maxKey] ?? undefined,
    [minKey]: undefined,
  };
  if (eqKey) result[eqKey] = undefined;
  return result;
}
