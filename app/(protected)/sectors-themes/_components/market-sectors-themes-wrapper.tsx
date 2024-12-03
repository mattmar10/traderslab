"use client";

import {
  EtfMarketData,
  RankedEtfMarketData,
} from "@/lib/types/submarkets-sectors-themes-types";
import MarketRankGroupAggregateTable from "./market-rank-group-aggregate-table";
import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";
import { Candle } from "@/lib/types/basic-types";
import AggregateReturnsChart from "./aggregate-returns-chart";
import { useTheme } from "next-themes";
import { FMPHistoricalResultsSchema } from "@/lib/types/fmp-types";
import { formatDateToEST } from "@/lib/utils/epoch-utils";
import Loading from "@/components/loading";
import { rankMarketData } from "../utils";
import RankedMarketDataGrid from "./ranked-etf-data-grid";
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
}

const MarketSectorsThemesWrapper: React.FC<MarketSectorsThemesWrapperProps> = ({
  title,
  data,
}) => {
  const { theme } = useTheme();
  const resolvedTheme = (theme as "light" | "dark") || "light";

  const tickers = useMemo(() => {
    const uniqueTickers = new Set(["RSP", ...data.map((d) => d.ticker)]);
    return Array.from(uniqueTickers);
  }, [data]);

  const tickerNames = useMemo(() => {
    const names: Record<string, string> = {
      RSP: "S&P 500 Equal Weight",
    };

    data.forEach((d) => {
      names[d.ticker] = d.name;
    });

    return names;
  }, [data]);

  const getBars = async (barsKey: string) => {
    const bars = await fetch(barsKey);
    const parsed = FMPHistoricalResultsSchema.safeParse(await bars.json());
    if (!parsed.success) {
      throw Error("Unable to fetch bars");
    } else {
      return parsed.data.historical.map((h) => {
        const candle: Candle = {
          date: new Date(h.date).getTime(),
          dateStr: h.date,
          open: h.open,
          high: h.high,
          low: h.low,
          close: h.close,
          volume: h.volume,
        };
        return candle;
      });
    }
  };

  const now = new Date();
  const oneYearAgo = new Date(
    now.getFullYear() - 1,
    now.getMonth(),
    now.getDate()
  );

  const tickerQueries = useQueries({
    queries: tickers.map((ticker) => ({
      queryKey: ["daily", ticker],
      queryFn: async (): Promise<Candle[]> => {
        return await getBars(
          `/api/bars/${ticker}?fromDateString=${formatDateToEST(oneYearAgo)}`
        );
      },
      staleTime: 1000 * 60 * 5,
      //cacheTime: 1000 * 60 * 30,
    })),
  });
  const processedData = useMemo(() => {
    if (tickerQueries.some((query) => query.isLoading)) {
      return null;
    }

    const candlesData: Record<string, Candle[]> = {};

    tickerQueries.forEach((query, index) => {
      if (query.isSuccess && query.data) {
        const ticker = tickers[index];
        const sortedCandles = [...query.data].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        candlesData[ticker] = sortedCandles;
      }
    });

    // Calculate all market data from candles
    return calculateMarketData(candlesData, tickerNames);
  }, [tickerQueries, tickers, tickerNames]);
  const errors = tickerQueries
    .filter((query) => query.isError)
    .map((query) => query.error);

  const hasErrors = errors.length > 0;

  if (hasErrors) {
    return (
      <div>
        <div>Errors loading some data:</div>
        <ul>
          {errors.map((error, index) => (
            <li key={index}>{error?.toString()}</li>
          ))}
        </ul>
      </div>
    );
  }

  const isLoading = tickerQueries.find((f) => f.isLoading);

  if (isLoading) {
    return <Loading />;
  }

  let sortedData: EtfMarketData[] = [];
  if (processedData && processedData?.marketData.length > 6) {
    sortedData = rankMarketData(
      [...processedData?.marketData].filter((d) => d.ticker !== "RSP"),
      true
    );
  }

  return (
    <div className="flex-col space-y-2 ">

      {sortedData.length > 0 && (
        <div className="relative">
          <BorderBeam />

          <RankedMarketDataGrid
            theme={resolvedTheme}
            rankedData={sortedData.slice(0, 10)}
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
              tickerNames={tickerNames}
            />
          </div>
        )}
      </div>

      {processedData && (
        <MarketRankGroupAggregateTable data={processedData.marketData} title={title} />
      )}

    </div>
  );
};

export default MarketSectorsThemesWrapper;
