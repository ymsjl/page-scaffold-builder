import { createListenerMiddleware } from "@reduxjs/toolkit";
import type { AppDispatch, RootState } from "../storeTypes";
import { ruleBuilderActions } from "../slices/ruleBuilderSlice";

export const listenerMiddleware =
  createListenerMiddleware<RootState, AppDispatch>();

listenerMiddleware.startListening({
  predicate: (_action, currentState, previousState) =>
    Boolean(previousState?.schemaEditor?.schemaEditorVisible) &&
    !currentState.schemaEditor.schemaEditorVisible,
  effect: async (_action, api) => {
    api.dispatch(ruleBuilderActions.resetState());
  },
});
