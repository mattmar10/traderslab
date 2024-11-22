import { CustomizableChartMALine } from "@/components/customizable-price-chart";
import ErrorCard from "@/components/error-card";
import Loading from "@/components/loading";
import { ChartSettings } from "@/components/settings/chart-settings";
import { Candle, QuoteElementSchema } from "@/lib/types/basic-types";
import {
  FMPEarningsCalendar,
  FMPEarningsCalendarSchema,
  FMPHistoricalResultsSchema,
  isFMPDataLoadingError,
} from "@/lib/types/fmp-types";
import { formatDateToEST } from "@/lib/utils/epoch-utils";
import {
  calculateEMA,
  calculateSMA,
  isMovingAverageError,
} from "@/lib/utils/moving-average";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { useMemo } from "react";
import ScreenerMiniChart from "./screener-minichart";
import { SymbolWithStatsWithRank } from "@/lib/types/screener-types";
import CompactStrengthIndicator, {
  NameValuePair,
} from "./compact-rs-indicator";

export interface ScreenerMiniChartWrapperProps {
  item: SymbolWithStatsWithRank;
  chartSettings: ChartSettings;
  theme: "light" | "dark";
  startDate: Date;
}

const ScreenerMiniChartWrapper: React.FC<ScreenerMiniChartWrapperProps> =
  React.memo(({ item, chartSettings, theme, startDate }) => {
    const ticker = item.quote.symbol;
    const barsKey = useMemo(
      () => `/api/bars/${ticker}?fromDateString=${formatDateToEST(startDate)}`,
      [ticker, startDate]
    );

    const quoteKey = useMemo(() => `/api/quote/${ticker}`, [ticker]);

    const earningsKey = useMemo(() => `/api/earnings/${ticker}`, [ticker]);

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

    const {
      data: barsData,
      error: barsError,
      isLoading: barsIsLoading,
    } = useQuery({
      queryKey: [barsKey, ticker],
      queryFn: getBars,
      refetchOnWindowFocus: false,
      refetchInterval: 120000,
      staleTime: 120000,
    });

    const getQuoteApi = async () => {
      const res = await fetch(quoteKey);
      const parsed = QuoteElementSchema.safeParse(await res.json());
      if (!parsed.success) {
        return "Unable to parse quote results";
      } else {
        return parsed.data;
      }
    };

    const {
      data: quoteData,
      error: quoteError,
      isLoading: quoteIsLoading,
    } = useQuery({
      queryKey: [quoteKey, ticker],
      queryFn: getQuoteApi,
      refetchInterval: 30000,
      staleTime: 30000, // Add staleTime to prevent unnecessary refetches
    });

    const getEarningsApi = async () => {
      const response = await fetch(earningsKey);
      const data = await response.json();
      const parsed = FMPEarningsCalendarSchema.safeParse(data);
      if (!parsed.success) {
        throw Error("Unable to fetch quote");
      }
      return parsed.data;
    };

    const { data: earningsData, isLoading: earningsLoading } = useQuery({
      queryKey: [earningsKey, ticker],
      queryFn: getEarningsApi,
      refetchOnWindowFocus: false,
      refetchInterval: 3600000,
      staleTime: 3600000,
    });

    const filterAndSortEarningsDates = (
      earningsCalendar: FMPEarningsCalendar
    ) => {
      const currentDate = new Date();

      const filteredSortedDates = earningsCalendar
        .filter((item) => {
          const dateObj = new Date(item.date);
          if (item.time === "amc") {
            dateObj.setDate(dateObj.getDate() + 1);
          }
          return (
            dateObj.getTime() > startDate.getTime() &&
            dateObj.getTime() <= currentDate.getTime()
          );
        })
        .sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          if (a.time === "amc") dateA.setDate(dateA.getDate() + 1);
          if (b.time === "amc") dateB.setDate(dateB.getDate() + 1);
          return dateA.getTime() - dateB.getTime();
        });

      return filteredSortedDates;
    };

    if (barsIsLoading || quoteIsLoading || earningsLoading) {
      return <Loading />;
    }

    if (
      barsError ||
      !barsData ||
      isFMPDataLoadingError(earningsData) ||
      quoteError ||
      !quoteData ||
      isFMPDataLoadingError(quoteData)
    ) {
      return <ErrorCard errorMessage={`Unable to load data for ${ticker}`} />;
    }

    const sortedTickerData = barsData.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const filteredEarnings = earningsData
      ? filterAndSortEarningsDates(earningsData)
      : [];

    const adjustedDates = filteredEarnings.map((e) => {
      const dateObj = new Date(e.date);
      if (e.time === "amc") {
        dateObj.setDate(dateObj.getDate() + 1);
      }
      return dateObj.toISOString().split("T")[0];
    });

    const filteredCandles = barsData.filter(
      (d) => d.date >= startDate.getTime()
    );

    if (
      quoteData &&
      quoteData.open &&
      !isFMPDataLoadingError(quoteData) &&
      filteredCandles.length > 0
    ) {
      // Add length check
      try {
        const lastCandle = filteredCandles[filteredCandles.length - 1];

        // Update the last candle with formatted values
        Object.assign(lastCandle, {
          close: Number(quoteData.price.toFixed(2)),
          open: Number(quoteData.open.toFixed(2)),
          high: Number(quoteData.dayHigh.toFixed(2)),
          low: Number(quoteData.dayLow.toFixed(2)),
        });

        // Optional: Verify the high/low make sense
        lastCandle.high = Math.max(lastCandle.high, lastCandle.close);
        lastCandle.low = Math.min(lastCandle.low, lastCandle.close);
      } catch (error) {
        console.error("Error updating last candle with quote data:", error);
      }
    }

    if (
      quoteData &&
      quoteData.open &&
      !isFMPDataLoadingError(quoteData) &&
      filteredCandles.length > 0
    ) {
      // Add length check
      try {
        const lastCandle = filteredCandles[filteredCandles.length - 1];

        // Update the last candle with formatted values
        Object.assign(lastCandle, {
          close: Number(quoteData.price.toFixed(2)),
          open: Number(quoteData.open.toFixed(2)),
          high: Number(quoteData.dayHigh.toFixed(2)),
          low: Number(quoteData.dayLow.toFixed(2)),
        });

        // Optional: Verify the high/low make sense
        lastCandle.high = Math.max(lastCandle.high, lastCandle.close);
        lastCandle.low = Math.min(lastCandle.low, lastCandle.close);
      } catch (error) {
        console.error("Error updating last candle with quote data:", error);
      }
    }

    const priceMovingAverages: CustomizableChartMALine[] =
      chartSettings.priceMovingAverages
        .map((ma) => {
          const timeseries =
            ma.type === "SMA"
              ? calculateSMA(sortedTickerData, ma.period)
              : calculateEMA(sortedTickerData, ma.period);

          if (isMovingAverageError(timeseries)) {
            console.error(`Error calculating ${ma.type} ${ma.period}`);
            return null;
          }

          return {
            period: ma.period,
            type: ma.type,
            color: ma.color,
            timeseries: timeseries.timeseries.filter(
              (t) => new Date(t.time).getTime() > startDate.getTime()
            ),
          };
        })
        .filter((ma): ma is CustomizableChartMALine => ma !== null);

    let volumeMovingAverage: CustomizableChartMALine | undefined;
    if (chartSettings.volumeMA.enabled) {
      const volumeMA =
        chartSettings.volumeMA.type === "SMA"
          ? calculateSMA(
              sortedTickerData,
              chartSettings.volumeMA.period,
              (c) => c.volume
            )
          : calculateEMA(
              sortedTickerData,
              chartSettings.volumeMA.period,
              (c) => c.volume
            );

      if (!isMovingAverageError(volumeMA)) {
        volumeMovingAverage = {
          period: chartSettings.volumeMA.period,
          type: chartSettings.volumeMA.type,
          color: chartSettings.volumeMA.color,
          timeseries: volumeMA.timeseries.filter(
            (t) => new Date(t.time).getTime() > startDate.getTime()
          ),
        };
      }
    }
    const volAdjustedScores: NameValuePair[] = [
      {
        name: "1M",
        value: item.relativeStrength.volAdjustedRelativeStrengthStats.oneMonth,
      },
      {
        name: "3M",
        value:
          item.relativeStrength.volAdjustedRelativeStrengthStats.threeMonth,
      },
      {
        name: "6M",
        value: item.relativeStrength.volAdjustedRelativeStrengthStats.sixMonth,
      },
      {
        name: "1Y",
        value: item.relativeStrength.volAdjustedRelativeStrengthStats.oneYear,
      },
    ];

    return (
      <div>
        <div className="flex items-start justify-between pt-2 pb-2">
          <div>
            <span className="font-semibold">{ticker} </span>
            {item.profile.companyName}
            <div className="flex space-x-1 text-sm text-foreground/50">
              <div>{item.profile.sector}</div>
              <div>•</div>
              <div>{item.profile.industry}</div>
            </div>
          </div>

          <div className=" text-sm">
            <CompactStrengthIndicator
              scores={volAdjustedScores}
              theme={theme}
            />
          </div>
        </div>
        <ScreenerMiniChart
          className="h-[30rem]"
          candles={sortedTickerData}
          priceMovingAverages={priceMovingAverages}
          volumeMovingAverage={volumeMovingAverage}
          showVolume={true}
          ticker={ticker}
          earningsDates={adjustedDates}
          chartSettings={chartSettings}
          theme={theme}
        />
      </div>
    );
  });
ScreenerMiniChartWrapper.displayName = "ScreenerMiniChartWrapper";

export default ScreenerMiniChartWrapper;
