
import { FilterCriteria, ScreenerRanges } from "@/lib/types/screener-types";
import { SliderRangeFilter } from "./slider-filter";
import { Checkbox } from "@/components/ui/checkbox";

interface VolatilityFilterProps {
  filters: FilterCriteria;
  handleFilterChange: (key: keyof FilterCriteria, value: any) => void;
  ranges: ScreenerRanges;
}

const VolatilityFilters: React.FC<VolatilityFilterProps> = ({
  filters,
  handleFilterChange,
  ranges,
}) => {
  const handleCheckboxChange = (
    key: "insideDay" | "narrowRangeDay",
    value: boolean
  ) => {
    handleFilterChange(key, value ? true : undefined);
  };

  return (
    <div className="mt-4 w-full ">
      <SliderRangeFilter
        minValue={ranges.volatilityContractionScoreRange[0]}
        maxValue={ranges.volatilityContractionScoreRange[1]}
        initialMinValue={
          filters.volatilityContractionScoreRange
            ? filters.volatilityContractionScoreRange[0]
            : ranges.volatilityContractionScoreRange[0]
        }
        initialMaxValue={
          filters.volatilityContractionScoreRange
            ? filters.volatilityContractionScoreRange[1]
            : ranges.volatilityContractionScoreRange[1]
        }
        steps={1}
        onValueChange={(value) =>
          handleFilterChange("volatilityContractionScoreRange", value)
        }
        header={"Price Contraction"}
        className="py-2"
        inputWidth="6rem"
      />
      <SliderRangeFilter
        minValue={ranges.dailyRangeHistoricalVolatilityRange[0]}
        maxValue={ranges.dailyRangeHistoricalVolatilityRange[1]}
        initialMinValue={
          filters.dailyRangeHistoricalVolatilityRange
            ? filters.dailyRangeHistoricalVolatilityRange[0]
            : ranges.dailyRangeHistoricalVolatilityRange[0]
        }
        initialMaxValue={
          filters.dailyRangeHistoricalVolatilityRange
            ? filters.dailyRangeHistoricalVolatilityRange[1]
            : ranges.dailyRangeHistoricalVolatilityRange[1]
        }
        steps={0.01}
        onValueChange={(value) =>
          handleFilterChange("dailyRangeHistoricalVolatilityRange", value)
        }
        header={"Daily Range Historical Volatility"}
        className="py-2"
        inputWidth="6rem"
      />
      <div className="mt-6">
        <div className="font-semibold mb-3">Volatility Patterns</div>
        <div className="flex space-x-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Checkbox
                id="insideDay"
                checked={filters.insideDay || false}
                onCheckedChange={(checked) => {
                  handleCheckboxChange("insideDay", checked as boolean);
                }}
              />
              <label
                htmlFor="insideDay"
                className="text-sm font-medium leading-none ml-2 cursor-pointer hover:text-primary transition-colors"
              >
                Inside Day
              </label>
            </div>
          </div>
          <div className="flex items-center space-x-4 ">
            <div className="flex items-center">
              <Checkbox
                id="narrowRangeDay"
                checked={filters.narrowRangeDay || false}
                onCheckedChange={(checked) => {
                  handleCheckboxChange("narrowRangeDay", checked as boolean);
                }}
              />
              <label
                htmlFor="narrowRangeDay"
                className="text-sm font-medium leading-none ml-2 cursor-pointer hover:text-primary transition-colors"
              >
                Narrow Range Day
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolatilityFilters;
