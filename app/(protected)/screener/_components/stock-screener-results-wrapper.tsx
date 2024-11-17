"use client";

import {
  ChartSettings,
  defaultChartSettings,
} from "@/components/settings/chart-settings";
import {
  FilterCriteria,
  FilterGroup,
  FilterGroupDTO,
  ScreenerResults,
  ScreenerResultsSchema,
  ScreenerSortableKeys,
  ScreenerSortConfig,
  SymbolWithStatsWithRank,
} from "@/lib/types/screener-types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { allColumns, Column, defaultColumns } from "./screener-table-columns";
import { useIsMobile } from "@/hooks/use-mobile";
import { useInView } from "react-intersection-observer";
import { adjustFilterGroupForSave } from "@/components/filters/utils";
import { fetchWithRetries } from "@/app/api/utils";
import Loading from "@/components/loading";
import { isWithinMarketHours } from "@/lib/utils";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import ScreenerResultsTable from "./screener-results-table";
import { useTheme } from "next-themes";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { GearIcon } from "@radix-ui/react-icons";
import TableColumnSelector from "./table-column-selector";
import PulsatingDots from "@/components/pulsating-dots";
import ExportComponent from "./export-component";
import FilterGroupSelector from "@/components/filters/filter-group/filter-group-selector";
import FilterGroupEditor from "@/components/filters/filter-group/filter-group-editor";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ScreenerLibrary from "./filter-library";
import { Button } from "@/components/ui/button";
import { RiStackLine } from "react-icons/ri";
import ScreenerMiniChartWrapper from "./screener-result-minichart";
// Define types for localStorage data
interface LocalStorageData {
  sortConfig: ScreenerSortConfig;
  filterGroup: FilterGroupDTO | undefined;
  chartSettings: ChartSettings;
  selectedColumns: Column[];
}

const defaultSortConfig: ScreenerSortConfig = {
  key: "rsRank",
  direction: "asc",
};

interface ScreenerResultsWrapperProps {
  initialData: ScreenerResults;
  countryCodes: Record<string, string>;
}

