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
} from "recharts";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import { Button } from "@/components/ui/button";

interface Returns {
  date: string;
  dailyReturn: number;
  cumulativeReturn: number;
}

interface AggregateReturnsChartProps {
  returnsData: Record<string, Returns[]>;
  title?: string;
  returnType?: "daily" | "cumulative";
  startDate?: Date;
  endDate?: Date;
  colorMap?: Record<string, string>;
  tickerNames: Record<string, string>;
}

const DEFAULT_COLORS = [
  "#2563eb", // blue-600
  "#dc2626", // red-600
  "#16a34a", // green-600
  "#9333ea", // purple-600
  "#ea580c", // orange-600
  "#0891b2", // cyan-600
];

const CustomTooltip = ({
  active,
  payload,
  label,
  config,
  tickerNames,
}: any) => {
  if (!active || !payload || !payload.length || !config) return null;

  return (
    <div className="bg-background p-3 border rounded-lg shadow-lg">
      <p className="font-medium mb-2">{label}</p>
      {payload.map((entry: any) => (
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
            {entry.value?.toFixed(2)}%
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
  startDate,
  endDate,
  colorMap = {},
  tickerNames,
}) => {
  // Process the data for the chart
  const processedData = React.useMemo(() => {
    // Get all unique dates across all tickers
    const allDates = new Set<string>();
    Object.values(returnsData).forEach((returns) => {
      returns.forEach((r) => allDates.add(r.date));
    });

    const sortedDates = Array.from(allDates)
      .map((date) => new Date(date))
      .sort((a, b) => a.getTime() - b.getTime());

    // Filter dates if start/end dates are provided
    const filteredDates = sortedDates.filter((date) => {
      if (startDate && date < startDate) return false;
      if (endDate && date > endDate) return false;
      return true;
    });

    return filteredDates.map((date) => {
      const dataPoint: Record<string, any> = {
        date: date.toISOString().split("T")[0],
      };

      Object.entries(returnsData).forEach(([ticker, returns]) => {
        const returnForDate = returns.find(
          (r) => new Date(r.date).toISOString().split("T")[0] === dataPoint.date
        );
        dataPoint[ticker] = returnForDate
          ? returnType === "daily"
            ? returnForDate.dailyReturn
            : returnForDate.cumulativeReturn
          : null;
      });

      return dataPoint;
    });
  }, [returnsData, returnType, startDate, endDate]);

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
  }, [returnsData, colorMap]);

  const monthlyTicks = React.useMemo(() => {
    if (!processedData.length) return [];

    const monthTicks = processedData.reduce((acc, item) => {
      const monthYear = item.date.substring(0, 7);
      if (!acc.has(monthYear)) {
        acc.set(monthYear, item.date);
      }
      return acc;
    }, new Map<string, string>());

    return Array.from(monthTicks.values()) as string[];
  }, [processedData]);

  const [selectedTickers, setSelectedTickers] = useState<string[]>(
    Object.keys(returnsData)
  );

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
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>

      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="h-[60vh] 4xl:h-[30vh] w-full"
        >
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
            <ReferenceLine y={0} stroke="#999" strokeWidth={1.5} />

            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              ticks={monthlyTicks}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  year: "2-digit",
                });
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${value.toFixed(1)}%`}
            />
            <Tooltip
              content={
                <CustomTooltip config={chartConfig} tickerNames={tickerNames} />
              }
              cursor={{ strokeDasharray: "3 3" }}
            />
            {/*<ChartTooltip
              content={
                <ChartTooltipContent
                  hideLabel
                  className="w-[325px] p-2"
                  formatter={(value, name, item, index) => (
                    <>
                      <div
                        className="h-2.5 w-2.5 shrink-0 rounded-[2px] bg-[--color-bg]"
                        style={
                          {
                            "--color-bg": `var(--color-${name})`,
                          } as React.CSSProperties
                        }
                      />
                      <span className="font-semibold">{name}</span>
                      {chartConfig[name as keyof typeof chartConfig]?.label}
                      <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground">
                        {value}
                        <span className="font-normal text-muted-foreground">
                          %
                        </span>
                      </div>
                    </>
                  )}
                />
              }
              cursor={false}
              defaultIndex={1}
            />*/}
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
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div>
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.keys(returnsData).map((ticker) => (
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
        </div>
      </CardFooter>
    </Card>
  );
};

export default AggregateReturnsChart;
