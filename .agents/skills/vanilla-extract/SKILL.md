---
name: vanilla-extract
description: "帮助将项目样式迁移到 vanilla-extract (@vanilla-extract/css)。当需要在 Vite + React 项目中：添加 vanilla-extract、把 `.css`/`.scss`/行内样式迁移为 `*.css.ts`、建立 design tokens/sprinkles、或为样式添加测试与规范时使用。"
---

## 概述

提供迁移策略、示例代码、以及可执行的辅助脚本，用于把现有 CSS（外部样式表、组件级样式、以及 React 行内样式）逐步转换为 `vanilla-extract` 的推荐模式（静态、零运行时、类型安全的 CSS-in-TS）。

## 包含内容（捆绑资源）
- references/vanilla-extract-usage.md — 快速使用与 API 摘要
- references/migration-guidelines.md — 分步迁移计划与最佳实践
- scripts/scan-styles.js — 扫描项目中需迁移的样式并生成报告
- scripts/generate-css-ts-templates.js — 从 `.css` 文件自动生成 `*.css.ts` 模板（半自动、需人工补全）

## 触发条件（何时使用本 Skill）
- 需要把整个仓库或某些组件从 CSS / 行内样式 迁移到 `vanilla-extract`。
- 需要一个可重复的迁移计划、检测/报告工具或示例转换。
- 需要在 Vite 项目中正确配置 `@vanilla-extract/vite-plugin` 与测试支持。

## 快速使用
1. 运行扫描：
   `node .agents/skills/vanilla-extract/scripts/scan-styles.js --path apps/web/src`
2. 生成模板（可选）：
   `node .agents/skills/vanilla-extract/scripts/generate-css-ts-templates.js path/to/file.css`
3. 按 `references/migration-guidelines.md` 的步骤逐步迁移并补全生成的 `.css.ts` 模板。

## 要我做的事情（示例）
- 全仓库扫描并输出迁移优先级报告（自动）。
- 把指定的组件或文件从 `.css` / 行内样式 迁移为 `*.css.ts`（逐文件/批量迁移）。
- 添加 tokens / sprinkles 目录并重构共享样式。

## 内联样式迁移指南

### 样式分类与迁移决策

迁移内联样式时，需要识别样式类型并决定是否迁移：

#### ✅ 应该迁移（静态样式）
这些内联样式应该提取到 `.css.ts` 文件：

1. **静态样式常量**
   ```tsx
   // ❌ 迁移前
   const TOOLBAR_STYLE: React.CSSProperties = {
     position: 'fixed',
     bottom: 72,
     zIndex: 20,
   };
   <div style={TOOLBAR_STYLE}>
   
   // ✅ 迁移后
   // styles.css.ts
   export const toolbar = style({
     position: 'fixed',
     bottom: 72,
     zIndex: 20,
   });
   // Component.tsx
   <div className={styles.toolbar}>
   ```

2. **重复的通用样式**
   ```tsx
   // ❌ 迁移前
   <Space direction="vertical" style={{ width: "100%" }}>
   <AutoComplete style={{ width: "100%" }}>
   <Flex style={{ width: "100%" }}>
   
   // ✅ 迁移后 - 提取为共享类
   export const fullWidth = style({ width: '100%' });
   <Space className={styles.fullWidth}>
   <AutoComplete className={styles.fullWidth}>
   ```

3. **静态布局样式**
   ```tsx
   // ❌ 迁移前
   <div style={{ cursor: "grab", display: "flex", alignItems: "center" }}>
   
   // ✅ 迁移后
   export const dragHandle = style({
     cursor: 'grab',
     display: 'flex',
     alignItems: 'center',
   });
   ```

4. **静态定位样式**
   ```tsx
   // ❌ 迁移前
   <Handle style={{ left: "30%" }} />
   
   // ✅ 迁移后
   export const handleTopLeft = style({ left: '30%' });
   <Handle className={styles.handleTopLeft} />
   ```

#### ⚠️ 应该保留（动态样式）
这些内联样式应该保留，因为需要运行时计算：