const ScreenerResultsWrapper = ({
  initialData,
  countryCodes,
}: ScreenerResultsWrapperProps) => {
  const isLargeScreen = !useIsMobile();
  const queryClient = useQueryClient();
  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: false,
  });

  const [state, setState] = useState<{
    displayAs: "table" | "charts";
    isFiltersLibraryOpen: boolean;
    isMounted: boolean;
  }>({
    displayAs: "table",
    isFiltersLibraryOpen: false,
    isMounted: false,
  });

  const [persistedState, setPersistedState] = useState<LocalStorageData>({
    sortConfig: defaultSortConfig,
    chartSettings: defaultChartSettings,
    selectedColumns: defaultColumns,
    filterGroup: undefined,
  });

  const { theme } = useTheme();
  const resolvedTheme = (theme as "light" | "dark") || "light";


  const startDate = useMemo(() => {
    const currentDate = new Date();
    return new Date(
      currentDate.getFullYear() - 2,
      currentDate.getMonth(),
      currentDate.getDate(),
      0, // Use fixed values for time to prevent unnecessary changes
      0,
      0,
      0
    );
  }, []);

  useEffect(() => {
    const loadPersistedData = () => {
      const data: Partial<LocalStorageData> = {};

      try {
        [
          "sortConfig",
          "filterGroup",
          "chartSettings",
          "selectedColumns",
        ].forEach((key) => {
          const saved = localStorage.getItem(key);
          if (saved) {
            data[key as keyof LocalStorageData] = JSON.parse(saved);
          }
        });
      } catch (error) {
        console.error("Error loading persisted data:", error);
      }

      setPersistedState({
        sortConfig: data.sortConfig || defaultSortConfig,
        filterGroup: data.filterGroup,
        chartSettings: data.chartSettings || defaultChartSettings,
        selectedColumns: data.selectedColumns || defaultColumns,
      });

      setState((prev) => ({ ...prev, isMounted: true }));
    };

    loadPersistedData();
  }, []);

  // Save to localStorage whenever persisted state changes
  useEffect(() => {
    if (state.isMounted) {
      Object.entries(persistedState).forEach(([key, value]) => {
        if (value !== undefined) {
          localStorage.setItem(key, JSON.stringify(value));
        }
      });
    }
  }, [persistedState, state.isMounted]);

  // Handlers for updating state
  const updatePersistedState = useCallback(
    (
      key: keyof LocalStorageData,
      value: LocalStorageData[keyof LocalStorageData]
    ) => {
      setPersistedState((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const updateState = useCallback(
    (key: keyof typeof state, value: (typeof state)[keyof typeof state]) => {
      setState((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleColumnChange = useCallback(
    (newColumns: Column[]) => {
      const columnsToSet =
        newColumns.length === 0 ? defaultColumns : newColumns;
      updatePersistedState("selectedColumns", columnsToSet);
    },
    [updatePersistedState]
  );

  const handleApplyFilters = useCallback(
    (filters: FilterGroupDTO | undefined) => {
      let filterGroup: FilterGroup | undefined;

      if (!filters) {
        filterGroup = undefined;
      } else if ("operator" in filters.filterGroup) {
        filterGroup = adjustFilterGroupForSave(
          filters.filterGroup,
          initialData.ranges
        );
      } else {
        const convertedGroup = convertToFilterGroup(filters as FilterCriteria);
        filterGroup = adjustFilterGroupForSave(
          convertedGroup,
          initialData.ranges
        );
      }

      updatePersistedState("filterGroup", filters);
      if (filterGroup) {
        localStorage.setItem("filterGroup", JSON.stringify(filters));
      } else {
        localStorage.removeItem("filterGroup");
      }
      queryClient.invalidateQueries({ queryKey: ["stocks"] });
    },
    [queryClient, initialData]
  );

  const clearFilters = useCallback(() => {
    handleApplyFilters(undefined);
  }, [handleApplyFilters]);

  const handleSortKeyChange = (value: ScreenerSortableKeys) => {
    const updatedSortConfig = {
      ...persistedState.sortConfig,
      key: value,
      direction: value === "rsRank" ? "asc" : ("desc" as "asc" | "desc"),
    };

    updatePersistedState("sortConfig", updatedSortConfig);
  };

  const handleSortDirectionChange = (value: "asc" | "desc") => {
    // Get the previous sort configuration and update it with the new direction
    const updatedSortConfig = {
      ...persistedState.sortConfig,
      direction: value,
    };

    updatePersistedState("sortConfig", updatedSortConfig);
  };

  const handleDisplayAsToggle = () => {
    setState((prevState) => ({
      ...prevState,
      displayAs: prevState.displayAs === "table" ? "charts" : "table",
    }));
  };

  //functions for fetching results
  const fetchStocks = async ({ pageParam = 1 }) => {
    const response = await fetchWithRetries(
      "/api/screener/stocks",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page: pageParam,
          pageSize: initialData.pageSize,
          ...(persistedState.filterGroup
            ? { filterGroup: persistedState.filterGroup.filterGroup }
            : {}),
          sortAttribute: persistedState.sortConfig.key,
          sortDirection: persistedState.sortConfig.direction,
        }),
        next: { revalidate: 0 },
      },
      1
    );

    const parsed = ScreenerResultsSchema.safeParse(response);

    if (parsed.success) {
      return parsed.data;
    } else {
      throw Error("Unable to fetch more data");
    }
  };

  const getAllStocks = async (): Promise<SymbolWithStatsWithRank[]> => {
    let allStocks: SymbolWithStatsWithRank[] = [];
    let pageParam = 1;

    while (true) {
      const page = await fetchStocks({ pageParam });
      allStocks = [...allStocks, ...page.stocks];
      if (page.pages <= pageParam) break;
      pageParam++;
    }

    return allStocks;
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
    error,
  } = useInfiniteQuery({
    queryKey: ["stocks", persistedState.sortConfig, persistedState.filterGroup],
    queryFn: fetchStocks,
    getNextPageParam: (lastPage) =>
      lastPage.pages > lastPage.currentPage
        ? lastPage.currentPage + 1
        : undefined,
    initialPageParam: 1,
    refetchInterval: (data) => {
      if (!data) return 0; // Run immediately if no data
      return isWithinMarketHours()
        ? persistedState.chartSettings.screenerRefreshInterval
        : false;
    },
    select: (data) => ({
      pages: data.pages,
      pageParams: data.pageParams,
      totalCount: data.pages[0].total,
    }),
  });

  const resultCountFromQueryResult = data?.totalCount;
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (!state.isMounted) {
    return <Loading />;
  }

  const renderContent = () => {
    if (status === "pending") {
      return <Loading />;
    }

    if (status === "error") {
      return <div>Error: {(error as Error).message}</div>;
    }

    const stocks = data?.pages.flatMap((page) => page.stocks) || [];

    return (
      <>
        <div className="mt-0 relative">
          {state.displayAs === "table" ? (
            <ScreenerResultsTable
              stocks={stocks}
              theme={resolvedTheme}
              sortConfig={persistedState.sortConfig}
              ranges={initialData.ranges}
              columns={persistedState.selectedColumns}
              chartSettings={persistedState.chartSettings}
            />
          ) : (
            <div className="pt-4 grid grid-cols-1 lg:grid-cols-2 gap-4 lg:mt-4 px-2 lg:px-0">
              {stocks.map((item) => (
                <Card key={item.profile.symbol}>
                  <CardContent className="pl-3 pr-5">
                    <ScreenerMiniChartWrapper
                      item={item}
                      chartSettings={persistedState.chartSettings}
                      theme={resolvedTheme} startDate={startDate} />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
        {hasNextPage && (
          <div ref={ref} style={{ height: "20px", width: "100%" }} />
        )}
      </>
    );
  };

  return (
    <div className="flex flex-col min-h-screen w-full">
      <div className="flex items-end space-x-2  w-full pl-3 lg:pl-0">
        <div className="relative">
          <div className="text-sm text-foreground/60 pb-1">SORT BY</div>
          <Select
            onValueChange={handleSortKeyChange}
            value={persistedState.sortConfig.key}
          >
            <SelectTrigger className="w-[185px]">
              <SelectValue className="text-xs p-0" placeholder="SORT BY" />
            </SelectTrigger>
            <SelectContent className="text-xs w-[185px]" position="popper">
              <SelectGroup>
                <SelectLabel>GENERAL</SelectLabel>
                <SelectItem value="price">PRICE</SelectItem>
                <SelectItem value="rsRank">RS RANK</SelectItem>
                <SelectItem value="oneDayAbsoluteChange">
                  1 DAY CHANGE
                </SelectItem>
                <SelectItem value="sector">SECTOR</SelectItem>
                <SelectItem value="industry">INDUSTRY</SelectItem>
              </SelectGroup>
              <SelectGroup>
                <SelectLabel>RETURN %</SelectLabel>
                <SelectItem value="oneDayReturnPercent">
                  1 DAY RETURN %
                </SelectItem>
                <SelectItem value="oneWeekReturnPercent">
                  1 WK RETURN %
                </SelectItem>
                <SelectItem value="oneMonthReturnPercent">
                  1 MO RETURN %
                </SelectItem>
                <SelectItem value="threeMonthReturnPercent">
                  3 MO RETURN %
                </SelectItem>
                <SelectItem value="sixMonthReturnPercent">
                  6 MO RETURN %
                </SelectItem>
                <SelectItem value="oneYearReturnPercent">
                  1 YR RETURN %
                </SelectItem>
              </SelectGroup>
              <SelectGroup>
                <SelectLabel>52 WEEK RANGE</SelectLabel>
                <SelectItem value="percentFromFiftyTwoWeekHigh">
                  % FROM 52 WK HIGH
                </SelectItem>
                <SelectItem value="percentFromFiftyTwoWeekLow">
                  % FROM 52 WK LOW
                </SelectItem>
              </SelectGroup>
              <SelectGroup>
                <SelectLabel>Volume</SelectLabel>
                <SelectItem value="relativeVolume">RELATIVE VOLUME</SelectItem>
              </SelectGroup>
              <SelectGroup>
                <SelectLabel>Momentum</SelectLabel>
                <SelectItem value="breakoutIntensityScore">BIS</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="relative">
          <div className="text-sm text-foreground/60 pb-1">DIRECTION</div>
          <Select
            onValueChange={handleSortDirectionChange}
            value={persistedState.sortConfig.direction}
          >
            <SelectTrigger className="w-[80px]">
              <SelectValue className="text-xs" placeholder="DIR" />
            </SelectTrigger>
            <SelectContent className="text-sm">
              <SelectItem value="asc">ASC</SelectItem>
              <SelectItem value="desc">DESC</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {isLargeScreen ? (
          <>
            <FilterGroupSelector
              onApplyFilters={handleApplyFilters}
              appliedFilterGroup={persistedState.filterGroup}
            />
            <FilterGroupEditor
              onApplyFilters={handleApplyFilters}
              onClearFilters={clearFilters}
              ranges={initialData.ranges}
              countryCodes={countryCodes}
              filterGrp={persistedState.filterGroup}
            />


            <div className="pl-2">
              <Button
                onClick={() => updateState("isFiltersLibraryOpen", true)}
                className="flex items-center gap-2 h-[2.2rem] px-3"
              >
                <RiStackLine className="h-4 w-4" />
                <span className="text-sm">Library</span>
              </Button>
            </div>



            <div className="flex items-center space-x-2 pl-4 pb-2 sm:mt-0 pt-6">
              <div className="flex items-center space-x-4">
                <span
                  className={` ${state.displayAs === "charts"
                    ? "text-foreground"
                    : "text-foreground/50"
                    }`}
                >
                  CHARTS
                </span>
                <Switch
                  checked={state.displayAs === "table"}
                  onCheckedChange={handleDisplayAsToggle}
                  id="displayAs"
                  className="transform scale-125" // Scale up the switch
                />
                <span
                  className={` ${state.displayAs === "table"
                    ? "text-foreground "
                    : "text-foreground/50"
                    }`}
                >
                  TABLE
                </span>
              </div>
            </div>

            {state.displayAs === "table" && (
              <div className="pb-3">
                <TableColumnSelector
                  allColumns={allColumns}
                  selectedColumns={persistedState.selectedColumns}
                  onColumnChange={handleColumnChange}
                >
                  <GearIcon className=" h-5 w-5 text-foreground/50 cursor-pointer hover:text-foreground " />
                </TableColumnSelector>
              </div>
            )}
          </>
        ) : (
          <div>
            <div className="flex flex-wrap items-center space-x-4 pt-6">
              Mobile filter library
            </div>
          </div>
        )}

        <div className="flex flex-grow justify-end items-center space-x-4 mt-4 lg:mt-0 pt-6">
          {isFetching || isFetchingNextPage ? (
            <div className="flex items-center space-x-2">
              <PulsatingDots />
            </div>
          ) : (
            <div className="text-sm uppercase">
              {resultCountFromQueryResult &&
                `${resultCountFromQueryResult} Results`}
            </div>
          )}
          <div className="hidden lg:block">
            <ExportComponent getAllStocks={getAllStocks} />
          </div>
        </div>
      </div>
      <Dialog
        open={state.isFiltersLibraryOpen}
        onOpenChange={(isOpen) => updateState("isFiltersLibraryOpen", isOpen)}
      >
        <DialogContent className="w-[95%] max-w-[85vw] h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Screener Library</DialogTitle>
          </DialogHeader>
          <ScreenerLibrary
            onApplyFilter={(filters: FilterGroupDTO | undefined) => {
              handleApplyFilters(filters);
              updateState("isFiltersLibraryOpen", false);
            }}
          />
        </DialogContent>
      </Dialog>
      {renderContent()}
    </div>
  );
};

export default ScreenerResultsWrapper;

const convertToFilterGroup = (filters: FilterCriteria): FilterGroup => {
  return {
    operator: "AND",
    filters: [filters],
  };
};
