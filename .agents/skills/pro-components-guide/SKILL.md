---
name: pro-components-guide
description: 包含 Ant Design Pro Components (ProComponents) 的组件列表、适用场景及官方文档链接。用于辅助代码生成和参数查询。
---

# ProComponents Guide & Documentation

当用户询问 Ant Design Pro 组件、构建后台页面或需要查找具体组件参数时，请参考以下目录。
**关键指令**：如果需要编写详细代码且不确定某个 Props（如 `request` 的返回值格式、`columns` 的具体配置），请使用浏览工具（Browsing Tool）读取对应的 URL。

## 1. Layout 布局组件
**核心组件**: `ProLayout`
- **文档链接**: [https://pro-components.antdigital.dev/components/layout](https://pro-components.antdigital.dev/components/layout)
- **包含**:
    - `ProLayout`: 解决侧边栏、顶部导航、面包屑等全局布局。
    - `PageContainer`: 页面的标准容器，自动生成面包屑和标题。
    - `FooterToolbar`: 底部固定工具栏。
    - `WaterMark`: 水印组件。

## 2. Table 表格与列表
**核心组件**: `ProTable`
- **ProTable (超级表格)**:
    - **文档链接**: [https://pro-components.antdigital.dev/components/table](https://pro-components.antdigital.dev/components/table)
    - **用途**: 包含查询表单、工具栏、表格体的全功能表格，CRUD 标配。
- **EditableProTable (可编辑表格)**:
    - **文档链接**: [https://pro-components.antdigital.dev/components/editable-table](https://pro-components.antdigital.dev/components/editable-table)
    - **用途**: 行内编辑、实时保存。
- **DragSortTable (拖拽排序)**:
    - **文档链接**: [https://pro-components.antdigital.dev/components/drag-sort-table](https://pro-components.antdigital.dev/components/drag-sort-table)
- **ProList (高级列表)**:
    - **文档链接**: [https://pro-components.antdigital.dev/components/list](https://pro-components.antdigital.dev/components/list)
    - **用途**: 卡片列表、文章列表，支持展开、选择。

## 3. Form 表单组件
**核心组件**: `ProForm`
- **通用表单 (ProForm, ModalForm, DrawerForm, StepsForm)**:
    - **文档链接**: [https://pro-components.antdigital.dev/components/form](https://pro-components.antdigital.dev/components/form)
    - **用途**:
        - `ProForm`: 标准页面表单。
        - `ModalForm`: 弹窗表单。
        - `DrawerForm`: 抽屉表单。
        - `StepsForm`: 分步表单。
        - `LoginForm`: 登录页专用。
- **SchemaForm (JSON配置表单)**:
    - **文档链接**: [https://pro-components.antdigital.dev/components/schema-form](https://pro-components.antdigital.dev/components/schema-form)
- **QueryFilter (筛选表单)**:
    - **文档链接**: [https://pro-components.antdigital.dev/components/query-filter](https://pro-components.antdigital.dev/components/query-filter)

## 4. Data Display 数据展示
- **ProCard (高级卡片)**:
    - **文档链接**: [https://pro-components.antdigital.dev/components/card](https://pro-components.antdigital.dev/components/card)
    - **用途**: 页面切分、分栏布局、栅格布局。
- **ProDescriptions (定义列表)**:
    - **文档链接**: [https://pro-components.antdigital.dev/components/descriptions](https://pro-components.antdigital.dev/components/descriptions)
    - **用途**: 详情页展示，支持 `columns` 定义。
- **StatisticCard (指标卡)**:
    - **文档链接**: [https://pro-components.antdigital.dev/components/statistic-card](https://pro-components.antdigital.dev/components/statistic-card)

## 5. Other 其他
- **ProSkeleton (骨架屏)**:
    - **文档链接**: [https://pro-components.antdigital.dev/components/skeleton](https://pro-components.antdigital.dev/components/skeleton)
- **ProField (原子组件)**:
    - **文档链接**: [https://pro-components.antdigital.dev/components/field](https://pro-components.antdigital.dev/components/field)
    - **用途**: 根据 valueType 渲染只读/编辑模式的原子组件。

## 最佳实践提醒
1. **Request 模式**: ProTable 和 ProForm 推荐使用 `request` 属性配合 `async` 函数来接管数据加载，而不是手动管理 loading 和 data state。详情请查阅 ProTable 文档中的 `request` 部分。
2. **ValueType**: 善用 `valueType` ('money', 'date', 'select' 等) 来自动格式化显示和表单项，减少手写 render 代码。