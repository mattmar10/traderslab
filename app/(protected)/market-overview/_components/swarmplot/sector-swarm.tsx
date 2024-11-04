"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { Label } from "@/components/ui/label";
import {
  isFMPDataLoadingError,
  RealtimeQuoteResponse,
} from "@/lib/types/fmp-types";
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
import { useQuery } from "react-query";
import { useEffect, useState } from "react";

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
  quotes: RealtimeQuoteResponse[];
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
  quotes: initialData,
  market: initialMarket,
}) => {
  const [selectedMarket, setSelectedMarket] =
    useState<MarketType>(initialMarket);
  const [containerHeight, setContainerHeight] = useState("625px");

  // Adjust container height based on viewport
  useEffect(() => {
    const updateHeight = () => {
      const vh = window.innerHeight;
      // For smaller screens, use 80vh with a minimum height
      if (vh < 800) {
        setContainerHeight(`max(500px, ${Math.min(80, vh * 0.8)}px)`);
      } else {
        // For larger screens, cap at 800px
        setContainerHeight("min(800px, 80vh)");
      }
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  const {
    data: quotes,
    error,
    refetch,
  } = useQuery({
    queryKey: ["realTimeQuotes", selectedMarket],
    queryFn: () => getRealTimeQuotes(selectedMarket as MarketType),
    refetchInterval: 60000,
    initialData,
    staleTime: 55000,
  });

  const handleMarketChange = async (value: MarketType) => {
    setSelectedMarket(value);
    await getRealTimeQuotes(value);
    refetch();
  };

  if (!quotes || quotes.length === 0) {
    return (
      <Card className="w-full h-full">
        <CardContent className="flex items-center justify-center h-[500px]">
          <p className="text-muted-foreground">No market data available.</p>
        </CardContent>
      </Card>
    );
  }

  if (isFMPDataLoadingError(quotes) || error) {
    return (
      <Card className="w-full h-full">
        <CardContent className="flex items-center justify-center h-[500px]">
          <p className="text-muted-foreground">Error loading market data</p>
        </CardContent>
      </Card>
    );
  }

  const mapped: StockDataPoint[] = quotes.map((q) => ({
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

  // Set the interval to ensure we have 20 ticks in total (10 on each side)
  const interval = Math.ceil(minMax / 10);

  // Generate the ticks array from -minMax to +minMax, with the calculated interval
  const returnTicks = Array.from(
    { length: Math.ceil((2 * minMax) / interval) + 1 },
    (_, i) => -minMax + i * interval
  );

  return (
    <Card className="w-full relative" style={{ height: containerHeight }}>
      <CardHeader className="flex-none flex flex-row items-center justify-between  px-4 lg:px-6">
        <div className="flex-shrink">
          <CardTitle className="text-lg lg:text-xl">
            Sector Performance Distribution
          </CardTitle>
          <CardDescription className="text-sm">
            High level overview of returns across sectors
          </CardDescription>
        </div>
        <div className="flex items-center space-x-1 flex-shrink-0">
          <Label htmlFor="market-select" className="whitespace-nowrap">
            Market:
          </Label>
          <Select value={selectedMarket} onValueChange={handleMarketChange}>
            <SelectTrigger
              id="market-select"
              className="w-[120px] lg:w-[140px]"
            >
              <SelectValue placeholder="Select market" />
            </SelectTrigger>
            <SelectContent>
              {marketOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="absolute inset-0 mt-[120px] mb-4 px-2 lg:px-4">
        <ChartContainer
          config={{
            stocks: {
              label: "Stocks",
              color: "text-gray-700",
            },
          }}
          className="h-full w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart
              margin={{
                top: 10,
                right: 20,
                bottom: 10,
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
                interval={0} // Ensures all ticks in returnTicks are displayed
                domain={[-minMax, minMax]} // Set domain directly to enforce min/max
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
                  <CustomYAxisLabel
                    x={x}
                    y={y}
                    payload={payload}
                    // fontSize={window.innerWidth < 768 ? 10 : 12}
                  />
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
                    fill={entry.return >= 0 ? "#1e90ff" : "#ff5f5f"}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
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
