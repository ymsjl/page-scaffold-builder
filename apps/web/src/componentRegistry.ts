// Centralized component registry to avoid circular imports
// Exports: registerComponent, getRegisteredComponent, lazyLoad

const componentRegistry = new Map<string, React.ComponentType<any>>();

export const registerComponent = (key: string, component: React.ComponentType<any>) => {
  componentRegistry.set(key, component);
};

export const getRegisteredComponent = (key: string): React.ComponentType<any> => {
  const component = componentRegistry.get(key);
  if (!component) {
    // placeholder to avoid runtime errors when a component isn't registered
    return (() => null) as React.ComponentType<any>;
  }
  return component;
};

export const lazyLoad = async (key: string, loader: () => Promise<any>) => {
  if (!componentRegistry.has(key)) {
    const module = await loader();
    const component = module.default || module;
    registerComponent(key, component);
  }
  return componentRegistry.get(key)!;
};
