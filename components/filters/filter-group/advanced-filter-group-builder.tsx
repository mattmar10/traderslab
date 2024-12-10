import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Trash2, ChevronRight, ChevronDown } from "lucide-react";

import FilterSelect from "./filter-select";
import { ExpandableDropDownOption } from "../custom-multi-select";
import { FilterCriteria, FilterGroup, ScreenerRanges } from "@/lib/types/screener-types";

interface FilterGroupEditorProps {
  filterGroup: FilterGroup;
  onFilterGroupChange: (filterGroup: FilterGroup) => void;
  ranges: ScreenerRanges;
  sectors: ExpandableDropDownOption[];
  industries: ExpandableDropDownOption[];
  countries: ExpandableDropDownOption[];
  isNested?: boolean;
  onRemoveGroup?: () => void;
}

const FilterGroupEditor: React.FC<FilterGroupEditorProps> = ({
  filterGroup,
  onFilterGroupChange,
  ranges,
  countries,
  sectors,
  industries,
  isNested = false,
  onRemoveGroup,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    if (!filterGroup.filters) {
      onFilterGroupChange({ operator: "AND", filters: [] });
    }
  }, [filterGroup, onFilterGroupChange]);

  const addFilter = () => {
    const newFilter: FilterCriteria = { priceRange: ranges.priceRange }; // Default to price range
    onFilterGroupChange({
      ...filterGroup,
      filters: [...filterGroup.filters, newFilter],
    });
  };

  const addGroup = () => {
    const newGroup: FilterGroup = { operator: "AND", filters: [] };
    onFilterGroupChange({
      ...filterGroup,
      filters: [...filterGroup.filters, newGroup],
    });
  };

  const updateFilter = (
    index: number,
    updatedFilter: Partial<FilterCriteria> | FilterGroup
  ) => {
    const newFilters = [...filterGroup.filters];

    const existingFilter = newFilters[index];

    if ("operator" in updatedFilter) {
      // If the updated filter is a FilterGroup, replace it as is
      newFilters[index] = updatedFilter;
    } else if ("operator" in existingFilter) {
      // If the existing filter is a FilterGroup, it means you're trying to update an entire group
      // This is not what you want, so we need to handle this case correctly
      newFilters[index] = {
        ...existingFilter,
        filters: [{ ...updatedFilter }],
      };
    } else {
      // Otherwise, merge the updated criteria into the existing filter
      newFilters[index] = { ...existingFilter, ...updatedFilter };
    }

    onFilterGroupChange({ ...filterGroup, filters: newFilters });
  };

  const replaceFilter = (
    index: number,
    newFilter: Partial<FilterCriteria> | FilterGroup
  ) => {
    const newFilters = [...filterGroup.filters];

    // Directly replace the existing filter with the new filter
    newFilters[index] = newFilter;

    onFilterGroupChange({ ...filterGroup, filters: newFilters });
  };


  const removeFilter = (
    groupIndex: number,
    filterKey?: keyof FilterCriteria
  ) => {
    const newFilters = [...filterGroup.filters];

    if (filterKey) {
      const criteria = newFilters[groupIndex] as FilterCriteria;

      // Remove the specific filter key
      delete criteria[filterKey];

      if (Object.keys(criteria).length === 0) {
        // Remove the entire group if criteria is empty
        newFilters.splice(groupIndex, 1);
      }
      // No need to reassign criteria to newFilters[groupIndex] here
    } else {
      // Remove the entire group if no filterKey is specified
      newFilters.splice(groupIndex, 1);
    }

    // Trigger the update with the modified filters
    onFilterGroupChange({ ...filterGroup, filters: newFilters });
  };


  const handleNameChange = (name: string) => {
    onFilterGroupChange({ ...filterGroup, name });
  };

  const renderFilter = (filter: FilterCriteria, index: number) => {
    return Object.entries(filter).map(([filterKey, filterValue]) => {
      const key = filterKey as keyof FilterCriteria;
      const value = filterValue;


      return (
        <FilterSelect
          key={`${index}-${key}`}
          filterKey={key}
          filterValue={value}
          ranges={ranges}
          countries={countries}
          sectors={sectors}
          industries={industries}
          onFilterTypeChange={(newFilterKey) => {
            const newFilter = {
              [newFilterKey]: defaultValueForFilter(newFilterKey, ranges),
            };
            replaceFilter(index, newFilter); // Use replaceFilter when changing the filter type
          }}
          onFilterValueChange={(newValue) =>
            updateFilter(index, { [key]: newValue } as FilterCriteria)
          }
          onRemoveFilter={() => removeFilter(index, key)}
        />
      );
    });
  };
  return (
    <div
      className={`border-l-2 border-foreground/20 pl-4 py-4 my-2 ${isNested ? "ml-4" : ""
        }`}
    >
      <div className="flex items-center space-x-4 mb-4">
        <div className="text-sm font-semibold text-foreground/40">
          Filter Group
        </div>
        <Input
          value={filterGroup.name || ""}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="Filter Group Name"
          className="w-[300px]"
        />
      </div>

      <div className="flex items-center space-x-2 mb-2">
        {isNested && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        )}

        {/* New Operation Label */}
        <div className="text-sm font-semibold text-foreground/40 pr-4">
          Operation
        </div>

        <Select
          value={filterGroup.operator}
          onValueChange={(value: "AND" | "OR") =>
            onFilterGroupChange({ ...filterGroup, operator: value })
          }
        >
          <SelectTrigger className="w-[80px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="AND">AND</SelectItem>
            <SelectItem value="OR">OR</SelectItem>
          </SelectContent>
        </Select>
        {isNested && (
          <Button variant="ghost" size="icon" onClick={onRemoveGroup}>
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
      {isExpanded && (
        <>
          {filterGroup.filters.length === 0 ? (
            <div className="text-foreground/30 text-sm italic py-2">
              No filters added. Please add a filter or a filter group.
            </div>
          ) : (
            filterGroup.filters.map((filter, index) =>

              "operator" in filter ? (
                <FilterGroupEditor
                  key={index}
                  filterGroup={filter as FilterGroup}
                  onFilterGroupChange={(updatedGroup) =>
                    updateFilter(index, updatedGroup)
                  }
                  ranges={ranges}
                  isNested={true}
                  onRemoveGroup={() => removeFilter(index)}
                  sectors={sectors}
                  industries={industries}
                  countries={countries}
                />
              ) : (
                renderFilter(filter as FilterCriteria, index)
              )
            )
          )}
          <div className="space-x-2 mt-2">
            <Button variant="outline" onClick={addFilter}>
              Add Filter
            </Button>
            <Button variant="outline" onClick={addGroup}>
              Add Filter Group
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default FilterGroupEditor;

function defaultValueForFilter(
  filterKey: keyof FilterCriteria,
  ranges: ScreenerRanges
) {
  switch (filterKey) {
    case "priceRange":
    case "dailyLiquidityRange":
    case "adrPercentRange":
    case "fiftyTwoWeekHighPercentageRange":
    case "fiftyTwoWeekLowPercentageRange":
    case "dailyRangeHistoricalVolatilityRange":
    case "twentyVolumeSMARange":
    case "oneDayAbsoluteChangeRange":
    case "oneDayReturnPercentRange":
    case "oneWeekReturnPercentRange":
    case "marketCapRange":
    case "trendMomentumRange":
    case "oneMonthReturnPercentRange":
    case "threeMonthReturnPercentRange":
    case "sixMonthReturnPercentRange":
    case "oneYearReturnPercentRange":
    case "volumeRange":
    case "relativeVolumeRange":
    case "percentBRange":
    case "rsRankRange":
      return ranges[filterKey]; // Default range values
    case "movingAvgFilters":
    case "adrPercentFromMovingAvgFilter":
    case "movingAvgDecliningFilters":
    case "movingAvgAdvancingFilters":
      return [];
    case "increasingVolume":
      return true;
    case "insideDay":
      return true;
    case "aboveAverageVolume":
      return true;
    case "narrowRangeDay":
      return true;
    case "minimumDaysBeforeEarnings":
      return undefined;
    default:
      return [1, 100]; // Default for text inputs or other filter types
  }
}

export function isDropDownKey(key: keyof FilterCriteria) {
  return key === "country" || key === "sector" || key === "industry";
}

type FilterType = "slider" | "checkbox" | "dropdown" | "custom";

interface FilterConfig {
  header: string;
  type: FilterType;
  steps?: number; // Only relevant for sliders
}

export const filterKeyConfig: Record<
  keyof FilterCriteria,
  FilterConfig | undefined
> = {
  priceRange: { header: "Price Range", type: "slider", steps: 0.01 },
  dailyLiquidityRange: {
    header: "Daily Liquidity",
    type: "slider",
    steps: 1000,
  },
  marketCapRange: { header: "Market Cap", type: "slider", steps: 1000 },
  adrPercentRange: {
    header: "ADR Percent Range",
    type: "slider",
    steps: 0.01,
  },
  fiftyTwoWeekHighPercentageRange: {
    header: "% From 52 Week High",
    type: "slider",
    steps: 0.01,
  },
  fiftyTwoWeekLowPercentageRange: {
    header: "% From 52 Week Low",
    type: "slider",
    steps: 0.01,
  },
  dailyClosingRangePercentRange: {
    header: "% Daily Closing Range",
    type: "slider",
    steps: 0.01,
  },
  volatilityContractionScoreRange: {
    header: "Price Contraction",
    type: "slider",
    steps: 0.01,
  },
  dailyRangeHistoricalVolatilityRange: {
    header: "Daily Historical Volatility",
    type: "slider",
    steps: 0.01,
  },
  oneDayAbsoluteChangeRange: {
    header: "1 Day Change $",
    type: "slider",
    steps: 0.01,
  },
  twentyVolumeSMARange: {
    header: "Volume SMA (20 Day)",
    type: "slider",
    steps: 1000,
  },
  oneDayReturnPercentRange: {
    header: "1 Day Return %",
    type: "slider",
    steps: 0.01,
  },

  country: { header: "Country", type: "dropdown" },
  sector: { header: "Sector", type: "dropdown" },
  industry: { header: "Industry", type: "dropdown" },

  aboveAverageVolume: { header: "Above Average Volume", type: "checkbox" },
  increasingVolume: { header: "Increasing Volume", type: "checkbox" },
  bearishMovingAvgPattern: {
    header: "Bearish MA Pattern",
    type: "checkbox",
  },
  bullishMovingAvgPattern: {
    header: "Bullish MA Pattern",
    type: "checkbox",
  },
  insideDay: { header: "Inside Day", type: "checkbox" },

  movingAvgAdvancingFilters: {
    header: "Advancing Moving Average",
    type: "custom",
  },
  movingAvgDecliningFilters: {
    header: "Declining Moving Average",
    type: "custom",
  },
  movingAvgFilters: { header: "Moving Average Filter", type: "custom" },
  adrPercentFromMovingAvgFilter: {
    header: "ADR % From Moving Avg",
    type: "custom",
  },
  volumeRange: {
    header: "Volume Range",
    type: "slider",
    steps: 1000,
  },
  relativeVolumeRange: {
    header: "Relative Volume",
    type: "slider",
    steps: 0.01,
  },
  rsRankRange: {
    header: "Relative Strength Rank",
    type: "slider",
    steps: 1,
  },
  oneMonthRSRange: {
    header: "1M RS Rating",
    type: "slider",
    steps: 1,
  },
  threeMonthRSRange: {
    header: "3M RS Rating",
    type: "slider",
    steps: 1,
  },
  sixMonthRSRange: {
    header: "6M RS Rating",
    type: "slider",
    steps: 1,
  },
  oneYearRSRange: {
    header: "1Y RS Rating",
    type: "slider",
    steps: 1,
  },
  compositeRSRange: {
    header: "Composite RS Rating",
    type: "slider",
    steps: 1,
  },
  oneWeekReturnPercentRange: {
    header: "1 Week Return %",
    type: "slider",
    steps: 0.01,
  },
  oneMonthReturnPercentRange: {
    header: "1 Month Return %",
    type: "slider",
    steps: 0.01,
  },
  threeMonthReturnPercentRange: {
    header: "3 Month Return %",
    type: "slider",
    steps: 0.01,
  },
  sixMonthReturnPercentRange: {
    header: "6 Month Return %",
    type: "slider",
    steps: 0.01,
  },
  oneYearReturnPercentRange: {
    header: "1 Year Return %",
    type: "slider",
    steps: 0.01,
  },
  trendMomentumRange: {
    header: "Trend Momentum",
    type: "slider",
    steps: 0.01,
  },
  volatilityAdjustedTrendMomentumRange: undefined,
  narrowRangeDay: { header: "Narrow Range Day", type: "checkbox" },
  volumeContractionScoreRange: {
    header: "Volume Contraction",
    type: "slider",
    steps: 0.01,
  },
  minimumDaysBeforeEarnings: {
    header: "Days Before Earnings",
    type: "custom",
  },
  percentBRange: {
    header: "Bollinger %B",
    type: "slider",
    steps: 0.01,
  },
  relativeVolatilityMetricFilter: {
    header: "Relative Volatility Metric",
    type: "custom",
  },
};
