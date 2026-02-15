import { createSelector } from '@reduxjs/toolkit';
import { type MaybeWritable } from '../storeTypes';
import { type RootState } from '../rootReducer';
import { type PropertyPanelState } from './propertyPanelSlice';

export const selectPropertyPanelSlice = (state: RootState) => state.propertyPanel;

export const getNodeIdsInPropertyPanel = (state: MaybeWritable<PropertyPanelState>) =>
  state.propertyPanelNodeIds;

export const selectNodeIdsInPropertyPanel = createSelector(
  selectPropertyPanelSlice,
  getNodeIdsInPropertyPanel,
);

const getSelectShowBackInPropertyPanelResult = (nodeIds: string[]) => {
  return !!nodeIds && nodeIds.length > 0;
};
export const getSelectShowBackInPropertyPanel = (state: MaybeWritable<PropertyPanelState>) =>
  getSelectShowBackInPropertyPanelResult(getNodeIdsInPropertyPanel(state));
export const selectShowBackInPropertyPanel = createSelector(
  selectNodeIdsInPropertyPanel,
  getSelectShowBackInPropertyPanelResult,
);
