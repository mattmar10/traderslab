"use client";

import { useTheme } from "next-themes";

import { useEffect, useRef, useState } from "react";
import { ColorType, CrosshairMode, createChart } from "lightweight-charts";
import { LineDataPoint, BarDataPoint } from "@/lib/types/tradingview-types";

export interface FiftyTwoWeekHighsLowsLineTVFullProps {
  dataLine: LineDataPoint[];
  smaLine: LineDataPoint[];
  newHighsData: BarDataPoint[];
}

const FiftyTwoWeekHighsLowsLineTVFull: React.FC<
  FiftyTwoWeekHighsLowsLineTVFullProps
> = ({
  dataLine,
  smaLine,
  newHighsData,
}: FiftyTwoWeekHighsLowsLineTVFullProps) => {
  const highLowLineChartFullContainerRef = useRef<HTMLDivElement>(null);
  const highLowChartFullRef = useRef<ReturnType<typeof createChart>>();
  const highLowBarChartFullContainerRef = useRef<HTMLDivElement>(null);
  const highLowCBarhartFullRef = useRef<ReturnType<typeof createChart>>();
  const [cumulHighsOverLowsSeries, setCumulHighsOverLowsSeries] =
    useState<any>();
  const [fiftySMASeries, setFiftySMASeries] = useState<any>();
  const [netNewHighsSeries, setNetNewHighsSeries] = useState<any>();
  const { theme } = useTheme();

  const bgColor = theme === "light" ? "white" : "black";
  const gridColor = theme === "light" ? "#F0F0F0" : "#333";

  const positiveColor = theme === "dark" ? "#4CAF50" : "#228B22"; // Green

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
        rightOffset: 13,
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
    const lineChart = createChart(
      highLowLineChartFullContainerRef.current!,
      chartOptions
    );
    highLowChartFullRef.current = lineChart;

    const barChart = createChart(
      highLowBarChartFullContainerRef.current!,
      chartOptions
    );
    highLowCBarhartFullRef.current = barChart;

    const cumulHighsOverLowsSeries = highLowChartFullRef.current.addLineSeries({
      lineWidth: 2,
      title: `CUMUL H/L`,
      color: "#268bd2",
      priceLineVisible: false,
      crosshairMarkerVisible: false,
    });

    const fiftyMASeries = highLowChartFullRef.current.addLineSeries({
      lineWidth: 2,
      title: `50 SMA`,
      color: "#b58900",
      priceLineVisible: false,
      crosshairMarkerVisible: false,
    });

    setCumulHighsOverLowsSeries(cumulHighsOverLowsSeries);
    setFiftySMASeries(fiftyMASeries);

    const histogramSeries = highLowCBarhartFullRef.current.addHistogramSeries({
      title: `Net Highs`,
      color: positiveColor,
      priceLineVisible: false,
    });

    setNetNewHighsSeries(histogramSeries);

    return () => {
      lineChart.remove();
      barChart.remove();
    };
  }, [theme]);

  useEffect(() => {
    if (highLowChartFullRef.current) {
      fiftySMASeries?.setData(smaLine);
      cumulHighsOverLowsSeries?.setData(dataLine);
      netNewHighsSeries?.setData(newHighsData);
    }
  }, [
    cumulHighsOverLowsSeries,
    netNewHighsSeries,
    fiftySMASeries,
    dataLine,
    smaLine,
    highLowChartFullRef,
    positiveColor,
  ]);

  return (
    <div className="h-[50rem]">
      <div className="h-[25rem]">
        <div
          ref={highLowLineChartFullContainerRef}
          className={`h-[25rem]`}
        ></div>
      </div>
      <div className="h-[25rem]">
        <div
          ref={highLowBarChartFullContainerRef}
          className={`h-[25rem]`}
        ></div>
      </div>
    </div>
  );
};

export default FiftyTwoWeekHighsLowsLineTVFull;
