"use client";

import { useTheme } from "next-themes";

import { useEffect, useRef, useState } from "react";
import { ColorType, CrosshairMode, createChart } from "lightweight-charts";
import { LineDataPoint, BarDataPoint } from "@/lib/types/tradingview-types";

export interface FiftyTwoWeekHighsLowsLineTVFullProps {
  dataLine: LineDataPoint[];
  smaLine: LineDataPoint[];
  oscillatorData: BarDataPoint[];
}

const McclellanOscillatorTVFull: React.FC<
  FiftyTwoWeekHighsLowsLineTVFullProps
> = ({
  dataLine,
  smaLine,
  oscillatorData,
}: FiftyTwoWeekHighsLowsLineTVFullProps) => {
  const lineChartFullContainerRef = useRef<HTMLDivElement>(null);
  const lineChartFullRef = useRef<ReturnType<typeof createChart>>();
  const oscBarChartFullContainerRef = useRef<HTMLDivElement>(null);
  const oscBarChartFullRef = useRef<ReturnType<typeof createChart>>();
  const [mcclellanSumIndexSeries, setMcclellanSumIndexSeries] = useState<any>();
  const [tenSMASeries, setTenSMASeries] = useState<any>();
  const [mclellanOscSeries, setMclellanOscSeries] = useState<any>();

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
      lineChartFullContainerRef.current!,
      chartOptions
    );
    lineChartFullRef.current = lineChart;

    const barChart = createChart(
      oscBarChartFullContainerRef.current!,
      chartOptions
    );
    oscBarChartFullRef.current = barChart;

    const mcclellanSumIndexSeries = lineChartFullRef.current.addLineSeries({
      lineWidth: 2,
      title: `MCC. SUM`,
      color: "#268bd2",
      priceLineVisible: false,
      crosshairMarkerVisible: false,
    });

    const tenMASeries = lineChartFullRef.current.addLineSeries({
      lineWidth: 2,
      title: `10 SMA`,
      color: "#b58900",
      priceLineVisible: false,
      crosshairMarkerVisible: false,
    });

    setMcclellanSumIndexSeries(mcclellanSumIndexSeries);
    setTenSMASeries(tenMASeries);

    const histogramSeries = oscBarChartFullRef.current.addHistogramSeries({
      title: `MCC OSC`,
      color: positiveColor,
      priceLineVisible: false,
    });

    setMclellanOscSeries(histogramSeries);

    return () => {
      lineChart.remove();
      barChart.remove();
    };
  }, [theme]);

  useEffect(() => {
    if (lineChartFullRef.current) {
      tenSMASeries?.setData(smaLine);
      mcclellanSumIndexSeries?.setData(dataLine);
      mclellanOscSeries?.setData(oscillatorData);
    }
  }, [
    mcclellanSumIndexSeries,
    mclellanOscSeries,
    lineChartFullContainerRef,
    oscBarChartFullContainerRef,
    oscillatorData,
    tenSMASeries,
    dataLine,
    smaLine,
    lineChartFullRef,
    positiveColor,
  ]);

  return (
    <div className="h-[50rem]">
      <div className="h-[25rem]">
        <div ref={lineChartFullContainerRef} className={`h-[25rem]`}></div>
      </div>
      <div className="h-[25rem]">
        <div ref={oscBarChartFullContainerRef} className={`h-[25rem]`}></div>
      </div>
    </div>
  );
};

export default McclellanOscillatorTVFull;
