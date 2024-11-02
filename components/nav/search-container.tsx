"use client";

import { Popover } from "../ui/popover";
import { PopoverTrigger } from "@radix-ui/react-popover";
import { Cross2Icon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { Button } from "../ui/button";
import { createPortal } from "react-dom";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { useDebounce } from "@/hooks/useDebounce";
import { useKeyPress } from "@/hooks/useKeyPress";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  EtfSymbolSearchResult,
  IndexSymbolResponse,
  StockSymbolSearchResult,
} from "@/lib/types/basic-types";
import { useCallback, useRef, useState } from "react";
import { useQuery } from "react-query";
import { basicSearch } from "@/app/search-actions";

type SearchResultType = "stock" | "etf" | "index";

type SearchResult = {
  symbol: string;
  name: string;
  sector?: string;
  industry?: string;
  type: SearchResultType;
};

interface FilterOption {
  id: SearchResultType;
  label: string;
}

const filterOptions: FilterOption[] = [
  { id: "stock", label: "Stocks" },
  { id: "etf", label: "ETFs" },
  { id: "index", label: "Indexes" },
];

const SearchContainer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<Set<SearchResultType>>(
    new Set(["stock"])
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const debouncedSearch = useDebounce(searchTerm, 300);

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ["search", debouncedSearch],
    queryFn: () => basicSearch(debouncedSearch),
    enabled: debouncedSearch.length > 0,
    staleTime: 1000 * 60 * 5, // Cache results for 5 minutes
  });

  const [currentIndex, setCurrentIndex] = useState(-1);
  const filteredResults = formatAndFilterSearchResults(
    searchResults,
    selectedFilters
  );

  const handleNavigation = (symbol: string) => {
    setIsOpen(false);
    router.push(`/symbol/${symbol}`);
  };

  useKeyPress("ArrowDown", () => {
    setCurrentIndex((prev) =>
      prev < filteredResults.length - 1 ? prev + 1 : prev
    );
  });

  useKeyPress("ArrowUp", () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  });

  useKeyPress("Enter", () => {
    if (currentIndex >= 0 && filteredResults[currentIndex]) {
      handleNavigation(filteredResults[currentIndex].symbol);
    }
  });

  useKeyPress("Escape", () => {
    handleClose();
  });

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setSearchTerm("");
    setCurrentIndex(-1);
  }, []);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  }, []);

  const toggleFilter = (type: SearchResultType) => {
    setSelectedFilters((prev) => {
      const newFilters = new Set(prev);
      if (newFilters.has(type)) {
        if (newFilters.size > 1) {
          // Prevent removing last filter
          newFilters.delete(type);
        }
      } else {
        newFilters.add(type);
      }
      return newFilters;
    });
    setCurrentIndex(-1); // Reset selection when filters change
  };

  function formatAndFilterSearchResults(
    data: any,
    filters: Set<SearchResultType>
  ): SearchResult[] {
    if (!data) return [];

    const results: SearchResult[] = [];

    if (filters.has("stock") && data.stocks) {
      results.push(
        ...data.stocks.map((s: StockSymbolSearchResult) => ({
          ...s,
          type: "stock" as const,
        }))
      );
    }

    if (filters.has("etf") && data.etfs) {
      results.push(
        ...data.etfs.map((e: EtfSymbolSearchResult) => ({
          ...e,
          type: "etf" as const,
        }))
      );
    }

    if (filters.has("index") && data.indexes) {
      results.push(
        ...data.indexes.map((i: IndexSymbolResponse) => ({
          ...i,
          type: "index" as const,
        }))
      );
    }

    return results;
  }

  return (
    <Popover
      open={isOpen}
      onOpenChange={(open) => (open ? handleOpen() : handleClose())}
    >
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size={"icon"}
          className="relative hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Search symbols"
        >
          <MagnifyingGlassIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100  shrink-0" />
        </Button>
      </PopoverTrigger>

      {isOpen &&
        createPortal(
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background rounded-lg shadow-lg w-[66vw] max-w-6xl h-[52rem] flex flex-col">
              <SearchHeader
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                inputRef={inputRef}
                onClose={handleClose}
              />

              <div className="px-4 py-4 border-b">
                <div className="flex gap-6">
                  {filterOptions.map((option) => (
                    <div
                      key={option.id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={option.id}
                        checked={selectedFilters.has(option.id)}
                        onCheckedChange={() => toggleFilter(option.id)}
                        disabled={
                          selectedFilters.has(option.id) &&
                          selectedFilters.size === 1
                        }
                      />
                      <Label
                        htmlFor={option.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className=" flex-grow overflow-auto">
                <SearchResults
                  results={filteredResults}
                  isLoading={isLoading}
                  currentIndex={currentIndex}
                  onSelect={handleNavigation}
                />
              </div>
            </div>
          </div>,
          document.body
        )}
    </Popover>
  );
};

const SearchHeader = ({
  searchTerm,
  setSearchTerm,
  inputRef,
  onClose,
}: {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  inputRef: React.RefObject<HTMLInputElement>;
  onClose: () => void;
}) => (
  <div className="flex justify-between items-start p-2 border-b">
    <div className="relative flex-grow mr-2">
      <MagnifyingGlassIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 text-foreground/40 h-6 w-6" />
      <Input
        ref={inputRef}
        type="text"
        placeholder="Search for symbols"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-10 pr-4 py-2 w-full bg-transparent border-none focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground shadow-none text-base"
      />
    </div>
    <Button variant="ghost" size="icon" onClick={onClose}>
      <Cross2Icon className="h-4 w-4" />
    </Button>
  </div>
);

const SearchResults = ({
  results,
  isLoading,
  currentIndex,
  onSelect,
}: {
  results: SearchResult[];
  isLoading: boolean;
  currentIndex: number;
  onSelect: (symbol: string) => void;
}) => {
  if (isLoading) {
    return <div className="flex justify-center p-4">Loading...</div>;
  }

  if (results.length === 0 && !isLoading) {
    return (
      <div className="flex justify-center p-4 text-muted-foreground/70">
        No results found. Try adjusting your search.
      </div>
    );
  }

  return (
    <div className="relative overflow-x-auto">
      <table className="w-full text-sm ">
        <thead className="">
          <tr className="border-b border-border bg-accent ">
            <th scope="col" className="py-3 px-3 text-left font-medium w-[10%]">
              Symbol
            </th>
            <th scope="col" className="py-3 px-2 text-left font-medium w-[30%]">
              Name
            </th>
            <th scope="col" className="py-3 px-2 text-left font-medium w-[20%]">
              Sector
            </th>
            <th scope="col" className="py-3 px-2 text-left font-medium w-[30%]">
              Industry
            </th>
            <th
              scope="col"
              className="py-3 px-3 text-right font-medium w-[10%]"
            >
              Type
            </th>
          </tr>
        </thead>
        <tbody>
          {results.map((result, index) => (
            <tr
              key={`${result.type}-${result.symbol}`}
              className={`group border-b border-border/50 transition-colors ${
                index === currentIndex
                  ? "bg-foreground/10"
                  : "hover:bg-foreground/5"
              }`}
            >
              <td className="py-3 px-3 font-medium">
                <Link
                  href={`/symbol/${result.symbol}`}
                  className="block w-full"
                  onClick={(e) => {
                    e.preventDefault();
                    onSelect(result.symbol);
                  }}
                  aria-label={`View details for ${result.symbol} - ${result.name}`}
                >
                  {result.symbol}
                </Link>
              </td>
              <td className="py-3 px-2 truncate">
                <Link
                  href={`/symbol/${result.symbol}`}
                  className="block w-full"
                  onClick={(e) => {
                    e.preventDefault();
                    onSelect(result.symbol);
                  }}
                >
                  {result.name}
                </Link>
              </td>
              <td className="py-3 px-2">
                <Link
                  href={`/symbol/${result.symbol}`}
                  className="block w-full"
                  onClick={(e) => {
                    e.preventDefault();
                    onSelect(result.symbol);
                  }}
                >
                  {result.type === "stock"
                    ? result.sector?.replace("Consumer", "Cons.")
                    : ""}
                </Link>
              </td>
              <td className="py-3 px-2">
                <Link
                  href={`/symbol/${result.symbol}`}
                  className="block w-full"
                  onClick={(e) => {
                    e.preventDefault();
                    onSelect(result.symbol);
                  }}
                >
                  {result.type === "stock" ? result.industry : ""}
                </Link>
              </td>
              <td className="py-3 px-3 text-right text-muted-foreground">
                <Link
                  href={`/symbol/${result.symbol}`}
                  className="block w-full"
                  onClick={(e) => {
                    e.preventDefault();
                    onSelect(result.symbol);
                  }}
                >
                  {result.type.toUpperCase()}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default SearchContainer;
