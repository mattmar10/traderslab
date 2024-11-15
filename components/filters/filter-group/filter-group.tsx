import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { PlusCircle, MinusCircle } from "lucide-react";
import { FilterCriteria, FilterGroup } from "@/lib/types/screener-types";

interface FilterGroupBuilderProps {
  filterGroup: FilterGroup;
  onFilterGroupChange: (filterGroup: FilterGroup) => void;
}

const filterKeys: (keyof FilterCriteria)[] = [
  "priceRange",
  "adrPercentRange",
  "sector",
  "industry",
  "country",
  "marketCapRange",
  "movingAvgAdvancingFilters",
  "movingAvgDecliningFilters",
  "movingAvgFilters",
  "adrPercentFromMovingAvgFilter",
  // ... add all other keys from FilterCriteria
];

function isFilterGroup(
  filter: FilterCriteria | FilterGroup
): filter is FilterGroup {
  return "operator" in filter && "filters" in filter;
}

function isFilterCriteria(
  filter: FilterCriteria | FilterGroup
): filter is FilterCriteria {
  return !isFilterGroup(filter);
}

const FilterGroupBuilder: React.FC<FilterGroupBuilderProps> = ({
  filterGroup,
  onFilterGroupChange,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const addFilter = () => {
    onFilterGroupChange({
      ...filterGroup,
      filters: [...filterGroup.filters, {} as FilterCriteria],
    });
  };

  const addGroup = () => {
    onFilterGroupChange({
      ...filterGroup,
      filters: [
        ...filterGroup.filters,
        { operator: "AND", filters: [] } as FilterGroup,
      ],
    });
  };

  const updateFilter = (
    index: number,
    filter: FilterCriteria | FilterGroup
  ) => {
    const newFilters = [...filterGroup.filters];
    newFilters[index] = filter;
    onFilterGroupChange({ ...filterGroup, filters: newFilters });
  };

  const removeFilter = (index: number) => {
    const newFilters = filterGroup.filters.filter((_, i) => i !== index);
    onFilterGroupChange({ ...filterGroup, filters: newFilters });
  };

  const renderComplexFilterValue = (
    key: keyof FilterCriteria,
    value: any,
    index: number,
    filter: FilterCriteria
  ) => {
    switch (key) {
      case "movingAvgAdvancingFilters":
      case "movingAvgDecliningFilters":
        return (
          <div>
            <Select
              value={value?.type || ""}
              onValueChange={(newType) => {
                const newValue = { ...value, type: newType };
                updateFilter(index, { ...filter, [key]: [newValue] });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select MA type" />
              </SelectTrigger>
              <SelectContent>
                {["5SMA", "10EMA", "21EMA", "20SMA", "50SMA", "200SMA"].map(
                  (type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
            <Input
              type="checkbox"
              checked={value?.isAdvancing}
              onChange={(e) => {
                const newValue = { ...value, isAdvancing: e.target.checked };
                updateFilter(index, { ...filter, [key]: [newValue] });
              }}
            />
            <label>Is Advancing</label>
          </div>
        );
      case "movingAvgFilters":
      case "adrPercentFromMovingAvgFilter":
        return (
          <div>
            <Select
              value={value?.type || ""}
              onValueChange={(newType) => {
                const newValue = { ...value, type: newType };
                updateFilter(index, { ...filter, [key]: [newValue] });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select MA type" />
              </SelectTrigger>
              <SelectContent>
                {["5SMA", "10EMA", "21EMA", "20SMA", "50SMA", "200SMA"].map(
                  (type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
            <Input
              type="number"
              value={value?.percentRange?.[0] || ""}
              onChange={(e) => {
                const newValue = {
                  ...value,
                  percentRange: [
                    Number(e.target.value),
                    value?.percentRange?.[1],
                  ],
                };
                updateFilter(index, { ...filter, [key]: [newValue] });
              }}
              placeholder="Min %"
            />
            <Input
              type="number"
              value={value?.percentRange?.[1] || ""}
              onChange={(e) => {
                const newValue = {
                  ...value,
                  percentRange: [
                    value?.percentRange?.[0],
                    Number(e.target.value),
                  ],
                };
                updateFilter(index, { ...filter, [key]: [newValue] });
              }}
              placeholder="Max %"
            />
          </div>
        );
      default:
        return <div>Unsupported complex filter type</div>;
    }
  };

  const renderFilterValue = (filter: FilterCriteria, index: number) => {
    const key = Object.keys(filter)[0] as keyof FilterCriteria;
    const value = filter[key];

    if (
      Array.isArray(value) &&
      typeof value[0] === "number" &&
      typeof value[1] === "number"
    ) {
      return (
        <div className="flex space-x-2">
          <Input
            type="number"
            value={value[0]}
            onChange={(e) =>
              updateFilter(index, {
                ...filter,
                [key]: [Number(e.target.value), value[1]],
              })
            }
            placeholder="Min"
          />
          <Input
            type="number"
            value={value[1]}
            onChange={(e) =>
              updateFilter(index, {
                ...filter,
                [key]: [value[0], Number(e.target.value)],
              })
            }
            placeholder="Max"
          />
        </div>
      );
    } else if (typeof value === "object" && value !== null) {
      return renderComplexFilterValue(key, value, index, filter);
    } else if (typeof value === "boolean") {
      return (
        <Select
          value={value ? "true" : "false"}
          onValueChange={(v) =>
            updateFilter(index, { ...filter, [key]: v === "true" })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">True</SelectItem>
            <SelectItem value="false">False</SelectItem>
          </SelectContent>
        </Select>
      );
    } else {
      return (
        <Input
          type="text"
          value={value || ""}
          onChange={(e) =>
            updateFilter(index, { ...filter, [key]: e.target.value })
          }
          placeholder="Value"
        />
      );
    }
  };

  const renderFilter = (
    filter: FilterCriteria | FilterGroup,
    index: number
  ) => {
    if (isFilterGroup(filter)) {
      return (
        <div
          key={index}
          className="ml-4 mt-2 p-2 border border-gray-300 rounded"
        >
          <FilterGroupBuilder
            filterGroup={filter}
            onFilterGroupChange={(newGroup) => updateFilter(index, newGroup)}
          />
        </div>
      );
    }

    if (isFilterCriteria(filter)) {
      const filterKey = Object.keys(filter)[0] as keyof FilterCriteria;

      return (
        <div key={index} className="flex items-center space-x-2 mt-2">
          <Select
            value={filterKey || ""}
            onValueChange={(value) =>
              updateFilter(index, { [value]: undefined } as FilterCriteria)
            }
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select filter" />
            </SelectTrigger>
            <SelectContent>
              {filterKeys.map((key) => (
                <SelectItem key={key} value={key}>
                  {key}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {filterKey && renderFilterValue(filter, index)}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeFilter(index)}
          >
            <MinusCircle className="h-4 w-4" />
          </Button>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Select
          value={filterGroup.operator}
          onValueChange={(value) =>
            onFilterGroupChange({
              ...filterGroup,
              operator: value as "AND" | "OR",
            })
          }
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="Operator" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="AND">AND</SelectItem>
            <SelectItem value="OR">OR</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex-grow">
          <Input
            type="text"
            placeholder="Search filters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <Button variant="outline" size="icon" onClick={addFilter}>
          <PlusCircle className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={addGroup}>
          <PlusCircle className="h-4 w-4" /> Group
        </Button>
      </div>

      {filterGroup.filters.map((filter, index) => renderFilter(filter, index))}
    </div>
  );
};

export default FilterGroupBuilder;
