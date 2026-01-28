import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { EntityType } from "@/types";
import type { ComponentInstance } from "@/types/Component";
import { immer } from "zustand/middleware/immer";
import { PersistOptions, devtools } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";
import { BuilderState } from "./BuilderState";
import { createSelectors } from "./createSelectors";

import { PersistedState } from "./sliceTypes";
import { createComponentTreeSlice } from "./slices/createComponentTreeSlice";
import { createEntityTypeSlice } from "./slices/createEntityTypeSlice";
import { createUISlice } from "./slices/createUISlice";
import { createSelectedNodeSlice } from "./slices/createSelectedNodeSlice";

const persistOptions: PersistOptions<BuilderState, PersistedState> = {
  name: "PageScaffoldBuilder-storage",
  version: 1,
  storage: createJSONStorage(() => localStorage),
};

import type { Mutators } from "./sliceTypes";

const useBuilderStoreBase = create<BuilderState, Mutators>(
  devtools(
    persist(
      immer((...a) => ({
        ...createComponentTreeSlice(...a),
        ...createEntityTypeSlice(...a),
        ...createUISlice(...a),
        ...createSelectedNodeSlice(...a),
      })),

      persistOptions,
    ),
  ),
);

export const useBuilderStore = createSelectors(useBuilderStoreBase);

export const selectedNodeSelector = (
  state: BuilderState,
): ComponentInstance | null =>
  state.componentTree.selectedNodeId
    ? state.componentTree.nodesById[state.componentTree.selectedNodeId]
    : null;

export const useEntityTypes = (): EntityType[] =>
  useBuilderStore(
    useShallow((state) => {
      return state.entityType.allIds.map((id) => state.entityType.byId[id]);
    }),
  );
