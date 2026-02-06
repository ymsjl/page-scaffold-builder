# Nested Component Preview Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Render a full component tree preview from the Page root with selectable nodes and children driven by `childrenIds`.

**Architecture:** Normalize node props during preview resolution (merge defaults, map columns, inject `children` from `childrenIds` for containers). Use a Page-root selector to drive preview, then reuse the existing slot + NodeRef pipeline for nested rendering.

**Tech Stack:** React, Redux Toolkit, Reselect, Vitest, TypeScript.

---

### Task 1: Add a Page-root preview selector

**Files:**
- Create: `src/store/componentTree/componentTreeSelectors.test.ts`
- Modify: `src/store/componentTree/componentTreeSelectors.tsx`

**Step 1: Write the failing test**

```typescript
import { describe, it, expect } from "vitest";
import componentTreeReducer, { componentTreeActions } from "./componentTreeSlice";
import { selectPreviewRootNodeId } from "./componentTreeSelectors";

describe("selectPreviewRootNodeId", () => {
  it("returns Page root when present", () => {
    let state = componentTreeReducer(undefined, { type: "" } as any) as any;
    state = componentTreeReducer(
      state,
      componentTreeActions.addNode({ parentId: null, type: "Page" }),
    );

    const rootId = state.rootIds[0];
    const rootState = { componentTree: state } as any;
    expect(selectPreviewRootNodeId(rootState)).toBe(rootId);
  });

  it("returns null when no Page root", () => {
    let state = componentTreeReducer(undefined, { type: "" } as any) as any;
    state = componentTreeReducer(
      state,
      componentTreeActions.addNode({ parentId: null, type: "Table" }),
    );

    const rootState = { componentTree: state } as any;
    expect(selectPreviewRootNodeId(rootState)).toBeNull();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test -- src/store/componentTree/componentTreeSelectors.test.ts`

Expected: FAIL with `selectPreviewRootNodeId is not a function` or import error.

**Step 3: Write minimal implementation**

```typescript
export const selectPreviewRootNodeId = createSelector(
  selectComponentTreeState,
  componentNodesSelectors.selectEntities,
  (state, entities) => {
    const rootId = state.rootIds.find((id) => entities[id]?.type === "Page");
    return rootId ?? null;
  },
);

export const selectPreviewRootNode = createSelector(
  componentNodesSelectors.selectEntities,
  selectPreviewRootNodeId,
  (entities, id) => (id ? entities[id] ?? null : null),
);
```

**Step 4: Run test to verify it passes**

Run: `pnpm test -- src/store/componentTree/componentTreeSelectors.test.ts`

Expected: PASS.

**Step 5: Commit**

```bash
git add src/store/componentTree/componentTreeSelectors.tsx src/store/componentTree/componentTreeSelectors.test.ts

git commit -m "test: add preview root selector"
```

---

### Task 2: Normalize preview props (childrenIds + columns)

**Files:**
- Create: `src/components/ComponentPreview/nodeRefLogic.test.ts`
- Modify: `src/components/ComponentPreview/nodeRefLogic.ts`

**Step 1: Write the failing test**

```typescript
import { describe, it, expect } from "vitest";
import type { ComponentNode } from "@/types";
import { resolveNodeFromPrototype } from "./nodeRefLogic";

describe("resolveNodeFromPrototype (preview normalization)", () => {
  it("replaces children with NodeRefs derived from childrenIds", () => {
    const node = {
      id: "node1",
      type: "Page",
      name: "Page",
      props: { children: "ignore" },
      childrenIds: ["node2"],
      isContainer: true,
    } as ComponentNode;

    const prototype = { component: "div", defaultProps: {} } as any;
    const resolved = resolveNodeFromPrototype(node, prototype);

    expect(resolved.mergedProps.children).toEqual([
      { type: "nodeRef", nodeId: "node2" },
    ]);
  });

  it("maps columns into renderable props", () => {
    const node = {
      id: "node1",
      type: "Table",
      name: "Table",
      props: {
        columns: [{ key: "c1", dataIndex: "name", title: "Name" }],
      },
      childrenIds: [],
      isContainer: false,
    } as ComponentNode;

    const prototype = { component: "div", defaultProps: {} } as any;
    const resolved = resolveNodeFromPrototype(node, prototype);

    const column = (resolved.mergedProps.columns as any[])[0];
    expect(column.key).toBe("c1");
    expect(column.title).toBe("Name");
    expect(column.formItemProps).toEqual({});
    expect(column.fieldProps).toEqual({});
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test -- src/components/ComponentPreview/nodeRefLogic.test.ts`

