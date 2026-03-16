# EditableShell 组件设计规范 (Spec)

`EditableShell` 是一个基础包装组件，用于在低代码编辑器中实现组件的可选中、可编辑状态。它负责处理悬停状态、选中状态、工具栏（Toolbar）的显示，以及可选的拖拽激活区域。

## Props 属性定义

| 属性名               | 类型                                                          | 说明                                                                              |
| :------------------- | :------------------------------------------------------------ | :-------------------------------------------------------------------------------- |
| `target`             | `EditableProjection`                                          | 目标投影对象，包含组件的 `id`、`kind` 以及 `outlineVariant` 等。                  |
| `selected`           | `boolean`                                                     | 是否处于选中状态。若为 `true`，工具栏默认可见。                                   |
| `highlighted`        | `boolean`                                                     | 是否高亮（默认 `true`）。用于在画布中显示辅助线/边框。                            |
| `disabled`           | `boolean`                                                     | 是否禁用交互。禁用后不会触发 `onSelect` 及相关 hover/click 事件。                 |
| `toolbar`            | `React.ReactNode`                                             | 悬浮在组件上方的工具栏内容。                                                      |
| `dragActivatorProps` | `React.HTMLAttributes<HTMLDivElement> & React.AriaAttributes` | 透传给 Shell 根节点的拖拽激活属性，通常来自 `dnd-kit` 的 `listeners/attributes`。 |
| `altDragEnabled`     | `boolean`                                                     | 是否启用 Alt 按键拖拽提示；启用后按住 Alt 悬停会显示 `move` 光标。                |
| `placeholder`        | `React.ReactNode`                                             | 当 `children` 为空时显示的占位内容。                                              |
| `children`           | `React.ReactNode`                                             | 组件包装的实际内容。                                                              |
| `onSelect`           | `(event: React.MouseEvent \| React.KeyboardEvent) => void`    | 当组件被点击或按下 Enter/Space 键时的回调。                                       |
| `onMouseEnter`       | `(e: React.MouseEvent<HTMLDivElement>) => void`               | 鼠标进入组件区域的回调。                                                          |
| `onMouseLeave`       | `(e: React.MouseEvent<HTMLDivElement>) => void`               | 鼠标离开组件区域的回调。                                                          |
| `className`          | `string`                                                      | 透传给外层容器的样式类名。                                                        |
| `onClick`            | `React.MouseEventHandler`                                     | 原生点击事件透传。                                                                |
| `onKeyDown`          | `React.KeyboardEventHandler`                                  | 原生键盘事件透传。                                                                |
| `onContextMenu`      | `React.MouseEventHandler`                                     | 原生上下文菜单（右键）事件透传。                                                  |

---

## 内部状态与交互逻辑

### 1. 悬停状态 (Hover)

- `isShellHovered`: 标识鼠标是否在 Shell 容器范围内。
- `isToolbarHovered`: 标识鼠标是否在工具栏弹窗范围内。
- **工具栏延迟关闭**: 为了提升用户体验，防止鼠标移动到工具栏的过程中弹窗消失，设置了 `TOOLBAR_CLOSE_DELAY_MS` (120ms) 的延迟。

### 2. 工具栏可见性 (`toolbarVisible`)

工具栏在满足以下任一条件时显示：

- 组件被选中 (`selected === true`)。
- 鼠标当前在 Shell 容器之上 (`isShellHovered === true`)。
- 鼠标当前在工具栏弹窗之上 (`isToolbarHovered === true`)。

---

## 事件处理程序 (Event Handlers)

### `handleShellMouseEnter` / `handleShellMouseLeave`

管理 Shell 自身的悬停状态。

- `MouseEnter`: 清除关闭定时器，设置 `isShellHovered` 为 `true`。
- `MouseLeave`: 开启延迟关闭定时器。

### `clearHideToolbarTimeout` / `scheduleShellHoverClear`

内部工具函数，用于确保工具栏在鼠标于组件与工具栏之间滑行时能平滑过渡。

### `handleClick`

- 触发外部传入的 `onClick`。
- 如果事件没有被阻止冒泡 (`isPropagationStopped()`)，则触发 `onSelect`。

### `handleKeyDown`

- 支持辅助功能（A11y）。
- 当按下 `Enter` 或 `Space` 键时，如果未被阻止冒泡，则触发 `onSelect`。

### `handleContextMenu`

- 触发外部传入的 `onContextMenu`。
- 仅当 `contextmenu` 由键盘上下文菜单键触发时（而非鼠标右键）才触发 `onSelect`。
- 这样可以兼容外层 `Dropdown` 等基于 `contextmenu` 打开的交互，避免组件在鼠标右键时抢先打断菜单打开流程。

---

## JSX 元素结构

### 1. 根容器 (Root Div)

根据 `isInteractive` (是否有 `onSelect` 且未 `disabled`) 渲染不同的 `div`：

- **交互状态**: 带有 `role="button"`、`tabIndex={0}` 及其对应的键盘事件映射。
- **非交互状态**: 普通内容容器。
- **Data Attributes**: 绑定了 `data-target-id`、`data-target-kind`、`data-selected` 等，便于全局样式控制（如 `Layout.css.ts` 中的 outline 效果）。

### 2. Popover (Ant Design)

包裹在 Shell 外层，用于渲染 `toolbar`。

- `trigger={['hover']}`: 基于悬停触发。
- `open={toolbarVisible}`: 受控显示。
- `placement="topRight"`: 默认对齐到右上角。

### 3. Drag Handle (`styles.dragHandle`)

不再内置单独的拖拽手柄。需要排序的容器可通过 `dragActivatorProps` 将拖拽事件直接挂到 Shell 根节点，并配合 `altDragEnabled` 使用 Alt + 左键按住触发拖拽。

### 4. Content (`styles.content`)

包裹 `children`。如果 `children` 为空且存在 `placeholder`，则渲染 `placeholder`。

### 5. Placeholder (`styles.placeholder`)

当组件没有子节点时，提供一个最小高度（16px）及对应的占位样式，确保组件在画布中仍可被选中和交互。

---

## 样式约定 (CSS with vanilla-extract)

- `.shell`: 基础样式，`position: relative` 为工具栏和外层交互提供参考系。
- `.toolbar`: 包含气泡样式的横向容器，具有阴影和圆角。
- `.toolbarPopoverOverlay`: 通过 `globalStyle` 重置 Ant Design Popover 的内边距和背景，实现自定义工具栏外观。
