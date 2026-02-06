import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { rootReducer } from "@/store/rootReducer";
import { componentTreeActions } from "@/store/componentTree/componentTreeSlice";
import { DropZone } from "./DropZone";
import { useDroppable } from "@dnd-kit/core";

vi.mock("@dnd-kit/core", () => ({
  useDroppable: vi.fn(),
}));

const mockUseDroppable = vi.mocked(useDroppable);

const buildStoreWithPage = () => {
  const store = configureStore({ reducer: rootReducer });
  store.dispatch(componentTreeActions.addNode({ parentId: null, type: "Page" }));
  const rootId = store.getState().componentTree.rootIds[0];
  if (!rootId) {
    throw new Error("Expected root Page node to exist");
  }
  return { store, rootId };
};

describe("DropZone add component", () => {
  beforeEach(() => {
    mockUseDroppable.mockReturnValue({
      isOver: false,
      setNodeRef: vi.fn(),
      active: null,
    });
  });

  it("shows a component list on hover and adds selected component to slot", async () => {
    const { store, rootId } = buildStoreWithPage();
    const user = userEvent.setup();

    render(
      <Provider store={store}>
        <DropZone
          id={`${rootId}:children`}
          targetNodeId={rootId}
          propPath="children"
          acceptTypes={["Table"]}
          label="页面内容"
        />
      </Provider>,
    );

    const dropZone = screen.getByText("页面内容").closest(".drop-zone");
    if (!dropZone) {
      throw new Error("Expected drop zone element to exist");
    }

    await user.hover(dropZone);
    expect(await screen.findByText("表格组件")).toBeInTheDocument();

    await user.click(screen.getByText("表格组件"));

    const state = store.getState().componentTree;
    const createdNode = Object.values(state.components.entities).find(
      (node) => node && node.type === "Table" && node.parentId === rootId,
    );

    expect(createdNode).toBeTruthy();
    expect(state.components.entities[rootId]?.props?.children).toEqual([
      { type: "nodeRef", nodeId: createdNode?.id },
    ]);
  });

  it("does not open the popover while dragging", async () => {
    mockUseDroppable.mockReturnValue({
      isOver: false,
      setNodeRef: vi.fn(),
      active: { data: { current: { type: "treeNode", nodeType: "Table" } } },
    });

    const { store, rootId } = buildStoreWithPage();
    const user = userEvent.setup();

    render(
      <Provider store={store}>
        <DropZone
          id={`${rootId}:children`}
          targetNodeId={rootId}
          propPath="children"
          acceptTypes={["Table"]}
          label="页面内容"
        />
      </Provider>,
    );

    const dropZone = screen.getByText("页面内容").closest(".drop-zone");
    if (!dropZone) {
      throw new Error("Expected drop zone element to exist");
    }

    await user.hover(dropZone);
    expect(screen.queryByText("表格组件")).toBeNull();
  });
});
