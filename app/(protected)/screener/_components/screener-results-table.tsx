"use client";
import {
  ScreenerRanges,
  ScreenerSortConfig,
  SymbolWithStatsWithRank,
} from "@/lib/types/screener-types";
import { Column, mobileColumns } from "./screener-table-columns";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  calculateColorFromPercentage,
  calculateColorFromPercentageInverted,
} from "@/lib/utils/table-utils";
import { Fira_Code } from "next/font/google";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Cross2Icon } from "@radix-ui/react-icons";

const firaCode = Fira_Code({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

export interface ScreenerResultsTableProps {
  stocks: SymbolWithStatsWithRank[];
  sortConfig: ScreenerSortConfig;
  ranges: ScreenerRanges;
  columns: Column[];
  theme: "light" | "dark";
}

const ScreenerResultsTable: React.FC<ScreenerResultsTableProps> = ({
  stocks,
  sortConfig,
  ranges,
  columns,
  theme,
}) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [selectedStock, setSelectedStock] =
    useState<SymbolWithStatsWithRank | null>(null);
  const isMobile = useIsMobile();
  const getHeaderClass = (key: string) => {
    if (!sortConfig) return "";
    return sortConfig.key === key
      ? `${sortConfig.direction === "asc" ? "↑" : "↓"} `
      : "";
  };

  const openPopover = (stock: SymbolWithStatsWithRank) => {
    setSelectedStock(stock);
    setIsPopoverOpen(true);
  };

  const closePopover = () => {
    setIsPopoverOpen(false);
    setSelectedStock(null);
  };

  const columnsToUse = isMobile ? mobileColumns : columns;

  return (
    <div className="w-full pt-8 px-4 lg:px-0">
      <div className="relative overflow-x-auto overflow-y-auto ">
        <table className="w-full">
          <thead className="sticky top-0 z-50 ">
            <tr
              className="text-sm "
              style={{ boxShadow: "0 0px 0.5px 1px gray" }}
            >
              {columnsToUse.map((column) => (
                <th
                  key={column.key}
                  className={`py-1 px-2 ${column.key === sortConfig.key ? "bg-accent" : ""
                    }`}
                  style={{
                    minWidth: column.minWidth, // Apply minWidth
                    maxWidth: column.maxWidth, // Apply maxWidth
                  }}
                >
                  <div
                    className={`pl-1 flex w-full items-center whitespace-nowrap py-2 ${column.alignment === "left"
                      ? "justify-start"
                      : column.alignment === "right"
                        ? "justify-end"
                        : "justify-center"
                      }`}
                  >
                    <span className={`text-${column.alignment}`}>
                      {column.label} {getHeaderClass(column.key)}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {stocks.map((item) => (
              <tr
                className={`text-sm border-b border-foreground/20 hover:bg-foreground/5 cursor-pointer `}
                key={item.profile.symbol}
                onClick={() => openPopover(item)}
              >
                {columnsToUse.map((column) => {
                  let value;
                  let style = {};
                  let customContent;

                  switch (column.key) {
                    case "rsRank":
                      value = item.rsRank;
                      style = {
                        background: calculateColorFromPercentageInverted(
                          item.rsRank,
                          ranges.rsRankRange[0],
                          ranges.rsRankRange[1] / 2,
                          ranges.rsRankRange[1]
                        ),
                      };
                      break;
                    case "profile.symbol":
                      value = item.profile.symbol;
                      break;
                    case "profile.companyName":
                      value = item.profile.companyName;
                      break;
                    case "sector":
                      value = item.profile.sector;
                      break;
                    case "industry":
                      value = item.profile.industry;
                      break;
                    case "quote.price":
                      value = item.quote.price.toFixed(2);
                      break;
                    case "oneDayReturnPercent":
                      value = `${item.oneDayReturnPercent.toFixed(2)}%`;
                      style = {
                        background: calculateColorFromPercentage(
                          item.oneDayReturnPercent,
                          theme,
                          -4,
                          0,
                          4
                        ),
                      };
                      break;
                    case "oneWeekReturnPercent":
                      value = `${item.oneWeekReturnPercent.toFixed(2)}%`;
                      style = {
                        background: calculateColorFromPercentage(
                          item.oneWeekReturnPercent,
                          theme,
                          -10,
                          0,
                          10
                        ),
                      };
                      break;
                    case "oneMonthReturnPercent":
                      value = `${item.oneMonthReturnPercent.toFixed(2)}%`;
                      style = {
                        background: calculateColorFromPercentage(
                          item.oneMonthReturnPercent,
                          theme,
                          -10,
                          0,
                          10
                        ),
                      };
                      break;
                    case "threeMonthReturnPercent":
                      value = `${item.threeMonthReturnPercent.toFixed(2)}%`;
                      style = {
                        background: calculateColorFromPercentage(
                          item.threeMonthReturnPercent,
                          theme,
                          -15,
                          0,
                          15
                        ),
                      };
                      break;
                    case "sixMonthReturnPercent":
                      value = `${item.sixMonthReturnPercent.toFixed(2)}%`;
                      style = {
                        background: calculateColorFromPercentage(
                          item.sixMonthReturnPercent,
                          theme,
                          -20,
                          0,
                          20
                        ),
                      };
                      break;

                    case "oneMonthRS":
                      value = `${item.relativeStrength.relativeStrengthStats.oneMonth.toFixed(
                        2
                      )}%`;
                      style = {
                        background: calculateColorFromPercentage(
                          item.relativeStrength.relativeStrengthStats.oneMonth,
                          theme,
                          0,
                          50,
                          100
                        ),
                      };
                      break;
                    case "threeMonthRS":
                      value = `${item.relativeStrength.relativeStrengthStats.threeMonth.toFixed(
                        2
                      )}%`;
                      style = {
                        background: calculateColorFromPercentage(
                          item.relativeStrength.relativeStrengthStats
                            .threeMonth,
                          theme,
                          0,
                          50,
                          100
                        ),
                      };
                      break;
                    case "sixMonthRS":
                      value = `${item.relativeStrength.relativeStrengthStats.sixMonth.toFixed(
                        2
                      )}%`;
                      style = {
                        background: calculateColorFromPercentage(
                          item.relativeStrength.relativeStrengthStats.sixMonth,
                          theme,
                          0,
                          50,
                          100
                        ),
                      };
                      break;
                    case "oneYearRS":
                      value = `${item.relativeStrength.relativeStrengthStats.oneYear.toFixed(
                        2
                      )}%`;
                      style = {
                        background: calculateColorFromPercentage(
                          item.relativeStrength.relativeStrengthStats.oneYear,
                          theme,
                          0,
                          50,
                          100
                        ),
                      };
                      break;

                    case "compositeRS":
                      value = `${item.relativeStrength.relativeStrengthStats.composite.toFixed(
                        2
                      )}%`;
                      style = {
                        background: calculateColorFromPercentage(
                          item.relativeStrength.relativeStrengthStats.composite,
                          theme,
                          0,
                          50,
                          100
                        ),
                      };
                      break;

                    case "percentFromFiftyTwoWeekLow":
                      value = `${item.percentFromFiftyTwoWeekLow.toFixed(2)}%`;
                      customContent = (
                        <div className="relative border-l border-foreground py-1">
                          <div
                            className="absolute left-0 top-0 bottom-0 bg-foreground/5 "
                            style={{
                              width: `${Math.max(
                                5,
                                Math.min(
                                  Math.log1p(
                                    Math.abs(item.percentFromFiftyTwoWeekLow)
                                  ) * 10,
                                  100
                                )
                              )}%`,
                            }}
                          ></div>
                          <span className="relative z-10">{value}</span>
                        </div>
                      );
                      break;
                    case "percentFromFiftyTwoWeekHigh":
                      value = `${item.percentFromFiftyTwoWeekHigh.toFixed(2)}%`;
                      customContent = (
                        <div className="relative border-r border-foreground py-1">
                          <div
                            className="absolute right-0 top-0 bottom-0 bg-foreground/5"
                            style={{
                              width: `${Math.max(
                                5,
                                Math.min(
                                  Math.log1p(
                                    Math.abs(item.percentFromFiftyTwoWeekHigh)
                                  ) * 10,
                                  100
                                )
                              )}%`,
                            }}
                          ></div>
                          <span className="relative z-10 pr-2">{value}</span>
                        </div>
                      );
                      break;
                    case "nextEarnings":
                      value = `${item.quote.earningsAnnouncement
                        ? formatEarnings(item.quote.earningsAnnouncement)
                        : ""
                        }`;
                      break;

                    case "relativeVolume":
                      value = `${item.relativeVolume.toFixed(2)}`;
                      break;

                    case "breakoutIntensityScore":
                      value = `${item.breakoutIntensityScore.toFixed(2)}`;
                      style = {
                        background: calculateColorFromPercentage(
                          item.breakoutIntensityScore,
                          theme,
                          0,
                          1,
                          10
                        ),
                      };
                      break;
                    // Add other cases as needed
                    default:
                      value = "";
                  }

                  const isName = column.key === "profile.companyName";

                  const nonNumberic =
                    column.key === "profile.companyName" ||
                    column.key === "sector" ||
                    column.key === "industry" ||
                    column.key === "profile.symbol";

                  const fontClassName = !nonNumberic ? firaCode.className : "";

                  return (
                    <td
                      key={column.key}
                      className={`${fontClassName} py-2 text-${column.alignment
                        } px-2 ${isName ? "font-semibold" : ""}`} // Apply alignment from Column
                      style={{
                        ...style,
                        minWidth: column.minWidth, // Apply minWidth
                        maxWidth: column.maxWidth, // Apply maxWidth
                      }}
                    >
                      {customContent || value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selectedStock && (
        <CenteredPopoverContent
          isOpen={isPopoverOpen}
          onClose={closePopover}
        // selectedStock={selectedStock.profile.symbol}
        >
          <div className="px-6 pt-2">{selectedStock.quote.symbol}</div>
        </CenteredPopoverContent>
      )}
    </div>
  );
};

const CenteredPopoverContent: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-background rounded-none lg:rounded-lg shadow-lg w-full h-full sm:w-[66vw] sm:h-[52rem] flex flex-col">
        <div className="flex justify-between items-start p-4 sm:p-2 border-b">
          <div className="relative flex-grow mr-2"></div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Cross2Icon className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-1 sm:p-3 flex-grow overflow-auto">{children}</div>
      </div>
    </div>,
    document.body
  );
};

export default ScreenerResultsTable;

const formatEarnings = (dateTimeString: string) => {
  const date = new Date(dateTimeString);
  const now = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const day = String(date.getDate()).padStart(2, "0");

  // Calculate the difference in days
  const diffTime = Math.abs(date.getTime() - now.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return `${month}/${day}/${year} (${diffDays})`;
};
