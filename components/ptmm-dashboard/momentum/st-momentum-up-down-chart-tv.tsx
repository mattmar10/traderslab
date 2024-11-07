"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MomentumRow } from "./momentum-types";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AiOutlineZoomIn } from "react-icons/ai";
import STMomentumUpDownChartFullTV from "./st-momentum-up-down-full";
import { negativeRed, positiveBlue } from "@/lib/utils/color-utils";

export interface STMomentumUpDownChartProps {
  momentumRows: MomentumRow[];
}

const STMomentumUpDownChartTV: React.FC<STMomentumUpDownChartProps> = ({
  momentumRows,
}: STMomentumUpDownChartProps) => {
  const stMomentumChartContainerRef = useRef<HTMLDivElement>(null);
  const stMomentumBarChartRef = useRef<ReturnType<typeof createChart>>();
  const [upSeries, setUpSeries] = useState<any>();
  const [downSeries, setDownSeries] = useState<any>();
  const [fiveDayRatioSeries, setFiveDayRatioSeries] = useState<any>();
  const [tenDayRatioSeries, setTenDayRatioSeries] = useState<any>();

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
      scaleMargins: {
        top: 0.05,
        bottom: 0.4,
      },
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

  // Use effect to create the chart and the price lines, runs only once
  useEffect(() => {
    const stChart = createChart(
      stMomentumChartContainerRef.current!,
      chartOptions
    );
    stMomentumBarChartRef.current = stChart;

    const upBarSeries = stMomentumBarChartRef.current.addHistogramSeries({
      title: `Up`,
      color: positiveColor,
      priceLineVisible: false,
      priceScaleId: "right", // Use the right scale for Up/Down bars
    });

    setUpSeries(upBarSeries);

    const downBarSeries = stMomentumBarChartRef.current.addHistogramSeries({
      title: `Down`,
      color: negativeColor,
      priceLineVisible: false,
      priceScaleId: "right", // Use the right scale for Up/Down bars
    });

    setDownSeries(downBarSeries);

    const fiveDayRatioSeries = stMomentumBarChartRef.current.addLineSeries({
      title: "5D Ratio",
      color: ratioColor,
      lineWidth: 2,
      priceScaleId: "ratio", // Move the ratio series to the left scale
      priceLineVisible: false,
    });

    setFiveDayRatioSeries(fiveDayRatioSeries);

    const tenDayRatioSeries = stMomentumBarChartRef.current.addLineSeries({
      title: "10D Ratio",
      color: tenDayColor,
      lineWidth: 2,
      priceScaleId: "ratio",
      priceLineVisible: false,
    });

    setTenDayRatioSeries(tenDayRatioSeries);

    const ratioPriceScale = stChart.priceScale("ratio");
    ratioPriceScale.applyOptions({
      mode: PriceScaleMode.Logarithmic, // Set the scale mode to logarithmic for ratios
      scaleMargins: {
        top: 0.5,
        bottom: 0.05,
      },
    });

    // Create the price lines only once here
    const lineWidth = 2;

    const lower = {
      price: 0.3,
      color: positiveBlue,
      lineWidth: lineWidth as LineWidth,
      lineStyle: LineStyle.Solid,
      axisLabelVisible: true,
      title: "OS", // Oversold
    };

    const upper = {
      price: 5,
      color: negativeRed,
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
      stChart.remove(); // Cleanup on component unmount
    };
  }, [theme]); // Ensure this effect only runs once and when the theme changes

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

    // Set data for 5 Day Ratio
    const fiveDayRatios = momentumRows.map((m) => ({
      time: m.stMomentumRow.dateStr,
      value: m.stMomentumRow.fiveDayRatio,
    }));

    fiveDayRatioSeries?.setData(fiveDayRatios);

    // Set data for 10 Day Ratio
    const tenDayRatios = momentumRows.map((m) => ({
      time: m.stMomentumRow.dateStr,
      value: m.stMomentumRow.tenDayRatio,
    }));

    tenDayRatioSeries?.setData(tenDayRatios);
  }, [
    upSeries,
    downSeries,
    fiveDayRatioSeries,
    tenDayRatioSeries,
    momentumRows,
  ]); // This effect only runs when the data (momentumRows) changes

  return (
    <Card>
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-lg">
          <div className="flex justify-between items-center">
            <div>4% Up vs 4% Down and 5/10 Day Ratio</div>
            <div className="hidden md:block text-foreground/15 hover:text-foreground/70 cursor-pointer">
              <Dialog>
                <DialogTrigger>
                  <AiOutlineZoomIn />
                </DialogTrigger>
                <DialogContent className="max-w-6xl h-[46rem]">
                  <DialogHeader>
                    <DialogTitle>
                      4% Up vs 4% Down and 5/10 Day Ratio
                    </DialogTitle>
                  </DialogHeader>
                  <div>
                    <STMomentumUpDownChartFullTV momentumRows={momentumRows} />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="w-full pr-1">
        <div className="h-[32rem]">
          <div ref={stMomentumChartContainerRef} className="h-[32rem]"></div>
        </div>
      </CardContent>
    </Card>
  );
};

export default STMomentumUpDownChartTV;
