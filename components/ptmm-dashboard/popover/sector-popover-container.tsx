"use client";
import { useEffect, useState } from "react";
import { Candle } from "@/lib/types/basic-types";

import {
  calculateEMA,
  calculateSMA,
  isMovingAverageError,
} from "@/lib/utils/moving-average";

import { useTheme } from "next-themes";

import {
  FMPHistoricalResultsSchema,
  isFMPDataLoadingError,
} from "@/lib/types/fmp-types";
import { formatDateToEST } from "@/lib/utils/epoch-utils";
import {
  ChartSettings,
  defaultChartSettings,
} from "@/components/settings/chart-settings";
import Loading from "@/components/loading";
import ErrorCard from "@/components/error-card";
import { useQuery } from "@tanstack/react-query";
import PriceChart from "@/components/price-chart/price-chart";

export interface OffCanvasContainerPros {
  etfSymbol: string;
  name: string;
}

const SectorPopoverContainer: React.FC<OffCanvasContainerPros> = ({
  etfSymbol,
  name,
}) => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const chartTheme = theme === "dark" ? "dark" : "light";
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

  const barsKey = `/api/bars/${etfSymbol}?fromDateString=${formatDateToEST(
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

  const { data, error, status } = useQuery({
    queryKey: [barsKey],
    queryFn: getBars,
    refetchInterval: 60000,
  });

  const bgColor = theme === "light" ? "white" : "black";

  if (status === "pending" || !theme || !mounted) {
    return (
      <div className="h-[32rem] pt-4">
        <Loading />
      </div>
    );
  }
  if (error || !data || isFMPDataLoadingError(data)) {
    return <ErrorCard errorMessage={`Unable to load data for ${etfSymbol}`} />;
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
    return (
      <ErrorCard errorMessage={`Unable to calcualte MAs for ${etfSymbol}`} />
    );
  }

  return (
    <div
      style={{
        zIndex: 1000,
        outline: "none",
      }}
      className={`bg-${bgColor}  `}
    >
      <div className={`mb-2 pb-2 border-b border-foreground`}>
        <div>
          <span className="font-semibold">{etfSymbol} </span>
          &nbsp;{name}
        </div>
      </div>
      <PriceChart
        className="h-[30rem] mt-1"
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
        showVolume={!etfSymbol.includes("^")}
        ticker={etfSymbol}
        earningsDates={[]}
        chartSettings={chartSettings}
        theme={chartTheme}
      />
    </div>
  );
};

export default SectorPopoverContainer;
