import { ChartConfig, ChartTooltip } from "@/components/ui/chart";
import { EtfMarketData } from "@/lib/types/submarkets-sectors-themes-types";
import { solarizedMagenta, solarizedViolet } from "@/lib/utils/color-utils";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

export interface EtfReturnsBarChartProps {
  etf: EtfMarketData;
}

const EtfReturnsBarChart: React.FC<EtfReturnsBarChartProps> = ({ etf }) => {
  const chartData = [
    {
      period: "daily",
      value: etf.percentDailyChange,
      fill: etf.percentDailyChange >= 0 ? solarizedViolet : solarizedMagenta,
    },
    {
      period: "weekly",
      value: etf.percentWeeklyChange,
      fill: etf.percentWeeklyChange >= 0 ? solarizedViolet : solarizedMagenta,
    },
    {
      period: "monthly",
      value: etf.percentMonthlyChange,
      fill: etf.percentMonthlyChange >= 0 ? solarizedViolet : solarizedMagenta,
    },
    {
      period: "threeMonth",
      value: etf.percentThreeMonthChange,
      fill: etf.percentThreeMonthChange >= 0 ? solarizedViolet : solarizedMagenta,
    },
    {
      period: "sixMonth",
      value: etf.percentSixMonthChange,
      fill: etf.percentSixMonthChange >= 0 ? solarizedViolet : solarizedMagenta,
    },
    {
      period: "oneYear",
      value: etf.percent1YearChange,
      fill: etf.percent1YearChange >= 0 ? solarizedViolet : solarizedMagenta,
    },
  ];

  const chartConfig = {
    value: { label: "Return (%)" },
    daily: { label: "Day" },
    weekly: { label: "Week" },
    monthly: { label: "1M" },
    threeMonth: { label: "3M" },
    sixMonth: { label: "6M" },
    oneYear: { label: "1Y" },
  } satisfies ChartConfig;

  return (
    <div className="h-[230px] py-4 4xl:px-12">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{
            left: 20, // Reduced left margin
            right: 50, // Increased right margin for better balance
            top: 25, // Reduced top margin
            bottom: 10, // Reduced bottom margin
          }}
          className="h-full w-full"
        >
          <YAxis
            dataKey="period"
            type="category"
            tickLine={false}
            tickMargin={8}
            axisLine={false}
            interval={0}
            fontSize={12}
            tickFormatter={(value) =>
              chartConfig[value as keyof typeof chartConfig]?.label
            }
          />
          <XAxis
            type="number"
            tickFormatter={(value) => `${value.toFixed(1)}%`}
            fontSize={12}
            tickMargin={8}
          />
          <ChartTooltip
            cursor={false}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const data = payload[0].payload;
              return (
                <div className="rounded-lg bg-background border p-2 shadow-sm w-28 tabular-nums flex space-x-2">
                  <div className="font-medium text-sm">
                    {
                      chartConfig[data.period as keyof typeof chartConfig]
                        ?.label
                    }:
                  </div>
                  <div
                    className={`text-sm 
                      }`}
                    style={{ color: data.value >= 0 ? solarizedViolet : solarizedMagenta }}
                  >
                    {data.value.toFixed(2)}%
                  </div>
                </div>
              );
            }}
          />
          <Bar dataKey="value" fill="#000000" radius={0} barSize={13} opacity={.7} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EtfReturnsBarChart;
