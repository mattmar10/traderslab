import React from "react";

import CustomMultiSelect, {
  ExpandableDropDownOption,
  SelectedOptions,
} from "../custom-multi-select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import MovingAvgFilter from "../moving-average-filter";
import AdrPercentFromMovingAvgFilter from "../moving-avg-atr-filter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MinimumDaysBeforeEarnings from "../minimum-days-before-earnings";
import { FilterCriteria, InclusionExclusion, ScreenerRanges } from "@/lib/types/screener-types";
import { SliderRangeFilter } from "../slider-filter";
import { ChevronDown, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { filterKeyConfig } from "./advanced-filter-group-builder";
import RelativeVolatiltyMetricFilter from "../relative-volatility-metric-filter";

interface FilterSelectProps {
  filterKey: keyof FilterCriteria;
  filterValue: any;
  ranges: ScreenerRanges;
  sectors: ExpandableDropDownOption[];
  industries: ExpandableDropDownOption[];
  countries: ExpandableDropDownOption[];
  onFilterTypeChange: (newFilterKey: keyof FilterCriteria) => void;
  onFilterValueChange: (value: any) => void;
  onRemoveFilter: () => void;
}

const FilterSelect: React.FC<FilterSelectProps> = ({
  filterKey,
  filterValue,
  ranges,
  sectors,
  industries,
  countries,
  onFilterTypeChange,
  onFilterValueChange,
  onRemoveFilter,
}) => {
  const convertIdsToOptions = (
    ids: string[] | undefined,
    options: ExpandableDropDownOption[]
  ): ExpandableDropDownOption[] => {
    if (!ids) return [];
    return ids.map(
      (id) =>
        options.find((option) => option.id === id) || {
          id,
          displayName: id,
        }
    );
  };

  const convertOptionsToIds = (
    options: ExpandableDropDownOption[]
  ): string[] => {
    return options.map((option) => option.id);
  };

  const getInitialSelectedItems = (
    filterValue: InclusionExclusion | undefined,
    options: ExpandableDropDownOption[]
  ): SelectedOptions => {
    return {
      include: convertIdsToOptions(filterValue?.include, options),
      exclude: convertIdsToOptions(filterValue?.exclude, options),
    };
  };

  const renderFilterInput = () => {
    const filterConfig = filterKeyConfig[filterKey];

    if (!filterConfig) {
      return <></>;
    }

    if (filterKey === "minimumDaysBeforeEarnings") {
      return (
        <div className="">
          <MinimumDaysBeforeEarnings
            value={filterValue}
            onValueChange={onFilterValueChange}
          />
        </div>
      );
    }

    // Handle cases like movingAvgFilters and adrPercentFromMovingAvgFilter
    if (filterKey === "movingAvgFilters") {
      return (
        <MovingAvgFilter
          filters={filterValue}
          onFiltersChange={onFilterValueChange}
        />
      );
    }

    if (filterKey === "adrPercentFromMovingAvgFilter") {
      return (
        <AdrPercentFromMovingAvgFilter
          filters={filterValue}
          onFiltersChange={onFilterValueChange}
        />
      );
    }

    if (filterKey === "relativeVolatilityMetricFilter") {

      const handleRelativeVolatilityMetricFilterChange = (key: keyof FilterCriteria, value: any) => {
        onFilterValueChange({
          period: value.period,
          shortLookback: value.shortLookback,
          longLookback: value.longLookback,
          range: value.range,
        });
      };

      return (
        <RelativeVolatiltyMetricFilter
          filterValue={filterValue} handleFilterChange={handleRelativeVolatilityMetricFilterChange}
        />
      );
    }

    // Handle movingAvgAdvancingFilters with a custom UI
    if (filterKey === "movingAvgAdvancingFilters") {
      const handleAdvancingDecliningMAFiltersChange = (type: string) => {
        const newFilters = filterValue ? [...filterValue] : [];

        const existingFilterIndex = newFilters.findIndex(
          (filter: any) => filter.type === type
        );

        if (existingFilterIndex > -1) {
          newFilters[existingFilterIndex] = {
            ...newFilters[existingFilterIndex],
            type,
          };
        } else {
          // If it doesn't exist, add a new filter object
          newFilters.push({ type, isAdvancing: true }); // Assuming 'isAdvancing' is the default behavior
        }

        onFilterValueChange(newFilters); // Update the parent component with the new filters
      };

      return (
        <div className="px-4">
          <div className="flex flex-col">
            <label className="text-sm mb-3 font-semibold text-foreground/70">
              MA Period
            </label>
            <Select
              onValueChange={(value) =>
                handleAdvancingDecliningMAFiltersChange(value)
              }
              value={filterValue?.[0]?.type || ""}
            >
              <SelectTrigger className="w-24 lg:w-28">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5SMA">5 SMA</SelectItem>
                <SelectItem value="10EMA">10 EMA</SelectItem>
                <SelectItem value="21EMA">21 EMA</SelectItem>
                <SelectItem value="20SMA">20 SMA</SelectItem>
                <SelectItem value="50SMA">50 SMA</SelectItem>
                <SelectItem value="200SMA">200 SMA</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );
    }

    if (filterKey === "movingAvgDecliningFilters") {
      const handleAdvancingDecliningMAFiltersChange = (type: string) => {
        const newFilters = filterValue ? [...filterValue] : [];

        const existingFilterIndex = newFilters.findIndex(
          (filter: any) => filter.type === type
        );

        if (existingFilterIndex > -1) {
          newFilters[existingFilterIndex] = {
            ...newFilters[existingFilterIndex],
            type,
          };
        } else {
          // If it doesn't exist, add a new filter object
          newFilters.push({ type, isDeclining: true });
        }

        onFilterValueChange(newFilters); // Update the parent component with the new filters
      };

      return (
        <div className="px-2">
          <div className="flex flex-col">
            <label className="text-sm mb-3 font-semibold text-foreground/70">
              MA Period
            </label>
            <Select
              onValueChange={(value) =>
                handleAdvancingDecliningMAFiltersChange(value)
              }
              value={filterValue?.[0]?.type || ""}
            >
              <SelectTrigger className="w-24 lg:w-28">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5SMA">5 SMA</SelectItem>
                <SelectItem value="10EMA">10 EMA</SelectItem>
                <SelectItem value="21EMA">21 EMA</SelectItem>
                <SelectItem value="20SMA">20 SMA</SelectItem>
                <SelectItem value="50SMA">50 SMA</SelectItem>
                <SelectItem value="200SMA">200 SMA</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );
    }

    if (filterConfig.type === "slider") {
      const range = ranges[filterKey as keyof ScreenerRanges] || [
        1, 100,
      ];

      const numericRange = range as [number, number];

      const steps = filterConfig.steps || 1;

      return (
        <SliderRangeFilter
          key={filterKey}
          minValue={numericRange[0]}
          maxValue={numericRange[1]}
          initialMinValue={
            filterValue && filterValue[0] ? filterValue[0] : numericRange[0]
          }
          initialMaxValue={
            filterValue && filterValue[1] ? filterValue[1] : numericRange[1]
          }
          steps={filterConfig.steps || 1}
          onValueChange={onFilterValueChange}
          header={filterConfig.header}
          inputWidth="12rem"
          className="w-full"
          decimalPlaces={steps >= 1 ? 0 : 2}
        />
      );
    }

    if (filterConfig.type === "dropdown") {
      let options = sectors;
      const header = filterConfig.header;

      if (filterKey === "country") {
        options = countries;
      } else if (filterKey === "industry") {
        options = industries;
      }

      const handleFilterChange = (selectedItems: SelectedOptions) => {
        const filtered: InclusionExclusion = {
          include: convertOptionsToIds(selectedItems.include),
          exclude: convertOptionsToIds(selectedItems.exclude),
        };
        onFilterValueChange(filtered);
      };

      return (
        <CustomMultiSelect
          header={header}
          items={options}
          onSelectionChange={handleFilterChange}
          initiallySelectedItems={getInitialSelectedItems(filterValue, options)}
        />
      );
    }

    if (filterConfig.type === "checkbox") {

      return (
        <div className="flex items-center pb-2">
          <Checkbox
            id={filterKey}
            checked={Boolean(filterValue)}
            disabled={true}
          />
          <label
            htmlFor={filterKey}
            className="text-sm font-medium leading-none ml-2 cursor-pointer hover:text-primary transition-colors"
          >
            {filterConfig.header}
          </label>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex items-end space-x-2 w-full py-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild className="mr-2">
          <Button
            variant="secondary"
            className="w-[220px] rounded-none text-left flex justify-between items-center"
          >
            <span>
              {filterKeyConfig[filterKey]?.header || "Select a filter"}
            </span>
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[250px]">
          <DropdownMenuGroup>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="font-semibold">
                Profile
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem
                  onSelect={() => onFilterTypeChange("priceRange")}
                >
                  Price Range
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => onFilterTypeChange("dailyLiquidityRange")}
                >
                  Daily Liquidity
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => onFilterTypeChange("marketCapRange")}
                >
                  Market Cap
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => onFilterTypeChange("country")}
                >
                  Country
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => onFilterTypeChange("sector")}>
                  Sector
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => onFilterTypeChange("industry")}
                >
                  Industry
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="font-semibold">
                Technical
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem
                  onSelect={() => onFilterTypeChange("adrPercentRange")}
                >
                  ADR %
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() =>
                    onFilterTypeChange("dailyClosingRangePercentRange")
                  }
                >
                  Daily Closing Range
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() =>
                    onFilterTypeChange("fiftyTwoWeekLowPercentageRange")
                  }
                >
                  % From 52 Week Low
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() =>
                    onFilterTypeChange("fiftyTwoWeekHighPercentageRange")
                  }
                >
                  % From 52 Week High
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => onFilterTypeChange("trendMomentumRange")}
                >
                  Trend Momentum
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="font-semibold">
                Moving Average
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem
                  onSelect={() => onFilterTypeChange("movingAvgFilters")}
                >
                  Price vs Moving Avg
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() =>
                    onFilterTypeChange("adrPercentFromMovingAvgFilter")
                  }
                >
                  ADR % From Moving Avg
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() =>
                    onFilterTypeChange("movingAvgAdvancingFilters")
                  }
                >
                  Advancing Moving Average
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() =>
                    onFilterTypeChange("movingAvgDecliningFilters")
                  }
                >
                  Declining Moving Average
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => onFilterTypeChange("bullishMovingAvgPattern")}
                >
                  Bullish MA Pattern
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => onFilterTypeChange("bearishMovingAvgPattern")}
                >
                  Bearish MA Pattern
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="font-semibold">
                Performance
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem
                  onSelect={() =>
                    onFilterTypeChange("oneDayAbsoluteChangeRange")
                  }
                >
                  1 Day Change $
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() =>
                    onFilterTypeChange("oneDayReturnPercentRange")
                  }
                >
                  1 Day Return %
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() =>
                    onFilterTypeChange("oneWeekReturnPercentRange")
                  }
                >
                  1 Week Return %
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() =>
                    onFilterTypeChange("oneMonthReturnPercentRange")
                  }
                >
                  1 Month Return %
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() =>
                    onFilterTypeChange("threeMonthReturnPercentRange")
                  }
                >
                  3 Month Return %
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() =>
                    onFilterTypeChange("sixMonthReturnPercentRange")
                  }
                >
                  6 Month Return %
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() =>
                    onFilterTypeChange("oneYearReturnPercentRange")
                  }
                >
                  1 Year Return %
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="font-semibold">
                Relative Strength
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem
                  onSelect={() => onFilterTypeChange("rsRankRange")}
                >
                  RS Rank
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => onFilterTypeChange("oneMonthRSRange")}
                >
                  1M RS Rating
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => onFilterTypeChange("threeMonthRSRange")}
                >
                  3M RS Rating
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => onFilterTypeChange("sixMonthRSRange")}
                >
                  6M RS Rating
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => onFilterTypeChange("oneYearRSRange")}
                >
                  1Y RS Rating
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => onFilterTypeChange("compositeRSRange")}
                >
                  Composite RS Rating
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="font-semibold">
                Volatility
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem
                  onSelect={() =>
                    onFilterTypeChange("relativeVolatilityMetricFilter")
                  }
                >
                  Relative Volatility Metric
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() =>
                    onFilterTypeChange("volatilityContractionScoreRange")
                  }
                >
                  Price Contraction
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() =>
                    onFilterTypeChange("dailyRangeHistoricalVolatilityRange")
                  }
                >
                  Daily Hist. Volatility
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() =>
                    onFilterTypeChange("percentBRange")
                  }
                >
                  Bollinger %B
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => onFilterTypeChange("insideDay")}
                >
                  Inside Day
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => onFilterTypeChange("narrowRangeDay")}
                >
                  Narrow Range Day (NR7)
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="font-semibold">
                Volume
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem
                  onSelect={() => onFilterTypeChange("volumeRange")}
                >
                  Volume Range
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => onFilterTypeChange("relativeVolumeRange")}
                >
                  Relative Volume Range
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => onFilterTypeChange("twentyVolumeSMARange")}
                >
                  Volume SMA (20D)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() =>
                    onFilterTypeChange("volumeContractionScoreRange")
                  }
                >
                  Volume Contraction
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => onFilterTypeChange("aboveAverageVolume")}
                >
                  Above Average Volume
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => onFilterTypeChange("increasingVolume")}
                >
                  Increasing Volume
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="font-semibold">
                Fundamental
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem
                  onSelect={() =>
                    onFilterTypeChange("minimumDaysBeforeEarnings")
                  }
                >
                  Minimum Days Before Earnings
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex-1">{renderFilterInput()}</div>

      <div className="flex items-center justify-center h-full">
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemoveFilter}
          className="h-full py-2"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default FilterSelect;
