迁移指南（分步、可复现）

目标：把项目的样式（包括 `.css` 文件、组件级样式和 React 行内样式）逐步迁移到 `vanilla-extract`，在不中断现有功能的前提下逐步替换。

步骤概览（优先级顺序）
1. **配置与验证** — 确保 `vanilla-extract` 插件在 Vite/测试中生效（已完成）。
2. **建立 design tokens** — 在 `src/styles/tokens` 中建立颜色、间距、字号的导出常量或 `createTheme`。
3. **迁移全局样式** — 把 `styles.css` 的 reset/global 转为 `globalStyle`。
4. **迁移共享类/utility** — 把可复用的小类（如 `.flex-center`、`.container`）转为 `style` 或 `sprinkles`。
5. **组件按优先级迁移** — 优先迁移：公共组件 → 页面容器 → 次要组件。小步提交，每次只改一个或一组组件并同时运行测试。
6. **替换行内样式** — 把行内对象抽成 `style()` 或 `variants` 并替换为 `className`。
7. **清理与移除** — 删除旧的 `.css`、更新 import，以及调整 ESLint 规则（如需要禁止行内样式）。

转换示例
- CSS 文件 → `*.css.ts`：
  - `.btn { padding: 8px; background: blue; }` →

```ts
// button.css.ts
import { style } from '@vanilla-extract/css';
export const btn = style({ padding: 8, background: 'blue' });
```

- React 行内样式 → `style()`：
```tsx
// before
<div style={{ padding: 12, color: '#333' }}>text</div>

// after (MyComp.css.ts)
export const padded = style({ padding: 12, color: '#333' });

// usage
<div className={styles.padded}>text</div>
```

约定与最佳实践
- 每个组件 `*.css.ts` colocate，导出清晰的命名（root / container / header / body）
- 复用 tokens：不要在多个文件中硬编码同一颜色/间距
- 将复杂的样式变体放入 `styleVariants` 并导出为命名集合
- 小步迁移、覆盖测试并保留回滚点（git 分支/PR）

测试与 CI
- 在单元/集成测试中加载生成的 CSS（Vite + Vitest 插件）
- 在 PR 中加入视觉回归或对比（可选）

常见问题
- "我能自动把所有 CSS 转为 CSS-in-TS 吗？" — 不能完全自动化；可用脚本生成模板和报告，具体样式需要人工校验。
- "行内样式如何转换？" — 优先把可重用部分抽成样式常量；对仅一次性样式可以保留行内但建议逐步减少。


