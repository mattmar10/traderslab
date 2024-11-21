"use client";

import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { Label } from "@/components/ui/label";
import { isFMPDataLoadingError } from "@/lib/types/fmp-types";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ZAxis,
  Cell,
  ReferenceLine,
} from "recharts";
import { sectorsOrderMap } from "./util";
import CustomYAxisLabel from "./y-axis-label";
import { getRealTimeQuotes } from "@/actions/market-data/actions";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Loading from "@/components/loading";
import { negativeColor, positiveColor } from "@/lib/utils/color-utils";

interface StockDataPoint {
  ticker: string;
  sector: number;
  return: number;
  volume: number;
}

export function getSectorNumber(sectorName: string): number {
  const key = sectorName.trim().replaceAll(" ", "-").toLowerCase();
  return sectorsOrderMap.get(key) || 60;
}

export interface SectorSwarmplotResponse {
  market: MarketType;
}

type MarketType = "sp500" | "ns100" | "iwm" | "nyse";

const marketOptions: { value: MarketType; label: string }[] = [
  { value: "sp500", label: "S&P 500" },
  { value: "ns100", label: "Nasdaq 100" },
  { value: "iwm", label: "Russell 2000" },
  { value: "nyse", label: "NYSE" },
];

const SectorSwarmplot: React.FC<SectorSwarmplotResponse> = ({
  market: initialMarket,
}) => {
  const [selectedMarket, setSelectedMarket] =
    useState<MarketType>(initialMarket);

  const {
    data: quotes,
    error,
    refetch,
  } = useQuery({
    queryKey: ["realTimeQuotes", selectedMarket],
    queryFn: () => getRealTimeQuotes(selectedMarket as MarketType),
    refetchInterval: 60000,
    staleTime: 55000,
  });

  const handleMarketChange = (value: MarketType) => {
    setSelectedMarket(value);
    refetch();
  };

  if (!quotes || quotes.length === 0) {
    return (
      <div className="place-items-center">
        <Loading />
      </div>
    );
  }

  if (isFMPDataLoadingError(quotes) || error) {
    return <p className="text-muted-foreground">Error loading market data</p>;
  }

  const mapped: StockDataPoint[] = quotes
    .filter((q) => q.volume > 10)
    .map((q) => ({
      ticker: q.ticker,
      return: q.changesPercentage,
      sector: getSectorNumber(q.sector),
      volume: q.volume,
    }));

  const minReturn = Math.floor(
    Math.min(...mapped.map((data) => data.return)) - 1
  );
  const maxReturn = Math.ceil(
    Math.max(...mapped.map((data) => data.return)) + 1
  );

  const minMax = Math.max(Math.abs(minReturn), Math.abs(maxReturn));
  const interval = Math.ceil(minMax / 10);
  const returnTicks = Array.from(
    { length: Math.ceil((2 * minMax) / interval) + 1 },
    (_, i) => -minMax + i * interval
  );

  return (
    <>
      <div className="flex items-center justify-end space-x-2 mb-4">
        <Label htmlFor="market-select" className="whitespace-nowrap mr-2">
          Market:
        </Label>
        {marketOptions.map((option) => (
          <Button
            size={"sm"}
            key={option.value}
            onClick={() => handleMarketChange(option.value)}
            variant={selectedMarket === option.value ? "default" : "secondary"}
          >
            {option.label}
          </Button>
        ))}
      </div>
      <ChartContainer
        config={{
          stocks: {
            label: "Stocks",
            color: "text-gray-700",
          },
        }}
        className="h-[42vh] 4xl:h-[38vh] mt-2 w-full"
      >
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart
            margin={{
              top: 10,
              right: 20,
              bottom: 20,
              left: window.innerWidth < 768 ? 60 : 80,
            }}
          >
            <CartesianGrid stroke="#e0e0e0" strokeDasharray="3 3" />
            <ReferenceLine x={0} stroke="#999" strokeWidth={1.5} />
            <XAxis
              type="number"
              dataKey="return"
              name="Return"
              unit="%"
              ticks={returnTicks}
              interval={0}
              domain={[-minMax, minMax]}
              stroke="#555"
              tickFormatter={(value) => value.toFixed(0)}
              fontSize={12}
            />
            <YAxis
              type="number"
              dataKey="sector"
              name="Sector"
              ticks={Array.from(sectorsOrderMap.values())}
              domain={[0, 60]}
              stroke="#555"
              tick={({ x, y, payload }) => (
                <CustomYAxisLabel x={x} y={y} payload={payload} />
              )}
              tickMargin={16}
            />
            <ZAxis
              type="number"
              dataKey="volume"
              range={[50, window.innerWidth < 768 ? 1000 : 2000]}
              name="Volume"
              unit="M"
            />
            <ChartTooltip
              cursor={{ strokeDasharray: "3 3" }}
              content={<CustomTooltip />}
            />
            <Scatter name="Stocks" data={mapped} fillOpacity={0.6}>
              {mapped.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.return >= 0 ? positiveColor : negativeColor}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </ChartContainer>
    </>
  );
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: { payload: StockDataPoint }[];
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-background p-4 rounded shadow-lg border border-foreground/10">
        <p className="font-semibold">{data.ticker}</p>
        <p>Return: {data.return.toFixed(2)}%</p>
        <p>Volume: {Intl.NumberFormat().format(data.volume)}M</p>
      </div>
    );
  }
  return null;
};

export default SectorSwarmplot;
