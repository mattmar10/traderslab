"use client";
import { McClellanOscillatorPoint } from "@/lib/types/market-breadth-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useRef, useState } from "react";
import { ColorType, CrosshairMode, createChart } from "lightweight-charts";
import { useTheme } from "next-themes";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AiOutlineZoomIn } from "react-icons/ai";
import McclellanOscillatorTVFull from "./mcclellan-oscillator-full";
import { BarDataPoint, LineDataPoint } from "@/lib/types/tradingview-types";

export interface McclellanOscillatorProps {
  mcClellanOscillator: McClellanOscillatorPoint[];
}

export interface McClellanSMADataPoint {
  time: string;
  value: number;
}

const McclellanOscillatorTV: React.FC<McclellanOscillatorProps> = ({
  mcClellanOscillator,
}: McclellanOscillatorProps) => {
  const mclellanLineChartContainerRef = useRef<HTMLDivElement>(null);
  const mclellanLineChartRef = useRef<ReturnType<typeof createChart>>();
  const mclellanBarChartContainerRef = useRef<HTMLDivElement>(null);
  const mclellanBarChartRef = useRef<ReturnType<typeof createChart>>();
  const [mcclellanSumIndexSeries, setMcclellanSumIndexSeries] = useState<any>();
  const [tenSMASeries, setTenSMASeries] = useState<any>();
  const [mclellanOscSeries, setMclellanOscSeries] = useState<any>();

  const [lineData, setLineData] = useState<LineDataPoint[]>([]);
  const [smaLineData, setSMALineData] = useState<LineDataPoint[]>([]);
  const [oscBarData, setOscBarData] = useState<BarDataPoint[]>([]);
  const { theme } = useTheme();

  const bgColor = theme === "light" ? "white" : "black";
  const gridColor = theme === "light" ? "#F0F0F0" : "#333";

  const positiveColor = theme === "dark" ? "#4CAF50" : "#228B22"; // Green
  const negativeColor = theme === "dark" ? "#F44336" : "#FF6347"; // Red

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

  useEffect(() => {
    const lineChart = createChart(
      mclellanLineChartContainerRef.current!,
      chartOptions
    );
    mclellanLineChartRef.current = lineChart;

    const barChart = createChart(
      mclellanBarChartContainerRef.current!,
      chartOptions
    );
    mclellanBarChartRef.current = barChart;

    const mcclellanSumIndexSeries = mclellanLineChartRef.current.addLineSeries({
      lineWidth: 2,
      title: `MCC. SUM`,
      color: "#268bd2",
      priceLineVisible: false,
      crosshairMarkerVisible: false,
    });

    const tenMASeries = mclellanLineChartRef.current.addLineSeries({
      lineWidth: 2,
      title: `10 SMA`,
      color: "#b58900",
      priceLineVisible: false,
      crosshairMarkerVisible: false,
    });

    setMcclellanSumIndexSeries(mcclellanSumIndexSeries);
    setTenSMASeries(tenMASeries);

    const histogramSeries = mclellanBarChartRef.current.addHistogramSeries({
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
    if (mclellanLineChartContainerRef.current) {
      const smaLine: McClellanSMADataPoint[] = [];
      const dates: string[] = [];

      for (let i = 10 - 1; i < mcClellanOscillator.length; i++) {
        const sum = mcClellanOscillator
          .slice(i - 10 + 1, i + 1)
          .reduce((total, c) => total + c.cumulative, 0);
        const average = sum / 10;

        smaLine.push({ time: mcClellanOscillator[i].dateStr, value: average });
        dates.push(mcClellanOscillator[i].dateStr);
      }

      const mappedData: any[] = [];
      for (let i = 10 - 1; i < mcClellanOscillator.length; i++) {
        const mc = mcClellanOscillator[i];

        mappedData.push({
          time: mc.dateStr,
          value: mc.cumulative,
        });
      }

      tenSMASeries?.setData(smaLine);
      setSMALineData(smaLine);

      const lineData = mappedData.filter((c) => dates.includes(c.time));
      mcclellanSumIndexSeries?.setData(lineData);
      setLineData(lineData);

      const barData = mcClellanOscillator
        .filter((c) => dates.includes(c.dateStr))
        .map((m) => {
          return {
            time: m.dateStr,
            value: Number(m.value.toFixed(2)),
            color: m.value > 0 ? positiveColor : negativeColor,
          };
        });
      mclellanOscSeries?.setData(barData);
      setOscBarData(barData);
    }
  }, [
    mcclellanSumIndexSeries,
    mclellanOscSeries,
    tenSMASeries,
    mcClellanOscillator,
    mclellanLineChartContainerRef,
  ]);

  return (
    <Card>
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-lg">
          <div className="flex justify-between items-center">
            <div>
              <span className="block md:hidden">
                McClellan Osc. & Summation Index
              </span>
              <span className="hidden md:block">
                McClellan Oscillator & Summation Index
              </span>
            </div>
            <div className="hidden md:block text-foreground/15 hover:text-foreground/70 cursor-pointer">
              <Dialog>
                <DialogTrigger>
                  <AiOutlineZoomIn />
                </DialogTrigger>
                <DialogContent className="max-w-6xl h-[54rem]">
                  <DialogHeader>
                    <DialogTitle>
                      McClellan Oscillator & Summation Index
                    </DialogTitle>
                  </DialogHeader>
                  <div>
                    <McclellanOscillatorTVFull
                      dataLine={lineData}
                      smaLine={smaLineData}
                      oscillatorData={oscBarData}
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className=" border-b border-foreground/20 px-4 pr-1">
        <div className="h-[17.5rem]">
          <div
            ref={mclellanLineChartContainerRef}
            className={`h-[17.5rem]`}
          ></div>
        </div>
      </CardContent>
      <CardContent className=" mt-8 w-full border-foreground/20 pb-4 px-4 pr-1">
        <div className="h-[17.5rem]">
          <div
            ref={mclellanBarChartContainerRef}
            className={`h-[17.5rem]`}
          ></div>
        </div>
      </CardContent>
    </Card>
  );
};

export default McclellanOscillatorTV;