1. **基于 props/state 的动态值**
   ```tsx
   // ✅ 保留 - 依赖运行时变量
   <div style={{ paddingLeft: `${level * 8}px` }}>
   <div style={{ borderColor: color }}>
   <div style={{ background: enabled ? undefined : "#fafafa" }}>
   ```

2. **第三方组件的 style props**
   ```tsx
   // ✅ 保留 - 组件 API 要求
   <ProCard bodyStyle={{ padding: '16px' }} />
   <Modal overlayInnerStyle={{ borderRadius: 8 }} />
   <ProFormText fieldProps={{ style: { width: "100%" } }} />
   ```

3. **拖拽库的 transform 样式**
   ```tsx
   // ✅ 保留 - 由库动态计算
   const style = {
     transform: CSS.Transform.toString(transform),
     transition,
     opacity: isDragging ? 0.5 : 1,
   };
   <div style={style}>
   ```

### 常见迁移模式

#### 1. 组件生态系统批量迁移
当多个相关组件共享样式时，创建统一的 `.css.ts` 文件：

```typescript
// RuleBuilder.css.ts - 服务整个 RuleBuilder 生态
export const fullWidth = style({ width: '100%' });
export const deleteButton = style({
  background: 'none',
  border: 'none',
  cursor: 'pointer',
});
export const canvasCard = style({ minHeight: 260 });

// 在 RuleBuilder.tsx、RuleCanvas.tsx、RuleItem.tsx 中共享使用
import * as styles from './RuleBuilder.css';
```

#### 2. 扩展现有样式文件
优先扩展现有 `.css.ts` 而不是创建新文件：

```typescript
// EntityModelDesigner/styles.css.ts 已存在
export const setAsPkButton = style({ /* ... */ });

// 添加新样式到同一文件
export const actionsRow = style({ marginBottom: 12 });
export const fullWidth = style({ width: '100%' });
```

#### 3. 父子悬停模式
使用选择器实现悬停显示效果：

```typescript
// ✅ 正确模式 - 在子元素中引用父元素
export const wrapper = style({ /* ... */ });
export const actions = style({
  visibility: 'hidden',
  selectors: {
    [`${wrapper}:hover &`]: {
      visibility: 'visible',
    },
  },
});
```

#### 4. 全局样式处理
第三方组件或库的类名需要全局样式：

```typescript
import { globalStyle } from '@vanilla-extract/css';

export const setAsPkButton = style({ visibility: 'hidden' });

// Ant Design 表格单元格悬停
globalStyle(`.ant-table-cell:hover .${setAsPkButton}`, {
  visibility: 'visible',
});
```

### 迁移工作流

1. **扫描与分析**
   ```bash
   node .agents/skills/vanilla-extract/scripts/scan-styles.js
   # 查看 .vanilla-extract-scan.json 了解剩余内联样式
   ```

2. **读取并分类**
   - 检查每个文件中的 `style={` 使用
   - 区分静态样式 vs 动态样式
   - 识别可复用的通用模式

3. **创建或扩展 .css.ts**
   - 优先扩展同目录已有的 `.css.ts` 文件
   - 为组件生态创建共享样式文件
   - 使用语义化的导出名称

4. **批量更新组件**
   ```typescript
   // 使用 multi_replace_string_in_file 同时更新多个文件
   // 1. 添加 import 语句
   // 2. 替换 style= 为 className=
   // 3. 移除样式常量定义
   ```

5. **验证与测试**
   ```bash
   pnpm --filter ./apps/web test -- --run
   ```

### 常见静态内联样式速查表

| 原始内联样式 | 推荐类名 | vanilla-extract 定义 |
|------------|---------|------------------|
| `style={{ width: "100%" }}` | `className={styles.fullWidth}` | `width: '100%'` |
| `style={{ marginBottom: 12 }}` | `className={styles.actionsRow}` | `marginBottom: 12` |
| `style={{ cursor: "pointer" }}` | `className={styles.clickable}` | `cursor: 'pointer'` |
| `style={{ minHeight: 260 }}` | `className={styles.canvasCard}` | `minHeight: 260` |
| `style={{ borderRadius: 8, padding: 4 }}` | `className={styles.container}` | `{ borderRadius: 8, padding: 4 }` |
| `style={{ fontSize: 12, display: "block" }}` | `className={styles.message}` | `{ fontSize: 12, display: 'block' }` |

