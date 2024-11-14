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
import { useCallback, useEffect, useState } from "react";
import { Column, defaultColumns } from "./screener-table-columns";
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

      setPersistedState((prev) => ({
        sortConfig: data.sortConfig || defaultSortConfig,
        filterGroup: data.filterGroup,
        chartSettings: data.chartSettings || defaultChartSettings,
        selectedColumns: data.selectedColumns || defaultColumns,
      }));

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
    refetch,
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
              sortConfig={persistedState.sortConfig}
              ranges={initialData.ranges}
              columns={persistedState.selectedColumns}
              theme={resolvedTheme}
            />
          ) : (
            <div className="pt-4 grid grid-cols-1 lg:grid-cols-2 gap-4 lg:mt-4 px-2 lg:px-0">
              {stocks.map((item, index) => (
                <Card key={index}>
                  <CardContent className="pl-3 pr-5">
                    {item.profile.symbol}
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

  return <div> {renderContent()}</div>;
};

export default ScreenerResultsWrapper;

const convertToFilterGroup = (filters: FilterCriteria): FilterGroup => {
  return {
    operator: "AND",
    filters: [filters],
  };
};
