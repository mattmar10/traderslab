"use client";

import { Fira_Code } from "next/font/google";

import { useTheme } from "next-themes";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  GlobalDailyBreadthDataPointWithRank,
  MomentumRow,
  NewMarketBreadthOverview,
  STMomentumRow,
  UpAndDown,
} from "@/lib/types/market-breadth-types";
import {
  FMPDataLoadingError,
  isFMPDataLoadingError,
} from "@/lib/types/fmp-types";

import {
  AdvanceDeclineRow,
  GlobalDailyBreadthRow,
  GreaterThanSMARow,
  MarkBreadthRow,
  NewHighLowRow,
  UpDownVolumeRow,
} from "./market-breadth-table-types";
import ErrorCard from "@/components/error-card";
import { addPercentileRankToData, calculateColorFromPercentage } from "./utils";
import { Dataset, getTickerForDataset } from "@/lib/types/basic-types";
import { formatDateToEST } from "@/lib/utils/epoch-utils";
import MarketBreadthPopoverContainer from "../popover/market-breadth-popover-container";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const firaCode = Fira_Code({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});
export interface MarketBreadthTableProps {
  overview: NewMarketBreadthOverview | FMPDataLoadingError;
  dataset: Dataset;
  datasetDescription: string;
}

const MarketBreadthTable: React.FC<MarketBreadthTableProps> = ({
  overview,
  dataset,
  datasetDescription,
}: MarketBreadthTableProps) => {
  const { theme } = useTheme();

  const currentDate = new Date();
  const oneYearAgo = new Date(
    currentDate.getFullYear() - 1,
    currentDate.getMonth(),
    currentDate.getDate(),
    currentDate.getHours(),
    currentDate.getMinutes(),
    currentDate.getSeconds(),
    currentDate.getMilliseconds()
  );

  if (isFMPDataLoadingError(overview)) {
    return (
      <div>
        <ErrorCard errorMessage={"Unable to load Market Breadth"} />
      </div>
    );
  }
  const oneYearGDB = overview.globalDailyBreadthLine.filter(
    (gdb) => new Date(gdb.dateStr).getTime() >= oneYearAgo.getTime()
  );

  const dataWithRank: GlobalDailyBreadthDataPointWithRank[] =
    addPercentileRankToData(oneYearGDB);
  const advanceDecline = overview.advanceDeclineLine;
  const highsLows = overview.fiftyTwoWeekHighsLowsLine;
  const upDownVol = overview.upDownVolumeLine;

  const lastTenAdvanceDecline = advanceDecline
    .slice(-252)
    .map((ad) => {
      const row: AdvanceDeclineRow = {
        ...ad,
        net: ad.advances - ad.declines,
        netRatio: Number(
          (
            ((ad.advances - ad.declines) / (ad.advances + ad.declines)) *
            100
          ).toFixed(2)
        ),
      };
      return row;
    })
    .reverse();

  const marketBreadthRows = lastTenAdvanceDecline.map((ad) => {
    const hl = highsLows.find((hl) => hl.dateStr === ad.dateStr);
    const upD = upDownVol.find((u) => u.dateStr === ad.dateStr);
    const greaterThanFiveSMA = overview.percentAboveFiveSMA.find(
      (p) => p.dateStr === ad.dateStr
    );
    const greaterThanTen = overview.percentAboveTenEMA.find(
      (p) => p.dateStr === ad.dateStr
    );

    const greaterThanFifty = overview.percentAboveFiftySMA.find(
      (p) => p.dateStr === ad.dateStr
    );
    const greaterThanTwoHundred = overview.percentAboveTwoHundredSMA.find(
      (p) => p.dateStr === ad.dateStr
    );
    const greaterThanTwenty = overview.percentAboveTwentyOneEMA.find(
      (p) => p.dateStr === ad.dateStr
    );
    const gdb = dataWithRank.find((g) => g.dateStr === ad.dateStr);

    const upI = overview.upFourPercentLine.findIndex(
      (u) => u.dateStr === ad.dateStr
    );
    const up = overview.upFourPercentLine[upI];
    const downI = overview.downFourPercentLine.findIndex(
      (d) => d.dateStr == ad.dateStr
    );
    const down = overview.downFourPercentLine[downI];
    const downCount = down ? down.count : 0;

    const lastTen = overview.upFourPercentLine.slice(upI - 9, downI + 1);

    const lastTenUpAndDown: UpAndDown[] = lastTen.map((l) => {
      const d = overview.downFourPercentLine.find(
        (d) => d.dateStr == l.dateStr
      );

      const u = overview.upFourPercentLine.find((d) => d.dateStr == l.dateStr);

      const upAndDown: UpAndDown = {
        dateStr: l.dateStr,
        upCount: u ? u.count : 0,
        downCount: d ? d.count : 0,
      };

      return upAndDown;
    });

    const lastTenUpCount = lastTenUpAndDown
      .map((l) => l.upCount)
      .reduce((accumulator, currentValue) => accumulator + currentValue, 0);

    const lastTenDownCount = lastTenUpAndDown
      .map((l) => l.downCount)
      .reduce((accumulator, currentValue) => accumulator + currentValue, 0);

    const lastFiveUpCount = lastTenUpAndDown
      .slice(-5)
      .map((l) => l.upCount)
      .reduce((accumulator, currentValue) => accumulator + currentValue, 0);

    const lastFivDownCount = lastTenUpAndDown
      .slice(-5)
      .map((l) => l.downCount)
      .reduce((accumulator, currentValue) => accumulator + currentValue, 0);

    const adl = overview.advanceDeclineLine.find(
      (ad) => ad.dateStr === up.dateStr
    );
    const adlSum = adl ? adl.advances + adl.declines : 0;

    const shortTermRow: STMomentumRow = {
      dateStr: up.dateStr,
      upFourPercent: up.count,
      downFourPercent: down ? down.count : 0,
      dayRatio: up.count / Math.max(1, downCount),
      fiveDayRatio: lastFiveUpCount / Math.max(1, lastFivDownCount),
      tenDayRatio: lastTenUpCount / Math.max(1, lastTenDownCount),
      dailyMomo: adlSum > 0 ? 100 * (up.count / adlSum) : 0,
    };

    const oneMonthDown = overview.oneMonthDownTwentyFivePercentyLine.find(
      (d) => d.dateStr === up.dateStr
    );

    const oneMonthUp = overview.oneMonthUpTwentyFivePercentyLine.find(
      (d) => d.dateStr === up.dateStr
    );

    const oneMonthRatio =
      (oneMonthUp?.count || 0) / Math.max(1, oneMonthDown?.count || 0);

    const threeMonthsDown = overview.threeMonthsDownTwentyFivePercentyLine.find(
      (d) => d.dateStr === up.dateStr
    );

    const threeMonthsUp = overview.threeMonthsUpTwentyFivePercentyLine.find(
      (d) => d.dateStr === up.dateStr
    );

    const threeMonthsRatio =
      (threeMonthsUp?.count || 0) / Math.max(1, threeMonthsDown?.count || 0);

    const momentumRow: MomentumRow = {
      stMomentumRow: shortTermRow,
      mtMomentumRow: {
        dateStr: up.dateStr,
        upTwentyFivePercent: oneMonthUp?.count || 0,
        downTwentyFivePercent: oneMonthDown?.count || 0,
        ratio: oneMonthRatio,
      },
      ltMomentumRow: {
        dateStr: up.dateStr,
        upTwentyFivePercent: threeMonthsUp?.count || 0,
        downTwentyFivePercent: threeMonthsDown?.count || 0,
        ratio: threeMonthsRatio,
      },
    };
    if (
      !hl ||
      !upD ||
      !greaterThanFiveSMA ||
      !greaterThanTen ||
      !greaterThanTwenty ||
      !greaterThanFifty ||
      !greaterThanTwoHundred ||
      !gdb
    ) {
      return undefined;
    }

    const stockCountPoint = overview.stockCountLine.find(
      (l) => l.dateStr === hl.dateStr
    );

    const stockCount = stockCountPoint ? stockCountPoint.count : 1;

    const hlRow: NewHighLowRow = {
      ...hl,
      net: hl.fiftyTwoWeekHighs - hl.fiftyTwoWeekLows,
      netRatio: Number(
        (
          100 *
          ((hl.fiftyTwoWeekHighs - hl.fiftyTwoWeekLows) / stockCount)
        ).toFixed(2)
      ),
    };

    const upDownRow: UpDownVolumeRow = {
      ...upD,
      upDownRatio: Number((upD.upVolume / upD.downVolume).toFixed(2)),
    };

    const greaterThanSMARow: GreaterThanSMARow = {
      percentAboveFiveSMA: greaterThanFiveSMA?.percentAboveMA,
      percentAboveTenEMA: greaterThanTen?.percentAboveMA,
      percentAboveFiftySMA: greaterThanFifty.percentAboveMA,
      percentAboveTwoHundredSMA: greaterThanTwoHundred.percentAboveMA,
      percentAboveTwentyOneEMA: greaterThanTwenty.percentAboveMA,
    };

    const globalDailyBreadthRow: GlobalDailyBreadthRow = {
      globalDailyBreadth: gdb.globalDailyBreadth,
      globalDailyBreadthPercentRank: gdb.globalDailyBreadthPercentileRank,
    };

    const row: MarkBreadthRow = {
      advanceDeclineRow: ad,
      newHighNewLowRow: hlRow,
      upDownVolumeRow: upDownRow,
      greaterThanSMARow: greaterThanSMARow,
      globalDailyBreadthRow: globalDailyBreadthRow,
      momentumRow,
    };

    return row;
  });

  const currentTheme = theme === "light" ? "light" : "dark";
  return (
    <>
      <Card>
        <CardHeader className="py-2">
          <CardTitle className={`text-lg `}>
            {datasetDescription} Breadth Snapshot
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex overflow-x-auto  max-h-[100rem] no-scrollbar">
            <table className="w-full table-auto text-sm border-collapse border-spacing-0">
              <thead className="sticky top-0 bg-background ">
                <tr className="" key="market-breadth-table-head">
                  <th className=" border-r border-foreground/70 px-2 py-2"></th>
                  <th
                    colSpan={5}
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
                    colSpan={1}
                    className=" border-r border-foreground/70 px-2 py-2 text-left "
                  >
                    UP/DOWN VOL
                  </th>
                  <th
                    colSpan={5}
                    className=" border-r border-foreground/70 px-2 py-2 text-left"
                  >
                    % ABOVE KMA
                  </th>

                  <th
                    colSpan={5}
                    className="border-r border-foreground/70 px-2 py-2 text-left"
                  >
                    ST MOMENTUM
                  </th>
                  <th colSpan={1} className=" px-2 py-2 text-left">
                    1Y GDB RANK
                  </th>
                </tr>
                <tr
                  className="border-b text-foreground/70"
                  key={"market-breadth-table-sub-head"}
                  style={{ boxShadow: "0 0px 0.5px 1px gray" }}
                >
                  <td className="border-r border-foreground/70 py-2 text-left">
                    DATE
                  </td>
                  <td className="px-2 py-1 text-right">ADV</td>
                  <td className="px-2 py-1 text-right">DECL</td>
                  <td className="px-2 py-1 text-right">NET</td>
                  <td className="px-2 py-1 text-right">NET RATIO</td>
                  <td className="border-r border-foreground/70 px-2 py-1 text-right">
                    CUMUL
                  </td>
                  <td className="px-2 py-1 text-right">HIGHS</td>
                  <td className="px-2 py-1 text-right">LOWS</td>
                  <td className="px-2 py-1 text-right">NET</td>
                  <td className="border-r border-foreground/70 px-2 py-1 text-right">
                    NET RATIO
                  </td>
                  <td className="border-r border-foreground/70 px-2 py-1 text-right">
                    UP/DOWN
                  </td>
                  <td className=" px-2 py-1 text-right">5SMA</td>
                  <td className=" px-2 py-1 text-right">10EMA</td>
                  <td className=" px-2 py-1 text-right">21EMA</td>
                  <td className=" px-2 py-1 text-right">50SMA</td>
                  <td className="border-r border-foreground/70 px-2 py-1 text-right">
                    200SMA
                  </td>

                  <td className="px-2 py-1 text-right">UP &gt; 4%</td>
                  <td className="px-2 py-1 text-right">DOWN &lt; 4%</td>
                  <td className="px-2 py-1 text-right">DAY RATIO</td>
                  <td className="whitespace-normal px-2 py-1 text-right">
                    5 DAY RATIO
                  </td>
                  <td className="border-r border-foreground/70 px-2 py-1 text-right">
                    10 DAY RATIO
                  </td>

                  <td className=" px-2 py-1 text-right ">GDB</td>
                </tr>
              </thead>
              <tbody>
                {marketBreadthRows.map((r) => {
                  const advDeclineBackground = calculateColorFromPercentage(
                    r?.advanceDeclineRow.netRatio || 0,
                    currentTheme,
                    -100,
                    0,
                    100
                  );

                  const newHighsLowsBackground = calculateColorFromPercentage(
                    r?.newHighNewLowRow.netRatio || 0,
                    currentTheme,
                    -10,
                    0,
                    10
                  );

                  const fiveSMABackground = calculateColorFromPercentage(
                    r?.greaterThanSMARow.percentAboveFiveSMA || 0,
                    currentTheme,
                    0,
                    50,
                    100
                  );

                  const tenEMABackground = calculateColorFromPercentage(
                    r?.greaterThanSMARow.percentAboveTenEMA || 0,
                    currentTheme,
                    0,
                    50,
                    100
                  );

                  const twentyEMABackground = calculateColorFromPercentage(
                    r?.greaterThanSMARow.percentAboveTwentyOneEMA || 0,
                    currentTheme,
                    0,
                    50,
                    100
                  );

                  const fiftySMABackground = calculateColorFromPercentage(
                    r?.greaterThanSMARow.percentAboveFiftySMA || 0,
                    currentTheme,
                    0,
                    50,
                    100
                  );

                  const twoHundredSMABackground = calculateColorFromPercentage(
                    r?.greaterThanSMARow.percentAboveTwoHundredSMA || 0,
                    currentTheme,
                    0,
                    50,
                    100
                  );

                  const upDownRatioBG = calculateColorFromPercentage(
                    r?.upDownVolumeRow.upDownRatio || 0,
                    currentTheme,
                    0,
                    1,
                    3
                  );

                  const dayRatioBackground = calculateColorFromPercentage(
                    r?.momentumRow.stMomentumRow.dayRatio || 0,
                    currentTheme,
                    0,
                    1,
                    5
                  );

                  const fiveDayRatioBackground = calculateColorFromPercentage(
                    r?.momentumRow.stMomentumRow.fiveDayRatio || 0,
                    currentTheme,
                    0,
                    1,
                    5
                  );

                  const tenDayRatioBackground = calculateColorFromPercentage(
                    r?.momentumRow?.stMomentumRow?.tenDayRatio ?? 0,
                    currentTheme,
                    0,
                    1,
                    5
                  );

                  const gdbPercentBackground = calculateColorFromPercentage(
                    r?.globalDailyBreadthRow.globalDailyBreadthPercentRank || 0,
                    currentTheme,
                    -100,
                    0,
                    100
                  );

                  return (
                    <Popover key={r?.advanceDeclineRow.dateStr}>
                      <PopoverTrigger asChild>
                        <tr
                          className={`${firaCode.className} border-b border-foreground/20  hover:cursor-pointer hover:bg-foreground/5`}
                          key={r?.advanceDeclineRow.dateStr}
                        >
                          <td className="border-r border-foreground/70 py-2 pr-2 text-left text-foreground/70">
                            {r?.advanceDeclineRow.dateStr}
                          </td>
                          <td
                            className="px-2 text-right"
                            style={{
                              background: advDeclineBackground,
                            }}
                          >
                            {r?.advanceDeclineRow.advances}
                          </td>
                          <td
                            className="px-2 text-right"
                            style={{
                              background: advDeclineBackground,
                            }}
                          >
                            {r?.advanceDeclineRow.declines}
                          </td>
                          <td
                            className="px-2 text-right"
                            style={{
                              background: advDeclineBackground,
                            }}
                          >
                            {r?.advanceDeclineRow.net}
                          </td>
                          <td
                            className="px-2 text-right"
                            style={{
                              background: advDeclineBackground,
                            }}
                          >
                            {r?.advanceDeclineRow.netRatio}%
                          </td>
                          <td
                            className="border-r border-foreground/70 px-2 text-right"
                            style={{
                              background: advDeclineBackground,
                            }}
                          >
                            {r?.advanceDeclineRow.cumulative}
                          </td>
                          <td
                            className="px-2 text-right"
                            style={{
                              background: newHighsLowsBackground,
                            }}
                          >
                            {r?.newHighNewLowRow.fiftyTwoWeekHighs}
                          </td>
                          <td
                            className="px-2 text-right"
                            style={{
                              background: newHighsLowsBackground,
                            }}
                          >
                            {r?.newHighNewLowRow.fiftyTwoWeekLows}
                          </td>
                          <td
                            className="px-2 text-right"
                            style={{
                              background: newHighsLowsBackground,
                            }}
                          >
                            {r?.newHighNewLowRow.net}
                          </td>
                          <td
                            className="border-r border-foreground/70 px-2 text-right"
                            style={{
                              background: newHighsLowsBackground,
                            }}
                          >
                            {r?.newHighNewLowRow.netRatio}%
                          </td>
                          <td
                            className="border-r border-foreground/70 px-2 text-right "
                            style={{
                              background: upDownRatioBG,
                            }}
                          >
                            {r?.upDownVolumeRow.upDownRatio}
                          </td>
                          <td
                            className="px-2 text-right "
                            style={{
                              background: fiveSMABackground,
                            }}
                          >
                            {r?.greaterThanSMARow.percentAboveFiveSMA}%
                          </td>
                          <td
                            className="px-2 text-right "
                            style={{
                              background: tenEMABackground,
                            }}
                          >
                            {r?.greaterThanSMARow.percentAboveTenEMA}%
                          </td>
                          <td
                            className="px-2 text-right "
                            style={{
                              background: twentyEMABackground,
                            }}
                          >
                            {r?.greaterThanSMARow.percentAboveTwentyOneEMA}%
                          </td>
                          <td
                            className="px-2 text-right "
                            style={{
                              background: fiftySMABackground,
                            }}
                          >
                            {r?.greaterThanSMARow.percentAboveFiftySMA}%
                          </td>
                          <td
                            className=" border-r border-foreground/70 px-2 text-right"
                            style={{
                              background: twoHundredSMABackground,
                            }}
                          >
                            {r?.greaterThanSMARow.percentAboveTwoHundredSMA}%
                          </td>

                          <td
                            className="px-2 text-right"
                            style={{
                              background: dayRatioBackground,
                            }}
                          >
                            {r?.momentumRow.stMomentumRow.upFourPercent}
                          </td>
                          <td
                            className="px-2 text-right"
                            style={{
                              background: dayRatioBackground,
                            }}
                          >
                            {r?.momentumRow.stMomentumRow.downFourPercent}
                          </td>
                          <td
                            className="px-2 text-right"
                            style={{
                              background: dayRatioBackground,
                            }}
                          >
                            {r?.momentumRow.stMomentumRow.dayRatio.toFixed(2)}
                          </td>
                          <td
                            className="px-2 text-right"
                            style={{
                              background: fiveDayRatioBackground,
                            }}
                          >
                            {r?.momentumRow.stMomentumRow.fiveDayRatio.toFixed(
                              2
                            )}
                          </td>
                          <td
                            className="px-2 text-right border-r border-foreground/70 "
                            style={{
                              background: tenDayRatioBackground,
                            }}
                          >
                            {r?.momentumRow.stMomentumRow.tenDayRatio.toFixed(
                              2
                            )}
                          </td>

                          <td
                            className="px-2 text-right"
                            style={{
                              background: gdbPercentBackground,
                            }}
                          >
                            {r?.globalDailyBreadthRow.globalDailyBreadthPercentRank.toFixed(
                              2
                            )}
                          </td>
                        </tr>
                      </PopoverTrigger>

                      <PopoverContent
                        side="bottom" // Change to a position that better suits your layout, like "bottom" or "top"
                        align="start" // Align to the start for a more flush position relative to the trigger
                        sideOffset={10} // Adjust this offset to avoid overlap or ensure proper space
                        className="w-[60rem] p-0" // Increase width or padding as needed
                        style={{ zIndex: 1000, outline: "none" }} // Retain this for visibility
                      >
                        <MarketBreadthPopoverContainer
                          ticker={getTickerForDataset(dataset)}
                          name={datasetDescription}
                          endDate={
                            r?.advanceDeclineRow.dateStr
                              ? r.advanceDeclineRow.dateStr
                              : undefined
                          }
                          fromDate={getOneYearAgo(
                            r?.advanceDeclineRow.dateStr ||
                            formatDateToEST(new Date())
                          )}
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
    </>
  );
};

export default MarketBreadthTable;

const getOneYearAgo = (dateStr: string) => {
  const currentDate = new Date(dateStr);
  const oneYearAgo = new Date(
    currentDate.getFullYear() - 1,
    currentDate.getMonth(),
    currentDate.getDate(),
    currentDate.getHours(),
    currentDate.getMinutes(),
    currentDate.getSeconds(),
    currentDate.getMilliseconds()
  );
  return formatDateToEST(oneYearAgo);
};
