
import { FilterCriteria, ScreenerRanges } from "@/lib/types/screener-types";
import { SliderRangeFilter } from "./slider-filter";

interface PerformanceFiltersProps {
  filters: FilterCriteria;
  handleFilterChange: (key: keyof FilterCriteria, value: any) => void;
  ranges: ScreenerRanges;
}

const PerformanceFilters: React.FC<PerformanceFiltersProps> = ({
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
    <div className="mt-4 w-full ">
      <SliderRangeFilter
        minValue={ranges.oneDayAbsoluteChangeRange[0]}
        maxValue={ranges.oneDayAbsoluteChangeRange[1]}
        initialMinValue={
          filters.oneDayAbsoluteChangeRange
            ? filters.oneDayAbsoluteChangeRange[0]
            : ranges.oneDayAbsoluteChangeRange[0]
        }
        initialMaxValue={
          filters.oneDayAbsoluteChangeRange
            ? filters.oneDayAbsoluteChangeRange[1]
            : ranges.oneDayAbsoluteChangeRange[1]
        }
        steps={0.1}
        onValueChange={(value) =>
          handleRangeChange("oneDayAbsoluteChangeRange", value)
        }
        header={"1 Day Change $"}
        className="py-2"
      />
      <SliderRangeFilter
        minValue={ranges.oneDayReturnPercentRange[0]}
        maxValue={ranges.oneDayReturnPercentRange[1]}
        initialMinValue={
          filters.oneDayReturnPercentRange
            ? filters.oneDayReturnPercentRange[0]
            : ranges.oneDayReturnPercentRange[0]
        }
        initialMaxValue={
          filters.oneDayReturnPercentRange
            ? filters.oneDayReturnPercentRange[1]
            : ranges.oneDayReturnPercentRange[1]
        }
        steps={0.01}
        onValueChange={(value) =>
          handleRangeChange("oneDayReturnPercentRange", value)
        }
        header={"1 Day Return %"}
        className="py-2"
      />
      <SliderRangeFilter
        minValue={ranges.oneWeekReturnPercentRange[0]}
        maxValue={ranges.oneWeekReturnPercentRange[1]}
        initialMinValue={
          filters.oneWeekReturnPercentRange
            ? filters.oneWeekReturnPercentRange[0]
            : ranges.oneWeekReturnPercentRange[0]
        }
        initialMaxValue={
          filters.oneWeekReturnPercentRange
            ? filters.oneWeekReturnPercentRange[1]
            : ranges.oneWeekReturnPercentRange[1]
        }
        steps={0.01}
        onValueChange={(value) =>
          handleRangeChange("oneWeekReturnPercentRange", value)
        }
        header={"1 Week Return %"}
        className="py-2"
      />
      <SliderRangeFilter
        minValue={ranges.oneMonthReturnPercentRange[0]}
        maxValue={ranges.oneMonthReturnPercentRange[1]}
        initialMinValue={
          filters.oneMonthReturnPercentRange
            ? filters.oneMonthReturnPercentRange[0]
            : ranges.oneMonthReturnPercentRange[0]
        }
        initialMaxValue={
          filters.oneMonthReturnPercentRange
            ? filters.oneMonthReturnPercentRange[1]
            : ranges.oneMonthReturnPercentRange[1]
        }
        steps={0.01}
        onValueChange={(value) =>
          handleRangeChange("oneMonthReturnPercentRange", value)
        }
        header={"1 Month Return %"}
        className="py-2"
      />

      <SliderRangeFilter
        minValue={ranges.threeMonthReturnPercentRange[0]}
        maxValue={ranges.threeMonthReturnPercentRange[1]}
        initialMinValue={
          filters.threeMonthReturnPercentRange
            ? filters.threeMonthReturnPercentRange[0]
            : ranges.threeMonthReturnPercentRange[0]
        }
        initialMaxValue={
          filters.threeMonthReturnPercentRange
            ? filters.threeMonthReturnPercentRange[1]
            : ranges.threeMonthReturnPercentRange[1]
        }
        steps={0.01}
        onValueChange={(value) =>
          handleRangeChange("threeMonthReturnPercentRange", value)
        }
        header={"3 Month Return %"}
        className="py-2"
      />

      <SliderRangeFilter
        minValue={ranges.sixMonthReturnPercentRange[0]}
        maxValue={ranges.sixMonthReturnPercentRange[1]}
        initialMinValue={
          filters.sixMonthReturnPercentRange
            ? filters.sixMonthReturnPercentRange[0]
            : ranges.sixMonthReturnPercentRange[0]
        }
        initialMaxValue={
          filters.sixMonthReturnPercentRange
            ? filters.sixMonthReturnPercentRange[1]
            : ranges.sixMonthReturnPercentRange[1]
        }
        steps={0.01}
        onValueChange={(value) =>
          handleRangeChange("sixMonthReturnPercentRange", value)
        }
        header={"6 Month Return %"}
        className="py-2"
      />
      <SliderRangeFilter
        minValue={ranges.oneYearReturnPercentRange[0]}
        maxValue={ranges.oneYearReturnPercentRange[1]}
        initialMinValue={
          filters.oneYearReturnPercentRange
            ? filters.oneYearReturnPercentRange[0]
            : ranges.oneYearReturnPercentRange[0]
        }
        initialMaxValue={
          filters.oneYearReturnPercentRange
            ? filters.oneYearReturnPercentRange[1]
            : ranges.oneYearReturnPercentRange[1]
        }
        steps={0.01}
        onValueChange={(value) =>
          handleRangeChange("oneYearReturnPercentRange", value)
        }
        header={"1 Year Return %"}
        className="py-2"
      />
    </div>
  );
};

export default PerformanceFilters;
