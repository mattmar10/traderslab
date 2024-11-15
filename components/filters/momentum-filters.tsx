import React from "react";
import { SliderRangeFilter } from "./slider-filter";
import { FilterCriteria } from "@/lib/types/screener-types";

interface MomentumFiltersProps {
  filters: FilterCriteria;
  handleFilterChange: (key: keyof FilterCriteria, value: any) => void;
  ranges: {
    trendMomentumRange: [number, number];
    volatilityAdjustedTrendMomentumRange: [number, number];
    // Add other ranges as needed
  };
}

const MomentumFilters: React.FC<MomentumFiltersProps> = ({
  filters,
  handleFilterChange,
  ranges,
}) => {
  const handleRangeChange = (
    key: keyof FilterCriteria,
    value: number[] | undefined
  ) => {
    if (value === undefined) {
      handleFilterChange(key, undefined);
    } else {
      handleFilterChange(key, value as [number, number]);
    }
  };

  return (
    <div className="mt-4 w-full pb-6 border-b border-foreground/30">
      <div className="text-lg font-semibold mb-4">Momentum Filters</div>

      <SliderRangeFilter
        minValue={ranges.trendMomentumRange[0]}
        maxValue={ranges.trendMomentumRange[1]}
        initialMinValue={
          filters.trendMomentumRange
            ? filters.trendMomentumRange[0]
            : ranges.trendMomentumRange[0]
        }
        initialMaxValue={
          filters.trendMomentumRange
            ? filters.trendMomentumRange[1]
            : ranges.trendMomentumRange[1]
        }
        steps={0.01}
        onValueChange={(value) =>
          handleRangeChange("trendMomentumRange", value)
        }
        header={"Trend Momentum"}
      />

      <SliderRangeFilter
        minValue={ranges.volatilityAdjustedTrendMomentumRange[0]}
        maxValue={ranges.volatilityAdjustedTrendMomentumRange[1]}
        initialMinValue={
          filters.volatilityAdjustedTrendMomentumRange
            ? filters.volatilityAdjustedTrendMomentumRange[0]
            : ranges.volatilityAdjustedTrendMomentumRange[0]
        }
        initialMaxValue={
          filters.volatilityAdjustedTrendMomentumRange
            ? filters.volatilityAdjustedTrendMomentumRange[1]
            : ranges.volatilityAdjustedTrendMomentumRange[1]
        }
        steps={0.01}
        onValueChange={(value) =>
          handleRangeChange("volatilityAdjustedTrendMomentumRange", value)
        }
        header={"Volatility Adjusted Trend Momentum"}
      />
    </div>
  );
};

export default MomentumFilters;
