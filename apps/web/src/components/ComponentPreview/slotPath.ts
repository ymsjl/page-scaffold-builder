import { get } from 'lodash-es';

export const getValueByPath = (obj: Record<string, unknown>, path: string): unknown =>
  get(obj, path);

export function setValueByPath(
  obj: Record<string, unknown>,
  path: string,
  value: unknown,
): Record<string, unknown> {
  const parts = path.split('.');

  const setValue = (target: Record<string, unknown>, index: number): Record<string, unknown> => {
    const key = parts[index];
    if (index === parts.length - 1) {
      return { ...target, [key]: value };
    }

    const currentChild = target[key];
    const nextChild =
      currentChild && typeof currentChild === 'object'
        ? (currentChild as Record<string, unknown>)
        : {};

    return {
      ...target,
      [key]: setValue(nextChild, index + 1),
    };
  };

  return setValue(obj, 0);
}
