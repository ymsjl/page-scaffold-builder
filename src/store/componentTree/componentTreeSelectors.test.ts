import { describe, it, expect } from "vitest";
import componentTreeReducer, {
  componentTreeActions,
} from "./componentTreeSlice";
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