Expected: FAIL (children not mapped, columns not normalized).

**Step 3: Write minimal implementation**

```typescript
import { mapProCommonColumnToProps } from "@/store/componentTree/mapProCommonColumnToProps";
import type { NodeRef } from "@/types";

const buildChildrenRefs = (childrenIds: string[]): NodeRef[] =>
  childrenIds.map((nodeId) => ({ type: "nodeRef", nodeId }));

const normalizeNodePropsForPreview = (
  node: ComponentNode,
  defaultProps: Record<string, unknown> | undefined,
): Record<string, unknown> => {
  const mergedProps = mergeNodeProps(defaultProps, node.props ?? {});

  if (Array.isArray(mergedProps.columns)) {
    mergedProps.columns = mergedProps.columns.map(mapProCommonColumnToProps);
  }

  if (node.isContainer) {
    mergedProps.children = buildChildrenRefs(node.childrenIds ?? []);
  }

  return mergedProps;
};

export const resolveNodeFromPrototype = (
  node: ComponentNode,
  prototype: PrototypeLike,
): ResolvedNode => ({
  nodeId: node.id,
  component: prototype.component,
  mergedProps: normalizeNodePropsForPreview(node, prototype.defaultProps),
});
```

**Step 4: Run test to verify it passes**

Run: `pnpm test -- src/components/ComponentPreview/nodeRefLogic.test.ts`

Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/ComponentPreview/nodeRefLogic.ts src/components/ComponentPreview/nodeRefLogic.test.ts

git commit -m "test: normalize preview props for nested render"
```

---

### Task 3: Render full tree preview from Page root

**Files:**
- Modify: `src/components/ComponentPreview/ComponentPreview.tsx`
- Modify: `src/components/ComponentPreview/ComponentPreviewInner.tsx`
- Modify: `src/componentMetas.ts`
- Create: `src/componentMetas.test.ts`

**Step 1: Write the failing test**

```typescript
import { describe, it, expect } from "vitest";
import { componentPrototypeMap } from "@/componentMetas";

describe("componentMetas (children slot)", () => {
  it("defines a children slot for Page", () => {
    const page = componentPrototypeMap.Page;
    const childrenSlot = page.slots?.find((slot) => slot.path === "children");
    expect(childrenSlot).toBeTruthy();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test -- src/componentMetas.test.ts`

Expected: FAIL because the test file does not exist yet.

**Step 3: Write minimal implementation**

- Add a `children` slot to container prototypes (Page) in `componentMetas.ts`.
- Update `ComponentPreview.tsx` to use `selectPreviewRootNode` and render the Page root instead of the selected node.
- Update `ComponentPreviewInner.tsx` to accept `childrenIds` and use the normalized props path (no local columns mapping).

**Step 4: Run test to verify it passes**

Run: `pnpm test -- src/componentMetas.test.ts`

Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/ComponentPreview/ComponentPreview.tsx src/components/ComponentPreview/ComponentPreviewInner.tsx src/componentMetas.ts src/componentMetas.test.ts

git commit -m "feat: render preview from Page root"
```

---

Plan complete and saved to `docs/plans/2026-02-06-nested-preview-implementation-plan.md`. Two execution options:

1. Subagent-Driven (this session) - I dispatch fresh subagent per task, review between tasks, fast iteration
2. Parallel Session (separate) - Open new session with executing-plans, batch execution with checkpoints

Which approach?
