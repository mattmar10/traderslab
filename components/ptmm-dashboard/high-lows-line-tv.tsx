"use client";

import { useTheme } from "next-themes";
import { AiOutlineZoomIn } from "react-icons/ai";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { useEffect, useRef, useState } from "react";
import { ColorType, CrosshairMode, createChart } from "lightweight-charts";
import FiftyTwoWeekHighsLowsLineTVFull from "./high-lows-line-full";
import { LineDataPoint, BarDataPoint } from "@/lib/types/tradingview-types";
import { Candle } from "@/lib/types/basic-types";
import {
  FiftyTwoWeekHighsLowsDataPoint,
  FiftyTwoWeekHighsLowsDataPointWithCumulative,
  SMADataPoint,
} from "@/lib/types/market-breadth-types";
import { negativeColor, positiveColor } from "@/lib/utils/color-utils";

export interface HighsLowsLineLineProps {
  plotStartDate: Date;
  candles: Candle[];
  fiftyTwoWeeksHighLowLine: FiftyTwoWeekHighsLowsDataPoint[];
}

export interface HighsLowsLineProps {
  highsLowsLine: FiftyTwoWeekHighsLowsDataPoint[];
}
const FiftyTwoWeekHighsLowsLineTV: React.FC<HighsLowsLineProps> = ({
  highsLowsLine,
}: HighsLowsLineProps) => {
  const highLowLineChartContainerRef = useRef<HTMLDivElement>(null);
  const highLowChartRef = useRef<ReturnType<typeof createChart>>();
  const highLowBarChartContainerRef = useRef<HTMLDivElement>(null);
  const highLowCBarhartRef = useRef<ReturnType<typeof createChart>>();
  const [cumulHighsOverLowsSeries, setCumulHighsOverLowsSeries] =
    useState<any>();
  const [fiftySMASeries, setFiftySMASeries] = useState<any>();
  const [netNewHighsSeries, setNetNewHighsSeries] = useState<any>();
  const { theme } = useTheme();

  const [lineData, setLineData] = useState<LineDataPoint[]>([]);
  const [smaLineData, setSMALineData] = useState<LineDataPoint[]>([]);
  const [newHighBarData, setNewHighBarData] = useState<BarDataPoint[]>([]);

  const bgColor = theme === "light" ? "white" : "black";
  const gridColor = theme === "light" ? "#F0F0F0" : "#333";

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
      highLowLineChartContainerRef.current!,
      chartOptions
    );
    highLowChartRef.current = lineChart;

    const barChart = createChart(
      highLowBarChartContainerRef.current!,
      chartOptions
    );
    highLowCBarhartRef.current = barChart;

    const cumulHighsOverLowsSeries = highLowChartRef.current.addLineSeries({
      lineWidth: 2,
      title: `CUMUL H/L`,
      color: "#268bd2",
      priceLineVisible: false,
      crosshairMarkerVisible: false,
    });

    const fiftyMASeries = highLowChartRef.current.addLineSeries({
      lineWidth: 2,
      title: `50 SMA`,
      color: "#b58900",
      priceLineVisible: false,
      crosshairMarkerVisible: false,
    });

    setCumulHighsOverLowsSeries(cumulHighsOverLowsSeries);
    setFiftySMASeries(fiftyMASeries);

    const histogramSeries = highLowCBarhartRef.current.addHistogramSeries({
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

  const netNewHighsData = highsLowsLine.map((p) => {
    return {
      time: p.dateStr,
      value: p.fiftyTwoWeekHighs - p.fiftyTwoWeekLows,
      color:
        p.fiftyTwoWeekHighs > p.fiftyTwoWeekLows
          ? positiveColor
          : negativeColor,
    };
  });

  useEffect(() => {
    if (highLowChartRef.current) {
      const dataLine: FiftyTwoWeekHighsLowsDataPointWithCumulative[] = [];
      const smaLine: SMADataPoint[] = [];

      const smaLengh = 50;

      for (let i = 0; i < highsLowsLine.length; i++) {
        if (i == 0) {
          dataLine.push({
            ...highsLowsLine[i],
            cumulativeHighs: highsLowsLine[i].fiftyTwoWeekHighs,
            cumulativeLows: Math.max(1, highsLowsLine[i].fiftyTwoWeekLows),
          });
        } else {
          const previousCumulativeHighs = dataLine[i - 1].cumulativeHighs;
          const previousCumulativeLows = dataLine[i - 1].cumulativeLows;
          dataLine.push({
            ...highsLowsLine[i],
            cumulativeHighs:
              previousCumulativeHighs + highsLowsLine[i].fiftyTwoWeekHighs,
            cumulativeLows:
              previousCumulativeLows + highsLowsLine[i].fiftyTwoWeekLows,
          });
        }

        if (i >= smaLengh - 1) {
          const sum = dataLine
            .slice(i - smaLengh + 1, i + 1)
            .reduce(
              (total, c) => total + (c.cumulativeHighs - c.cumulativeLows),
              0
            );
          const average = sum / smaLengh;

          smaLine.push({ dateStr: dataLine[i].dateStr, sma: average });
        }
      }
      const cumulativeHighsMinusLows = dataLine.map((d) => {
        const point = {
          time: d.dateStr,
          value: Number((d.cumulativeHighs - d.cumulativeLows).toFixed(2)),
        };
        return point;
      });

      const fiftySma = smaLine.map((d) => {
        const point = {
          time: d.dateStr,
          value: d.sma,
        };
        return point;
      });

      fiftySMASeries?.setData(fiftySma);
      setSMALineData(fiftySma);

      const dates = fiftySma.map((f) => f.time);
      const lineData = cumulativeHighsMinusLows.filter((c) =>
        dates.includes(c.time)
      );
      cumulHighsOverLowsSeries?.setData(lineData);
      setLineData(lineData);

      const barData = netNewHighsData.filter((c) => dates.includes(c.time));
      netNewHighsSeries?.setData(barData);
      setNewHighBarData(barData);
    }
  }, [
    cumulHighsOverLowsSeries,
    netNewHighsSeries,
    fiftySMASeries,
    highsLowsLine,
    highLowChartRef,
    positiveColor,
  ]);

  return (
    <div>
      <div className="py-1 px-4">
        <div className="text-lg">
          <div className="flex justify-between items-center">
            <div className="text-sm font-semibold">Cumulative 52 Week Highs/Lows</div>
            <div className="hidden md:block text-foreground/15 hover:text-foreground/70 cursor-pointer">
              <Dialog>
                <DialogTrigger>
                  <AiOutlineZoomIn />
                </DialogTrigger>
                <DialogContent className="max-w-6xl h-[54rem]">
                  <DialogHeader>
                    <DialogTitle>Cumulative 52 Week Highs/Lows</DialogTitle>
                  </DialogHeader>
                  <div>
                    <FiftyTwoWeekHighsLowsLineTVFull
                      dataLine={lineData}
                      smaLine={smaLineData}
                      newHighsData={newHighBarData}
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>
      <div className=" border-b border-foreground/20 pb-2 px-4 pr-2">
        <div className="h-[16.25m]">
          <div
            ref={highLowLineChartContainerRef}
            className={`h-[16.25rem]`}
          ></div>

        </div>
      </div>
      <div className=" mt-4 w-full pb-4 px-4 pr-1">
        <div className="text-sm font-semibold">Net New Highs/Lows</div>

        <div className="h-[16.25rem]">
          <div
            ref={highLowBarChartContainerRef}
            className={`h-[16.25rem]`}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default FiftyTwoWeekHighsLowsLineTV;
