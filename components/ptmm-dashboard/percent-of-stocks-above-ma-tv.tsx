"use client";
import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useRef, useState } from "react";
import {
  ColorType,
  CrosshairMode,
  LineStyle,
  createChart,
} from "lightweight-charts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AiOutlineZoomIn } from "react-icons/ai";
import PercentOfStocksAboveMAsFull from "./percent-of-stocks-above-ma-full";
import {
  defaultPTMMDashboardSettings,
  PTMMDashboardSettings,
} from "./ptmm-dashboard-settings";
import { PercentAboveMAPoint } from "@/lib/types/market-breadth-types";

export interface PercentOfStocksAboveMATVLineProps {
  plotStartDate: Date;
  percentAboveFiveSMA: PercentAboveMAPoint[];
  percentAboveTenEMA: PercentAboveMAPoint[];
  percentAboveTwentyOneEMA: PercentAboveMAPoint[];
  percentAboveFiftySMA: PercentAboveMAPoint[];
  percentAboveTwoHundredSMA: PercentAboveMAPoint[];
}
const PercentOfStocksAboveMAs: React.FC<PercentOfStocksAboveMATVLineProps> = ({
  percentAboveFiveSMA,
  percentAboveTenEMA,
  percentAboveTwentyOneEMA,
  percentAboveFiftySMA,
  percentAboveTwoHundredSMA,
}: PercentOfStocksAboveMATVLineProps) => {
  const kmaChartContainerRef = useRef<HTMLDivElement>(null);
  const kmaCchartRef = useRef<ReturnType<typeof createChart>>();
  const [percentAboveFiveSMASeries, setPercentAboveFiveSMASeries] =
    useState<any>();
  const [percentAboveTenEMASeries, setPercentAboveTenEMASeries] =
    useState<any>();
  const [percentAboveTwentyOneEMASeies, setPercentAboveTwentyOneEMASeies] =
    useState<any>();
  const [percentAboveFiftySMASeries, setPercentAboveFiftySMASeries] =
    useState<any>();
  const [percentAboveTwoHundredSMASeries, setPercentAboveTwoHundredSMASeries] =
    useState<any>();

  const { theme } = useTheme();

  const ptmmDashboardSettings = loadPTMMDashboardSettings();

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
        rightOffset: 15,
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

    const chart = createChart(kmaChartContainerRef.current!, chartOptions);
    kmaCchartRef.current = chart;

    // Create a separate series for OB/OS lines
    const obosSeriesOptions = {
      color: "rgba(0, 0, 0, 0)", // Invisible line
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: false,
    };

    const obosSeries = chart.addLineSeries(obosSeriesOptions);

    // Add OB/OS lines
    obosSeries.createPriceLine({
      price: 25,
      color: "#26a69a",
      lineWidth: 2,
      lineStyle: LineStyle.Solid,
      axisLabelVisible: true,
      title: "OS",
    });

    obosSeries.createPriceLine({
      price: 75,
      color: "#ef5350",
      lineWidth: 2,
      lineStyle: LineStyle.Solid,
      axisLabelVisible: true,
      title: "OB",
    });

    // Set some data for the OB/OS series to ensure it spans the chart
    const currentDate = new Date();
    const pastDate = new Date(
      currentDate.getFullYear() - 1,
      currentDate.getMonth(),
      currentDate.getDate()
    );
    obosSeries.setData([
      { time: pastDate.toISOString().split("T")[0], value: 50 },
      { time: currentDate.toISOString().split("T")[0], value: 50 },
    ]);

    const percentAboveFiveSMASeries = kmaCchartRef.current.addLineSeries({
      lineWidth: 1,
      title: `% > 5 SMA`,
      color: "#657b83",
      priceLineVisible: false,
      crosshairMarkerVisible: false,
    });

    const percentAboveTenEMASeries = kmaCchartRef.current.addLineSeries({
      lineWidth: 1,
      title: `% > 10 EMA`,
      color: "#6c71c4",
      priceLineVisible: false,
      crosshairMarkerVisible: false,
    });

    const percentAboveTwentyOneEMASeries = kmaCchartRef.current.addLineSeries({
      lineWidth: 1,
      title: `% > 21 EMA`,
      color: "#268bd2",
      priceLineVisible: false,
      crosshairMarkerVisible: false,
    });

    const percentAboveFiftySMASeries = kmaCchartRef.current.addLineSeries({
      lineWidth: 1,
      title: `% > 50 SMA`,
      color: "#b58900",
      priceLineVisible: false,
      crosshairMarkerVisible: false,
    });
    const percentAboveTwoHundredSMASeries = kmaCchartRef.current.addLineSeries({
      lineWidth: 1,
      title: `% > 200 SMA`,
      color: "#d33682",
      priceLineVisible: false,
      crosshairMarkerVisible: false,
    });
    if (ptmmDashboardSettings.show5SMA) {
      setPercentAboveFiveSMASeries(percentAboveFiveSMASeries);
    }
    if (ptmmDashboardSettings.show10EMA) {
      setPercentAboveTenEMASeries(percentAboveTenEMASeries);
    }
    if (ptmmDashboardSettings.show21EMA) {
      setPercentAboveTwentyOneEMASeies(percentAboveTwentyOneEMASeries);
    }
    if (ptmmDashboardSettings.show50SMA) {
      setPercentAboveFiftySMASeries(percentAboveFiftySMASeries);
    }

    if (ptmmDashboardSettings.show200SMA) {
      setPercentAboveTwoHundredSMASeries(percentAboveTwoHundredSMASeries);
    }

    return () => {
      chart.remove();
    };
  }, [theme]);

  useEffect(() => {
    if (kmaCchartRef.current) {
      const fiveData = percentAboveFiveSMA.map((d) => {
        const point = {
          time: d.dateStr,
          value: d.percentAboveMA,
        };
        return point;
      });

      percentAboveFiveSMASeries?.setData(fiveData);
      const tenData = percentAboveTenEMA.map((d) => {
        const point = {
          time: d.dateStr,
          value: d.percentAboveMA,
        };
        return point;
      });

      percentAboveTenEMASeries?.setData(tenData);
      const twentyOneData = percentAboveTwentyOneEMA.map((d) => {
        const point = {
          time: d.dateStr,
          value: d.percentAboveMA,
        };
        return point;
      });

      percentAboveTwentyOneEMASeies?.setData(twentyOneData);

      const fiftySma = percentAboveFiftySMA.map((d) => {
        const point = {
          time: d.dateStr,
          value: d.percentAboveMA,
        };
        return point;
      });

      percentAboveFiftySMASeries?.setData(fiftySma);

      const twoHundredSMA = percentAboveTwoHundredSMA.map((d) => {
        const point = {
          time: d.dateStr,
          value: d.percentAboveMA,
        };
        return point;
      });

      percentAboveTwoHundredSMASeries?.setData(twoHundredSMA);
    }
  }, [
    percentAboveFiveSMASeries,
    percentAboveFiftySMASeries,
    percentAboveTwentyOneEMASeies,
    percentAboveTwoHundredSMASeries,
    percentAboveTwentyOneEMA,
    percentAboveFiftySMA,
    percentAboveTwoHundredSMA,
    kmaCchartRef,
  ]);

  return (
    <Card>
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-lg">
          <div className="flex justify-between items-center">
            <div>
              <span className="block md:hidden">
                Percent of Stocks Above KMA
              </span>
              <span className="hidden md:block">
                Percent of Stocks Above Key Moving Avg
              </span>
            </div>
            <div className="hidden md:block text-foreground/15 hover:text-foreground/70 cursor-pointer">
              <Dialog>
                <DialogTrigger>
                  <AiOutlineZoomIn />
                </DialogTrigger>
                <DialogContent className="max-w-6xl h-[46rem]">
                  <DialogHeader>
                    <DialogTitle>
                      Percent of Stocks Above Key Moving Avg
                    </DialogTitle>
                  </DialogHeader>
                  <div>
                    <PercentOfStocksAboveMAsFull
                      percentAboveTwentyOneEMA={percentAboveTwentyOneEMA}
                      percentAboveFiftySMA={percentAboveFiftySMA}
                      percentAboveTwoHundredSMA={percentAboveTwoHundredSMA}
                      percentAboveFiveSMA={percentAboveFiveSMA}
                      percentAboveTenEMA={percentAboveTenEMA}
                      ptmmDashboardSettings={ptmmDashboardSettings}
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className=" px-4 pr-2">
        <div>
          <div className="h-[32rem]">
            <div ref={kmaChartContainerRef} className={`h-[32rem]`}></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PercentOfStocksAboveMAs;

function loadPTMMDashboardSettings(): PTMMDashboardSettings {
  if (typeof window !== "undefined") {
    const savedSettings = localStorage.getItem("ptmmDashboardSettings");
    if (savedSettings) {
      return { ...defaultPTMMDashboardSettings, ...JSON.parse(savedSettings) };
    }
  }
  return defaultPTMMDashboardSettings;
}
