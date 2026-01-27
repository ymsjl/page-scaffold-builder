export const PATTERN_PRESETS = {
  phoneChina: { pattern: /^1[3-9]\d{9}$/, message: 'Please Enter Valid Phone' },
  phoneNigeria: { pattern: /^0(70|80|81|90|91|98)\d{8}$/, message: 'Please Enter Valid Phone' },
  email: { pattern: /^[\w.-]+@[\w.-]+\.[A-Za-z]{2,}$/, message: 'Please Enter Valid Email' },
  alpha: { pattern: /^[A-Za-z]+$/, message: 'Please Enter Letters Only' },
  numeric: { pattern: /^\d+$/, message: 'Please Enter Digits Only' },
};

export const validatePatternFactory = (pattern: RegExp | string, msgKey?: string) => {
  const reg = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
  return (_rule: any, value: any) => {
    if (!value) return Promise.resolve();
    if (!reg.test(value)) return Promise.reject(msgKey || 'Invalid format');
    return Promise.resolve();
  };
};
