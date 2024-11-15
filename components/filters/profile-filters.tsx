"use client";
import React from "react";

import { SliderRangeFilter } from "./slider-filter";

import CustomMultiSelect, { ExpandableDropDownOption, SelectedOptions } from "./custom-multi-select";
import { FilterCriteria, InclusionExclusion, ScreenerRanges } from "@/lib/types/screener-types";
interface ProfileFiltersProps {
  filters: FilterCriteria;
  handleFilterChange: (key: keyof FilterCriteria, value: any) => void;
  ranges: ScreenerRanges;
  sectors: ExpandableDropDownOption[];
  industries: ExpandableDropDownOption[];
  countryCodes: Record<string, string>;
}
const ProfileFilters: React.FC<ProfileFiltersProps> = ({
  filters,
  handleFilterChange,
  ranges,
  sectors,
  industries,
  countryCodes,
}) => {
  const countryOptions: ExpandableDropDownOption[] = Object.entries(
    countryCodes
  ).map(([key, value]) => ({
    id: key,
    displayName: value,
  }));

  const convertIdsToOptions = (
    ids: string[] | undefined,
    options: ExpandableDropDownOption[]
  ): ExpandableDropDownOption[] => {
    if (!ids) return [];
    return ids.map(
      (id) =>
        options.find((option) => option.id === id) || { id, displayName: id }
    );
  };

  const convertOptionsToIds = (
    options: ExpandableDropDownOption[]
  ): string[] => {
    return options.map((option) => option.id);
  };

  const getInitialSelectedItems = (
    filterKey: "sector" | "industry" | "country",
    options: ExpandableDropDownOption[]
  ): SelectedOptions => {
    const filter = filters[filterKey] as InclusionExclusion | undefined;
    return {
      include: convertIdsToOptions(filter?.include, options),
      exclude: convertIdsToOptions(filter?.exclude, options),
    };
  };

  const handleSectorChange = (selectedItems: SelectedOptions) => {
    const sectorFilter: InclusionExclusion = {
      include: convertOptionsToIds(selectedItems.include),
      exclude: convertOptionsToIds(selectedItems.exclude),
    };
    handleFilterChange("sector", sectorFilter);
  };

  const handleCountriesChange = (selectedItems: SelectedOptions) => {
    const countryFilter: InclusionExclusion = {
      include: convertOptionsToIds(selectedItems.include),
      exclude: convertOptionsToIds(selectedItems.exclude),
    };
    handleFilterChange("country", countryFilter);
  };

  const handleIndustriesChange = (selectedItems: SelectedOptions) => {
    const industryFilter: InclusionExclusion = {
      include: convertOptionsToIds(selectedItems.include),
      exclude: convertOptionsToIds(selectedItems.exclude),
    };
    handleFilterChange("industry", industryFilter);
  };

  return (
    <div className="">
      <SliderRangeFilter
        minValue={ranges.priceRange[0]}
        maxValue={ranges.priceRange[1]}
        initialMinValue={
          filters.priceRange ? filters.priceRange[0] : ranges.priceRange[0]
        }
        initialMaxValue={
          filters.priceRange ? filters.priceRange[1] : ranges.priceRange[1]
        }
        steps={0.01}
        onValueChange={(value) => handleFilterChange("priceRange", value)}
        header={"Price Range"}
        inputWidth="6rem"
        className="py-2"
      />
      <SliderRangeFilter
        minValue={ranges.dailyLiquidityRange[0]}
        maxValue={ranges.dailyLiquidityRange[1]}
        decimalPlaces={2}
        initialMinValue={
          filters.dailyLiquidityRange
            ? filters.dailyLiquidityRange[0]
            : ranges.dailyLiquidityRange[0]
        }
        initialMaxValue={
          filters.dailyLiquidityRange
            ? filters.dailyLiquidityRange[1]
            : ranges.dailyLiquidityRange[1]
        }
        steps={1000}
        onValueChange={(value) =>
          handleFilterChange("dailyLiquidityRange", value)
        }
        header={"Daily Liquidity"}
        inputWidth="10rem"
        className="py-2"
      />
      <SliderRangeFilter
        minValue={ranges.marketCapRange[0]}
        maxValue={ranges.marketCapRange[1]}
        initialMinValue={
          filters.marketCapRange
            ? filters.marketCapRange[0]
            : ranges.marketCapRange[0]
        }
        initialMaxValue={
          filters.marketCapRange
            ? filters.marketCapRange[1]
            : ranges.marketCapRange[1]
        }
        steps={1000}
        onValueChange={(value) => handleFilterChange("marketCapRange", value)}
        header={"Market Cap"}
        inputWidth="10rem"
        className="py-2"
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        <CustomMultiSelect
          header={"Countries"}
          items={countryOptions}
          onSelectionChange={handleCountriesChange}
          initiallySelectedItems={getInitialSelectedItems(
            "country",
            countryOptions
          )}
        />
        <CustomMultiSelect
          header={"Sectors"}
          items={sectors}
          onSelectionChange={handleSectorChange}
          initiallySelectedItems={getInitialSelectedItems("sector", sectors)}
        />
        <CustomMultiSelect
          header={"Industries"}
          items={industries}
          onSelectionChange={handleIndustriesChange}
          initiallySelectedItems={getInitialSelectedItems(
            "industry",
            industries
          )}
        />
      </div>
    </div>
  );
};

export default ProfileFilters;
