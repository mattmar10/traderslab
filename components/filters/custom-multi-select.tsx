"use client";
import { Button } from "@/components/ui/button";
import React, { useState, useEffect } from "react";
import { FaUndo } from "react-icons/fa";

export interface ExpandableDropDownOption {
  id: string;
  displayName: string;
}

export interface SelectedOptions {
  include: ExpandableDropDownOption[];
  exclude: ExpandableDropDownOption[];
}

interface CustomMultiSelectProps {
  header: string;
  items: ExpandableDropDownOption[];
  onSelectionChange: (selectedItems: SelectedOptions) => void;
  initiallySelectedItems?: SelectedOptions;
}

const CustomMultiSelect: React.FC<CustomMultiSelectProps> = ({
  header,
  items,
  onSelectionChange,
  initiallySelectedItems = { include: [], exclude: [] },
}) => {
  const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>(
    initiallySelectedItems
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isIncludeMode, setIsIncludeMode] = useState(true);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  useEffect(() => {
    setSelectedOptions(initiallySelectedItems);
  }, [initiallySelectedItems]);

  const sortedItems = [...items].sort((a, b) =>
    a.displayName.localeCompare(b.displayName)
  );

  const handleOptionToggle = (option: ExpandableDropDownOption) => {
    const mode = isIncludeMode ? "include" : "exclude";
    const isSelected = selectedOptions[mode].some((o) => o.id === option.id);

    const updatedOptions = { ...selectedOptions };

    if (isSelected) {
      updatedOptions[mode] = updatedOptions[mode].filter(
        (o) => o.id !== option.id
      );
    } else {
      updatedOptions[mode] = [...updatedOptions[mode], option];
    }

    setSelectedOptions(updatedOptions);
    onSelectionChange(updatedOptions);
  };

  const handleModeChange = () => {
    setIsIncludeMode(!isIncludeMode);
  };

  const handleClearSelection = () => {
    const mode = isIncludeMode ? "include" : "exclude";
    const updatedOptions = { ...selectedOptions, [mode]: [] };
    setSelectedOptions(updatedOptions);
    onSelectionChange(updatedOptions);
  };

  const getSelectedText = () => {
    const includeText = selectedOptions.include
      .map((s) => s.displayName)
      .join(", ");
    const excludeText = selectedOptions.exclude
      .map((s) => s.displayName)
      .join(", ");
    if (includeText && excludeText) {
      return `Include: ${includeText} | Exclude: ${excludeText}`;
    } else if (includeText) {
      return `Include: ${includeText}`;
    } else if (excludeText) {
      return `Exclude: ${excludeText}`;
    }
    return "ALL";
  };

  const handleMouseLeave = () => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      setIsDropdownOpen(false);
      setIsAnimatingOut(false);
    }, 300); // Match this duration with the CSS transition duration
  };

  const dropdownClasses = `absolute z-50 w-full bg-background shadow-xl drop-shadow border border-foreground/30 mt-1 transition-opacity transition-transform duration-300 ease-in-out ${isAnimatingOut ? "opacity-0 transform -translate-y-2" : "opacity-100"
    }`;

  return (
    <div className="w-full">
      <div className="relative">
        <label className="block text-sm leading-5 font-medium text-foreground/70 mb-2">
          {header}
        </label>
        <div
          className="cursor-pointer"
          onClick={() => {
            if (isDropdownOpen) {
              handleMouseLeave();
            } else {
              setIsDropdownOpen(true);
            }
          }}
        >
          <div className="relative w-full border border-foreground/30 bg-background pl-3 pr-10 py-2 text-left focus:outline-none focus:border-foreground/3 transition ease-in-out duration-150 sm:text-sm sm:leading-5">
            <span className="block truncate">{getSelectedText()}</span>
            <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg
                className="h-5 w-5 text-foreground/50"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
              >
                <path
                  d="M7 7l3-3 3 3m0 6l-3 3-3-3"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>
        </div>
        {isDropdownOpen && (
          <div
            className={dropdownClasses}
            onMouseLeave={handleMouseLeave} // Close dropdown on mouse leave with animation
          >
            <div className="flex justify-between items-center p-2 border-b border-foreground/10">
              <span className="text-sm font-medium text-foreground/70">
                Mode:
              </span>
              <div className="flex items-center space-x-2">
                <Button
                  size={"sm"}
                  type="button"
                  onClick={handleModeChange}
                  className={`transition-colors duration-200 ${isIncludeMode
                      ? "bg-primary text-background hover:bg-primary-dark"
                      : "bg-foreground/10 text-foreground hover:bg-foreground/20"
                    }`}
                >
                  Include
                </Button>
                <Button
                  size={"sm"}
                  type="button"
                  onClick={handleModeChange}
                  className={`transition-colors duration-200 ${!isIncludeMode
                      ? "bg-primary text-background hover:bg-primary-dark"
                      : "bg-foreground/10 text-foreground hover:bg-foreground/20"
                    }`}
                >
                  Exclude
                </Button>
                <Button
                  size={"sm"}
                  type="button"
                  variant={"ghost"}
                  onClick={handleClearSelection}
                  className="bg-transparent text-foreground/70 hover:text-primary transition-colors duration-200"
                >
                  <FaUndo />
                </Button>
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto">
              {sortedItems.map((option) => {
                const isIncluded = selectedOptions.include.some(
                  (o) => o.id === option.id
                );
                const isExcluded = selectedOptions.exclude.some(
                  (o) => o.id === option.id
                );
                const isSelected = isIncludeMode ? isIncluded : isExcluded;
                return (
                  <div
                    key={option.id}
                    className={`cursor-pointer select-none relative py-2 pl-4 pr-4 ${isSelected ? "bg-foreground/5" : "text-foreground/70"
                      } hover:bg-foreground/10`}
                    onClick={() => handleOptionToggle(option)}
                  >
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleOptionToggle(option)}
                        className="mr-3 accent-current"
                      />
                      <span
                        className={`${isSelected ? "font-semibold" : "font-normal"
                          } block truncate`}
                      >
                        {option.displayName}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomMultiSelect;
