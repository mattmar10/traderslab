
import { FilterCriteria, ScreenerRanges } from "@/lib/types/screener-types";
import { SliderRangeFilter } from "./slider-filter";

interface VolumeFiltersProps {
  filters: FilterCriteria;
  handleFilterChange: (key: keyof FilterCriteria, value: any) => void;
  ranges: ScreenerRanges;
}

const RelativeStrengthFilters: React.FC<VolumeFiltersProps> = ({
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
        minValue={ranges.rsRankRange[0]}
        maxValue={ranges.rsRankRange[1]}
        initialMinValue={
          filters.rsRankRange ? filters.rsRankRange[0] : ranges.rsRankRange[0]
        }
        initialMaxValue={
          filters.rsRankRange ? filters.rsRankRange[1] : ranges.rsRankRange[1]
        }
        steps={1}
        onValueChange={(value) => handleRangeChange("rsRankRange", value)}
        header={"RS Rank"}
        className="py-2"
        inputWidth="9rem"
        decimalPlaces={0}
      />
      <div className="mt-6">
        <div className="font-semibold mb-3">RS Line Filters</div>
        <SliderRangeFilter
          minValue={1}
          maxValue={100}
          initialMinValue={
            filters.oneMonthRSRange ? filters.oneMonthRSRange[0] : 1
          }
          initialMaxValue={
            filters.oneMonthRSRange ? filters.oneMonthRSRange[1] : 100
          }
          steps={1}
          onValueChange={(value) => handleRangeChange("oneMonthRSRange", value)}
          header={"1M RS Rating"}
          className="py-2"
          inputWidth="9rem"
          decimalPlaces={0}
        />
        <SliderRangeFilter
          minValue={1}
          maxValue={100}
          initialMinValue={
            filters.threeMonthRSRange ? filters.threeMonthRSRange[0] : 1
          }
          initialMaxValue={
            filters.threeMonthRSRange ? filters.threeMonthRSRange[1] : 100
          }
          steps={1}
          onValueChange={(value) =>
            handleRangeChange("threeMonthRSRange", value)
          }
          header={"3M RS Rating"}
          className="py-2"
          inputWidth="9rem"
          decimalPlaces={0}
        />
        <SliderRangeFilter
          minValue={1}
          maxValue={100}
          initialMinValue={
            filters.sixMonthRSRange ? filters.sixMonthRSRange[0] : 1
          }
          initialMaxValue={
            filters.sixMonthRSRange ? filters.sixMonthRSRange[1] : 100
          }
          steps={1}
          onValueChange={(value) => handleRangeChange("sixMonthRSRange", value)}
          header={"6M RS Rating"}
          className="py-2"
          inputWidth="9rem"
          decimalPlaces={0}
        />
        <SliderRangeFilter
          minValue={1}
          maxValue={100}
          initialMinValue={
            filters.oneYearRSRange ? filters.oneYearRSRange[0] : 1
          }
          initialMaxValue={
            filters.oneYearRSRange ? filters.oneYearRSRange[1] : 100
          }
          steps={1}
          onValueChange={(value) => handleRangeChange("oneYearRSRange", value)}
          header={"1Y RS Rating"}
          className="py-2"
          inputWidth="9rem"
          decimalPlaces={0}
        />
        <SliderRangeFilter
          minValue={1}
          maxValue={100}
          initialMinValue={
            filters.compositeRSRange ? filters.compositeRSRange[0] : 1
          }
          initialMaxValue={
            filters.compositeRSRange ? filters.compositeRSRange[1] : 100
          }
          steps={1}
          onValueChange={(value) =>
            handleRangeChange("compositeRSRange", value)
          }
          header={"Composite RS Rating"}
          className="py-2"
          inputWidth="9rem"
          decimalPlaces={0}
        />
      </div>
    </div>
  );
};

export default RelativeStrengthFilters;
