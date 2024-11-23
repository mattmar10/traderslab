"use client";
import React, { useState, useMemo } from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { Fira_Code } from "next/font/google";
import {
  EtfMarketData,
  RankedEtfMarketData,
} from "@/lib/types/submarkets-sectors-themes-types";
import {
  calculateColorFromPercentage,
  calculateColorFromPercentageInverted,
} from "@/lib/utils/table-utils";

export type SortableKeys =
  | "rank"
  | "percentDailyChange"
  | "percentWeeklyChange"
  | "percentMonthlyChange"
  | "percentThreeMonthChange"
  | "percentSixMonthChange"
  | "percentFromFiftyTwoWeekLow"
  | "percentFromFiftyTwoWeekHigh"
  | "ptScore";

const firaCode = Fira_Code({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

interface LinkedTableRowProps
  extends React.TableHTMLAttributes<HTMLTableRowElement> {
  href: string;
  children: React.ReactNode;
}

const LinkedTableRow: React.FC<LinkedTableRowProps> = ({
  href,
  children,
  ...props
}) => {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(href);
  };

  return (
    <tr onClick={handleClick} style={{ cursor: "pointer" }} {...props}>
      {children}
    </tr>
  );
};

export interface MarketRankGroupAggregateTableProps {
  data: EtfMarketData[];
}

export const MarketRankGroupAggregateTable: React.FC<
  MarketRankGroupAggregateTableProps
> = ({ data }) => {
  const { theme } = useTheme();
  const themeColor = theme === "light" ? "light" : "dark";

  const [sortConfig, setSortConfig] = useState<{
    key: SortableKeys;
    direction: "asc" | "desc";
  }>({
    key: "rank",
    direction: "asc",
  });

  const requestSort = (key: SortableKeys) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === "asc"
          ? "desc"
          : "asc",
    }));
  };

  const sortedData = useMemo(() => {
    const ranked: RankedEtfMarketData[] = rankMarketData(data, true);

    if (sortConfig !== null) {
      return [...ranked].sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return ranked;
  }, [data, sortConfig.key, sortConfig.direction]);

  const getHeaderClass = (key: SortableKeys) => {
    if (!sortConfig || sortConfig.key !== key) return "";
    return sortConfig.direction === "asc" ? "↑" : "↓";
  };

  const getSortableHeaderClass = (key: SortableKeys) => {
    return sortConfig && sortConfig.key === key ? `bg-foreground/5` : "";
  };

  return (
    <div className="w-full text-sm ">
      <div className="">
        <div className="border-none">
          <div className="w-full flex justify-center overflow-x-auto  no-scrollbar">
            <table className="w-full table-fixed">
              <thead>
                <tr className="border-b border-foreground/70 ">
                  <th
                    className={`text-left px-1 py-2 w-[4rem] min-w-[4rem] ${getSortableHeaderClass(
                      "rank"
                    )} cursor-pointer`}
                    onClick={() => requestSort("rank")}
                  >
                    <div className="flex items-center justify-between">
                      <span className="mr-1">RANK</span>
                      <span>{getHeaderClass("rank")}</span>
                    </div>
                  </th>
                  <th className="text-left px-1 w-16 min-w-[4rem]">TICKER</th>
                  <th className="text-left px-1 w-48 min-w-[8rem]">NAME</th>
                  <th
                    className={`text-right px-1 w-24 min-w-[5rem] ${getSortableHeaderClass(
                      "percentDailyChange"
                    )} cursor-pointer`}
                    onClick={() => requestSort("percentDailyChange")}
                  >
                    <div className="flex justify-end items-center">
                      <span className="mr-1">DAY</span>
                      <span>{getHeaderClass("percentDailyChange")}</span>
                    </div>
                  </th>
                  <th
                    className={`text-right px-1 w-24 min-w-[5rem] ${getSortableHeaderClass(
                      "percentWeeklyChange"
                    )} cursor-pointer`}
                    onClick={() => requestSort("percentWeeklyChange")}
                  >
                    <div className="flex justify-end items-center">
                      <span className="mr-1">WEEK</span>
                      <span>{getHeaderClass("percentWeeklyChange")}</span>
                    </div>
                  </th>
                  <th
                    className={`text-right px-1 w-28 min-w-[6rem] ${getSortableHeaderClass(
                      "percentMonthlyChange"
                    )} cursor-pointer`}
                    onClick={() => requestSort("percentMonthlyChange")}
                  >
                    <div className="flex justify-end items-center">
                      <span className="mr-1">1M</span>
                      <span>{getHeaderClass("percentMonthlyChange")}</span>
                    </div>
                  </th>
                  <th
                    className={`text-right px-1 w-28 min-w-[6rem] ${getSortableHeaderClass(
                      "percentThreeMonthChange"
                    )} cursor-pointer`}
                    onClick={() => requestSort("percentThreeMonthChange")}
                  >
                    <div className="flex justify-end items-center">
                      <span className="mr-1">3M</span>
                      <span>{getHeaderClass("percentThreeMonthChange")}</span>
                    </div>
                  </th>
                  <th
                    className={`text-right px-1 w-28 min-w-[6rem] ${getSortableHeaderClass(
                      "percentSixMonthChange"
                    )} cursor-pointer`}
                    onClick={() => requestSort("percentSixMonthChange")}
                  >
                    <div className="flex justify-end items-center">
                      <span className="mr-1">6M</span>
                      <span>{getHeaderClass("percentSixMonthChange")}</span>
                    </div>
                  </th>
                  <th
                    className={`text-right px-1 w-44 min-w-[8rem] ${getSortableHeaderClass(
                      "percentFromFiftyTwoWeekLow"
                    )} cursor-pointer`}
                    onClick={() => requestSort("percentFromFiftyTwoWeekLow")}
                  >
                    <div className="flex justify-end items-center">
                      <span className="mr-1">% FROM 52 WK LOW</span>
                      <span>
                        {getHeaderClass("percentFromFiftyTwoWeekLow")}
                      </span>
                    </div>
                  </th>
                  <th
                    className={`text-right px-1 w-44 min-w-[8rem] ${getSortableHeaderClass(
                      "percentFromFiftyTwoWeekHigh"
                    )} cursor-pointer`}
                    onClick={() => requestSort("percentFromFiftyTwoWeekHigh")}
                  >
                    <div className="flex justify-end items-center">
                      <span className="mr-1">% FROM 52 WK HIGH</span>
                      <span>
                        {getHeaderClass("percentFromFiftyTwoWeekHigh")}
                      </span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedData.map((item) => {
                  const rankBg = calculateColorFromPercentageInverted(
                    item.rank,
                    1,
                    data.length / 2,
                    data.length
                  );

                  const dailyBG = calculateColorFromPercentage(
                    item.percentDailyChange,
                    themeColor,
                    -4,
                    0,
                    4
                  );

                  const weekChangeBG = calculateColorFromPercentage(
                    item.percentWeeklyChange,
                    themeColor,
                    -10,
                    0,
                    10
                  );

                  const monthChangeBG = calculateColorFromPercentage(
                    item.percentMonthlyChange,
                    themeColor,
                    -10,
                    0,
                    10
                  );

                  const threeMonthChangeBG = calculateColorFromPercentage(
                    item.percentThreeMonthChange,
                    themeColor,
                    -15,
                    0,
                    15
                  );

                  const sixMonthChangeBg = calculateColorFromPercentage(
                    item.percentSixMonthChange,
                    themeColor,
                    -20,
                    0,
                    20
                  );

                  return (
                    <LinkedTableRow
                      href={`/market-performance/${item.ticker}`}
                      className={` text-right border-b border-foreground/20 hover:bg-foreground/5`}
                      key={`${item.ticker}-theme`}
                    >
                      <td
                        className="text-center px-1 py-2"
                        style={{
                          background: rankBg,
                          width: "4rem",
                        }}
                      >
                        {item.rank}
                      </td>
                      <td className="text-left px-1 w-16">{item.ticker}</td>
                      <td className="px-1 text-left w-48 font-semibold truncate">
                        {item.name}
                      </td>
                      <td
                        className={`${firaCode.className} text-right px-1 w-24`}
                        style={{ background: dailyBG }}
                      >
                        {item.percentDailyChange.toFixed(2)}%
                      </td>
                      <td
                        className={`${firaCode.className} text-right px-2 w-24`}
                        style={{ background: weekChangeBG }}
                      >
                        {item.percentWeeklyChange.toFixed(2)}%
                      </td>
                      <td
                        className={`${firaCode.className} text-right px-2 border-r border-foreground/80 w-28`}
                        style={{ background: monthChangeBG }}
                      >
                        {item.percentMonthlyChange.toFixed(2)}%
                      </td>
                      <td
                        className={`${firaCode.className} text-right px-2 border-r border-foreground/80 w-28`}
                        style={{ background: threeMonthChangeBG }}
                      >
                        {item.percentThreeMonthChange.toFixed(2)}%
                      </td>

                      <td
                        className={`${firaCode.className} text-right px-2 border-r border-foreground/80 w-28`}
                        style={{ background: sixMonthChangeBg }}
                      >
                        {item.percentSixMonthChange.toFixed(2)}%
                      </td>
                      <td
                        className={`${firaCode.className} text-left px-2 relative border-r border-foreground/80 w-44`}
                      >
                        <div
                          className="absolute left-0 top-0 bottom-0 bg-foreground/5"
                          style={{
                            width: `${Math.max(
                              5,
                              Math.min(
                                Math.log1p(
                                  Math.abs(item.percentFromFiftyTwoWeekLow)
                                ) * 10, // Adjust scaling factor
                                100
                              )
                            )}%`,
                          }}
                        ></div>
                        <span className="relative z-10">
                          {item.percentFromFiftyTwoWeekLow.toFixed(2)}%
                        </span>
                      </td>
                      <td
                        className={`${firaCode.className} text-right px-2 relative w-44`}
                      >
                        <div
                          className="absolute right-0 top-0 bottom-0 bg-foreground/5"
                          style={{
                            width: `${Math.max(
                              5,
                              Math.min(
                                Math.log1p(
                                  Math.abs(item.percentFromFiftyTwoWeekHigh)
                                ) * 10, // Adjust scaling factor
                                100
                              )
                            )}%`,
                          }}
                        ></div>
                        <span className="relative z-10 pr-2">
                          {item.percentFromFiftyTwoWeekHigh.toFixed(2)}%
                        </span>
                      </td>
                    </LinkedTableRow>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketRankGroupAggregateTable;

export function calculateMarketScore(data: EtfMarketData): number {
  return (
    20 * data.percentFromFiftyTwoWeekHigh +
    2 * data.percentFromFiftyTwoWeekLow +
    5 * data.percentMonthlyChange +
    1 * data.percentWeeklyChange
  );
}

export function calculateMarketPTScore(data: EtfMarketData): number {
  return (
    20 * (data.percentFromFiftyTwoWeekHigh / data.oneMonthDailyADRP) +
    2 * (data.percentFromFiftyTwoWeekLow / data.oneMonthDailyADRP) +
    5 * (data.percentMonthlyChange / data.oneMonthDailyADRP) +
    1 * (data.percentWeeklyChange / data.oneMonthDailyADRP)
  );
}

export function rankMarketData(
  marketDataArray: EtfMarketData[],
  useAdjustedRank: boolean
): RankedEtfMarketData[] {
  const sortKey = useAdjustedRank ? "ptScore" : "score";

  const scoredData = marketDataArray.map((data) => ({
    ...data,
    score: calculateMarketScore(data),
    ptScore: calculateMarketPTScore(data),
  }));

  const sortedData = scoredData.sort((a, b) => b[sortKey] - a[sortKey]);

  let currentRank = 1;
  let previousScore = sortedData[0][sortKey];
  let skipCount = 0;

  const rankedData = sortedData.map((data, index) => {
    if (data[sortKey] < previousScore) {
      currentRank += skipCount + 1;
      skipCount = 0;
    } else if (index > 0) {
      skipCount++;
    }
    previousScore = data[sortKey];
    return { ...data, rank: currentRank };
  });

  return rankedData;
}
