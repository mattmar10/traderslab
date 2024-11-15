import React from "react";
import { SliderRangeFilter } from "./slider-filter";
import { FilterCriteria } from "@/lib/types/screener-types";
interface ReturnsFiltersProps {
  filters: FilterCriteria;
  handleFilterChange: (key: keyof FilterCriteria, value: any) => void;
  ranges: {
    oneDayReturnRange: [number, number];
    oneWeekReturnRange: [number, number];
    oneMonthReturnRange: [number, number];
    threeMonthReturnRange: [number, number];
    sixMonthReturnRange: [number, number];
    oneYearReturnRange: [number, number];
  };
}

const ReturnsFilters: React.FC<ReturnsFiltersProps> = ({
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
      <h3 className="text-lg font-semibold mb-4">Returns Filters</h3>

      <SliderRangeFilter
        minValue={ranges.oneDayReturnRange[0]}
        maxValue={ranges.oneDayReturnRange[1]}
        initialMinValue={
          filters.oneDayReturnPercentRange
            ? filters.oneDayReturnPercentRange[0]
            : ranges.oneDayReturnRange[0]
        }
        initialMaxValue={
          filters.oneDayReturnPercentRange
            ? filters.oneDayReturnPercentRange[1]
            : ranges.oneDayReturnRange[1]
        }
        steps={0.01}
        onValueChange={(value) =>
          handleRangeChange("oneDayReturnPercentRange", value)
        }
        header={"1 Day Return %"}
      />

      <SliderRangeFilter
        minValue={ranges.oneWeekReturnRange[0]}
        maxValue={ranges.oneWeekReturnRange[1]}
        initialMinValue={
          filters.oneWeekReturnPercentRange
            ? filters.oneWeekReturnPercentRange[0]
            : ranges.oneWeekReturnRange[0]
        }
        initialMaxValue={
          filters.oneWeekReturnPercentRange
            ? filters.oneWeekReturnPercentRange[1]
            : ranges.oneWeekReturnRange[1]
        }
        steps={0.01}
        onValueChange={(value) =>
          handleRangeChange("oneWeekReturnPercentRange", value)
        }
        header={"1 Week Return %"}
      />

      <SliderRangeFilter
        minValue={ranges.oneMonthReturnRange[0]}
        maxValue={ranges.oneMonthReturnRange[1]}
        initialMinValue={
          filters.oneMonthReturnPercentRange
            ? filters.oneMonthReturnPercentRange[0]
            : ranges.oneMonthReturnRange[0]
        }
        initialMaxValue={
          filters.oneMonthReturnPercentRange
            ? filters.oneMonthReturnPercentRange[1]
            : ranges.oneMonthReturnRange[1]
        }
        steps={0.01}
        onValueChange={(value) =>
          handleRangeChange("oneMonthReturnPercentRange", value)
        }
        header={"1 Month Return %"}
      />

      <SliderRangeFilter
        minValue={ranges.threeMonthReturnRange[0]}
        maxValue={ranges.threeMonthReturnRange[1]}
        initialMinValue={
          filters.threeMonthReturnPercentRange
            ? filters.threeMonthReturnPercentRange[0]
            : ranges.threeMonthReturnRange[0]
        }
        initialMaxValue={
          filters.threeMonthReturnPercentRange
            ? filters.threeMonthReturnPercentRange[1]
            : ranges.threeMonthReturnRange[1]
        }
        steps={0.01}
        onValueChange={(value) =>
          handleRangeChange("threeMonthReturnPercentRange", value)
        }
        header={"3 Month Return %"}
      />

      <SliderRangeFilter
        minValue={ranges.sixMonthReturnRange[0]}
        maxValue={ranges.sixMonthReturnRange[1]}
        initialMinValue={
          filters.sixMonthReturnPercentRange
            ? filters.sixMonthReturnPercentRange[0]
            : ranges.sixMonthReturnRange[0]
        }
        initialMaxValue={
          filters.sixMonthReturnPercentRange
            ? filters.sixMonthReturnPercentRange[1]
            : ranges.sixMonthReturnRange[1]
        }
        steps={0.01}
        onValueChange={(value) =>
          handleRangeChange("sixMonthReturnPercentRange", value)
        }
        header={"6 Month Return %"}
      />

      <SliderRangeFilter
        minValue={ranges.oneYearReturnRange[0]}
        maxValue={ranges.oneYearReturnRange[1]}
        initialMinValue={
          filters.oneYearReturnPercentRange
            ? filters.oneYearReturnPercentRange[0]
            : ranges.oneYearReturnRange[0]
        }
        initialMaxValue={
          filters.oneYearReturnPercentRange
            ? filters.oneYearReturnPercentRange[1]
            : ranges.oneYearReturnRange[1]
        }
        steps={0.01}
        onValueChange={(value) =>
          handleRangeChange("oneYearReturnPercentRange", value)
        }
        header={"1 Year Return %"}
      />
    </div>
  );
};

export default ReturnsFilters;
