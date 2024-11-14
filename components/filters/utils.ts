import {
  FilterCriteria,
  FilterGroup,
  ScreenerRanges,
} from "@/lib/types/screener-types";
import { isRangeKey, RangeKeys } from "./filters-types";

export function adjustFilterGroupForSave(
  group: FilterGroup,
  ranges: ScreenerRanges
): FilterGroup {
  return {
    ...group,
    filters: group.filters.map((filter) => {
      if ("operator" in filter) {
        return adjustFilterGroupForSave(filter as FilterGroup, ranges);
      } else {
        return adjustFilterCriteriaForSave(filter as FilterCriteria, ranges);
      }
    }),
  };
}

export function adjustFilterCriteriaForSave(
  criteria: FilterCriteria,
  ranges: ScreenerRanges
): FilterCriteria {
  const adjustedCriteria: FilterCriteria = { ...criteria };

  Object.keys(criteria).forEach((key) => {
    if (isRangeKey(key)) {
      const rangeKey = key as RangeKeys;

      const range = ranges[rangeKey as keyof ScreenerRanges] || [1, 100];
      const numericRange = range as [number, number];

      if (
        criteria[rangeKey] &&
        Array.isArray(criteria[rangeKey]) &&
        criteria[rangeKey]!.length === 2
      ) {
        adjustedCriteria[rangeKey] = [
          criteria[rangeKey]![0] === numericRange[0]
            ? Number.MIN_SAFE_INTEGER
            : criteria[rangeKey]![0],
          criteria[rangeKey]![1] === numericRange[1]
            ? Number.MAX_VALUE
            : criteria[rangeKey]![1],
        ];
      }
    }
  });

  return adjustedCriteria;
}
