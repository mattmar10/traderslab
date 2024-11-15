"use client";
import { useTheme } from "next-themes";

import { isFMPDataLoadingError } from "@/lib/types/fmp-types";
import { CardHeader, Card, CardContent, CardTitle } from "@/components/ui/card";
import { Fira_Code } from "next/font/google";

import {
  CurrentDayMarketBreadthSnapshotPoint,
  CurrentDayMarketBreadthSnapshotSchema,
} from "@/lib/types/market-breadth-types";

import { calculateColorFromPercentage } from "./utils";
import { useQuery } from "@tanstack/react-query";
import Loading from "@/components/loading";
import SectorPopoverContainer from "../popover/sector-popover-container";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const firaCode = Fira_Code({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

interface AdvanceDeclineRow {
  advances: number;
  declines: number;
  net: number;
  netRatio: number;
}

interface HighLowRow {
  highs: number;
  lows: number;
  net: number;
  netRatio: number;
}

const getAdvanceDeclineRow = (
  snapshot: CurrentDayMarketBreadthSnapshotPoint
) => {
  const adl = snapshot.advanceDecline;

  const row: AdvanceDeclineRow = {
    advances: adl.advances,
    declines: adl.declines,
    net: adl.advances - adl.declines,
    netRatio: Number(
      (
        ((adl.advances - adl.declines) /
          Math.max(1, adl.advances + adl.declines)) *
        100
      ).toFixed(2)
    ),
  };

  return row;
};

const getHighLowRow = (
  snapshot: CurrentDayMarketBreadthSnapshotPoint,
  totalStockCount: number
) => {
  const hl = snapshot.fiftyTwoWeekHighsLows;
  const highs = hl?.fiftyTwoWeekHighs || 0;
  const lows = hl?.fiftyTwoWeekLows || 0;

  const row: HighLowRow = {
    highs,
    lows,
    net: highs - lows,
    netRatio: Number((((highs - lows) / totalStockCount) * 100).toFixed(2)),
  };

  return row;
};

const sectorsNameMap: Map<string, string> = new Map([
  ["utilities", "UTILITIES"],
  ["consumer-defensive", "CONS. DEFENSIVE"],
  ["real-estate", "REAL ESTATE"],
  ["industrials", "INDUSTRIALS"],
  ["basic-materials", "BASIC MATERIALS"],
  ["healthcare", "HEALTHCARE"],
  ["consumer-cyclical", "CONS. CYCLICAL"],
  ["technology", "TECHNOLOGY"],
  ["financial-services", "FINANCIAL SVCS."],
  ["energy", "ENERGY"],
  ["communication-services", "COMMUNICATION SVCS."],
]);

const sectorsTickerMap: Map<string, string> = new Map([
  ["utilities", "RSPU"],
  ["consumer-defensive", "RSPS"],
  ["real-estate", "RSPR"],
  ["industrials", "RSPN"],
  ["basic-materials", "RSPM"],
  ["healthcare", "RSPH"],
  ["consumer-cyclical", "RSPD"],
  ["technology", "RSPT"],
  ["financial-services", "RSPF"],
  ["energy", "RSPG"],
  ["communication-services", "RSPC"],
]);

const getTableRow = (
  name: string,
  url: string,
  currentTheme: "dark" | "light",
  borderBottom: string,
  overview: CurrentDayMarketBreadthSnapshotPoint
) => {
  const aDRow = getAdvanceDeclineRow(overview);
  const highLowRow = getHighLowRow(overview, overview.totalStockCount);

  const advanceDeclineBackground = calculateColorFromPercentage(
    aDRow.netRatio || 0,
    currentTheme,
    -100,
    0,
    100
  );

  const highLowBackground = calculateColorFromPercentage(
    highLowRow.netRatio || 0,
    currentTheme,
    -10,
    0,
    10
  );

  const fiveSMABackground = calculateColorFromPercentage(
    overview?.percentAboveFiveSMA || 0,
    currentTheme,
    0,
    50,
    100
  );

  const tenEMABackground = calculateColorFromPercentage(
    overview?.percentAboveTenEMA || 0,
    currentTheme,
    0,
    50,
    100
  );

  const twentyOneEMABackground = calculateColorFromPercentage(
    overview?.percentAboveTwentyOneEMA || 0,
    currentTheme,
    0,
    50,
    100
  );

  const fiftySMABackground = calculateColorFromPercentage(
    overview?.percentAboveFiftySMA || 0,
    currentTheme,
    0,
    50,
    100
  );
  const twoHundredSMABackground = calculateColorFromPercentage(
    overview?.percentAboveTwoHundredSMA || 0,
    currentTheme,
    0,
    50,
    100
  );

  const gdbPercentBackground = calculateColorFromPercentage(
    overview?.globalDailyBreadthPercentileRank || 0,
    currentTheme,
    -100,
    0,
    100
  );

  return (
    <tr
      className={`${firaCode.className} border-b ${borderBottom} text-sm`}
      key={`universe-breadth-snap-${name}`}
    >
      <td className="border-r border-foreground/70 py-1.5 pr-2 text-left text-foreground/70">
        <div className="flex justify-between">
          <div>{name}</div>
        </div>
      </td>
      <td
        className="px-2 text-right"
        style={{
          background: advanceDeclineBackground,
        }}
      >
        {aDRow.advances}
      </td>
      <td
        className="px-2 text-right"
        style={{
          background: advanceDeclineBackground,
        }}
      >
        {aDRow.declines}
      </td>
      <td
        className="px-2 text-right"
        style={{
          background: advanceDeclineBackground,
        }}
      >
        {aDRow.net}
      </td>
      <td
        className="border-r border-foreground/70 px-2 text-right"
        style={{
          background: advanceDeclineBackground,
        }}
      >
        {aDRow.netRatio}%
      </td>
      <td
        className="px-2 text-right"
        style={{
          background: highLowBackground,
        }}
      >
        {highLowRow.highs}
      </td>
      <td
        className="px-2 text-right"
        style={{
          background: highLowBackground,
        }}
      >
        {highLowRow.lows}
      </td>
      <td
        className="px-2 text-right"
        style={{
          background: highLowBackground,
        }}
      >
        {highLowRow.net}
      </td>
      <td
        className="border-r border-foreground/70 px-2 text-right"
        style={{
          background: highLowBackground,
        }}
      >
        {highLowRow.netRatio}%
      </td>

      <td
        className="px-2 text-right "
        style={{
          background: fiveSMABackground,
        }}
      >
        {overview.percentAboveFiveSMA}%
      </td>
      <td
        className="px-2 text-right "
        style={{
          background: tenEMABackground,
        }}
      >
        {overview.percentAboveTenEMA}%
      </td>
      <td
        className="px-2 text-right "
        style={{
          background: twentyOneEMABackground,
        }}
      >
        {overview.percentAboveTwentyOneEMA}%
      </td>
      <td
        className="px-2 text-right "
        style={{
          background: fiftySMABackground,
        }}
      >
        {overview.percentAboveFiftySMA}%
      </td>
      <td
        className=" px-2 text-right border-r border-foreground/70"
        style={{
          background: twoHundredSMABackground,
        }}
      >
        {overview.percentAboveTwoHundredSMA}%
      </td>
      <td
        className=" px-2 text-right"
        style={{
          background: gdbPercentBackground,
        }}
      >
        {overview.globalDailyBreadthPercentileRank.toFixed(2)}
      </td>
    </tr>
  );
};

const MarketBreadthSnapshotTable: React.FC = () => {
  const { theme } = useTheme();

  const snapshotKey = `/api/breadth-snapshot`;

  const { data, error, status } = useQuery({
    queryKey: ["breadthSnapshot"],
    queryFn: async () => {
      const response = await fetch(snapshotKey);
      const data = await response.json();
      const parsed = CurrentDayMarketBreadthSnapshotSchema.safeParse(data);
      if (!parsed.success) {
        throw new Error("Unable to fetch breadth snapshot");
      }
      return parsed.data;
    },
    refetchInterval: 30000,
    staleTime: 10000,
    retry: 1,
  });

  if (status === "pending" || !data || isFMPDataLoadingError(data)) {
    if (error) {
      console.error(error);
    }

    return (
      <Card>
        <CardHeader className="pt-3 pb-4 px-5">
          <CardTitle className={`text-lg`}>
            Daily Market Breadth Snapshot
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[39.5rem]">
          <Loading />
        </CardContent>
      </Card>
    );
  }

  const currentTheme = theme === "light" ? "light" : "dark";

  const sortedSectors = [
    ...data.sectorsOverviews.sort((a, b) => {
      if (a.sector < b.sector) return -1;
      if (a.sector > b.sector) return 1;
      return 0;
    }),
  ];

  return (
    <Card>
      <CardHeader className="pt-3 pb-4 px-5">
        <CardTitle className="text-lg">
          <div className="flex justify-between items-center">
            <div>Daily Market Breadth Snapshot</div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex overflow-x-auto  h-[37.8rem]">
          <table className="w-full table-auto text-sm">
            <thead>
              <tr
                className="border-b border-foreground/70"
                key={"market-breadth-snapshot-head"}
              >
                <th className=" border-r border-foreground/70 px-2 py-2"></th>
                <th
                  colSpan={4}
                  className="border-r border-foreground/70 px-2 py-2 text-left"
                >
                  ADVANCES/DECLINES
                </th>
                <th
                  colSpan={4}
                  className=" border-r border-foreground/70 px-2 py-2 text-left"
                >
                  NEW 52 WEEK HIGHS/LOWS
                </th>

                <th
                  colSpan={5}
                  className="px-2 py-2 text-left border-r border-foreground/70"
                >
                  % ABOVE KMA
                </th>
                <th colSpan={1} className="px-2 py-2 text-left">
                  GDB RANK
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                className="border-b text-foreground/70"
                key={"market-breadth-snapshot-sub-head"}
              >
                <td className="border-r border-foreground/70 py-2 text-left"></td>
                <td className="px-2 py-2 text-right">ADV</td>
                <td className="px-2 py-1 text-right">DECL</td>
                <td className="px-2 py-1 text-right">NET</td>
                <td className="border-r border-foreground/70 px-2 py-1 text-right">
                  NET RATIO
                </td>
                <td className="px-2 py-1 text-right">HIGHS</td>
                <td className="px-2 py-1 text-right">LOWS</td>
                <td className="px-2 py-1 text-right">NET</td>
                <td className="border-r border-foreground/70 px-2 py-1 text-right">
                  NET RATIO
                </td>
                <td className=" px-2 py-1 text-right">5SMA</td>
                <td className=" px-2 py-1 text-right">10EMA</td>
                <td className=" px-2 py-1 text-right">21EMA</td>
                <td className=" px-2 py-1 text-right">50SMA</td>
                <td className="px-2 py-1 text-right border-r border-foreground/70">
                  200SMA
                </td>
                <td className="px-2 py-1 text-right">GDB</td>
              </tr>
              {getTableRow(
                "Russell 2000",
                "",
                currentTheme,
                "border-foreground/20",
                data.iwmTradingOverview
              )}
              {getTableRow(
                "NDX 100",
                "",
                currentTheme,
                "border-foreground/20",
                data.qqqETradingOverview
              )}

              {getTableRow(
                "S&P 500",
                "prime-trading",
                currentTheme,
                "border-foreground/20",
                data.rspTradingOverview
              )}
              {getTableRow(
                "NYSE COMPOSITE",
                "exchange/nyse",
                currentTheme,
                "border-foreground/60",
                data.nyseOverview
              )}

              {sortedSectors.map((so) => {
                const row = getTableRow(
                  sectorsNameMap.get(so.sector) || "UNKNOWN",
                  `sector/${so.sector}`,
                  currentTheme,
                  "border-foreground/20 hover:cursor-pointer hover:bg-foreground/5",
                  so.overview
                );

                return (
                  <Popover key={so.sector}>
                    <PopoverTrigger asChild>{row}</PopoverTrigger>
                    <PopoverContent
                      side="bottom"
                      className="w-[60rem]  border border-foreground/70"
                      sideOffset={15}
                      style={{ zIndex: 1000, outline: "none" }}
                    >
                      <SectorPopoverContainer
                        etfSymbol={sectorsTickerMap.get(so.sector)!}
                        name={sectorsNameMap.get(so.sector)!}
                      />
                    </PopoverContent>
                  </Popover>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketBreadthSnapshotTable;
