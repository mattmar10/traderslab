"use client";

import ErrorCard from "@/components/error-card";
import Loading from "@/components/loading";
import PriceChart from "@/components/price-chart/price-chart";
import {
  ChartSettings,
  defaultSettings,
} from "@/components/settings/chart-settings";
import { Candle } from "@/lib/types/basic-types";
import {
  FMPHistoricalResultsSchema,
  isFMPDataLoadingError,
} from "@/lib/types/fmp-types";
import {
  calculateEMA,
  calculateSMA,
  isMovingAverageError,
} from "@/lib/utils/moving-average";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";

export interface OffCanvasContainerPros {
  ticker: string;
  name: string;
  fromDate: string;
  endDate?: string;
}

const MarketBreadthPopoverContainer: React.FC<OffCanvasContainerPros> = ({
  ticker,
  name,
  fromDate,
  endDate,
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

  console.log(chartSettings, isDataLoaded);

  const startDate = new Date(fromDate)
  const key = `/api/bars/${ticker}?fromDateString=${fromDate}&toDateString=${endDate}`;

  const getBars = async () => {
    const bars = await fetch(key);

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

  const { data, error, status } = useQuery({
    queryKey: [key],
    queryFn: getBars,
    refetchInterval: 30000,
  });

  const bgColor = theme === "light" ? "white" : "black";

  if (status === "loading" || !theme || !mounted) {
    return (
      <div
        className={`p-4 rounded shadow-lg border border-foreground/70 bg-${bgColor} h-96 `}
      >
        <div>
          <span className="font-semibold">{ticker} </span>
          &nbsp;{name}
        </div>
        <Loading />
      </div>
    );
  }

  if (error || !data || isFMPDataLoadingError(data)) {
    return <ErrorCard errorMessage={`Unable to load data for ${ticker}`} />;
  }

  const sortedTickerData = data.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const tenEMARes = calculateEMA(sortedTickerData, 10);
  const twentyOneEMARes = calculateEMA(sortedTickerData, 21);
  const fiftySMARes = calculateSMA(sortedTickerData, 50);
  const twoHundredSMARes = calculateSMA(sortedTickerData, 200);

  if (
    isMovingAverageError(tenEMARes) ||
    isMovingAverageError(twentyOneEMARes) ||
    isMovingAverageError(fiftySMARes) ||
    isMovingAverageError(twoHundredSMARes)
  ) {
    return <ErrorCard errorMessage={`Unable to calcualte MAs for ${ticker}`} />;
  }

  const dateHeader = `${sortedTickerData[0].dateStr!} - ${sortedTickerData[
    sortedTickerData.length - 1
  ].dateStr!}`;
  const chartTheme = theme === "dark" ? "dark" : "light";

  return (
    <div
      style={{
        zIndex: 1000,
        outline: "none",
      }}
      className={`p-4 rounded shadow-lg border border-foreground/70 bg-${bgColor} `}
    >
      <div
        className={`mb-2 pb-2 flex justify-between items-end border-b border-foreground`}
      >
        <div>
          <span className="font-semibold">{ticker} </span>
          &nbsp;{name}
        </div>
        <div className="text-xs text-foreground/70">{dateHeader}</div>
      </div>
      <PriceChart
        className="h-[30rem] mt-1 "
        candles={data}
        tenEMA={{
          period: 10,
          timeseries: tenEMARes.timeseries.filter(
            (t) => new Date(t.time).getTime() > startDate.getTime()
          ),
        }}
        twentyOneEMA={{
          period: 21,
          timeseries: twentyOneEMARes.timeseries.filter(
            (t) => new Date(t.time).getTime() > startDate.getTime()
          ),
        }}
        fiftySMA={{
          period: 50,
          timeseries: fiftySMARes.timeseries.filter(
            (t) => new Date(t.time).getTime() > startDate.getTime()
          ),
        }}
        twoHundredSMA={{
          period: 200,
          timeseries: twoHundredSMARes.timeseries.filter(
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
  );
};

export default MarketBreadthPopoverContainer;
