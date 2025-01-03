"use client";

import {
  EtfMarketData,
  RankedEtfMarketData,
} from "@/lib/types/submarkets-sectors-themes-types";
import MarketRankGroupAggregateTable from "./market-rank-group-aggregate-table";
import { Candle } from "@/lib/types/basic-types";
import AggregateReturnsChart from "./aggregate-returns-chart";
import { useTheme } from "next-themes";
import { FullFMPProfile } from "@/lib/types/fmp-types";
import { rankMarketData } from "../utils";
import RankedMarketDataGrid, {
  RankedEtfDataPoint,
} from "./ranked-etf-data-grid";
import { adrPercent, isADRPercentError } from "@/lib/indicators/adr-percent";
import { BorderBeam } from "@/components/magicui/border-beam";

export interface ReturnsData {
  date: string;
  dailyReturn: number;
  cumulativeReturn: number;
  price: number;
}

const calculateReturns = (candles: Candle[]): ReturnsData[] => {
  if (!candles.length) return [];

  return candles.map((candle, index) => {
    const dailyReturn =
      index === 0
        ? 0
        : ((candle.close - candles[index - 1].close) /
            candles[index - 1].close) *
          100;

    // Calculate cumulative return from the first day
    const cumulativeReturn =
      ((candle.close - candles[0].close) / candles[0].close) * 100;

    return {
      date: candle.dateStr!,
      dailyReturn: Number(dailyReturn.toFixed(2)),
      cumulativeReturn: Number(cumulativeReturn.toFixed(2)),
      price: candle.close,
    };
  });
};

interface MarketDataCalculations {
  returns: Record<string, ReturnsData[]>;
  marketData: RankedEtfMarketData[];
}

const calculateMarketData = (
  candles: Record<string, Candle[]>,
  tickerNames: Record<string, string>
): MarketDataCalculations => {
  const returns: Record<string, ReturnsData[]> = {};
  const marketData: EtfMarketData[] = [];

  Object.entries(candles).forEach(([ticker, tickerCandles]) => {
    returns[ticker] = calculateReturns(tickerCandles);

    const latestCandle = tickerCandles[tickerCandles.length - 1];
    const latestCandleIndex = tickerCandles.length - 1;

    const getCandleByOffset = (offset: number) => {
      const index = latestCandleIndex - offset;
      return index >= 0 ? tickerCandles[index] : tickerCandles[0]; // Use the first candle as fallback
    };

    const oneDayAgoCandle = getCandleByOffset(1); // Second to last
    const oneWeekAgoCandle = getCandleByOffset(7);
    const oneMonthAgoCandle = getCandleByOffset(30);
    const threeMonthAgoCandle = getCandleByOffset(90);
    const sixMonthAgoCandle = getCandleByOffset(180);
    const oneYearAgoCandle = getCandleByOffset(252);
    // Calculate percentages
    const calculatePercentChange = (oldValue: number, newValue: number) =>
      ((newValue - oldValue) / oldValue) * 100;

    const oneMonthDailyADRP = adrPercent(tickerCandles, 20);

    const yearCandles = tickerCandles.slice(-252); // Approximate trading days in a year
    const fiftyTwoWeekHigh = Math.max(...yearCandles.map((c) => c.high));
    const fiftyTwoWeekLow = Math.min(...yearCandles.map((c) => c.low));

    if (oneMonthDailyADRP && !isADRPercentError(oneMonthDailyADRP)) {
      const marketDataEntry: EtfMarketData = {
        ticker,
        name: tickerNames[ticker],
        percentDailyChange: calculatePercentChange(
          oneDayAgoCandle.close,
          latestCandle.close
        ),
        percentWeeklyChange: calculatePercentChange(
          oneWeekAgoCandle.close,
          latestCandle.close
        ),
        percentMonthlyChange: calculatePercentChange(
          oneMonthAgoCandle.close,
          latestCandle.close
        ),
        percentThreeMonthChange: calculatePercentChange(
          threeMonthAgoCandle.close,
          latestCandle.close
        ),
        percentSixMonthChange: calculatePercentChange(
          sixMonthAgoCandle.close,
          latestCandle.close
        ),
        percentFromFiftyTwoWeekLow: calculatePercentChange(
          fiftyTwoWeekLow,
          latestCandle.close
        ),
        percentFromFiftyTwoWeekHigh: calculatePercentChange(
          fiftyTwoWeekHigh,
          latestCandle.close
        ),
        oneMonthDailyADRP,
        percent1YearChange: calculatePercentChange(
          oneYearAgoCandle.close,
          latestCandle.close
        ),
      };
      marketData.push(marketDataEntry);
    }
  });

  const ranked = rankMarketData(marketData, true);

  return { returns, marketData: ranked };
};

export interface MarketSectorsThemesWrapperProps {
  title: string;
  data: EtfMarketData[];
  profiles: FullFMPProfile[];
  candlesData: Record<string, Candle[]>;
}

const MarketSectorsThemesWrapper: React.FC<MarketSectorsThemesWrapperProps> = ({
  title,
  data,
  profiles,
  candlesData,
}) => {
  const { theme } = useTheme();
  const resolvedTheme = (theme as "light" | "dark") || "light";

  const names: Record<string, string> = {
    RSP: "S&P 500 Equal Weight",
  };

  data.forEach((d) => {
    names[d.ticker] = d.name;
  });

  const processedData = calculateMarketData(candlesData, names);

  let sortedData: EtfMarketData[] = [];
  if (processedData && processedData?.marketData.length > 6) {
    sortedData = rankMarketData(
      [...processedData?.marketData].filter((d) => d.ticker !== "RSP"),
      true
    );
  }

  const topTen = sortedData.slice(0, 10);

  const topTenData = topTen.map((t) => {
    const profile = profiles.find((p) => p.symbol === t.ticker);

    const point: RankedEtfDataPoint = {
      etfData: t,
      profile: profile!,
    };

    return point;
  });

  return (
    <div className="flex-col space-y-2 ">
      {sortedData.length > 0 && (
        <div className="relative">
          <BorderBeam />

          <RankedMarketDataGrid
            theme={resolvedTheme}
            rankedData={topTenData}
            title={title}
          />
        </div>
      )}
      <div>
        {processedData && (
          <div className="relative mt-4 w-full">
            <AggregateReturnsChart
              returnsData={processedData.returns}
              title={`${title} Cumulative Returns Comparison`}
              returnType="cumulative"
              colorMap={{
                RSP: resolvedTheme === "light" ? "#404040" : "#e5e7eb",
              }}
              tickerNames={names}
            />
          </div>
        )}
      </div>

      {processedData && (
        <MarketRankGroupAggregateTable
          data={processedData.marketData}
          title={title}
        />
      )}
    </div>
  );
};

export default MarketSectorsThemesWrapper;
