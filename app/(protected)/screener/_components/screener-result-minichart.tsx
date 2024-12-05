import { CustomizableChartMALine } from "@/components/customizable-price-chart";
import ErrorCard from "@/components/error-card";
import Loading from "@/components/loading";
import { ChartSettings } from "@/components/settings/chart-settings";
import { QuoteElementSchema } from "@/lib/types/basic-types";
import {
  FMPEarningsCalendar,
  FMPEarningsCalendarSchema,
  FMPHistoricalResultsSchema,
  FMPSymbolProfile,
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
import CompactStrengthIndicator, {
  NameValuePair,
} from "./compact-rs-indicator";
import { RelativeStrengthResults } from "@/lib/types/relative-strength-types";

export interface ScreenerMiniChartWrapperProps {
  profile: FMPSymbolProfile;
  relativeStrengthResults?: RelativeStrengthResults;
  chartSettings: ChartSettings;
  theme: "light" | "dark";
  startDate: Date;
}

const ScreenerMiniChartWrapper: React.FC<ScreenerMiniChartWrapperProps> =
  React.memo(
    ({ profile, relativeStrengthResults, chartSettings, theme, startDate }) => {
      const ticker = profile.symbol;
      const barsKey = useMemo(
        () =>
          `/api/bars/${ticker}?fromDateString=${formatDateToEST(startDate)}`,
        [ticker, startDate]
      );

      const quoteKey = useMemo(() => `/api/quote/${ticker}`, [ticker]);

      const earningsKey = useMemo(() => `/api/earnings/${ticker}`, [ticker]);

      const getData = useMemo(
        () => async () => {
          const startTime = performance.now();
          const times: Record<string, number> = {};
          const [barsRes, quoteRes, earningsRes] = await Promise.all([
            fetch(barsKey).then((r) => {
              times.bars = performance.now() - startTime;
              return r;
            }),
            fetch(quoteKey).then((r) => {
              times.quote = performance.now() - startTime;
              return r;
            }),
            fetch(earningsKey).then((r) => {
              times.earnings = performance.now() - startTime;
              return r;
            }),
          ]);

          times.fetchTotal = performance.now() - startTime;

          const [barsJson, quoteJson, earningsJson] = await Promise.all([
            barsRes.json(),
            quoteRes.json(),
            earningsRes.json(),
          ]);

          times.parseTotal = performance.now() - startTime;
          console.table(times);

          // console.log('Parsed JSON:', { barsJson, quoteJson, earningsJson });

          const barsData = FMPHistoricalResultsSchema.safeParse(barsJson);
          const quoteData = QuoteElementSchema.safeParse(quoteJson);
          const earningsData =
            FMPEarningsCalendarSchema.safeParse(earningsJson);

          //console.log('Zod parsed:', { barsData, quoteData, earningsData });
          if (
            !barsData.success ||
            !quoteData.success ||
            !earningsData.success
          ) {
            console.error("Parse failures:", {
              bars: barsData.success ? "ok" : barsData.error,
              quote: quoteData.success ? "ok" : quoteData.error,
              earnings: earningsData.success ? "ok" : earningsData.error,
            });
            throw Error("Unable to fetch data");
          }

          return {
            bars: barsData.data.historical.map((h) => ({
              date: new Date(h.date).getTime(),
              dateStr: h.date,
              open: h.open,
              high: h.high,
              low: h.low,
              close: h.close,
              volume: h.volume,
            })),
            quote: quoteData.data,
            earnings: earningsData.data,
          };
        },
        [barsKey, quoteKey, earningsKey]
      );

      const { data, error, isLoading } = useQuery({
        queryKey: [ticker, "chartData"],
        queryFn: getData,
        refetchInterval: 30000, // Use the shortest interval needed (quote interval)
        staleTime: 30000,
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

      if (isLoading) {
        return <Loading />;
      }

      if (error || !data) {
        return (
          <ErrorCard
            errorMessage={`Unable to load data this timefor ${ticker}`}
          />
        );
      }

      const sortedTickerData = data.bars.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      const filteredEarnings = data.earnings
        ? filterAndSortEarningsDates(data.earnings)
        : [];

      const adjustedDates = filteredEarnings.map((e) => {
        const dateObj = new Date(e.date);
        if (e.time === "amc") {
          dateObj.setDate(dateObj.getDate() + 1);
        }
        return dateObj.toISOString().split("T")[0];
      });

      const filteredCandles = sortedTickerData.filter(
        (d) => d.date >= startDate.getTime()
      );

      if (
        data.quote &&
        data.quote.open &&
        !isFMPDataLoadingError(data.quote) &&
        filteredCandles.length > 0
      ) {
        // Add length check
        try {
          const lastCandle = filteredCandles[filteredCandles.length - 1];

          // Update the last candle with formatted values
          Object.assign(lastCandle, {
            close: Number(data.quote.price.toFixed(2)),
            open: Number(data.quote.open.toFixed(2)),
            high: Number(data.quote.dayHigh.toFixed(2)),
            low: Number(data.quote.dayLow.toFixed(2)),
          });

          // Optional: Verify the high/low make sense
          lastCandle.high = Math.max(lastCandle.high, lastCandle.close);
          lastCandle.low = Math.min(lastCandle.low, lastCandle.close);
        } catch (error) {
          console.error("Error updating last candle with quote data:", error);
        }
      }

      if (
        data.quote &&
        data.quote.open &&
        !isFMPDataLoadingError(data.quote) &&
        filteredCandles.length > 0
      ) {
        // Add length check
        try {
          const lastCandle = filteredCandles[filteredCandles.length - 1];

          // Update the last candle with formatted values
          Object.assign(lastCandle, {
            close: Number(data.quote.price.toFixed(2)),
            open: Number(data.quote.open.toFixed(2)),
            high: Number(data.quote.dayHigh.toFixed(2)),
            low: Number(data.quote.dayLow.toFixed(2)),
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
      const volAdjustedScores: NameValuePair[] = !relativeStrengthResults ? [] : [
        {
          name: "1M",
          value:
            relativeStrengthResults.volAdjustedRelativeStrengthStats.oneMonth,
        },
        {
          name: "3M",
          value:
            relativeStrengthResults.volAdjustedRelativeStrengthStats.threeMonth,
        },
        {
          name: "6M",
          value:
            relativeStrengthResults.volAdjustedRelativeStrengthStats.sixMonth,
        },
        {
          name: "1Y",
          value: relativeStrengthResults.volAdjustedRelativeStrengthStats.oneYear,
        },
      ];

      return (
        <div>
          <div className="flex items-start justify-between pt-2 pb-2">
            <div>
              <span className="font-semibold">{ticker} </span>
              {profile.companyName}
              <div className="flex space-x-1 text-sm text-foreground/50">
                <div>{profile.sector}</div>
                <div>•</div>
                <div>{profile.industry}</div>
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
    },
    (prevProps, nextProps) => {
      return (
        prevProps.profile.symbol === nextProps.profile.symbol &&
        prevProps.theme === nextProps.theme &&
        prevProps.startDate.getTime() === nextProps.startDate.getTime() &&
        JSON.stringify(prevProps.chartSettings) ===
        JSON.stringify(nextProps.chartSettings)
      );
    }
  );
ScreenerMiniChartWrapper.displayName = "ScreenerMiniChartWrapper";

export default ScreenerMiniChartWrapper;
