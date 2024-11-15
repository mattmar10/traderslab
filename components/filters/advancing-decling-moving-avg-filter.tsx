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

interface AdvDeclMovingAvgFilterProps {
  advancingFilters: { type: string; isAdvancing: boolean }[];
  decliningFilters: { type: string; isAdvancing: boolean }[];
  onFiltersChange: (
    advancingFilters: { type: string; isAdvancing: boolean }[],
    decliningFilters: { type: string; isAdvancing: boolean }[]
  ) => void;
}

const AdvDeclMovingAvgFilter: React.FC<AdvDeclMovingAvgFilterProps> = ({
  advancingFilters,
  decliningFilters,
  onFiltersChange,
}) => {
  const [newFilter, setNewFilter] = useState({
    type: "5SMA",
    isAdvancing: true,
  });

  const handleNewFilterChange = (key: string, value: any) => {
    setNewFilter((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const addMovingAvgFilter = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (newFilter.isAdvancing) {
      onFiltersChange([...advancingFilters, newFilter], decliningFilters);
    } else {
      onFiltersChange(advancingFilters, [...decliningFilters, newFilter]);
    }
    setNewFilter({ type: "5SMA", isAdvancing: true });
  };

  const removeMovingAvgFilter = (index: number, isAdvancing: boolean) => {
    if (isAdvancing) {
      const updatedFilters = [...advancingFilters];
      updatedFilters.splice(index, 1);
      onFiltersChange(updatedFilters, decliningFilters);
    } else {
      const updatedFilters = [...decliningFilters];
      updatedFilters.splice(index, 1);
      onFiltersChange(advancingFilters, updatedFilters);
    }
  };

  return (
    <div className="space-y-4 mt-2">
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
        <div className="flex flex-col">
          <label className="text-sm mb-3 font-semibold text-foreground/70">
            Trend
          </label>
          <Select
            onValueChange={(value) =>
              handleNewFilterChange("isAdvancing", value === "advancing")
            }
            value={newFilter.isAdvancing ? "advancing" : "declining"}
          >
            <SelectTrigger className="w-24 lg:w-28">
              <SelectValue placeholder="Trend" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="advancing">Advancing</SelectItem>
              <SelectItem value="declining">Declining</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col">
          <label className="text-xs mb-1">&nbsp;</label>{" "}
          <div
            onClick={addMovingAvgFilter}
            className="border border-foreground/10 px-2 py-2 text-sm lg:flex space-x-2 items-center text-foreground/70 cursor-pointer hover:bg-foreground/5 mt-3 hidden "
          >
            <IoAddCircleOutline className="text-lg" />
            <div>ADD</div>
          </div>
        </div>
        <div className="flex flex-col">
          <label className="text-xs mb-1">&nbsp;</label>{" "}
          <div
            onClick={addMovingAvgFilter}
            className=" pr-2 pt-2 text-foreground/70 cursor-pointer  mt-3 lg:hidden "
          >
            <IoAddCircleOutline className="text-xl" />
          </div>
        </div>
      </div>
      {(advancingFilters.length > 0 || decliningFilters.length > 0) && (
        <div className="space-y-4">
          <div className="text-sm font-semibold text-foreground/70">
            Selected
          </div>
          {advancingFilters.map((filter, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm">
              <div
                onClick={() => removeMovingAvgFilter(index, true)}
                className="px-2 text-sm flex space-x-2 items-center text-foreground/70 cursor-pointer hover:text-destructive"
              >
                <IoRemoveCircleOutline className="text-lg" />
              </div>
              <div className="w-28">{filter.type}</div>
              <div className="w-24">Advancing</div>
            </div>
          ))}
          {decliningFilters.map((filter, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm">
              <div
                onClick={() => removeMovingAvgFilter(index, false)}
                className="px-2 text-sm flex space-x-2 items-center text-foreground/70 cursor-pointer hover:text-destructive"
              >
                <IoRemoveCircleOutline className="text-lg" />
              </div>
              <div className="w-28">{filter.type}</div>
              <div className="w-24">Declining</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdvDeclMovingAvgFilter;
