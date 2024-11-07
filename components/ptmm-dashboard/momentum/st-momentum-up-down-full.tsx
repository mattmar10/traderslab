"use client";
import { useEffect, useRef, useState } from "react";
import {
  ColorType,
  CrosshairMode,
  createChart,
  PriceScaleMode,
  LineWidth,
  LineStyle,
} from "lightweight-charts";
import { useTheme } from "next-themes";
import { MomentumRow } from "./momentum-types";
import { negativeRed, positiveBlue } from "@/lib/utils/color-utils";

export interface STMomentumUpDownChartFullTVProps {
  momentumRows: MomentumRow[];
}

const STMomentumUpDownChartFullTV: React.FC<
  STMomentumUpDownChartFullTVProps
> = ({ momentumRows }: STMomentumUpDownChartFullTVProps) => {
  const stMomentumChartContainerRefFull = useRef<HTMLDivElement>(null);
  const stMomentumBarChartRef = useRef<ReturnType<typeof createChart>>();
  const [fiveDayRatioSeries, setFiveDayRatioSeries] = useState<any>();
  const [tenDayRatioSeries, setTenDayRatioSeries] = useState<any>();

  const [upSeries, setUpSeries] = useState<any>();
  const [downSeries, setDownSeries] = useState<any>();

  const { theme } = useTheme();

  const bgColor = theme === "light" ? "white" : "black";
  const gridColor = theme === "light" ? "#F0F0F0" : "#333";

  const positiveColor = positiveBlue
  const negativeColor = negativeRed
  const ratioColor = "#268bd2";
  const tenDayColor = "#b58900";

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
      rightOffset: 12,
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

  // Use effect to initialize the chart and add price lines only once
  useEffect(() => {
    const stChart = createChart(
      stMomentumChartContainerRefFull.current!,
      chartOptions
    );
    stMomentumBarChartRef.current = stChart;

    const upBarSeries = stChart.addHistogramSeries({
      title: `Up`,
      color: positiveColor,
      priceLineVisible: false,
    });

    setUpSeries(upBarSeries);

    const downBarSeries = stChart.addHistogramSeries({
      title: `Down`,
      color: negativeColor,
      priceLineVisible: false,
    });

    setDownSeries(downBarSeries);

    // Add line series for 5 Day Ratio
    const fiveDayRatioSeries = stChart.addLineSeries({
      title: "5D Ratio",
      color: ratioColor,
      lineWidth: 2,
      priceScaleId: "ratio",
      priceLineVisible: false,
    });

    setFiveDayRatioSeries(fiveDayRatioSeries);

    // Add line series for 10 Day Ratio
    const tenDayRatioSeries = stChart.addLineSeries({
      title: "10D Ratio",
      color: tenDayColor,
      lineWidth: 2,
      priceScaleId: "ratio",
      priceLineVisible: false,
    });

    setTenDayRatioSeries(tenDayRatioSeries);

    const rightPriceScale = stChart.priceScale("right");
    rightPriceScale.applyOptions({
      scaleMargins: {
        top: 0.05,
        bottom: 0.4,
      },
    });

    // Create a separate price scale for the ratios with a logarithmic scale
    const ratioPriceScale = stChart.priceScale("ratio");
    ratioPriceScale.applyOptions({
      mode: PriceScaleMode.Logarithmic,
      scaleMargins: {
        top: 0.5,
        bottom: 0.05,
      },
    });

    // Add price lines (only run once)
    const lineWidth = 2;

    const lower = {
      price: 0.3,
      color: "#26a69a",
      lineWidth: lineWidth as LineWidth,
      lineStyle: LineStyle.Solid,
      axisLabelVisible: true,
      title: "OS", // Oversold
    };

    const upper = {
      price: 5,
      color: "#ef5350",
      lineWidth: lineWidth as LineWidth,
      lineStyle: LineStyle.Solid,
      axisLabelVisible: true,
      title: "OB", // Overbought
    };

    const neutral = {
      price: 1, // Neutral price line at ratio of 1
      color: theme === "light" ? "#000000" : "#FAFAFA",
      lineWidth: lineWidth as LineWidth,
      lineStyle: LineStyle.Dashed,
      axisLabelVisible: true,
      title: "Neutral",
    };

    fiveDayRatioSeries.createPriceLine(lower);
    fiveDayRatioSeries.createPriceLine(upper);
    fiveDayRatioSeries.createPriceLine(neutral);

    return () => {
      stChart.remove(); // Cleanup on unmount
    };
  }, [theme]); // Effect runs once and when the theme changes

  // Update chart data whenever the momentumRows change
  useEffect(() => {
    const ups = momentumRows.map((m) => ({
      time: m.stMomentumRow.dateStr,
      value: m.stMomentumRow.upFourPercent,
    }));

    upSeries?.setData(ups);

    const downs = momentumRows.map((m) => ({
      time: m.stMomentumRow.dateStr,
      value: -m.stMomentumRow.downFourPercent,
    }));

    downSeries?.setData(downs);

    const fiveDayRatios = momentumRows.map((m) => ({
      time: m.stMomentumRow.dateStr,
      value: m.stMomentumRow.fiveDayRatio,
    }));

    fiveDayRatioSeries?.setData(fiveDayRatios);

    const tenDayRatios = momentumRows.map((m) => ({
      time: m.stMomentumRow.dateStr,
      value: m.stMomentumRow.tenDayRatio,
    }));

    tenDayRatioSeries?.setData(tenDayRatios);
  }, [
    momentumRows,
    upSeries,
    downSeries,
    fiveDayRatioSeries,
    tenDayRatioSeries,
  ]);

  return (
    <div className="h-[40rem]">
      <div ref={stMomentumChartContainerRefFull} className={`h-[40rem]`}></div>
    </div>
  );
};

export default STMomentumUpDownChartFullTV;
