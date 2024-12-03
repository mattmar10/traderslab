"use client";

import React, { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ReturnsData } from "./market-sectors-themes-wrapper";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChartLineIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimeframeOption {
  label: string;
  months: number;
}

const TIMEFRAME_OPTIONS: TimeframeOption[] = [
  { label: "1M", months: 1 },
  { label: "3M", months: 3 },
  { label: "6M", months: 6 },
  { label: "1Y", months: 12 },
];

interface AggregateReturnsChartProps {
  returnsData: Record<string, ReturnsData[]>;
  title?: string;
  returnType?: "daily" | "cumulative";
  endDate?: Date;
  colorMap?: Record<string, string>;
  tickerNames: Record<string, string>;
}

const DEFAULT_COLORS = [
  "#2563eb",
  "#dc2626",
  "#16a34a",
  "#9333ea",
  "#ea580c",
  "#0891b2",
];

const CustomTooltip = ({
  active,
  payload,
  label,
  config,
  tickerNames,
  isRelativeStrength,
}: any) => {
  if (!active || !payload || !payload.length || !config) return null;

  const sortedPayload = [...payload].sort((a, b) => b.value - a.value);

  return (
    <div className="bg-background p-3 border rounded-lg shadow-lg">
      <p className="font-medium mb-2">{label}</p>
      {sortedPayload.map((entry: any) => (
        <div
          key={entry.dataKey}
          className="flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.stroke }}
            />
            <span className="font-semibold">{entry.dataKey}</span>
            <span>{` - ${tickerNames?.[entry.dataKey] || entry.dataKey}`}</span>
          </div>
          <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground">
            {isRelativeStrength
              ? entry.value?.toFixed(4)
              : `${entry.value?.toFixed(2)}%`}
          </div>
        </div>
      ))}
    </div>
  );
};