### 实际迁移案例

#### 案例 1：工具栏样式常量
- **文件**: `ComponentPreview.tsx`
- **迁移内容**: `TOOLBAR_STYLE`、`TOOLBAR_CONTAINER_STYLE` 常量
- **方法**: 添加到现有 `previewStyles.css.ts`
- **收益**: 移除 2 个样式常量，类型检查更安全

#### 案例 2：组件生态批量迁移
- **文件**: `RuleBuilder.tsx`、`RuleCanvas.tsx`、`RuleItem.tsx`
- **迁移内容**: 创建新的 `RuleBuilder.css.ts` 统一管理
- **方法**: 提取通用样式（fullWidth、deleteButton 等）
- **收益**: 3 个组件共享 5 个样式类，减少重复代码

#### 案例 3：拖拽组件样式
- **文件**: `SchemaList.tsx`
- **迁移内容**: 拖拽手柄、图标样式
- **保留**: dnd-kit 的 transform 和 transition（动态）
- **方法**: 静态定位和视觉样式迁移，动态 transform 保留

### 迁移进度追踪

完成迁移后，记录关键指标：

```bash
# 迁移前
cssFiles: 9, inlineStyleFiles: 25, cssImports: 9

# 迁移后
cssFiles: 0, inlineStyleFiles: 13, cssImports: 2

# 成果
- 所有外部 CSS 文件已迁移 ✅
- 静态内联样式减少 48% (25 → 13)
- 剩余主要为动态样式和第三方组件 props
```

## 最佳实践与注意事项

### ✅ 推荐做法

1. **优先扩展而非新建**
   - 同一组件目录下已有 `.css.ts` 时，扩展它而不是创建新文件
   - 减少文件数量，便于维护

2. **语义化命名**
   - 使用描述用途的名称：`toolbar`、`dragHandle`、`actionsRow`
   - 避免样式值作为名称：`marginBottom12`、`width100`

3. **共享通用样式**
   - 多次使用的样式提取为共享类：`fullWidth`、`clickable`
   - 在组件生态内共享样式文件

4. **渐进式迁移**
   - 先迁移静态样式，保留动态样式
   - 从简单组件开始，逐步处理复杂组件
   - 每次迁移后立即测试

5. **使用批量操作**
   - 相关文件一起迁移（如 RuleBuilder 生态的 3 个文件）
   - 使用 `multi_replace_string_in_file` 提高效率

### ❌ 避免事项

1. **不要迁移动态样式**
   ```tsx
   // ❌ 错误 - 这是动态样式，应保留内联
   <div style={{ paddingLeft: `${level * 8}px` }}>
   ```

2. **不要移除第三方组件的 style props**
   ```tsx
   // ❌ 错误 - ProComponents 的 fieldProps 需要 style 对象
   <ProFormText fieldProps={{ style: { width: "100%" } }} />
   ```

3. **不要在 .css.ts 中使用运行时值**
   ```typescript
   // ❌ 错误 - vanilla-extract 是构建时生成，无法访问运行时变量
   export const dynamic = style({
     color: props.color, // ❌ 不可用
   });
   ```

4. **不要过度拆分样式**
   ```typescript
   // ❌ 过度拆分
   export const mb2 = style({ marginBottom: 2 });
   export const mb4 = style({ marginBottom: 4 });
   export const mb8 = style({ marginBottom: 8 });
   
   // ✅ 使用语义化名称或保留内联
   export const cardGap = style({ marginBottom: 8 });
   ```

### 选择器模式参考

**父悬停显示子元素**：
```typescript
export const wrapper = style({ position: 'relative' });
export const actions = style({
  visibility: 'hidden',
  selectors: {
    [`${wrapper}:hover &`]: { visibility: 'visible' },
  },
});

// 使用
<div className={wrapper}>
  <div className={actions}>...</div>
</div>
```

