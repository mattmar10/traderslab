import AVWAPMenu from "@/components/avwap-menu";
import { CustomizableChartMALine } from "@/components/customizable-price-chart";
import { ChartSettings } from "@/components/settings/chart-settings";
import { adrPercent, isADRPercentError } from "@/lib/indicators/adr-percent";
import { Candle } from "@/lib/types/basic-types";
import {
  isPricePoint,
  LastCrosshairPoint,
  PricePoint,
} from "@/lib/types/price-chart-types";
import { formatDateToEST } from "@/lib/utils/epoch-utils";
import {
  ColorType,
  createChart,
  CrosshairMode,
  ISeriesApi,
  LineData,
  MouseEventParams,
  Time,
} from "lightweight-charts";
import { useEffect, useRef, useState } from "react";

interface StoredAVWAPData {
  [ticker: string]: string[]; // Store array of start dates as strings
}

export interface ScreenerMiniChartProps {
  candles: Candle[];
  priceMovingAverages: CustomizableChartMALine[];
  volumeMovingAverage?: CustomizableChartMALine;
  showVolume: boolean;
  ticker: string;
  earningsDates: string[];
  className?: string;
  chartSettings: ChartSettings;
  theme: string;
}

const ScreenerMiniChart: React.FC<ScreenerMiniChartProps> = ({
  candles,
  priceMovingAverages,
  volumeMovingAverage,
  showVolume,
  ticker,
  earningsDates,
  className,
  chartSettings,
  theme,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReturnType<typeof createChart>>();
  const [priceSeries, setPriceSeries] =
    useState<ISeriesApi<"Candlestick" | "Bar">>();
  const [volumeSeries, setVolumeSeries] =
    useState<ISeriesApi<"Histogram"> | null>(null);
  const [volumeMASeries, setVolumeMASeries] =
    useState<ISeriesApi<"Line"> | null>(null);
  const [maSeriesMap, setMaSeriesMap] = useState<
    Map<number, ISeriesApi<"Line">>
  >(new Map());
  const [, setLastCrossHairPoint] = useState<LastCrosshairPoint | undefined>(
    undefined
  );
  const [avwapSeries, setAvwapSeries] = useState<any[]>([]);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const adrP = adrPercent(candles, 20);

  const last = candles[candles.length - 1];
  const prev = candles[candles.length - 2];
  const pChange = (last.close - prev.close) / prev.close;
  const initialDate = new Date(candles[0].dateStr!);

  const [currentPricePoint, setCurrentPricePoint] = useState<PricePoint>({
    ...last,
    time: last.dateStr!,
  });

  const [cursorPercentChange, setCursorPercentChange] =
    useState<number>(pChange);

  const bgColor = theme === "light" ? "white" : "black";
  const gridColor = theme === "light" ? "#F0F0F0" : "rgba(136,136,136, .2)";
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
    crosshair: {
      mode: CrosshairMode.Normal,
    },
  };

  const handleAddAvwap = () => {
    setIsDrawingMode(true);
  };

  const toggleDrawingMode = () => {
    setIsDrawingMode(!isDrawingMode);
  };

  const handleClearAvwaps = (): void => {
    avwapSeries.forEach((series) => {
      chartRef.current?.removeSeries(series);
    });

    setAvwapSeries([]);
    setIsDrawingMode(false);

    const storedData: StoredAVWAPData = JSON.parse(
      localStorage.getItem("avwapDataByTicker") || "{}"
    );

    if (storedData[ticker]) {
      delete storedData[ticker]; // Remove the AVWAP data for this ticker
      localStorage.setItem("avwapDataByTicker", JSON.stringify(storedData)); // Save back to localStorage
    }
  };

  const saveAvwapStartDateToLocalStorage = (
    ticker: string,
    avwapStartDate: string
  ): void => {
    const storedData: StoredAVWAPData = JSON.parse(
      localStorage.getItem("avwapDataByTicker") || "{}"
    );

    if (!storedData[ticker]) {
      storedData[ticker] = [];
    }

    storedData[ticker].push(avwapStartDate); // Store the date, not the AVWAP data
    localStorage.setItem("avwapDataByTicker", JSON.stringify(storedData));
  };

  const loadAvwapStartDatesFromLocalStorage = (ticker: string): string[] => {
    const storedData: StoredAVWAPData = JSON.parse(
      localStorage.getItem("avwapDataByTicker") || "{}"
    );
    return storedData[ticker] || [];
  };

  const calculateAVWAP = (startIndex: number): LineData<Time>[] => {
    let cumulativeVolume = 0;
    let cumulativeVolumePrice = 0;
    const avwapData: LineData[] = [];

    for (let i = startIndex; i < candles.length; i++) {
      const candle = candles[i];
      const volume = candle.volume;

      const typicalPrice =
        (candle.high + candle.low + candle.close + candle.open) / 4;

      cumulativeVolume += volume;
      cumulativeVolumePrice += typicalPrice * volume;

      const avwap = Number(
        (cumulativeVolumePrice / cumulativeVolume).toFixed(3)
      );
      avwapData.push({ time: candle.dateStr!, value: avwap });
    }

    return avwapData;
  };

  const isDrawingModeRef = useRef(isDrawingMode); // Ref to track the current value of isDrawingMode

  // Update the ref whenever isDrawingMode changes
  useEffect(() => {
    isDrawingModeRef.current = isDrawingMode;
  }, [isDrawingMode]);

  const handleChartClick = (param: MouseEventParams<Time>) => {
    const currentIsDrawingMode = isDrawingModeRef.current;

    if (currentIsDrawingMode && param.time) {
      const clickedDateStr = param.time.toString();
      const startIndex = candles.findIndex(
        (candle) => candle.dateStr === clickedDateStr
      );

      if (startIndex !== -1) {
        const avwapData = calculateAVWAP(startIndex);

        const newAvwapSeries = chartRef.current?.addLineSeries({
          color: chartSettings.avwapSettings?.color || "#6c71c4",
          lineWidth: 2,
          priceLineVisible: false,
          crosshairMarkerVisible: false,
          title: chartSettings.avwapSettings?.showLegend
            ? `AVWAP ${avwapData[0].time.toString()}`
            : "",
        });

        newAvwapSeries?.setData(avwapData);

        setAvwapSeries((prevSeries) => [
          ...prevSeries,
          newAvwapSeries, // Save the AVWAP series
        ]);

        // Save the start date for recalculating later
        saveAvwapStartDateToLocalStorage(ticker, clickedDateStr);

        setIsDrawingMode(false);
      }
    } else {
      console.log("Drawing mode is off or no date selected.");
    }
  };
  useEffect(() => {
    const chart = createChart(chartContainerRef.current!, chartOptions);
    chartRef.current = chart;

    const resizeObserver = new ResizeObserver((entries) => {
      if (entries[0].contentRect) {
        const { width, height } = entries[0].contentRect;
        chart.applyOptions({
          width: Math.floor(width),
          height: Math.floor(height),
        });

        chart.timeScale().setVisibleLogicalRange({
          from: candles.length - 80,
          to: candles.length,
        });

        chart.timeScale().applyOptions({
          rightOffset: 8,
        });
      }
    });

    if (chartContainerRef.current) {
      resizeObserver.observe(chartContainerRef.current);
    }

    chart.subscribeClick((param) => {
      handleChartClick(param);
    });

    const avwapStartDates = loadAvwapStartDatesFromLocalStorage(ticker);

    avwapStartDates.forEach((startDate) => {
      const startIndex = candles.findIndex(
        (candle) => candle.dateStr === startDate
      );
      if (startIndex !== -1) {
        const avwapData = calculateAVWAP(startIndex);

        const newAvwapSeries = chart.addLineSeries({
          color: chartSettings.avwapSettings?.color || "#6c71c4",
          lineWidth: 2,
          priceLineVisible: false,
          crosshairMarkerVisible: false,
          title: chartSettings.avwapSettings?.showLegend
            ? `AVWAP ${startDate}`
            : "",
        });

        newAvwapSeries.setData(avwapData);
        setAvwapSeries((prevSeries) => [...prevSeries, newAvwapSeries]);
      }
    });

    if (showVolume) {
      const newVolumeSeries = chartRef.current.addHistogramSeries({
        priceFormat: {
          type: "volume",
        },
        priceLineVisible: false,
        priceScaleId: "volume",
      });

      setVolumeSeries(newVolumeSeries);

      if (volumeMovingAverage) {
        const volumeMASeries = chartRef.current.addLineSeries({
          lineWidth: 1,
          title: chartSettings.showVolumeMovingAvgLegends
            ? `Volume ${volumeMovingAverage.period} ${volumeMovingAverage.type}`
            : "",
          color: chartSettings.volumeMA.color,
          priceLineVisible: false,
          priceScaleId: "volume",
          crosshairMarkerVisible: false,
        });
        setVolumeMASeries(volumeMASeries);
      }
    }

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

    chart.subscribeClick((param) => {
      console.log(isDrawingMode, param);
    });

    chart.subscribeCrosshairMove((param) => {
      if (param.time && param.point) {
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
      }

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

    const newMaSeriesMap = new Map();
    priceMovingAverages.forEach((ma) => {
      const series = chart.addLineSeries({
        color: ma.color,
        lineWidth: 1,
        priceLineVisible: false,
        crosshairMarkerVisible: false,
        title: chartSettings.showPriceMovingAvgLegends
          ? `${ma.period} ${ma.type}`
          : "",
      });
      newMaSeriesMap.set(ma.period, series);
    });
    setMaSeriesMap(newMaSeriesMap);

    chartContainerRef.current!.addEventListener("mouseleave", () => {
      setCurrentPricePoint({
        ...last,
        time: last.dateStr!,
      });
      setCursorPercentChange(pChange);
    });

    // Handle zoom specifically
    const handleZoom = () => {
      if (chartRef.current && chartContainerRef.current) {
        const { width, height } =
          chartContainerRef.current.getBoundingClientRect();
        chartRef.current.resize(Math.floor(width), Math.floor(height));
      }
    };

    window.addEventListener("resize", handleZoom);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", handleZoom);
      chart.remove();
    };
  }, []);

  // Update data
  useEffect(() => {
    if (!chartRef.current || !priceSeries || candles.length === 0) return;

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

    const priceData = candles.map((c) => ({
      time: c.dateStr!,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));
    priceSeries.setData(priceData);

    if (showVolume && volumeSeries) {
      const volumeData = candles.map((c) => ({
        time: c.dateStr!,
        value: c.volume,
        color: earningsDates.includes(c.dateStr!)
          ? "rgba(38, 139, 210, 0.6)"
          : "rgba(136,136,136, .4)",
      }));
      volumeSeries.setData(volumeData);

      if (volumeMovingAverage) {
        volumeMASeries?.setData(volumeMovingAverage.timeseries);
      }
    }

    maSeriesMap.forEach((series, period) => {
      const data = priceMovingAverages.find((ma) => ma.period === period);

      if (data) {
        series.setData(data.timeseries);
      }
    });

    volumeSeries?.priceScale().applyOptions({
      scaleMargins: {
        top: 0.7,
        bottom: 0,
      },
    });

    priceSeries?.priceScale().applyOptions({
      scaleMargins: {
        top: 0.15,
        bottom: 0.1,
      },
    });

    chartRef.current.timeScale().setVisibleLogicalRange({
      from: candles.length - 80,
      to: candles.length,
    });
    chartRef.current.timeScale().applyOptions({
      rightOffset: 10,
    });

    //  chartRef.current.timeScale().scrollToRealTime();
  }, [
    candles,
    showVolume,
    volumeMovingAverage,
    priceMovingAverages,
    earningsDates,
    priceSeries,
  ]);

  return (
    <div className={`relative ${className}`}>
      <div ref={chartContainerRef} className=" mr-[-1rem] h-full"></div>
      <div
        className="absolute top-0 left-1 z-20 flex justify-between text-sm text-foreground/95"
        style={{
          background: theme === "dark" ? "black" : "white",
          width: "90%",
        }}
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
            style={{ color: cursorPercentChange >= 0 ? "green" : "red" }}
          >
            {(cursorPercentChange * 100).toFixed(2)}%
          </span>
          {adrP && !isADRPercentError(adrP) && (
            <span>
              , <span className="font-semibold">ADRP:</span> {adrP.toFixed(2)}%
            </span>
          )}
        </div>
        {ticker.includes("^") && (
          <div className="absolute top-5 mt-1 left-0 z-20 text-sm text-foreground/50">
            Data delayed up to 15 min.
          </div>
        )}
      </div>
      <AVWAPMenu
        isDrawingMode={isDrawingMode}
        setDrawingMode={toggleDrawingMode}
        handleAddAvwap={handleAddAvwap}
        handleClearAvwaps={handleClearAvwaps}
      />
    </div>
  );
};

export default ScreenerMiniChart;
