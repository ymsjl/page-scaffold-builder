export const makeIdCreator = (prefix: string) => () =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
export const makeColumnId = makeIdCreator('column');
export const makeNodeId = makeIdCreator('node');
export const makeRuleId = makeIdCreator('rule');
export const makeEntityModelId = makeIdCreator('et');
export const makeVariableId = makeIdCreator('var');