const AggregateReturnsChart: React.FC<AggregateReturnsChartProps> = ({
  returnsData,
  title = "Returns Comparison",
  returnType = "cumulative",
  endDate = new Date(),
  colorMap = {},
  tickerNames,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const [selectedTickers, setSelectedTickers] = useState<string[]>(
    Object.keys(returnsData)
  );
  const [isRelativeStrength, setIsRelativeStrength] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeOption>(
    TIMEFRAME_OPTIONS[3]
  );

  const getTickDates = (data: any[], timeframe: TimeframeOption) => {
    if (!data.length) return [];

    // For 12M view, use monthly ticks
    if (timeframe.months === 12) {
      return data.reduce((acc, item) => {
        const monthYear = item.date.substring(0, 7);
        if (!acc.has(monthYear)) {
          acc.set(monthYear, item.date);
        }
        return acc;
      }, new Map<string, string>());
    }

    // For 1M view, use daily ticks
    if (timeframe.months === 1) {
      return data.reduce((acc, item) => {
        acc.set(item.date, item.date);
        return acc;
      }, new Map<string, string>());
    }

    // For 3M and 6M timeframes, use bi-weekly ticks
    const twoWeeksMs = 14 * 24 * 60 * 60 * 1000;
    const dates = data.map((item) => new Date(item.date));
    const startDate = dates[0];
    const endDate = dates[dates.length - 1];

    const ticks = new Map<string, string>();
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      // Find the closest actual data point to this tick
      const closest = data.reduce((prev, curr) => {
        const prevDate = new Date(prev.date);
        const currDate = new Date(curr.date);
        const prevDiff = Math.abs(prevDate.getTime() - currentDate.getTime());
        const currDiff = Math.abs(currDate.getTime() - currentDate.getTime());
        return currDiff < prevDiff ? curr : prev;
      });

      ticks.set(currentDate.toISOString(), closest.date);

      // Move to next tick
      currentDate = new Date(currentDate.getTime() + twoWeeksMs);
    }

    return ticks;
  };

  const calculateStartDate = React.useCallback(
    (timeframe: TimeframeOption) => {
      const date = new Date(endDate);
      date.setMonth(date.getMonth() - timeframe.months);
      return date;
    },
    [endDate]
  );

  const processedData = React.useMemo(() => {
    const startDate = calculateStartDate(selectedTimeframe);

    // Get all unique dates across all tickers
    const allDates = new Set<string>();
    Object.values(returnsData).forEach((returns) => {
      returns.forEach((r) => allDates.add(r.date));
    });

    const sortedDates = Array.from(allDates)
      .map((date) => new Date(date))
      .sort((a, b) => a.getTime() - b.getTime())
      .filter((date) => date >= startDate && date <= endDate);

    // Find starting prices for each ticker at the start date
    const startingPrices: Record<string, number> = {};
    Object.entries(returnsData).forEach(([ticker, returns]) => {
      // Find the closest date to startDate
      const startPoint = returns
        .filter((r) => new Date(r.date) >= startDate)
        .sort(
          (a, b) =>
            Math.abs(new Date(a.date).getTime() - startDate.getTime()) -
            Math.abs(new Date(b.date).getTime() - startDate.getTime())
        )[0];

      if (startPoint) {
        startingPrices[ticker] = startPoint.price;
      }
    });

    return sortedDates.map((date) => {
      const dataPoint: Record<string, any> = {
        date: date.toISOString().split("T")[0],
      };

      if (isRelativeStrength) {
        const rspData = returnsData["RSP"]?.find(
          (r) => new Date(r.date).getTime() === date.getTime()
        );
        const rspPrice = rspData?.price;

        Object.entries(returnsData).forEach(([ticker, returns]) => {
          const returnForDate = returns.find(
            (r) => new Date(r.date).getTime() === date.getTime()
          );

          if (returnForDate?.price && rspPrice) {
            dataPoint[ticker] = returnForDate.price / rspPrice;
          } else {
            dataPoint[ticker] = null;
          }
        });
      } else {
        // Calculate returns relative to the timeframe start
        Object.entries(returnsData).forEach(([ticker, returns]) => {
          const returnForDate = returns.find(
            (r) => new Date(r.date).getTime() === date.getTime()
          );

          if (returnForDate?.price && startingPrices[ticker]) {
            // Calculate return relative to the timeframe start
            const periodReturn =
              ((returnForDate.price - startingPrices[ticker]) /
                startingPrices[ticker]) *
              100;
            dataPoint[ticker] = periodReturn;
          } else {
            dataPoint[ticker] = null;
          }
        });
      }

      return dataPoint;
    });
  }, [returnsData, returnType, endDate, selectedTimeframe, isRelativeStrength]);

  const chartConfig = React.useMemo(() => {
    const config: ChartConfig = {};
    Object.keys(returnsData).forEach((ticker, index) => {
      config[ticker] = {
        label: `${tickerNames[ticker]}`,
        color:
          colorMap[ticker] || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
      };
    });
    return config;
  }, [returnsData, colorMap, tickerNames]);

  const chartTicks: string[] = React.useMemo(() => {
    const ticks = getTickDates(processedData, selectedTimeframe);
    return Array.from(ticks.values());
  }, [processedData, selectedTimeframe]);

  const handleTickerToggle = (ticker: string) => {
    setSelectedTickers((prevSelectedTickers) => {
      if (prevSelectedTickers.includes(ticker)) {
        return prevSelectedTickers.filter((t) => t !== ticker);
      } else {
        return [...prevSelectedTickers, ticker];
      }
    });
  };
  return (
    <Card className="w-full">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "relative flex items-center gap-4 h-6 w-auto p-2",
                  "hover:bg-muted/0 transition-all duration-200"
                )}
              >
                <div
                  className={cn(
                    "relative",
                    !isOpen &&
                    "after:absolute after:inset-0 after:rounded-full after:border after:border-primary/20 after:animate-[ping_3s_ease-in-out_infinite]"
                  )}
                >
                  <ChartLineIcon
                    className={cn(
                      "h-5 w-5 hover:text-primary/70 transition-colors duration-200",
                      isOpen &&
                      "rotate-90 transform transition-transform duration-200"
                    )}
                  />
                </div>
                <CardTitle className="font-semibold text-lg">{title}</CardTitle>
                <span className="sr-only">Toggle chart</span>
              </Button>
            </CollapsibleTrigger>
          </div>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-1">
              {TIMEFRAME_OPTIONS.map((timeframe) => (
                <Button
                  key={timeframe.label}
                  variant={
                    timeframe === selectedTimeframe ? "secondary" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedTimeframe(timeframe)}
                >
                  {timeframe.label}
                </Button>
              ))}
            </div>
            <div className="flex items-center space-x-2">
              <span
                className={`text-sm transition-colors duration-200 ${!isRelativeStrength
                  ? "text-foreground"
                  : "text-muted-foreground"
                  }`}
              >
                Returns
              </span>
              <Switch
                checked={isRelativeStrength}
                onCheckedChange={setIsRelativeStrength}
                id="chart-mode"
                className="mx-2"
              />
              <span
                className={`text-sm transition-colors duration-200 ${isRelativeStrength
                  ? "text-foreground"
                  : "text-muted-foreground"
                  }`}
              >
                Relative Strength
              </span>
            </div>
          </div>
        </div>

        <CollapsibleContent>
          <CardContent className="w-full">
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer>
                <LineChart
                  data={processedData}
                  margin={{
                    left: 12,
                    right: 12,
                    top: 12,
                    bottom: 12,
                  }}
                >
                  <CartesianGrid stroke="#e0e0e0" strokeDasharray="3 3" />
                  <ReferenceLine
                    y={isRelativeStrength ? 1 : 0}
                    stroke="#999"
                    strokeWidth={1.5}
                  />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    ticks={chartTicks}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      if (selectedTimeframe.months === 12) {
                        return date.toLocaleDateString("en-US", {
                          month: "short",
                          year: "2-digit",
                        });
                      }
                      return date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      });
                    }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) =>
                      isRelativeStrength
                        ? value.toFixed(2)
                        : `${value.toFixed(1)}%`
                    }
                  />
                  <Tooltip
                    content={
                      <CustomTooltip
                        config={chartConfig}
                        tickerNames={tickerNames}
                        isRelativeStrength={isRelativeStrength}
                      />
                    }
                    cursor={{ strokeDasharray: "3 3" }}
                  />
                  {Object.keys(returnsData).map((ticker) => (
                    <Line
                      key={ticker}
                      type="monotone"
                      dataKey={ticker}
                      name={ticker}
                      stroke={chartConfig[ticker].color}
                      strokeWidth={ticker === "RSP" ? 3 : 1}
                      dot={false}
                      activeDot={{ r: 4 }}
                      hide={!selectedTickers.includes(ticker)}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
          <CardFooter>
            <div className="flex flex-wrap gap-2 mb-4">
              {Object.keys(returnsData)
                .sort((a, b) =>
                  (tickerNames[a] || a).localeCompare(tickerNames[b] || b)
                )
                .map((ticker) => (
                  <Button
                    key={ticker}
                    variant={
                      selectedTickers.includes(ticker) ? "secondary" : "outline"
                    }
                    size="sm"
                    onClick={() => handleTickerToggle(ticker)}
                  >
                    {tickerNames?.[ticker] || ticker}
                  </Button>
                ))}
            </div>
          </CardFooter>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default AggregateReturnsChart;
