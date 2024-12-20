"use client";
import {
  MarketBreadthResponse,
  MomentumRow,
  STMomentumRow,
  UpAndDown,
} from "@/lib/types/market-breadth-types";
import FiftyTwoWeekHighsLowsLineTV from "./high-lows-line-tv";
import McclellanOscillatorTV from "./mcclellan-oscillator-tv";
import PercentOfStocksAboveMAs from "./percent-of-stocks-above-ma-tv";
import { Dataset, getTickerForDataset } from "@/lib/types/basic-types";
import STMomentumUpDownChartTV from "./momentum/st-momentum-up-down-chart-tv";
import ClientOverviewPriceChart from "../price-chart/client-overview-price-chart";
import MarketBreadthTable from "./market-breadth-table/market-breadth-table";
import MarketBreadthSnapshotTable from "./market-breadth-table/market-breadth-snapshot-table";

export interface DesktopDashboardProps {
  overview: MarketBreadthResponse;
  dataset: Dataset;
  datasetDescription: string;
}

const DesktopDashboard: React.FC<DesktopDashboardProps> = ({
  overview,
  dataset,
  datasetDescription,
}: DesktopDashboardProps) => {
  
  const upFourPercentLine = overview.marketBreadthOverview.upFourPercentLine;
  const downFourPercentLine =
    overview.marketBreadthOverview.downFourPercentLine;

  const marketBreadthOverview = overview.marketBreadthOverview;

  const momentumRows: MomentumRow[] = [];

  for (let i = 10; i <= upFourPercentLine.length - 1; i++) {
    const up = upFourPercentLine[i];
    const down = downFourPercentLine.find((d) => d.dateStr == up.dateStr);
    const downCount = down ? down.count : 0;

    const lastTen = upFourPercentLine.slice(i - 9, i + 1);

    const lastTenUpAndDown: UpAndDown[] = lastTen.map((l) => {
      const d = downFourPercentLine.find((d) => d.dateStr == l.dateStr);
      const u = upFourPercentLine.find((d) => d.dateStr == l.dateStr);

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

    const adl = marketBreadthOverview.advanceDeclineLine.find(
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

    const oneMonthDown =
      marketBreadthOverview.oneMonthDownTwentyFivePercentyLine.find(
        (d) => d.dateStr === up.dateStr
      );

    const oneMonthUp =
      marketBreadthOverview.oneMonthUpTwentyFivePercentyLine.find(
        (d) => d.dateStr === up.dateStr
      );

    const oneMonthRatio =
      (oneMonthUp?.count || 0) / Math.max(1, oneMonthDown?.count || 0);

    const threeMonthsDown =
      marketBreadthOverview.threeMonthsDownTwentyFivePercentyLine.find(
        (d) => d.dateStr === up.dateStr
      );

    const threeMonthsUp =
      marketBreadthOverview.threeMonthsUpTwentyFivePercentyLine.find(
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
    momentumRows.push(momentumRow);
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-3 p-4 md:gap-8 md:p-8">
        <div className="grid grid-cols-4 gap-2">
          <div className="col-span-1">
            <FiftyTwoWeekHighsLowsLineTV
              highsLowsLine={
                overview.marketBreadthOverview.fiftyTwoWeekHighsLowsLine
              }
            />
          </div>
          <div className="col-span-1">
            <McclellanOscillatorTV
              mcClellanOscillator={
                overview.marketBreadthOverview.mcClellanOscillator
              }
            />
          </div>
          <div className="col-span-2">
            <MarketBreadthSnapshotTable />
          </div>
          <div className="col-span-2">
            <ClientOverviewPriceChart ticker={getTickerForDataset(dataset)} />
          </div>

          <div className="col-span-1 ">
            <STMomentumUpDownChartTV momentumRows={momentumRows} />
          </div>
          <div className="col-span-1">
            <PercentOfStocksAboveMAs
              percentAboveFiveSMA={
                overview.marketBreadthOverview.percentAboveFiveSMA
              }
              percentAboveTenEMA={
                overview.marketBreadthOverview.percentAboveTenEMA
              }
              percentAboveTwentyOneEMA={
                overview.marketBreadthOverview.percentAboveTwentyOneEMA
              }
              percentAboveFiftySMA={
                overview.marketBreadthOverview.percentAboveFiftySMA
              }
              percentAboveTwoHundredSMA={
                overview.marketBreadthOverview.percentAboveTwoHundredSMA
              }
            />
          </div>
          <div className="col-span-4">
            <MarketBreadthTable
              overview={overview.marketBreadthOverview}
              dataset={dataset}
              datasetDescription={datasetDescription}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default DesktopDashboard;
