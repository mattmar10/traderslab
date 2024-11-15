"use client";

import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { IoAddCircleOutline, IoRemoveCircleOutline } from "react-icons/io5";
import { SliderRangeFilter } from "./slider-filter";
import { Button } from "@/components/ui/button";
import { MinusCircleIcon, PlusCircleIcon } from "lucide-react";

interface MovingAvgFilterProps {
  filters: { type: string; percentRange: [number, number] }[];
  onFiltersChange: (
    filters: { type: string; percentRange: [number, number] }[]
  ) => void;
}

const MovingAvgFilter: React.FC<MovingAvgFilterProps> = ({
  filters,
  onFiltersChange,
}) => {
  const [newFilter, setNewFilter] = useState({
    type: "5SMA",
    percentRange: [-100, 100] as [number, number],
  });

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
        percentRange: [-Infinity, Infinity],
      }));
    } else {
      setNewFilter((prev) => ({
        ...prev,
        percentRange: [value[0], value[1]],
      }));
    }
  };

  const addMovingAvgFilter = (event: any) => {
    event.preventDefault(); // Prevent the default form submission
    onFiltersChange([...filters, newFilter]);
    setNewFilter({ type: "5SMA", percentRange: [-100, 100] });
    setSliderKey((prevKey) => prevKey + 1);
  };

  const removeMovingAvgFilter = (index: number) => {
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
            header="Percent"
            minValue={-100}
            maxValue={100}
            initialMinValue={newFilter.percentRange[0]}
            initialMaxValue={newFilter.percentRange[1]}
            steps={1}
            onValueChange={handlePercentRangeChange}
          />
        </div>
        <div className="flex flex-col">
          <Button
            onClick={addMovingAvgFilter}
            className="lg:flex  space-x-2 mt-8 hidden "
          >
            <PlusCircleIcon className="h-4 w-4" />
            <div>ADD</div>
          </Button>
        </div>
        <div className="flex flex-col lg:hidden">
          <div
            onClick={addMovingAvgFilter}
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
            <div key={index} className="flex items-center space-x-2  text-sm">
              <div
                onClick={() => removeMovingAvgFilter(index)}
                className="px-2 text-sm flex space-x-2 items-center text-foreground/70 cursor-pointer  hover:text-destructive"
              >
                <MinusCircleIcon className="w-4 h-4" />
              </div>
              <div className="w-28">{filter.type}</div>
              <div className="w-24">
                {filter.percentRange[0]}% - {filter.percentRange[1]}%
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MovingAvgFilter;
