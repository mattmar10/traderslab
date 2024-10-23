"use client";

import { Candle } from "@/lib/types/basic-types";
import { useEffect, useRef, useState } from "react";
import {
  ColorType,
  CrosshairMode,
  createChart,
  ISeriesApi,
} from "lightweight-charts";

import { ChartSettings } from "@/components/settings/chart-settings";
import { MovingAverageLine } from "@/lib/utils/moving-average";
import { Fira_Code } from "next/font/google";
import { adrPercent, isADRPercentError } from "@/lib/indicators/adr-percent";
import {
  ATRMultipFromFiftySMAPoint,
  calcATRPercentMultipleFromFiftySMA,
  isPricePoint,
  PricePoint,
} from "@/lib/types/price-chart-types";

import { atr } from "@/lib/indicators/atr";
import { calculateSMAForChart } from "@/lib/indicators/moving-avg";
import { match } from "@/lib/utils";
import { calculateGreenOrRed } from "@/lib/utils/table-utils";
export interface PriceChartProps {
  candles: Candle[];
  tenEMA: MovingAverageLine;
  twentyOneEMA: MovingAverageLine;
  fiftySMA: MovingAverageLine;
  twoHundredSMA: MovingAverageLine;
  showVolume: boolean;
  ticker: string;
  earningsDates: string[];
  className?: string;
  chartSettings: ChartSettings;
  theme: string;
}

