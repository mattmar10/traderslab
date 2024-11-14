"use client";

import Loading from "@/components/loading";
import { CurrentDayMarketBreadthSnapshotArraySchema } from "@/lib/types/market-breadth-types";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import {
  iwmColor,
  nyseColor,
  qqqeColor,
  rspColor,
} from "@/lib/utils/color-utils";
import { format } from "date-fns";

type ChartDataPoint = {
  time: string; // formatted "HH:mm" string for the timestamp
  NYSE?: number;
  "S&P 500"?: number;
  NDX100?: number;
  "Russell 2000"?: number;
};

const chartConfig = {
  NYSE: { label: "NYSE", color: nyseColor },
  "S&P 500": { label: "S&P 500", color: rspColor },
  NDX100: { label: "NDX100", color: qqqeColor },
  "Russell 2000": { label: "Russell 2000", color: iwmColor },
};

const OverviewIntradayGDB: React.FC = () => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [errorState, setErrorState] = useState<string | null>(null);

  const snapshotsKey = `/api/breadth-snapshots`;

  const getSnapshots = async () => {
    const res = await fetch(snapshotsKey);
    const data = await res.json();
    const parsed = CurrentDayMarketBreadthSnapshotArraySchema.safeParse(data);
    return parsed.success ? parsed.data : "Unable to parse quote results";
  };

  const { data, isLoading, error } = useQuery({
    queryKey: [snapshotsKey],
    queryFn: getSnapshots,
    refetchInterval: 60000,
  });

  useEffect(() => {
    if (data && typeof data !== "string") {
      const cutoffTime = new Date();
      cutoffTime.setHours(15, 30, 0, 0); // Cutoff to 15:30
      const cutoffTimestamp = cutoffTime.getTime();

      const filteredData = data
        .filter((snapshot) => snapshot.timestamp <= cutoffTimestamp)
        .map((snapshot) => ({
          time: format(new Date(snapshot.timestamp), "HH:mm"),
          NYSE: Number(
            snapshot.nyseOverview.globalDailyBreadthPercentileRank.toFixed(2)
          ),
          "S&P 500": Number(
            snapshot.rspTradingOverview.globalDailyBreadthPercentileRank.toFixed(
              2
            )
          ),
          NDX100: Number(
            snapshot.qqqETradingOverview.globalDailyBreadthPercentileRank.toFixed(
              2
            )
          ),
          "Russell 2000": Number(
            snapshot.iwmTradingOverview.globalDailyBreadthPercentileRank.toFixed(
              2
            )
          ),
        }));

      setChartData(filteredData);
      setErrorState(null);
    } else if (typeof data === "string") {
      setErrorState(data);
    }
  }, [data]);

  if (isLoading)
    return (
      <div className="place-items-center">
        <Loading />
      </div>
    );
  if (error || errorState) return <p>Error loading market data.</p>;

  const generateTicks = (data: ChartDataPoint[]): string[] => {
    const tickInterval = 30; // interval in minutes
    const ticks: string[] = [];

    data.forEach((point) => {
      const [, minutes] = point.time.split(":").map(Number);
      if (minutes % tickInterval === 0) {
        ticks.push(point.time);
      }
    });

    return ticks;
  };

  const ticks = generateTicks(chartData);

  return (
    <ChartContainer
      config={{
        returns: {
          label: "Returns",
          color: "text-gray-700",
        },
      }}
      className=" h-[41vh] 4xl:h-[40vh] w-full mt-4"
    >
      <ResponsiveContainer width="100%">
        <LineChart
          data={chartData}
          margin={{ top: 20, right: 10, left: 10, bottom: 5 }}
        >
          <CartesianGrid stroke="#e0e0e0" strokeDasharray="3 3" />
          <ReferenceLine y={0} stroke="#999" strokeWidth={1.5} />
          <XAxis dataKey="time" ticks={ticks} />
          <YAxis
            domain={["auto", "auto"]}
            tickFormatter={(value) => `${value.toFixed(2)}%`}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                className="w-[180px]"
                labelFormatter={(label) => `Time: ${label}`}
                formatter={(value, name) => {
                  const config = chartConfig[name as keyof typeof chartConfig];
                  const color = config ? config.color : "#000";

                  return (
                    <>
                      <div
                        className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                        style={{ backgroundColor: color }}
                      />
                      <span key="label" className="ml-2 font-semibold">
                        {config?.label || name}
                      </span>
                      <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground">
                        {value}
                        <span className="font-normal text-muted-foreground">
                          %
                        </span>
                      </div>
                    </>
                  );
                }}
              />
            }
            cursor={true}
          />
          <Legend />

          {Object.entries(chartConfig).map(([key, config]) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              name={config.label}
              stroke={config.color}
              dot={false}
              connectNulls
              strokeWidth={2}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default OverviewIntradayGDB;
