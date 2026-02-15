# 组件注册表模式 - 解决循环引用

## 问题背景

原有架构存在严重的循环引用问题：

```
componentMetas.ts 
  → 导入 ProTableForPreview/ModalForPreview 
    → 导入 ReactNodeRenderer 
      → 调用 getComponentPrototype 
        → 回到 componentMetas.ts (循环！)
```

## 解决方案

采用**组件注册表模式**（Registry Pattern），实现控制反转（IoC）：

### 核心原理

1. **移除直接导入**：componentMetas.ts 不再直接 import 组件
2. **延迟注册**：组件在运行时通过注册表动态获取
3. **预加载机制**：应用启动时批量加载所有组件

### 实现细节

#### 1. 组件注册表 (componentMetas.ts)

```typescript
// 组件注册表
const componentRegistry = new Map<string, React.ComponentType<any>>();

// 注册组件
export const registerComponent = (key: string, component: React.ComponentType<any>) => {
  componentRegistry.set(key, component);
};

// 获取组件（带占位符fallback）
const getRegisteredComponent = (key: string): React.ComponentType<any> => {
  const component = componentRegistry.get(key);
  if (!component) {
    console.warn(`Component "${key}" not registered yet`);
    return (() => null) as React.ComponentType<any>;
  }
  return component;
};
```

#### 2. 使用 getter 延迟访问

```typescript
export const componentPrototypeMap: Record<ComponentType, ComponentPrototype> = {
  Table: {
    name: 'Table',
    label: '表格组件',
    // 使用 getter，访问时才从注册表获取
    get component() { 
      return getRegisteredComponent('ProTableForPreview'); 
    },
    // ... 其他配置
  },
};
```

#### 3. 预加载函数

```typescript
// 懒加载辅助函数
const lazyLoad = async (key: string, loader: () => Promise<any>) => {
  if (!componentRegistry.has(key)) {
    const module = await loader();
    const component = module.default || module;
    registerComponent(key, component);
  }
  return componentRegistry.get(key)!;
};

// 预加载所有组件
export const preloadComponents = async () => {
  await Promise.all([
    lazyLoad('ProTableForPreview', () => 
      import('@/components/ComponentPreview/ProTableForPreview/ProTableForPreview')
    ),
    lazyLoad('Button', () => 
      import('antd').then(m => ({ default: m.Button }))
    ),
    // ... 其他组件
  ]);
};
```

#### 4. 应用入口调用 (main.tsx)

```typescript
import { preloadComponents } from "./componentMetas";

// 预加载所有组件后再渲染
preloadComponents().then(() => {
  createRoot(document.getElementById("root")!).render(
    <Provider store={store}>
      <App />
    </Provider>,
  );
});
```

## 优势

### ✅ 解决循环引用
- componentMetas.ts 不再导入任何组件文件
- 组件文件可以自由导入 componentMetas

### ✅ 保持向后兼容
- API 完全不变：`getComponentPrototype(type)` 仍然同步返回
- 使用 getter，对调用方透明

### ✅ 性能优化
- **代码分割**：组件可按需加载（虽然目前预加载）
- **缓存机制**：组件只加载一次，后续从注册表获取

### ✅ 易于扩展
- 添加新组件：在 `preloadComponents` 中注册即可
- 支持运行时动态注册第三方组件

### ✅ 错误处理
- 未注册组件返回占位符，避免崩溃
- 控制台警告，便于调试

## 迁移影响

### 已修改文件
1. **componentMetas.ts** - 核心改造
   - 移除所有组件导入
   - 添加注册表机制
   - 组件定义使用 getter

2. **main.tsx** - 入口调整
   - 导入 `preloadComponents`
   - 启动前预加载组件

### 测试结果
✅ 21/21 测试通过  
✅ 无运行时错误  
✅ 类型检查通过

## 未来优化方向

### 1. 真正的按需加载
可以移除 `preloadComponents`，让组件在首次使用时才加载：

```typescript
const getRegisteredComponent = (key: string): React.ComponentType<any> => {
  if (!componentRegistry.has(key)) {
    // 触发懒加载（需要改为异步）
    lazyLoad(key, loaderMap[key]);
  }
  return componentRegistry.get(key)!;
};
```

### 2. 组件热更新
注册表模式天然支持 HMR（Hot Module Replacement）：

```typescript
if (import.meta.hot) {
  import.meta.hot.accept('./components/Button', (newModule) => {
    registerComponent('Button', newModule.default);
  });
}
```

### 3. 插件系统
第三方可通过注册表扩展组件：

```typescript
// 插件代码
import { registerComponent } from '@/componentMetas';
import MyCustomComponent from './MyCustomComponent';

registerComponent('MyCustomComponent', MyCustomComponent);
```

## 总结

通过组件注册表模式，我们成功：
- ✅ 解决了严重的循环引用问题
- ✅ 保持了 100% API 兼容性
- ✅ 提升了代码的可维护性和扩展性
- ✅ 为未来优化留下了空间

这是一个**最小改动、最大效果**的重构方案。
