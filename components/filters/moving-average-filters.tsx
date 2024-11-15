import React from "react";
import AdrPercentFromMovingAvgFilter from "./moving-avg-atr-filter";
import { Checkbox } from "@/components/ui/checkbox";
import { FilterCriteria } from "@/lib/types/screener-types";
import MovingAvgFilter from "./moving-average-filter";
import AdvDeclMovingAvgFilter from "./advancing-decling-moving-avg-filter";

interface MovingAverageFiltersProps {
  filters: FilterCriteria;
  handleFilterChange: (key: keyof FilterCriteria, value: any) => void;
}

const MovingAverageFilters: React.FC<MovingAverageFiltersProps> = ({
  filters,
  handleFilterChange,
}) => {
  const handleMovingAvgFiltersChange = (
    filters: { type: string; percentRange: number[] }[]
  ) => {
    handleFilterChange("movingAvgFilters", filters);
  };

  const handleAdvancingDecliningMAFiltersChange = (
    newAdvancingFilters: { type: string; isAdvancing: boolean }[],
    newDecliningFilters: { type: string; isAdvancing: boolean }[]
  ) => {
    handleFilterChange("movingAvgAdvancingFilters", newAdvancingFilters);
    handleFilterChange("movingAvgDecliningFilters", newDecliningFilters);
  };

  const handleAdrPercentFromMovingAvgFiltersChange = (
    filters: { type: string; adrPercentMultiple: [number, number] }[]
  ) => {
    handleFilterChange("adrPercentFromMovingAvgFilter", filters);
  };

  const handleCheckboxChange = (
    key: "bullishMovingAvgPattern" | "bearishMovingAvgPattern",
    value: boolean
  ) => {
    handleFilterChange(key, value ? true : undefined);
  };

  return (
    <div className="mt-4 w-full ">
      <div className="font-semibold mt-6 py-2">
        Price Distance from Moving Avg.
      </div>
      <MovingAvgFilter
        filters={filters.movingAvgFilters || []}
        onFiltersChange={handleMovingAvgFiltersChange}
      />

      <div className="font-semibold mt-8">
        ADR Percent Multiple from Moving Avg.
      </div>
      <AdrPercentFromMovingAvgFilter
        filters={filters.adrPercentFromMovingAvgFilter || []}
        onFiltersChange={handleAdrPercentFromMovingAvgFiltersChange}
      />

      <div className="pb-2 pt-8">
        <div className="font-semibold">Moving Average Trend</div>
        <AdvDeclMovingAvgFilter
          advancingFilters={filters.movingAvgAdvancingFilters || []}
          decliningFilters={filters.movingAvgDecliningFilters || []}
          onFiltersChange={handleAdvancingDecliningMAFiltersChange}
        />
      </div>
      <div className="font-semibold pt-8 pb-4">Moving Average Patterns</div>
      <div className="flex space-x-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <Checkbox
              id="bullishMovingAvgPattern"
              checked={filters.bullishMovingAvgPattern || false}
              onCheckedChange={(checked) => {
                handleCheckboxChange(
                  "bullishMovingAvgPattern",
                  checked as boolean
                );
              }}
            />
            <label
              htmlFor="bullishMovingAvgPattern"
              className="text-sm font-medium leading-none ml-2 cursor-pointer hover:text-primary transition-colors"
            >
              Bullish Moving Avg. Pattern
            </label>
          </div>
        </div>
        <div className="flex items-center space-x-4 ">
          <div className="flex items-center">
            <Checkbox
              id="bearishMovingAvgPattern"
              checked={filters.bearishMovingAvgPattern || false}
              onCheckedChange={(checked) => {
                handleCheckboxChange(
                  "bearishMovingAvgPattern",
                  checked as boolean
                );
              }}
            />
            <label
              htmlFor="bearishMovingAvgPattern"
              className="text-sm font-medium leading-none ml-2 cursor-pointer hover:text-primary transition-colors"
            >
              Bearish Moving Avg. Pattern
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovingAverageFilters;
