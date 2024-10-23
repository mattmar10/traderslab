"use client";

import { Candle } from "@/lib/types/basic-types";
import { useEffect, useRef, useState } from "react";
import { ColorType, createChart } from "lightweight-charts";

import { Fira_Code } from "next/font/google";

import {
  Accordion,
  AccordionContent,
  AccordionTrigger,
  AccordionItem,
} from "@/components/ui/accordion";

import { ChartSettings } from "@/components/settings/chart-settings";
import { MovingAverageLine } from "@/lib/utils/moving-average";
import { adrPercent, isADRPercentError } from "@/lib/indicators/adr-percent";
import { match } from "@/lib/utils";
import { calculateGreenOrRed } from "@/lib/utils/table-utils";
import { calculateSMAForChart } from "@/lib/indicators/moving-avg";

export interface MobilePriceChartProps {
  candles: Candle[];
  tenEMA: MovingAverageLine;
  twentyOneEMA: MovingAverageLine;
  fiftySMA: MovingAverageLine;
  twoHundredSMA: MovingAverageLine;
  ticker: string;
  chartSettings: ChartSettings;
  theme: string;
}

const firaCode = Fira_Code({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

interface PricePoint {
  open: number;
  high: number;
  low: number;
  close: number;
  time: string;
}

const MobilePriceChart: React.FC<MobilePriceChartProps> = ({
  candles,
  tenEMA,
  twentyOneEMA,
  fiftySMA,
  twoHundredSMA,
  ticker,
  chartSettings,
  theme,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReturnType<typeof createChart>>();
  const [priceSeries, setPriceSeries] = useState<any>();
  const [volumeSeries, setVolumeSeries] = useState<any>();
  const [volumeSMASeries, setVolumeSMASeries] = useState<any>();
  const [tenEMASeries, setTenEMASeries] = useState<any>();
  const [twentyOneEMASeries, setTwentyOneEMASeries] = useState<any>();
  const [fiftySMASeries, setFiftySMASeries] = useState<any>();

  const last = candles[candles.length - 1];
  const prev = candles[candles.length - 2];
  const pChange = (last.close - prev.close) / prev.close;
  const [cursorPercentChange, setCursorPercentChange] =
    useState<number>(pChange);
  const cursorChangeColor = cursorPercentChange >= 0 ? "green" : "red";
  const ohlcBGColor = theme === "dark" ? "black" : "white";

  const [currentPricePoint, setCurrentPricePoint] = useState<PricePoint>({
    ...last,
    time: last.dateStr!,
  });

  const bgColor = theme === "light" ? "white" : "black";
  const gridColor = theme === "light" ? "#F0F0F0" : "#333";

  const adrP = adrPercent(candles, 20);

  useEffect(() => {
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
        mode: 1,
      },
    };
    const chart = createChart(chartContainerRef.current!, chartOptions);
    chartRef.current = chart;

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
        ? chartRef.current.addCandlestickSeries({
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
        : chartRef.current.addBarSeries({
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
      if (param.time) {
        const data = param.seriesData.get(newPriceSeries) as PricePoint;
        setCurrentPricePoint(data);

        const candleIndex = candles.findIndex((c) => c.dateStr! === param.time);

        if (candleIndex > 0) {
          const candle = candles[candleIndex];
          const prev = candles[candleIndex - 1];

          const percentChange = (candle.close - prev.close) / prev.close;
          setCursorPercentChange(percentChange);
        }
      }
    });

    return () => {
      chart.remove();
    };
  }, [theme, chartSettings]);

  useEffect(() => {
    if (chartRef.current && priceSeries && candles && candles.length > 0) {
      const bars = candles.map((c) => ({
        time: c.dateStr,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }));

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

      const volColor = theme === "light" ? "#e4e4e4" : gridColor;
      const volumeBars = candles.map((c) => ({
        time: c.dateStr,
        value: c.volume,
        color: volColor,
      }));

      const smaData = calculateSMAForChart(candles, 50, (c) => c.volume);

      match(
        smaData,
        (err) => console.error(err),
        (smaResults) => {
          const filteredDates = candles.map((c) => c.dateStr);

          volumeSMASeries?.setData(
            smaResults.filter((d) => filteredDates.includes(d.time))
          );
        }
      );

      priceSeries?.setData(bars);

      priceSeries?.priceScale().applyOptions({
        scaleMargins: {
          top: 0.1,
          bottom: 0.2,
        },
      });

      volumeSeries?.priceScale().applyOptions({
        scaleMargins: {
          top: 0.7,
          bottom: 0,
        },
      });
      volumeSeries?.setData(volumeBars);
      tenEMASeries?.setData(tenEMA.timeseries);
      twentyOneEMASeries?.setData(twentyOneEMA.timeseries);
      fiftySMASeries?.setData(fiftySMA.timeseries);
    }
  }, [priceSeries, chartContainerRef, candles, theme]);

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

  return (
    <>
      <div className="flex gap-1">
        <div className={`text-xl font-semibold`}>${lastPrice}</div>
        <div
          className={`text-xl font-semibold`}
          style={{
            color: changeColor,
          }}
        >
          {percentChange}%
        </div>
      </div>
      <Accordion
        type="single"
        collapsible
        className="w-full"
        defaultValue="trend-model"
      >
        <AccordionItem value="trend-model">
          <AccordionTrigger className="font-semibold">
            Trend Model
          </AccordionTrigger>
          <AccordionContent>
            <div className="mt-1 pb-4 border-b border-foreground/20">
              <div
                className="flex justify-between px-2"
                style={{
                  background: greaterThanTenBG,
                }}
              >
                <div className={`${firaCode.className} text-sm p-1 "`}>
                  &gt; 10 EMA{" "}
                </div>
                <div className={`${firaCode.className} text-sm p-1 "`}>
                  {greaterThanTenEMA ? "TRUE" : "FALSE"}
                </div>
              </div>
              <div
                className="flex justify-between px-2"
                style={{
                  background: greaterThanTwentyOneBG,
                }}
              >
                <div className={`${firaCode.className} text-sm p-1 "`}>
                  &gt; 21 EMA{" "}
                </div>
                <div className={`${firaCode.className} text-sm p-1 "`}>
                  {greatherThanTwentyOneEMA ? "TRUE" : "FALSE"}
                </div>
              </div>
              <div
                className="flex justify-between px-2"
                style={{
                  background: greaterThanFiftyBG,
                }}
              >
                <div className={`${firaCode.className} text-sm p-1 "`}>
                  &gt; 50 SMA{" "}
                </div>
                <div className={`${firaCode.className} text-sm p-1 "`}>
                  {greaterThanFiftySMA ? "TRUE" : "FALSE"}
                </div>
              </div>
              <div
                className="flex justify-between px-2"
                style={{
                  background: tenGreaterThanTwentyOneBG,
                }}
              >
                <div className={`${firaCode.className} text-sm p-1 "`}>
                  10 EMA &gt; 21 EMA{" "}
                </div>
                <div className={`${firaCode.className} text-sm p-1 "`}>
                  {tenGreaterThanTwentyOne ? "TRUE" : "FALSE"}
                </div>
              </div>
              <div
                className="flex justify-between px-2"
                style={{
                  background: twentyOneGreaterThanFiftyBG,
                }}
              >
                <div className={`${firaCode.className} text-sm p-1 "`}>
                  21 EMA &gt; 50 SMA{" "}
                </div>
                <div className={`${firaCode.className} text-sm p-1 "`}>
                  {twentyOneGreaterThanFifty ? "TRUE" : "FALSE"}
                </div>
              </div>
              <div
                className="flex justify-between px-2 "
                style={{
                  background: fiftyGreaterThanTwoHundredSMABG,
                }}
              >
                <div className={`${firaCode.className} text-sm p-1 "`}>
                  50 SMA &gt; 200 SMA{" "}
                </div>
                <div className={`${firaCode.className} text-sm p-1 "`}>
                  {fiftyGreaterThanTwoHundredSMA ? "TRUE" : "FALSE"}
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {ticker.includes("^") && (
        <div className="top-5 mt-2 pl-2 text-sm text-foreground/50">
          Data delayed up to 15 min.
        </div>
      )}
      <div className="h-96 relative">
        <div ref={chartContainerRef} className={`mt-1 mr-[-1rem] h-96`}></div>

        <div
          className="absolute top-1 left-2 z-20 flex justify-between text-xs text-foreground/95 "
          style={{ background: ohlcBGColor, width: "75%" }}
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
        </div>
        {adrP && !isADRPercentError(adrP) && (
          <div
            className="absolute top-10 left-2 z-20 flex space-x-1 text-xs text-foreground/95 "
            style={{ background: ohlcBGColor, width: "20%" }}
          >
            <span className="">ADR%: {adrP.toFixed(2)}</span>
          </div>
        )}
      </div>
    </>
  );
};

export default MobilePriceChart;
