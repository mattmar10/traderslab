"use client";

import React, { useState } from "react";

import { IoAddCircleOutline } from "react-icons/io5";
import { SliderRangeFilter } from "./slider-filter";
import { Button } from "@/components/ui/button";
import { MinusCircleIcon, PlusCircleIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface AdrPercentFromMovingAvgFilterProps {
  filters: { type: string; adrPercentMultiple: [number, number] }[];
  onFiltersChange: (
    filters: { type: string; adrPercentMultiple: [number, number] }[]
  ) => void;
}

const AdrPercentFromMovingAvgFilter: React.FC<
  AdrPercentFromMovingAvgFilterProps
> = ({ filters, onFiltersChange }) => {
  const initialFilter = {
    type: "5SMA",
    adrPercentMultiple: [-50, 50] as [number, number],
  };
  const [newFilter, setNewFilter] = useState(initialFilter);
  const [sliderKey, setSliderKey] = useState(0); // State to force slider re-render

  const handleNewFilterChange = (key: string, value: any) => {
    setNewFilter((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handlePercentRangeChange = (value: number[] | undefined) => {
    if (value === undefined) {
      // Handle the case when value is undefined (e.g., reset or clear filter)
      setNewFilter((prev) => ({
        ...prev,
        adrPercentMultiple: [-Infinity, Infinity],
      }));
    } else {
      setNewFilter((prev) => ({
        ...prev,
        adrPercentMultiple: [value[0], value[1]],
      }));
    }
  };

  const addAdrPercentFromMovingAvgFilter = (event: any) => {
    event.preventDefault();
    onFiltersChange([...filters, newFilter]);
    // Reset the filter and slider after adding
    setNewFilter(initialFilter);
    setSliderKey((prevKey) => prevKey + 1);
  };

  const removeAdrPercentFromMovingAvgFilter = (index: number) => {
    const updatedFilters = filters.filter((_, i) => i !== index);
    onFiltersChange(updatedFilters);
  };
  return (
    <div className="space-y-4 mt-3">
      <div className="flex items-start space-x-4 mb-4">
        <div className="flex flex-col">
          <label className="text-sm mb-3 font-semibold text-foreground/70">
            MA Period
          </label>
          <Select
            onValueChange={(value) => handleNewFilterChange("type", value)}
            value={newFilter.type}
          >
            <SelectTrigger className="w-24 lg:w-28">
              <SelectValue placeholder="Type" />
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
        <div className="flex flex-col w-full">
          <SliderRangeFilter
            key={sliderKey}
            className="mt-0"
            header="ADR Percent Multiple"
            minValue={-50}
            maxValue={50}
            initialMinValue={newFilter.adrPercentMultiple[0]}
            initialMaxValue={newFilter.adrPercentMultiple[1]}
            steps={0.1}
            onValueChange={handlePercentRangeChange}
          />
        </div>
        <div className="flex flex-col">
          <Button
            onClick={addAdrPercentFromMovingAvgFilter}
            className="lg:flex  space-x-2 mt-8 hidden "
          >
            <PlusCircleIcon className="h-4 w-4" />
            <div>ADD</div>
          </Button>
        </div>
        <div className="flex flex-col lg:hidden">
          <div
            onClick={addAdrPercentFromMovingAvgFilter}
            className=" pr-2 pt-2 text-foreground/70 cursor-pointer  mt-3 lg:hidden "
          >
            <IoAddCircleOutline className="text-xl" />
          </div>
        </div>
      </div>
      {filters.length > 0 && (
        <div className="space-y-4 ">
          <div className="text-sm font-semibold text-foreground/70">
            Selected
          </div>
          {filters.map((filter, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm">
              <div
                onClick={() => removeAdrPercentFromMovingAvgFilter(index)}
                className="px-2 text-sm flex space-x-2 items-center text-foreground/70 cursor-pointer hover:text-destructive"
              >
                <MinusCircleIcon className="w-4 h-4" />
              </div>
              <div className="w-28">{filter.type}</div>
              <div className="w-24">
                {filter.adrPercentMultiple[0]} - {filter.adrPercentMultiple[1]}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdrPercentFromMovingAvgFilter;
