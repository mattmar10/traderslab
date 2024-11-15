"use client";
import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

import { FilterIcon, Save, Upload } from "lucide-react";
import { useEffect, useState, useTransition } from "react";

import SimpleFilterEditor from "./simple-filter-group-builder";
import AdvancedFilterGroupEditor from "./advanced-filter-group-builder";
import { ExpandableDropDownOption } from "../custom-multi-select";
import { useQuery } from "@tanstack/react-query";
import { isRangeKey, RangeKeys } from "../filters-types";
import SaveToLibrary from "./save-filter-group";
import { FilterCriteria, FilterGroup, FilterGroupDTO, InclusionExclusion, ScreenerRanges } from "@/lib/types/screener-types";
import { useAuth } from "@clerk/nextjs";

export interface FilterGroupEditorProps {
  onApplyFilters: (filters: FilterGroupDTO | undefined) => void;
  onClearFilters: () => void;
  ranges: ScreenerRanges;
  countryCodes: Record<string, string>;
  filterGrp: FilterGroupDTO | undefined;
}

const emptyFG: FilterGroupDTO = {
  filterGroupName: "New Screen",
  filterGroupDescription: "Enter a description",
  permission: "PRIVATE",
  filterGroup: {
    operator: "AND",
    filters: [],
  },
};

const FilterGroupEditor: React.FC<FilterGroupEditorProps> = ({
  onApplyFilters,
  onClearFilters,
  ranges,
  countryCodes,
  filterGrp,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [filterCount, setFilterCount] = useState<number>(0);
  const [filterGroupDTO, setFilterGroup] = useState<FilterGroupDTO>(emptyFG);

  const [showSaveToLibrarySection, setShowSaveToLibrarySection] =
    useState<boolean>(false);

  const [showUpdateSection, setShowUpdateSection] = useState<boolean>(false);

  const { userId, sessionId } = useAuth()

  const fetchSectors = async () => {
    const response = await fetch("/api/sectors");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.json();
  };

  const { data: sectors = [] } = useQuery({
    queryKey: ["sectors-list"],
    queryFn: fetchSectors,
  });

  const fetchIndustries = async () => {
    const response = await fetch("/api/industries");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.json();
  };
  const { data: industries = [] } = useQuery({
    queryKey: ["industries-list"],
    queryFn: fetchIndustries,
  });

  useEffect(() => {
    if (filterGrp) {
      setFilterGroup(filterGrp);
      setIsAdvancedMode(isComplexFilterGroup(filterGrp.filterGroup));
      setFilterCount(countActiveFilters(filterGrp.filterGroup));
    } else {
      setFilterGroup(emptyFG);
      setIsAdvancedMode(false);
      setFilterCount(0);
    }
  }, [filterGrp]);

  const sectorOptions: ExpandableDropDownOption[] = sectors.map(
    (s: string) => ({
      id: s,
      displayName: s,
    })
  );

  const industriesOptions: ExpandableDropDownOption[] = industries.map(
    (i: string) => ({
      id: i,
      displayName: i,
    })
  );

  const countryOptions: ExpandableDropDownOption[] = Object.entries(
    countryCodes
  ).map(([key, value]) => ({
    id: key,
    displayName: value,
  }));

  const isComplex = isComplexFilterGroup(filterGroupDTO.filterGroup);

  const handleFilterChange = (key: keyof FilterCriteria, value: any) => {
    setFilterGroup((prevGroup) => {
      let filterExists = false;

      // Map over existing filters to check if the key already exists
      const updatedFilters = prevGroup.filterGroup.filters.map((filter) => {
        if ("operator" in filter) {
          // Skip operator filters
          return filter;
        } else if (key in filter) {
          // Update the filter if the key exists
          filterExists = true;
          return { ...filter, [key]: value };
        } else {
          // No change for this filter
          return filter;
        }
      });

      // If the filter key didn't exist, add a new filter to the list
      if (!filterExists) {
        if (updatedFilters.length > 0 && !("operator" in updatedFilters[0])) {
          // Merge the new key-value pair into the first non-operator filter
          updatedFilters[0] = { ...updatedFilters[0], [key]: value };
        } else {
          // If all are operators, or it's empty, create a new filter
          updatedFilters.push({ [key]: value });
        }
      }

      // Return the updated FilterGroupDTO
      return {
        ...prevGroup,
        filterGroup: {
          ...prevGroup.filterGroup,
          filters: updatedFilters,
        },
      };
    });
  };

  const handleFilterGroupChange = (updatedFilterGroup: FilterGroup) => {
    setFilterGroup((prevGroup) => ({
      ...prevGroup,
      filterGroup: updatedFilterGroup,
    }));
  };

  const applyFilters = () => {
    onApplyFilters(filterGroupDTO);
    setFilterCount(countActiveFilters(filterGroupDTO.filterGroup));
    handleCloseDialog();
  };

  const handleSaveOrUpdate = (newFilterGroupDTO: FilterGroupDTO) => {
    setFilterGroup(newFilterGroupDTO);
    onApplyFilters(newFilterGroupDTO);
    setFilterCount(countActiveFilters(newFilterGroupDTO.filterGroup));
    setShowUpdateSection(false);
    setShowSaveToLibrarySection(false);
    handleCloseDialog();
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const resetFilters = () => {
    //setFilterGroup({ operator: "AND", filters: [] });
    //setFilterCount(0);
    onClearFilters();
    handleCloseDialog();
  };

  return (
    <>
      <div className="relative inline-block">
        <Button
          variant="outline"
          className="w-full mt-6 rounded-none "
          onClick={() => setIsDialogOpen(!isDialogOpen)}
        >
          <FilterIcon />
          <span className="ml-2">Filters</span>
        </Button>
        {filterCount > 0 && (
          <span className="absolute -top-1 mt-4 -right-2 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 py-1 text-xs font-bold leading-none text-background bg-solarizedblue rounded-md z-50">
            {filterCount}
          </span>
        )}
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[95%] max-w-[85vw] h-[90vh] flex flex-col">
          <div className="flex justify-between items-end w-full">
            <div className="flex items-center space-x-5">
              <div className="text-2xl font-semibold">Filters</div>

              <div className="hidden lg:flex items-center space-x-2">
                <span
                  className={`cursor-pointer ${isAdvancedMode ? "font-normal" : "font-semibold"
                    }`}
                  onClick={() => {
                    if (!isComplex) {
                      setIsAdvancedMode(false);
                    }
                  }}
                >
                  Simple
                </span>
                <Switch
                  className="outline-none focus:outline-none focus:ring-0"
                  checked={isAdvancedMode}
                  onCheckedChange={setIsAdvancedMode}
                  disabled={isComplex} // Disable switch if complex filters are detected
                />
                <span
                  className={`cursor-pointer ${isAdvancedMode ? "font-semibold" : "font-normal"
                    }`}
                  onClick={() => setIsAdvancedMode(true)}
                >
                  Advanced
                </span>
                {isComplex && (
                  <span className="text-sm text-foreground/40 italic">
                    Filters with nested groups must be edited in the advanced
                    editor.
                  </span>
                )}
              </div>
            </div>
            <div className="flex space-x-2 pr-4">
              <Button
                size={"sm"}
                variant={"outline"}
                className="rounded-none"
                onClick={() => setShowSaveToLibrarySection(true)}
              >
                <Save className="mr-2 h-4 w-4" /> Save As
              </Button>

              {filterGroupDTO &&
                filterGroupDTO.filterGroupId &&
                filterGroupDTO.userId === userId && (
                  <Button
                    size={"sm"}
                    variant={"outline"}
                    className="rounded-none"
                    onClick={() => setShowUpdateSection(true)}
                  >
                    <Upload className="mr-2 h-4 w-4" /> Update
                  </Button>
                )}
            </div>
          </div>

          {showSaveToLibrarySection && (
            <SaveToLibrary
              fgToSave={adjustFilterGroupDTOForSave(filterGroupDTO, ranges)}
              updateMode={false}
              onCancel={() => setShowSaveToLibrarySection(false)}
              onSuccess={handleSaveOrUpdate}
            />
          )}

          {showUpdateSection && (
            <SaveToLibrary
              fgToSave={adjustFilterGroupDTOForSave(filterGroupDTO, ranges)}
              updateMode={true}
              onCancel={() => setShowUpdateSection(false)}
              onSuccess={handleSaveOrUpdate}
            />
          )}

          <div className="flex-1 overflow-y-auto">
            {isAdvancedMode ? (
              <AdvancedFilterGroupEditor
                filterGroup={adjustFilterGroupForLoad(
                  filterGroupDTO.filterGroup,
                  ranges
                )}
                onFilterGroupChange={handleFilterGroupChange}
                ranges={ranges}
                sectors={sectorOptions}
                industries={industriesOptions}
                countries={countryOptions}
              />
            ) : (
              <SimpleFilterEditor
                filters={adjustFilterCriteriaForLoad(
                  filterGroupDTO.filterGroup.filters[0] as FilterCriteria,
                  ranges
                )}
                onFiltersChange={handleFilterChange}
                ranges={ranges}
                sectors={sectorOptions}
                industries={industriesOptions}
                countryCodes={countryCodes}
              />
            )}
          </div>

          <DialogFooter className="flex-shrink-0 flex justify-between items-center border-t border-foreground/10 pt-4">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:space-x-2 w-full justify-end">
              <Button className="w-full sm:w-auto" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button className="w-full sm:w-auto" onClick={applyFilters}>
                Apply Filters
              </Button>
              <Button className="w-full sm:w-auto" onClick={resetFilters}>
                Clear Filters
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FilterGroupEditor;

function isComplexFilterGroup(filterGroup: FilterGroup): boolean {
  return (
    filterGroup.filters.length > 1 ||
    filterGroup.filters.some((filter) => "operator" in filter)
  );
}

function sanitizeFilterGroup(group: FilterGroup): FilterGroup {
  return {
    name: group.name,
    operator: group.operator,
    filters: group.filters.map((filter) => {
      return sanitizeFilterCriteria(filter as FilterCriteria);
    }),
  };
}

// Helper function to sanitize FilterCriteria
function sanitizeFilterCriteria(criteria: FilterCriteria): FilterCriteria {
  return {
    ...criteria,
  };
}

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

function countActiveFilters(filters: FilterGroup): number {
  return filters.filters.reduce((count, filter) => {
    if ("operator" in filter) {
      // If the filter is a FilterGroup, recursively count its active filters
      return count + countActiveFilters(filter as FilterGroup);
    } else {
      // If the filter is a FilterCriteria
      return (
        count +
        Object.entries(filter).reduce((innerCount, [key, value]) => {
          if (key === "sector" || key === "industry" || key === "country") {
            const { include, exclude } = value as InclusionExclusion;
            return (
              innerCount +
              ((include?.length || 0) >= 1 || (exclude?.length || 0) >= 1
                ? 1
                : 0)
            );
          } else if (Array.isArray(value)) {
            return innerCount + (value.length > 0 ? 1 : 0);
          } else if (value !== null && value !== undefined) {
            return innerCount + 1;
          }
          return innerCount;
        }, 0)
      );
    }
  }, 0);
}

function adjustFilterGroupDTOForSave(
  groupDTO: FilterGroupDTO,
  ranges: ScreenerRanges
): FilterGroupDTO {
  return {
    ...groupDTO, // Keep other fields (filterGroupName, userId, permission, etc.) intact
    filterGroup: {
      ...groupDTO.filterGroup, // Adjust only the filterGroup property
      filters: groupDTO.filterGroup.filters.map((filter) => {
        if ("operator" in filter) {
          return adjustFilterGroupForSave(filter as FilterGroup, ranges); // Recursively adjust nested FilterGroups
        } else {
          return adjustFilterCriteriaForSave(filter as FilterCriteria, ranges); // Adjust FilterCriteria
        }
      }),
    },
  };
}

function adjustFilterGroupForSave(
  group: FilterGroup,
  ranges: ScreenerRanges
): FilterGroup {
  return {
    ...group,
    filters: group.filters.map((filter) => {
      if ("operator" in filter) {
        return adjustFilterGroupForSave(filter as FilterGroup, ranges);
      } else {
        return adjustFilterCriteriaForSave(filter as FilterCriteria, ranges);
      }
    }),
  };
}

function adjustFilterCriteriaForSave(
  criteria: FilterCriteria,
  ranges: ScreenerRanges
): FilterCriteria {
  const adjustedCriteria: FilterCriteria = { ...criteria };

  Object.keys(criteria).forEach((key) => {
    if (isRangeKey(key)) {
      const rangeKey = key as RangeKeys; // Correctly cast 'key' to 'RangeKeys' type

      const range = ranges[rangeKey as keyof ScreenerRanges] || [
        1, 100,
      ];
      const numericRange = range as [number, number];

      if (
        criteria[rangeKey] &&
        Array.isArray(criteria[rangeKey]) &&
        criteria[rangeKey]!.length === 2
      ) {
        adjustedCriteria[rangeKey] = [
          criteria[rangeKey]![0] === numericRange[0]
            ? Number.MIN_SAFE_INTEGER
            : criteria[rangeKey]![0],
          criteria[rangeKey]![1] === numericRange[1]
            ? Number.MAX_VALUE
            : criteria[rangeKey]![1],
        ];
      }
    }
  });

  return adjustedCriteria;
}

function adjustFilterGroupForLoad(
  group: FilterGroup,
  ranges: ScreenerRanges
): FilterGroup {
  return {
    ...group,
    filters: group.filters.map((filter) => {
      if ("operator" in filter) {
        return adjustFilterGroupForLoad(filter as FilterGroup, ranges);
      } else {
        return adjustFilterCriteriaForLoad(filter as FilterCriteria, ranges);
      }
    }),
  };
}

function adjustFilterCriteriaForLoad(
  criteria: FilterCriteria,
  ranges: ScreenerRanges
): FilterCriteria {
  if (!criteria) return {};

  const adjustedCriteria: FilterCriteria = { ...criteria };

  Object.keys(criteria).forEach((key) => {
    if (isRangeKey(key)) {
      const rangeKey = key as RangeKeys;

      const range = ranges[rangeKey as keyof ScreenerRanges] || [
        1, 100,
      ];
      const numericRange = range as [number, number];
      if (
        criteria[rangeKey] &&
        Array.isArray(criteria[rangeKey]) &&
        criteria[rangeKey]!.length === 2
      ) {
        adjustedCriteria[rangeKey] = [
          criteria[rangeKey]![0] === Number.MIN_SAFE_INTEGER
            ? numericRange[0]
            : criteria[rangeKey]![0],
          criteria[rangeKey]![1] === Number.MAX_VALUE
            ? numericRange[1]
            : criteria[rangeKey]![1],
        ];
      }
    }
  });

  return adjustedCriteria;
}
