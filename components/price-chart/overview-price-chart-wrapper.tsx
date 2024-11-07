"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Candle } from "@/lib/types/basic-types";
import {
  FMPHistoricalResultsSchema,
  QuoteArraySchema,
  isFMPDataLoadingError,
} from "@/lib/types/fmp-types";

import PriceChart from "./price-chart";

import Loading from "@/components/loading";
import { isWithinMarketHours } from "@/lib/utils";

import { useEffect, useState } from "react";
import {
  ChartSettings,
  defaultSettings,
} from "@/components/settings/chart-settings";
import { useTheme } from "next-themes";
import { useQuery } from "react-query";
import { formatDateToEST } from "@/lib/utils/epoch-utils";
import {
  calculateEMA,
  calculateSMA,
  isMovingAverageError,
} from "@/lib/utils/moving-average";

export interface OverviewPriceChartWrapperProps {
  ticker: string;
  candles: Candle[];
}

const OverviewPriceChartWrapper: React.FC<OverviewPriceChartWrapperProps> = ({
  ticker,
  candles,
}) => {
  const [mounted, setMounted] = useState(false);

  const { theme } = useTheme();
  const [chartSettings, setChartSettings] =
    useState<ChartSettings>(defaultSettings);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  useEffect(() => {
    const loadData = () => {
      const savedSettings = localStorage.getItem("chartSettings");
      if (savedSettings) {
        setChartSettings(JSON.parse(savedSettings));
      } else {
        setChartSettings(defaultSettings);
      }
      setIsDataLoaded(true);
    };

    loadData();
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const key = `/api/quote/${ticker}`;

  const getQuoteApi = async () => {
    const res = await fetch(key);
    const parsed = QuoteArraySchema.safeParse(await res.json());
    if (!parsed.success) {
      return "Unable to parse quote results";
    } else {
      return parsed.data[0];
    }
  };

  const { data, status } = useQuery({
    queryKey: [key],
    queryFn: getQuoteApi,
    refetchInterval: 35000,
  });
  const currentDate = new Date();
  const startDate = new Date(
    currentDate.getFullYear() - 2,
    currentDate.getMonth(),
    currentDate.getDate(),
    currentDate.getHours(),
    currentDate.getMinutes(),
    currentDate.getSeconds(),
    currentDate.getMilliseconds()
  );

  const barsKey = `/api/bars/${ticker}?fromDateString=${formatDateToEST(
    startDate
  )}`;

  const getBars = async () => {
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

  const { data: barsData, status: barsStatus } = useQuery({
    queryKey: [barsKey, ticker],
    queryFn: getBars,
    enabled: candles.length === 0, // Only fetch if candles are empty
  });

  // Use fetched bars data if candles are empty, otherwise use passed candles
  const sortedTickerData =
    (candles.length > 0 ? candles : barsData)?.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    ) || [];

  if (!chartSettings || !mounted) {
    return <Loading />;
  }

  if (
    (status === "loading" || barsStatus === "loading" || !isDataLoaded) &&
    sortedTickerData.length === 0
  ) {
    return <Loading />;
  }

  if (!sortedTickerData.length) {
    return <div>Oops, Something went wrong loading candles</div>;
  }

  if (isWithinMarketHours() && data && !isFMPDataLoadingError(data)) {
    const latestCandle = sortedTickerData[sortedTickerData.length - 1];
    if (data.price) latestCandle.close = Number(data.price.toFixed(2));
    if (data.open) latestCandle.open = Number(data.open.toFixed(2));
    if (data.dayHigh) latestCandle.high = Number(data.dayHigh.toFixed(2));
    if (data.dayLow) latestCandle.low = Number(data.dayLow.toFixed(2));
  }

  const tenEMA = calculateEMA(sortedTickerData, 10);
  const twentyOneEMA = calculateEMA(sortedTickerData, 21);
  const fiftySMA = calculateSMA(sortedTickerData, 50);
  const twoHundredSMA = calculateSMA(sortedTickerData, 200);

  const filteredCandles = sortedTickerData.filter(
    (d) => d.date >= startDate.getTime()
  );

  if (
    isMovingAverageError(tenEMA) ||
    isMovingAverageError(twentyOneEMA) ||
    isMovingAverageError(fiftySMA) ||
    isMovingAverageError(twoHundredSMA)
  ) {
    return <div>Oops, Something went wrong loading candles</div>;
  }

  const chartTheme = theme === "dark" ? "dark" : "light";

  return (
    <>
      <Card>
        <CardHeader className="py-2 px-4">
          <CardTitle className={`text-lg `}>
            Price Action Performance {ticker}
          </CardTitle>
        </CardHeader>
        <CardContent className="">
          <div className="mt-1">
            <PriceChart
              className="h-[28rem] mt-1"
              candles={filteredCandles}
              tenEMA={{
                period: 10,
                timeseries: tenEMA.timeseries.filter(
                  (t) => new Date(t.time).getTime() > startDate.getTime()
                ),
              }}
              twentyOneEMA={{
                period: 21,
                timeseries: twentyOneEMA.timeseries.filter(
                  (t) => new Date(t.time).getTime() > startDate.getTime()
                ),
              }}
              fiftySMA={{
                period: 50,
                timeseries: fiftySMA.timeseries.filter(
                  (t) => new Date(t.time).getTime() > startDate.getTime()
                ),
              }}
              twoHundredSMA={{
                period: 200,
                timeseries: twoHundredSMA.timeseries.filter(
                  (t) => new Date(t.time).getTime() > startDate.getTime()
                ),
              }}
              showVolume={!ticker.includes("^")}
              ticker={ticker}
              earningsDates={[]}
              chartSettings={chartSettings}
              theme={chartTheme}
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default OverviewPriceChartWrapper;
