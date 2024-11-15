"use client";
import { getDataSetMarketBreadthOverview } from "@/actions/breadth/breadth-actions";
import useViewport from "@/hooks/useViewport";
import { Dataset, getTickerForDataset } from "@/lib/types/basic-types";
import { useQuery } from "@tanstack/react-query";

import {
  MarketBreadthResponse,
  MomentumRow,
  STMomentumRow,
  UpAndDown,
} from "@/lib/types/market-breadth-types";
import { isFMPDataLoadingError } from "@/lib/types/fmp-types";
import PageContainer from "@/components/layout/page-container";
import { Lato } from "next/font/google";
import Loading from "@/components/loading";
import MarketBreadthSnapshotTable from "@/components/ptmm-dashboard/market-breadth-table/market-breadth-snapshot-table";
import MarketBreadthTable from "@/components/ptmm-dashboard/market-breadth-table/market-breadth-table";
import STMomentumUpDownChartTV from "@/components/ptmm-dashboard/momentum/st-momentum-up-down-chart-tv";
import ClientOverviewPriceChart from "@/components/price-chart/client-overview-price-chart";
import CombinedHighsLowsMcClellan from "./combined-highs-lows-mcclellan";
import PercentOfStocksAboveMAs from "@/components/ptmm-dashboard/percent-of-stocks-above-ma-tv";
import DesktopTrendModelStatus from "./desktop-trend-model-status";

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  display: "swap",
});

export interface DashboardWrapperProps {
  dataset: Dataset;
  datasetDescription: string;
}

const DashboardWrapper: React.FC<DashboardWrapperProps> = ({
  dataset,
  datasetDescription,
}) => {
  const { isMobile } = useViewport();

  const { data, error, isLoading } = useQuery({
    queryKey: [`dashboard-${dataset}`],
    queryFn: () => getDataSetMarketBreadthOverview(dataset),
    refetchInterval: 60000, // Refetch every minute
    staleTime: 5000, // Consider data stale after 55 seconds
  });

  if (isLoading || !data) {
    return (
      <main className="flex min-w-screen flex-col items-center justify-between pt-12">
        <Loading />
      </main>
    );
  }

  if (error || isFMPDataLoadingError(data)) {
    <main className="flex min-w-screen flex-col items-center justify-between pt-12">
      <Loading />
    </main>;
  }

  if (isMobile) {
    return (
      <main className="flex min-w-screen flex-col items-center justify-between pt-12">
        PTMM {datasetDescription}
      </main>
    );
  }

  const momentumRows = bulidMomentumRows(data);
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

  return (
    <PageContainer scrollable>
      <div className="space-y-4 mt-2">
        <div className="space-y-1">
          <span className="text-foreground/60">{datasetDescription}</span>

          <div className="flex space-x-3">
            <div>
              <div
                className={`text-2xl font-bold tracking-tight ${lato.className}`}
              >
                PTMM Dashboard{" "}
                <span className="text-2xl font-semibold">
                  {" "}
                  ({getTickerForDataset(dataset)})
                </span>
              </div>
            </div>

            <DesktopTrendModelStatus dataset={dataset} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 3xl:grid-cols-4">
          <div className="col-span-3">
            <MarketBreadthSnapshotTable />
          </div>
          <CombinedHighsLowsMcClellan overview={data} />

          <div className="col-span-2">
            <ClientOverviewPriceChart ticker={getTickerForDataset(dataset)} />
          </div>
          <div className="col-span-1 ">
            <STMomentumUpDownChartTV momentumRows={momentumRows} />
          </div>
          <div className="col-span-1">
            <PercentOfStocksAboveMAs
              plotStartDate={oneYearAgo}
              percentAboveFiveSMA={
                data.marketBreadthOverview.percentAboveFiveSMA
              }
              percentAboveTenEMA={data.marketBreadthOverview.percentAboveTenEMA}
              percentAboveTwentyOneEMA={
                data.marketBreadthOverview.percentAboveTwentyOneEMA
              }
              percentAboveFiftySMA={
                data.marketBreadthOverview.percentAboveFiftySMA
              }
              percentAboveTwoHundredSMA={
                data.marketBreadthOverview.percentAboveTwoHundredSMA
              }
            />
          </div>
          <div className="col-span-4">
            <MarketBreadthTable
              overview={data.marketBreadthOverview}
              dataset={dataset}
              datasetDescription={datasetDescription}
            />
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default DashboardWrapper;

const bulidMomentumRows = (overview: MarketBreadthResponse): MomentumRow[] => {
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

  return momentumRows;
};
