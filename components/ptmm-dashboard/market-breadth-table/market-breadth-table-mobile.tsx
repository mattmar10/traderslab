"use client";

import ErrorCard from "@/components/error-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  FMPDataLoadingError,
  isFMPDataLoadingError,
} from "@/lib/types/fmp-types";

import { NewMarketBreadthOverview } from "@/lib/types/market-breadth-types";
import { useTheme } from "next-themes";
import { MarkBreadthRow } from "./market-breadth-table-types";
import { calculateColorFromPercentage } from "./utils";
import { Fira_Code } from "next/font/google";

const firaCode = Fira_Code({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

export interface MobileMarketBreadthTableProps {
  overview: NewMarketBreadthOverview | FMPDataLoadingError;
  marketBreadthRows: MarkBreadthRow[];
  datasetName: string;
}

const MobileMarketBreadthTable: React.FC<MobileMarketBreadthTableProps> = ({
  overview,
  marketBreadthRows,
  datasetName,
}: MobileMarketBreadthTableProps) => {
  const { theme } = useTheme();

  if (isFMPDataLoadingError(overview)) {
    return (
      <div>
        <ErrorCard errorMessage={"Unable to load Market Breadth"} />
      </div>
    );
  }

  const currentTheme = theme === "light" ? "light" : "dark";

  return (
    <>
      <Card>
        <CardHeader className="pb-1 px-4 pt-3">
          <CardTitle className={`text-lg `}>
            {datasetName} Historical Breadth
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4">
          {marketBreadthRows.slice(0, 20).map((mb) => {
            const dateStr = mb?.advanceDeclineRow.dateStr;

            const advDeclineBackground = calculateColorFromPercentage(
              mb?.advanceDeclineRow.netRatio || 0,
              currentTheme,
              -100,
              0,
              100
            );

            const gdbPercentBackground = calculateColorFromPercentage(
              mb?.globalDailyBreadthRow.globalDailyBreadthPercentRank || 0,
              currentTheme,
              -100,
              0,
              100
            );

            const newHighsLowsBackground = calculateColorFromPercentage(
              mb?.newHighNewLowRow.netRatio || 0,
              currentTheme,
              -10,
              0,
              10
            );

            const tenEMABackground = calculateColorFromPercentage(
              mb?.greaterThanSMARow.percentAboveTenEMA || 0,
              currentTheme,
              0,
              50,
              100
            );

            const twentyEMABackground = calculateColorFromPercentage(
              mb?.greaterThanSMARow.percentAboveTwentyOneEMA || 0,
              currentTheme,
              0,
              50,
              100
            );

            const fiftySMABackground = calculateColorFromPercentage(
              mb?.greaterThanSMARow.percentAboveFiftySMA || 0,
              currentTheme,
              0,
              50,
              100
            );

            const twoHundredSMABackground = calculateColorFromPercentage(
              mb?.greaterThanSMARow.percentAboveTwoHundredSMA || 0,
              currentTheme,
              0,
              50,
              100
            );

            const dayRatioBackground = calculateColorFromPercentage(
              mb?.momentumRow.stMomentumRow.dayRatio || 0,
              currentTheme,
              0,
              1,
              5
            );

            const fiveDayRatioBackground = calculateColorFromPercentage(
              mb?.momentumRow.stMomentumRow.fiveDayRatio || 0,
              currentTheme,
              0,
              1,
              5
            );

            const tenDayRatioBackground = calculateColorFromPercentage(
              mb?.momentumRow.stMomentumRow.tenDayRatio || 0,
              currentTheme,
              0,
              1,
              5
            );

            return (
              <div
                className="w-full pb-4  border-b border-foreground/20"
                key={`mobile-breadth-snap-${dateStr}`}
              >
                <div className="flex justify-between items-center pt-4">
                  <div>{formatDate(dateStr!).toUpperCase()}</div>
                  <div>
                    <div
                      className={`${firaCode.className} flex items-center gap-x-1 text-sm`}
                    >
                      <div className="font-semibold">GDB:</div>
                      <div
                        className={`${firaCode.className} px-2 py-1 rounded`}
                        style={{ backgroundColor: gdbPercentBackground }}
                      >
                        {mb?.globalDailyBreadthRow.globalDailyBreadthPercentRank.toFixed(
                          2
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-full mt-3 ">
                  <div className={`font-semibold text-sm text-foreground/90 `}>
                    Advances & Declines
                  </div>
                  <div className={`text-sm w-full flex flex-col`}>
                    <div className="flex justify-between text-foreground/70">
                      <div className="flex-1 text-left">ADV</div>
                      <div className="flex-1 text-right">DECL</div>
                      <div className="flex-1 text-right">NET</div>
                      <div className="flex-1 text-right">RATIO</div>
                    </div>
                    <div
                      className={`${firaCode.className} flex justify-between py-1 `}
                      style={{ backgroundColor: advDeclineBackground }}
                    >
                      <div className="flex-1 text-left pl-1">
                        {mb?.advanceDeclineRow.advances}
                      </div>
                      <div className="flex-1 text-right">
                        {mb?.advanceDeclineRow.declines}
                      </div>
                      <div className="flex-1 text-right">
                        {mb?.advanceDeclineRow.net}
                      </div>
                      <div className="flex-1 text-right pr-1">
                        {mb?.advanceDeclineRow.netRatio}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-full mt-4">
                  <div className="font-semibold text-sm text-foreground/90">
                    New 52 Week Highs/Lows
                  </div>
                  <div
                    className={`text-sm w-full flex flex-col text-foreground/70`}
                  >
                    <div className="flex justify-between">
                      <div className="flex-1 text-left">HIGHS</div>
                      <div className="flex-1 text-right">LOWS</div>
                      <div className="flex-1 text-right">NET</div>
                      <div className="flex-1 text-right">RATIO</div>
                    </div>
                    <div
                      className={`flex justify-between py-1 ${firaCode.className} `}
                      style={{ backgroundColor: newHighsLowsBackground }}
                    >
                      <div className="flex-1 text-left pl-1">
                        {mb?.newHighNewLowRow.fiftyTwoWeekHighs}
                      </div>
                      <div className="flex-1 text-right">
                        {mb?.newHighNewLowRow.fiftyTwoWeekLows}
                      </div>
                      <div className="flex-1 text-right">
                        {mb?.newHighNewLowRow.net}
                      </div>
                      <div className="flex-1 text-right pr-1">
                        {mb?.newHighNewLowRow.netRatio}%
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-full mt-4">
                  <div className="font-semibold text-sm text-foreground/90">
                    Percent Above KMAs
                  </div>
                  <div className={`text-sm w-full flex flex-col`}>
                    <div className="flex justify-between text-foreground/70">
                      <div className="flex-1 text-left">10 EMA</div>
                      <div className="flex-1 text-right">21 EMA</div>
                      <div className="flex-1 text-right">50 SMA</div>
                      <div className="flex-1 text-right">200 SMA</div>
                    </div>
                    <div
                      className={`${firaCode.className} flex justify-between pb-1`}
                    >
                      <div
                        className="flex-1 text-left pl-1"
                        style={{ backgroundColor: tenEMABackground }}
                      >
                        {Number(
                          mb?.greaterThanSMARow.percentAboveTenEMA.toFixed(0)
                        )}
                        %
                      </div>
                      <div
                        className="flex-1 text-right"
                        style={{ backgroundColor: twentyEMABackground }}
                      >
                        {Number(
                          mb?.greaterThanSMARow.percentAboveTwentyOneEMA.toFixed(
                            0
                          )
                        )}
                        %
                      </div>
                      <div
                        className="flex-1 text-right"
                        style={{ backgroundColor: fiftySMABackground }}
                      >
                        {Number(
                          mb?.greaterThanSMARow.percentAboveFiftySMA.toFixed(0)
                        )}
                        %
                      </div>
                      <div
                        className="flex-1 text-right pr-1"
                        style={{ backgroundColor: twoHundredSMABackground }}
                      >
                        {Number(
                          mb?.greaterThanSMARow.percentAboveTwoHundredSMA.toFixed(
                            0
                          )
                        )}
                        %
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-full mt-4">
                  <div className="font-semibold text-sm text-foreground/90">
                    ST Momentum
                  </div>
                  <div className={`text-sm w-full flex flex-col pb-1`}>
                    <div className="flex justify-between text-foreground/70">
                      <div className="flex-1 text-left">
                        <span aria-label="Up" title="Up">
                          ▲
                        </span>{" "}
                        4%
                      </div>
                      <div className="flex-1 text-center">
                        <span aria-label="Down" title="Down">
                          ▼
                        </span>{" "}
                        4%
                      </div>
                      <div className="flex-1 text-center">RATIO</div>
                      <div className="flex-1 text-right">5D </div>
                      <div className="flex-1 text-right pr-1">10D </div>
                    </div>
                    <div
                      className={`${firaCode.className} flex justify-between pb-1`}
                    >
                      <div
                        className="flex-1 text-left pl-1"
                        style={{ backgroundColor: dayRatioBackground }}
                      >
                        {mb?.momentumRow.stMomentumRow.upFourPercent}
                      </div>
                      <div
                        className="flex-1 text-center"
                        style={{ backgroundColor: dayRatioBackground }}
                      >
                        {mb?.momentumRow.stMomentumRow.downFourPercent}
                      </div>
                      <div
                        className="flex-1 text-center"
                        style={{ backgroundColor: dayRatioBackground }}
                      >
                        {mb?.momentumRow.stMomentumRow.dayRatio.toFixed(2)}
                      </div>
                      <div
                        className="flex-1 text-right "
                        style={{ backgroundColor: fiveDayRatioBackground }}
                      >
                        {mb?.momentumRow.stMomentumRow.fiveDayRatio.toFixed(2)}
                      </div>
                      <div
                        className="flex-1 text-right pr-1"
                        style={{ backgroundColor: tenDayRatioBackground }}
                      >
                        {mb?.momentumRow.stMomentumRow.tenDayRatio.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </>
  );
};

export default MobileMarketBreadthTable;

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr + "T00:00:00Z"); // Append
  const options: Intl.DateTimeFormatOptions = {
    timeZone: "UTC", // Specify the timezone to format the date in UTC
    month: "long", // Full month name
    day: "numeric", // Day of the month
  };

  // Format the date using toLocaleDateString
  return date.toLocaleDateString("en-US", options);
};
