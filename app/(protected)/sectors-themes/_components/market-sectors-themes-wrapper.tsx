"use client";

import { EtfMarketData } from "@/lib/types/submarkets-sectors-themes-types";
import MarketRankGroupAggregateTable from "./market-rank-group-aggregate-table";
import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";
import { Candle } from "@/lib/types/basic-types";
import AggregateReturnsChart from "./aggregate-returns-chart";
import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FMPHistoricalResultsSchema } from "@/lib/types/fmp-types";
import { formatDateToEST } from "@/lib/utils/epoch-utils";
import Loading from "@/components/loading";

interface Returns {
  date: string;
  dailyReturn: number;
  cumulativeReturn: number;
}

interface ProcessedData {
  candles: Record<string, Candle[]>;
  returns: Record<string, Returns[]>;
}

const calculateReturns = (candles: Candle[]): Returns[] => {
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
    };
  });
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
    // Create a Set with RSP and all tickers from data to ensure uniqueness
    const uniqueTickers = new Set(["RSP", ...data.map((d) => d.ticker)]);
    return Array.from(uniqueTickers);
  }, [data]);

  const tickerNames = useMemo(() => {
    const names: Record<string, string> = {
      RSP: "S&P 500 Equal Weight",
    };

    // Add names from data
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

  // Now use these directly in useQueries
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

    const processed: ProcessedData = {
      candles: {},
      returns: {},
    };

    tickerQueries.forEach((query, index) => {
      if (query.isSuccess && query.data) {
        const ticker = tickers[index];
        const sortedCandles = [...query.data].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        processed.candles[ticker] = sortedCandles;
        processed.returns[ticker] = calculateReturns(sortedCandles);
      }
    });

    return processed;
  }, [tickerQueries, tickers]);

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
  return (
    <div className="flex-col space-y-2">
      <div>
        {processedData && (
          <div className="mt-4 ">
            <AggregateReturnsChart
              returnsData={processedData.returns}
              title={`${title} 1 Year Cumulative Returns Comparison`}
              returnType="cumulative"
              colorMap={{
                RSP: resolvedTheme === "light" ? "#404040" : "#e5e7eb",
              }}
              tickerNames={tickerNames}
            />
          </div>
        )}
      </div>
      <Card>
        <CardHeader className="p-3"></CardHeader>
        <CardContent>
          <MarketRankGroupAggregateTable data={data} />
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketSectorsThemesWrapper;
