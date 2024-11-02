"use client";
import { useState, useRef, useEffect } from "react";
import { useQuery } from "react-query";
import { Input } from "@/components/ui/input";
import { ArrowRight, Search } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch"; // Import Switch component
import { Label } from "@/components/ui/label";
import { useDebounce } from "@/hooks/useDebounce";
import { useKeyPress } from "@/hooks/useKeyPress";
import { useRouter } from "next/navigation";
import { basicSearch } from "@/app/search-actions";
import {
  StockSymbolSearchResult,
  EtfSymbolSearchResult,
  IndexSymbolResponse,
} from "@/lib/types/basic-types";

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

const SearchInput = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<Set<SearchResultType>>(
    new Set(["stock"])
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const debouncedSearch = useDebounce(searchTerm, 300);

  const { data: searchResults, isLoading } = useQuery(
    ["search", debouncedSearch],
    () => basicSearch(debouncedSearch),
    { enabled: debouncedSearch.length > 0, staleTime: 1000 * 60 * 5 }
  );

  const [currentIndex, setCurrentIndex] = useState(-1);
  const filteredResults = formatAndFilterSearchResults(
    searchResults,
    selectedFilters
  );

  const handleNavigation = (symbol: string) => {
    setSearchTerm(""); // Clear input
    setIsOpen(false); // Close popover
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
    setIsOpen(false);
  });

  const toggleFilter = (type: SearchResultType) => {
    setSelectedFilters((prev) => {
      const newFilters = new Set(prev);
      if (newFilters.has(type) && newFilters.size > 1) {
        newFilters.delete(type);
      } else {
        newFilters.add(type);
      }
      return newFilters;
    });
    setCurrentIndex(-1);
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

  // Enhanced focus management
  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Store the current cursor position
      const cursorPosition = inputRef.current.selectionStart;

      // Use requestAnimationFrame to ensure focus happens after React updates
      requestAnimationFrame(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          // Restore the cursor position
          inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
        }
      });
    }
  }, [isOpen, searchResults, isLoading]); // Added isLoading as a dependency

  return (
    <div className="w-full space-y-2">
      <Popover open={isOpen && searchTerm.length > 0} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className="relative w-full">
            <Input
              ref={inputRef}
              className="peer w-full pl-9 pr-9"
              placeholder="Search..."
              type="search"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsOpen(e.target.value.length > 0);
                setCurrentIndex(-1);
              }}
            />
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 text-muted-foreground/80 peer-disabled:opacity-50">
              <Search size={16} strokeWidth={2} aria-hidden="true" />
            </div>
            <button
              className="absolute inset-y-px right-px flex h-full w-9 items-center justify-center rounded-r-lg text-muted-foreground/80 ring-offset-background transition-shadow hover:text-foreground"
              aria-label="Submit search"
              type="submit"
            >
              <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
            </button>
          </div>
        </PopoverTrigger>
        {searchTerm && (
          <PopoverContent
            className="p-4"
            align="center"
            style={{
              width: "60vw",
              maxWidth: "60vw",
            }}
          >
            <div className="px-4 py-2 border-b">
              <div className="flex gap-4">
                {filterOptions.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <Switch
                      id={option.id}
                      checked={selectedFilters.has(option.id)}
                      onCheckedChange={() => toggleFilter(option.id)}
                      className="peer"
                    />
                    <Label htmlFor={option.id} className="text-sm font-medium">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-sm text-muted-foreground">
                  Loading...
                </div>
              ) : filteredResults.length === 0 && searchTerm ? (
                <div className="p-4 text-sm text-muted-foreground">
                  No results found
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-accent">
                      <th className="py-2 px-3 text-left font-medium">
                        Symbol
                      </th>
                      <th className="py-2 px-2 text-left font-medium">Name</th>
                      <th className="py-2 px-2 text-left font-medium">
                        Sector
                      </th>
                      <th className="py-2 px-2 text-left font-medium">
                        Industry
                      </th>
                      <th className="py-2 px-2 text-right font-medium">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredResults.map((result, index) => (
                      <tr
                        key={`${result.type}-${result.symbol}`}
                        className={`cursor-pointer border-b border-border/50 transition-colors ${
                          index === currentIndex
                            ? "bg-accent"
                            : "hover:bg-accent/50"
                        }`}
                        onClick={() => handleNavigation(result.symbol)}
                      >
                        <td className="py-2 px-3 font-medium">
                          {result.symbol}
                        </td>
                        <td className="py-2 px-2 truncate">{result.name}</td>
                        <td className="py-2 px-2">
                          {result.type === "stock" ? result.sector : ""}
                        </td>
                        <td className="py-2 px-2">
                          {result.type === "stock" ? result.industry : ""}
                        </td>
                        <td className="py-2 px-2 text-right text-muted-foreground">
                          {result.type.toUpperCase()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </PopoverContent>
        )}
      </Popover>
    </div>
  );
};

export default SearchInput;
