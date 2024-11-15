"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface MinimumDaysBeforeEarningsProps {
  value: number | undefined;
  onValueChange: (value: number | undefined) => void;
}

const MinimumDaysBeforeEarnings: React.FC<MinimumDaysBeforeEarningsProps> = ({
  value,
  onValueChange,
}) => {
  const [inputValue, setInputValue] = useState(value || undefined);

  const handleAddClick = () => {
    if (inputValue) {
      onValueChange(Number(inputValue));
    }
  };

  const handleClearClick = () => {
    setInputValue(undefined); // Reset the input value
    onValueChange(undefined); // Notify parent to clear the filter
  };

  return (
    <div className="flex flex-col">
      <label className="text-sm mb-3 font-semibold text-foreground/70">
        Minimum Days Before Earnings
      </label>
      <div className="flex items-center space-x-2 px-2">
        <Input
          type="number"
          value={inputValue !== undefined ? inputValue : ""}
          onChange={(e) => setInputValue(Number(e.target.value))}
          className="text-sm w-24"
          placeholder=""
        />
        <Button onClick={handleAddClick} className="w-20">
          Set
        </Button>
        <Button onClick={handleClearClick} variant="outline" className="w-20">
          Clear
        </Button>
      </div>
      {value !== undefined && (
        <div className="mt-2 text-sm text-foreground/70 font-semibold">
          Selected: {value} day{value > 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
};

export default MinimumDaysBeforeEarnings;