const firaCode = Fira_Code({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const PriceChart: React.FC<PriceChartProps> = ({
  candles,
  tenEMA,
  twentyOneEMA,
  fiftySMA,
  twoHundredSMA,
  showVolume,
  ticker,
  earningsDates,
  className,
  chartSettings,
  theme,
}: PriceChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReturnType<typeof createChart>>();
  const [priceSeries, setPriceSeries] = useState<
    ISeriesApi<"Candlestick"> | ISeriesApi<"Bar">
  >();
  const [volumeSeries, setVolumeSeries] = useState<ISeriesApi<"Histogram">>();
  const [volumeSMASeries, setVolumeSMASeries] = useState<ISeriesApi<"Line">>();
  const [tenEMASeries, setTenEMASeries] = useState<ISeriesApi<"Line">>();
  const [twentyOneEMASeries, setTwentyOneEMASeries] =
    useState<ISeriesApi<"Line">>();
  const [fiftySMASeries, setFiftySMASeries] = useState<ISeriesApi<"Line">>();
  /*const [lastCrossHairPoint, setLastCrossHairPoint] = useState<
    LastCrosshairPoint | undefined
  >(undefined);*/

  const adrP = adrPercent(candles, 20);

  const last = candles[candles.length - 1];
  const prev = candles[candles.length - 2];
  const pChange = (last.close - prev.close) / prev.close;

  const [currentPricePoint, setCurrentPricePoint] = useState<PricePoint>({
    ...last,
    time: last.dateStr!,
  });

  const [cursorPercentChange, setCursorPercentChange] =
    useState<number>(pChange);

  const bgColor = theme === "light" ? "white" : "black";
  const gridColor = theme === "light" ? "#F0F0F0" : "#333";

  const chartOptions = {
    layout: {
      textColor: theme === "light" ? "black" : "white",
      background: { type: ColorType.Solid, color: bgColor },
    },
    rightPriceScale: {
      borderColor: "gray",
    },
    timeScale: {
      borderColor: "gray",
      rightOffset: 10,
    },
    grid: {
      vertLines: { color: gridColor },
      horzLines: { color: gridColor },
    },
    autoSize: true,
    crosshair: {
      mode: CrosshairMode.Normal,
    },
  };
  useEffect(() => {
    const chart = createChart(chartContainerRef.current!, chartOptions);
    chartRef.current = chart;

    if (showVolume) {
      const newVolumeSeries = chartRef.current.addHistogramSeries({
        priceFormat: {
          type: "volume",
        },
        priceLineVisible: false,
        priceScaleId: "volume",
      });

      setVolumeSeries(newVolumeSeries);

      const volumeMASeries = chartRef.current.addLineSeries({
        lineWidth: 1,
        title: `Volume MA`,
        color: "#d33682",
        priceLineVisible: false,
        priceScaleId: "volume",
        crosshairMarkerVisible: false,
      });
      setVolumeSMASeries(volumeMASeries);

      chartRef.current.priceScale("volume").applyOptions({
        scaleMargins: {
          top: 0.7,
          bottom: 0,
        },
      });
    }

    const tenEMASeries = chartRef.current.addLineSeries({
      lineWidth: 1,
      title: `10 EMA`,
      color: "#888",
      priceLineVisible: false,
      crosshairMarkerVisible: false,
    });
    setTenEMASeries(tenEMASeries);

    const twentyOneEMASeries = chartRef.current.addLineSeries({
      lineWidth: 1,
      title: `21 EMA`,
      color: "#268bd2",
      priceLineVisible: false,
      crosshairMarkerVisible: false,
    });
    setTwentyOneEMASeries(twentyOneEMASeries);

    const fiftySMASeries = chartRef.current.addLineSeries({
      lineWidth: 1,
      title: `50 SMA`,
      color: "#b58900",
      priceLineVisible: false,
      crosshairMarkerVisible: false,
    });
    setFiftySMASeries(fiftySMASeries);

    const newPriceSeries =
      chartSettings.seriesType === "candlestick"
        ? chart.addCandlestickSeries({
            upColor: chartSettings.upColor,
            downColor: chartSettings.downColor,
            wickUpColor: chartSettings.wickUpColor,
            wickDownColor: chartSettings.wickDownColor,
            borderUpColor: chartSettings.upBorderColor,
            borderDownColor: chartSettings.downBorderColor,
            borderVisible: true,
            lastValueVisible: false,
            priceLineVisible: false,
            priceLineStyle: 2,
            priceLineColor: "purple",
          })
        : chart.addBarSeries({
            upColor: chartSettings.upColor,
            downColor: chartSettings.downColor,
            thinBars: chartSettings.useThinBars,
            lastValueVisible: false,
            priceLineVisible: false,
            priceLineStyle: 2,
            priceLineColor: "purple",
          });

    setPriceSeries(newPriceSeries);

    chart.subscribeCrosshairMove((param) => {
      /*if (param.time && param.point) {
          const x = param.time;
        const y = newPriceSeries.coordinateToPrice(param.point.y);

        const cursorPoint: LastCrosshairPoint = {
          x: x.toString(),
          y: y,
        };

        setLastCrossHairPoint(cursorPoint);
      } else if (param.logical && param.point) {
        const newDate = new Date(initialDate);
        newDate.setDate(newDate.getDate() + param.logical);

        const y = newPriceSeries.coordinateToPrice(param.point.y);

        const cursorPoint: LastCrosshairPoint = {
          x: formatDateToEST(newDate),
          y: y,
        };

        setLastCrossHairPoint(cursorPoint);
      }*/

      if (param.time) {
        const data = param.seriesData.get(newPriceSeries);
        if (isPricePoint(data)) {
          setCurrentPricePoint(data);

          const candleIndex = candles.findIndex(
            (c) => c.dateStr! === param.time
          );

          if (candleIndex > 0) {
            const candle = candles[candleIndex];
            const prev = candles[candleIndex - 1];

            const percentChange = (candle.close - prev.close) / prev.close;
            setCursorPercentChange(percentChange);
          }
        }
      }
    });

    chartContainerRef.current!.addEventListener("mouseleave", () => {
      setCurrentPricePoint({
        ...last,
        time: last.dateStr!,
      });
      setCursorPercentChange(pChange);
    });

    return () => {
      chart.remove();
    };
  }, [theme, chartSettings, showVolume]);

  useEffect(() => {
    if (chartRef.current && priceSeries && candles && candles.length > 0) {
      const bars = candles.map((c) => ({
        time: c.dateStr!,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }));

      const percentFromFiftySMATimeseries: ATRMultipFromFiftySMAPoint[] = [];

      if (bars.length > 14) {
        for (let i = 14; i < candles.length; i++) {
          const past14Bars = candles.slice(i - 14, i);
          const atrValue = atr(past14Bars, 14);
          const fiftySMAVal = fiftySMA.timeseries.find(
            (f) => f.time === candles[i].dateStr
          );

          if (atrValue && fiftySMAVal) {
            const percentAway = calcATRPercentMultipleFromFiftySMA(
              candles[i].close,
              fiftySMAVal.value,
              atrValue.timeseries[atrValue.timeseries.length - 1].value
            );

            percentFromFiftySMATimeseries.push({
              time: candles[i].dateStr!,
              atr: atrValue.timeseries[atrValue.timeseries.length - 1].value,
              percentFromFiftySMA: percentAway || 0,
            });
          }
        }
      }

      const waterMarkColor =
        theme === "light"
          ? "rgba(128, 128, 128, 0.1)"
          : "rgba(128, 128, 128, 0.25)";

      chartRef.current.applyOptions({
        watermark: {
          visible: true,
          fontSize: 72,
          horzAlign: "center",
          vertAlign: "center",
          color: waterMarkColor,
          text: ticker,
        },
      });

      priceSeries.setData(bars);

      const markers = percentFromFiftySMATimeseries
        .filter((point) => point.percentFromFiftySMA > 8)
        .map((point) => ({
          time: point.time,
          position: "aboveBar" as const,
          color: "rgba(255, 82, 82, .50)",
          shape: "circle" as const,
        }));

      priceSeries.setMarkers(markers);

      if (showVolume && volumeSeries) {
        const volColor = theme === "light" ? "#e4e4e4" : gridColor;
        const volumeBars = candles.map((c) => ({
          time: c.dateStr!,
          value: c.volume,
          color: earningsDates?.includes(c.dateStr!)
            ? "rgba(38, 139, 210, 0.4)"
            : volColor,
        }));

        volumeSeries.setData(volumeBars);

        if (volumeSMASeries) {
          const smaData = calculateSMAForChart(candles, 50, (c) => c.volume);

          match(
            smaData,
            (err) => console.error(err),
            (smaResults) => {
              const filteredDates = candles.map((c) => c.dateStr);

              volumeSMASeries.setData(
                smaResults.filter((d) => filteredDates.includes(d.time))
              );
            }
          );
        }
      }

      priceSeries.priceScale().applyOptions({
        scaleMargins: {
          top: 0.15,
          bottom: 0.1,
        },
      });

      tenEMASeries?.setData(tenEMA.timeseries);
      twentyOneEMASeries?.setData(twentyOneEMA.timeseries);
      fiftySMASeries?.setData(fiftySMA.timeseries);

      chartRef.current.timeScale().setVisibleLogicalRange({
        from: candles.length - 80,
        to: candles.length,
      });
      chartRef.current.timeScale().applyOptions({
        rightOffset: 8,
      });
    }
  }, [
    priceSeries,
    chartContainerRef,
    candles,
    theme,
    ticker,
    earningsDates,
    showVolume,
  ]);

  const lastPrice = candles[candles.length - 1].close;
  const percentChange = Number(
    (100 * (lastPrice - candles[candles.length - 2].close)) /
      candles[candles.length - 2].close
  ).toFixed(2);

  const greaterThanFiftySMA =
    lastPrice > fiftySMA.timeseries[fiftySMA.timeseries.length - 1].value;

  const greatherThanTwentyOneEMA =
    lastPrice >
    twentyOneEMA.timeseries[twentyOneEMA.timeseries.length - 1].value;

  const greaterThanTenEMA =
    lastPrice > tenEMA.timeseries[tenEMA.timeseries.length - 1].value;

  const greaterThanFiftyBG = calculateGreenOrRed(
    theme === "dark" ? "dark" : "light",
    lastPrice > fiftySMA.timeseries[fiftySMA.timeseries.length - 1].value
  );

  const greaterThanTwentyOneBG = calculateGreenOrRed(
    theme === "dark" ? "dark" : "light",
    lastPrice >
      twentyOneEMA.timeseries[twentyOneEMA.timeseries.length - 1].value
  );

  const greaterThanTenBG = calculateGreenOrRed(
    theme === "dark" ? "dark" : "light",
    lastPrice > tenEMA.timeseries[tenEMA.timeseries.length - 1].value
  );

  const tenGreaterThanTwentyOne =
    tenEMA.timeseries[tenEMA.timeseries.length - 1].value >
    twentyOneEMA.timeseries[twentyOneEMA.timeseries.length - 1].value;

  const twentyOneGreaterThanFifty =
    twentyOneEMA.timeseries[twentyOneEMA.timeseries.length - 1].value >
    fiftySMA.timeseries[fiftySMA.timeseries.length - 1].value;

  const twentyOneGreaterThanFiftyBG = calculateGreenOrRed(
    theme === "dark" ? "dark" : "light",
    twentyOneGreaterThanFifty
  );

  const tenGreaterThanTwentyOneBG = calculateGreenOrRed(
    theme === "dark" ? "dark" : "light",
    tenGreaterThanTwentyOne
  );

  const fiftyGreaterThanTwoHundredSMA =
    fiftySMA.timeseries[fiftySMA.timeseries.length - 1].value >
    twoHundredSMA.timeseries[twoHundredSMA.timeseries.length - 1].value;

  const fiftyGreaterThanTwoHundredSMABG = calculateGreenOrRed(
    theme === "dark" ? "dark" : "light",
    fiftyGreaterThanTwoHundredSMA
  );

  const changeColor = Number(percentChange) >= 0 ? "green" : "red";

  const ohlcBGColor = theme === "dark" ? "black" : "white";
  const cursorChangeColor = cursorPercentChange >= 0 ? "green" : "red";
  return (
    <>
      <div>
        <div className=" mx-1 mb-2 h-7 ">
          <table className="w-full table-auto text-xs">
            <thead>
              <tr className="border-b border-foreground/70">
                <th className=" border-r border-foreground/70 px-2 py-2">
                  PRICE
                </th>
                <th className="border-r border-foreground/70 px-2 py-2 text-right">
                  1D CHANGE
                </th>
                <th className=" border-r border-foreground/70 px-2 py-2 text-right">
                  &gt;50 SMA
                </th>
                <th className=" border-r border-foreground/70 px-2 py-2 text-right">
                  &gt;21 EMA
                </th>
                <th className=" border-r border-foreground/70 px-2 py-2 text-right">
                  &gt;10 EMA
                </th>
                <th className=" border-r border-foreground/70 px-2 py-2 text-right">
                  10 EMA&gt;21 EMA
                </th>
                <th className=" border-r border-foreground/70 px-2 py-2 text-right">
                  21 EMA&gt;50 SMA
                </th>
                <th className=" px-2 py-2 text-right">50 SMA&gt;200 SMA</th>
              </tr>
            </thead>
            <tbody className="text-xs ">
              <tr className={`${firaCode.className} "`}>
                <td className="px-2 py-1.5 text-right">
                  {lastPrice.toFixed(2)}
                </td>
                <td
                  className="px-2 py-1.5 text-right font-semibold"
                  style={{
                    color: changeColor,
                  }}
                >
                  {percentChange}%
                </td>
                <td
                  className="px-2 py-1.5 text-right"
                  style={{
                    background: greaterThanFiftyBG,
                  }}
                >
                  {greaterThanFiftySMA ? "TRUE" : "FALSE"}
                </td>
                <td
                  className="px-2 py-1.5 text-right"
                  style={{
                    background: greaterThanTwentyOneBG,
                  }}
                >
                  {greatherThanTwentyOneEMA ? "TRUE" : "FALSE"}
                </td>

                <td
                  className="px-2 py-1.5 text-right"
                  style={{
                    background: greaterThanTenBG,
                  }}
                >
                  {greaterThanTenEMA ? "TRUE" : "FALSE"}
                </td>
                <td
                  className="px-2 py-1.5 text-right"
                  style={{
                    background: tenGreaterThanTwentyOneBG,
                  }}
                >
                  {tenGreaterThanTwentyOne ? "TRUE" : "FALSE"}
                </td>
                <td
                  className="px-2 py-1.5 text-right"
                  style={{
                    background: twentyOneGreaterThanFiftyBG,
                  }}
                >
                  {twentyOneGreaterThanFifty ? "TRUE" : "FALSE"}
                </td>
                <td
                  className="px-2 py-1.5 text-right"
                  style={{
                    background: fiftyGreaterThanTwoHundredSMABG,
                  }}
                >
                  {fiftyGreaterThanTwoHundredSMA ? "TRUE" : "FALSE"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className={`relative ${className}`}>
        <div
          ref={chartContainerRef}
          className={`mt-10 mr-[-1rem] h-full`}
        ></div>

        <div
          className="absolute top-1 left-2 z-20 flex justify-between text-sm text-foreground/95 "
          style={{ background: ohlcBGColor, width: "90%" }}
        >
          <div>
            {`O:${currentPricePoint.open.toFixed(
              2
            )} H:${currentPricePoint.high.toFixed(
              2
            )} L:${currentPricePoint.low.toFixed(
              2
            )} C:${currentPricePoint.close.toFixed(2)} `}
            <span
              className="font-semibold"
              style={{ color: cursorChangeColor }}
            >
              {(cursorPercentChange * 100).toFixed(2)}%
            </span>
          </div>
          {ticker.includes("^") && (
            <div className="absolute top-5 mt-1 left-0 z-20 text-sm text-foreground/50">
              Data delayed up to 15 min.
            </div>
          )}
          {adrP && !isADRPercentError(adrP) && (
            <div>
              <span className="w-24">ADR%:</span> {adrP.toFixed(2)}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PriceChart;
