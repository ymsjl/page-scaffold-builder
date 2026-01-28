export const makeId = (prefix = 'field') => `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const sanitizeProps = (value: any, seen = new WeakSet()): any => {
  if (value == null) return value;
  if (typeof value === 'function') return undefined;
  if (typeof value !== 'object') return value; // primitives
  if (seen.has(value)) return undefined; // circular
  seen.add(value);
  // React element detection
  if ((value as any)?.$$typeof) return undefined;
  // DOM node detection
  if (typeof (value as any).nodeType === 'number') return undefined;
  if (Array.isArray(value)) {
    const arr = value
      .map(v => sanitizeProps(v, seen))
      .filter(v => v !== undefined);
    return arr;
  }
  // Plain object
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(value)) {
    if (typeof v === 'function') continue;
    const s = sanitizeProps(v, seen);
    if (s !== undefined) out[k] = s;
  }
  return out;
};

export const sanitizeNode = (node: any) => {
  if (!node) return node;
  return {
    id: node.id,
    parentId: node.parentId ?? null,
    name: node.name,
    type: node.type,
    isContainer: node.isContainer ?? false,
    props: sanitizeProps(node.props),
    childrenIds: node.childrenIds ?? [],
  };
};
