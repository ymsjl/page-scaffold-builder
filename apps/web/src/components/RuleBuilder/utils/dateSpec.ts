import dayjs from 'dayjs';
import {
  RelativeDatePresets,
  RuleParamsAbsoluteDateSchema,
  type RuleParamsDate,
  RuleParamsRelativeDateSchema,
} from '../RuleParamsDateSchema';

export const parseDateSpec = (spec: RuleParamsDate) => {
  if (!spec) return null;

  const absoluteDate = RuleParamsAbsoluteDateSchema.safeParse(spec);
  if (absoluteDate.success) {
    const d = dayjs(absoluteDate.data, 'YYYY-MM-DD', true);
    return d.isValid() ? d.startOf('day') : null;
  }

  const relativeDate = RuleParamsRelativeDateSchema.safeParse(spec);
  if (relativeDate.success) {
    const { preset, offset } = relativeDate.data;
    let base: dayjs.Dayjs = dayjs();
    switch (preset) {
      case RelativeDatePresets.LastDayOfMonth:
        base = dayjs().endOf('month');
        break;
      case RelativeDatePresets.LastDayOfYear:
        base = dayjs().endOf('year');
        break;
      default:
        break;
    }

    if (typeof offset === 'number' && offset !== 0) {
      base = base.add(offset, 'day');
    }

    return base.startOf('day');
  }
  return null;
};
