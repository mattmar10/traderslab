"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Candle } from "@/lib/types/basic-types";
import { QuoteArraySchema, isFMPDataLoadingError } from "@/lib/types/fmp-types";

import { useQuery } from "react-query";
import Loading from "@/components/loading";
import MobilePriceChart from "./price-chart-mobile";
import { isWithinMarketHours } from "@/lib/utils";
import { useTheme } from "next-themes";
import {
  ChartSettings,
  defaultChartSettings,
} from "@/components/settings/chart-settings";
import {
  calculateEMA,
  calculateSMA,
  isMovingAverageError,
} from "@/lib/utils/moving-average";

export interface OverviewPriceChartWrapperProps {
  ticker: string;
  candles: Candle[];
}

const OverviewMobilePriceChartWrapper: React.FC<
  OverviewPriceChartWrapperProps
> = ({ ticker, candles }) => {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const [chartSettings, setChartSettings] =
    useState<ChartSettings>(defaultChartSettings);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  useEffect(() => {
    const loadData = () => {
      const savedSettings = localStorage.getItem("chartSettings");
      if (savedSettings) {
        setChartSettings(JSON.parse(savedSettings));
      } else {
        setChartSettings(defaultChartSettings);
      }
      setIsDataLoaded(true);
    };

    loadData();
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  console.log(isDataLoaded);

  const sortedTickerData = candles.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

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
    refetchInterval: 45000,
  });

  if (status === "loading") {
    return <Loading />;
  }

  if (isWithinMarketHours() && data && !isFMPDataLoadingError(data)) {
    if (data.price) {
      sortedTickerData[sortedTickerData.length - 1].close = Number(
        data.price.toFixed(2)
      );
    }

    if (data.open) {
      sortedTickerData[sortedTickerData.length - 1].open = Number(
        data.open.toFixed(2)
      );
    }

    if (data.dayHigh) {
      sortedTickerData[sortedTickerData.length - 1].high = Number(
        data.dayHigh.toFixed(2)
      );
    }

    if (data.dayLow) {
      sortedTickerData[sortedTickerData.length - 1].low = Number(
        data.dayLow.toFixed(2)
      );
    }
  }

  const tenEMA = calculateEMA(sortedTickerData, 10);
  const twentyOneEMA = calculateEMA(sortedTickerData, 21);
  const fiftySMA = calculateSMA(sortedTickerData, 50);
  const twoHundredSMA = calculateSMA(sortedTickerData, 200);

  const currentDate = new Date();

  const startDate = new Date(
    currentDate.getFullYear() - 1,
    currentDate.getMonth(),
    currentDate.getDate(),
    currentDate.getHours(),
    currentDate.getMinutes(),
    currentDate.getSeconds(),
    currentDate.getMilliseconds()
  );

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

  if (!mounted) {
    return <Loading />;
  }
  const chartTheme = theme === "dark" ? "dark" : "light";

  return (
    <>
      <Card>
        <CardHeader className="pt-3 pb-0 px-4">
          <CardTitle className={`text-lg `}>
            {ticker} Price Action Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4">
          <MobilePriceChart
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
            ticker={ticker}
            chartSettings={chartSettings}
            theme={chartTheme}
          />
        </CardContent>
      </Card>
    </>
  );
};

export default OverviewMobilePriceChartWrapper;
