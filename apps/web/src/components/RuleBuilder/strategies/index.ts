import { type RuleNode, RuleNodeType } from '../RuleParamsDateSchema';
import { RequiredStrategy } from './RequiredStrategy';
import { TextLengthStrategy } from './TextLengthStrategy';
import { TextRegexPatternStrategy } from './TextRegexPatternStrategy';
import { NumericRangeStrategy } from './NumericRangeStrategy';
import { DecimalStrategy } from './DecimalStrategy';
import { DateRangeStrategy } from './DateRangeStrategy';
import { DateRangeSpanStrategy } from './DateRangeSpanStrategy';
import { type RuleNodeStrategy } from './types';
import { RuleNodeContext } from './RuleNodeContext';

export * from './types';
export { RuleNodeContext };

const strategies: Record<RuleNodeType, RuleNodeStrategy> = {
  [RuleNodeType.Required]: new RequiredStrategy(),
  [RuleNodeType.TextLength]: new TextLengthStrategy(),
  [RuleNodeType.TextRegexPattern]: new TextRegexPatternStrategy(),
  [RuleNodeType.NumericRange]: new NumericRangeStrategy(),
  [RuleNodeType.Decimal]: new DecimalStrategy(),
  [RuleNodeType.DateRange]: new DateRangeStrategy(),
  [RuleNodeType.DateRangeSpan]: new DateRangeSpanStrategy(),
};

export const ruleNodeContext = new RuleNodeContext(strategies);

export const getStrategy = (type: RuleNodeType): RuleNodeStrategy =>
  ruleNodeContext.getStrategy(type);

export const getStrategyForNode = (node: RuleNode): RuleNodeStrategy | null =>
  ruleNodeContext.getStrategyForNode(node);
