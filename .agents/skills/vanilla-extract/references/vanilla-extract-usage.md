Quick reference — vanilla-extract (core patterns & Vite)

1) 安装 / Vite 插件
- 运行：
  - `pnpm add @vanilla-extract/css`
  - `pnpm add -D @vanilla-extract/vite-plugin` (匹配你的 Vite 版本)
- Vite 配置：

```js
// vite.config.ts
import { defineConfig } from 'vite';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';

export default defineConfig({
  plugins: [vanillaExtractPlugin()]
});
```

2) 常用 API
- `style({...})` — 创建单一 class
- `styleVariants(source, mapFn?)` — 生成一组变体
- `globalStyle(selector, rules)` — 应用全局样式
- `compose(base, extra)` — 组合 class

示例：
```ts
// button.css.ts
import { style } from '@vanilla-extract/css';
export const btn = style({ padding: 8, borderRadius: 6 });
```

3) 文件与命名约定（推荐）
- 每个组件 colocate：`MyButton.tsx` + `MyButton.css.ts`
- 导出命名常量：`export const root = style({...})`
- 使用 camelCase 导出名对应组件类目的语义

4) 迁移小贴士
- 先迁移 design tokens / 全局样式（createTheme / globalStyle）
- 然后迁移可重用的原子类或 variants（styleVariants / sprinkles）
- 把组件内的行内样式替换为 `style()` 并通过 `className` 应用

5) 测试
- Vitest/Vite：`vanillaExtractPlugin()` 应同时在 Vite 配置中启用（你的项目已配置）

6) 标识符（可选配置）
- `vanillaExtractPlugin({ identifiers: 'debug' })` 或自定义函数
- 在开发环境使用 `debug` 更易于排查，在生产使用 `short`

7) 参考资源
- 官方文档（API / Vite 集成 / 迁移示例）