**全局第三方类名**：
```typescript
import { globalStyle } from '@vanilla-extract/css';

export const button = style({ visibility: 'hidden' });

globalStyle(`.ant-table-cell:hover .${button}`, {
  visibility: 'visible',
});
```

### 故障排除

**问题：样式没有生效**
- 检查 `vite.config.ts` 是否正确配置 `@vanilla-extract/vite-plugin`
- 确认 `.css.ts` 文件在 Vite 处理范围内
- 查看浏览器开发工具，确认类名已生成

**问题：选择器语法错误**
```typescript
// ❌ 错误
selectors: {
  '&:hover ${other}': { ... } // vanilla-extract 不支持
}

// ✅ 正确
selectors: {
  [`${parent}:hover &`]: { ... } // 在子元素中引用父元素
}
```

**问题：类型错误**
- vanilla-extract 样式是编译时生成的字符串
- 不要尝试将 `.css.ts` 导出用作 `React.CSSProperties`
- 只能作为 `className` 使用

### 性能优化

1. **避免过多的全局样式**
   - `globalStyle` 会增加 CSS 体积
   - 优先使用组合和选择器

2. **复用 token**
   - 从 `@/styles/tokens.css` 导入设计 token
   - 保持样式一致性

3. **按需导入**
   ```typescript
   // ✅ 推荐 - 命名空间导入，tree-shaking 友好
   import * as styles from './Component.css';
   
   // ⚠️ 可用但不推荐 - 导入所有内容
   import { style1, style2, style3 } from './Component.css';
   ```

## 快速参考

### 迁移决策流程图

```
发现内联样式 style={...}
    ↓
是否为静态值？
    ├─ 是 → 是否重复使用？
    │        ├─ 是 → 提取为共享类 (fullWidth, clickable)
    │        └─ 否 → 提取为组件专用类 (toolbar, header)
    │
    └─ 否 → 是否依赖运行时变量？
             ├─ 是 (props/state) → 保留内联 ✅
             ├─ 第三方组件 props → 保留内联 ✅
             └─ 拖拽库 transform → 保留内联 ✅
```

### 常用命令速查

```bash
# 扫描项目中的样式使用情况
node .agents/skills/vanilla-extract/scripts/scan-styles.js

# 查看扫描结果
cat .vanilla-extract-scan.json

# 运行测试验证迁移
pnpm --filter ./apps/web test -- --run

# 开发模式验证样式
pnpm --filter ./apps/web dev
```

### 快速模板

**创建新的组件样式文件**：
```typescript
// Component.css.ts
import { style } from '@vanilla-extract/css';

export const container = style({
  // 样式定义
});

export const fullWidth = style({
  width: '100%',
});
```

**组件中使用**：
```tsx
// Component.tsx
import * as styles from './Component.css';

export const Component = () => (
  <div className={styles.container}>
    <div className={styles.fullWidth}>...</div>
  </div>
);
```

**扩展现有样式文件**：
```typescript
// 在已有的 styles.css.ts 末尾添加
export const newStyle = style({
  // 新样式
});
```

### 迁移检查清单

每次迁移后检查：

- [ ] 扫描结果显示内联样式数量减少
- [ ] 所有测试通过
- [ ] 开发服务器正常启动
- [ ] 浏览器中样式显示正确
- [ ] 动态样式仍使用内联方式
- [ ] 第三方组件 props 未被误改
- [ ] 代码可读性提升（语义化类名）
- [ ] 没有重复的样式定义

### 关键文件位置

```
project-root/
├── .vanilla-extract-scan.json          # 扫描结果报告
├── .agents/skills/vanilla-extract/     # Skill 目录
│   ├── SKILL.md                        # 本文档
│   ├── references/                     # 参考文档
│   └── scripts/                        # 辅助脚本
└── apps/web/src/
    ├── styles/
    │   └── tokens.css.ts               # 设计 token
    └── components/
        └── YourComponent/
            ├── YourComponent.tsx       # 组件文件
            └── YourComponent.css.ts    # 样式文件
```



