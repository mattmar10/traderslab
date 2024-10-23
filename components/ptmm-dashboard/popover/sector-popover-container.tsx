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
  defaultSettings,
} from "@/components/settings/chart-settings";
import Loading from "@/components/loading";
import ErrorCard from "@/components/error-card";
import { useQuery } from "react-query";

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

  if (status === "loading" || !theme || !mounted) {
    return (
      <div
        style={{ width: "640px" }}
        className={`p-4 rounded shadow-lg border border-foreground/70 bg-${bgColor} h-96`}
      >
        <div className={`mb-2 pb-2 border-b border-foreground`}>
          <div>
            <span className="font-semibold">{etfSymbol} </span>
            {name}
          </div>
        </div>
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
      className={`p-4 rounded shadow-lg border border-foreground/70 bg-${bgColor} `}
    >
      <div className={`mb-2 pb-2 border-b border-foreground`}>
        <div>
          <span className="font-semibold">{etfSymbol} </span>
          &nbsp;{name}
        </div>
      </div>
      <div className="h-96">price chart</div>
    </div>
  );
};

export default SectorPopoverContainer;
