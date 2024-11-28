import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { RelativeStrengthResults } from "@/lib/types/relative-strength-types";
import { solarizedMagenta, solarizedViolet } from "@/lib/utils/color-utils";

export interface RelativeStrengthBarChartProps {
  rsData: RelativeStrengthResults;
}

const chartConfig = {
  standard: {
    label: "Standard RS",
    color: solarizedViolet,
  },
  adjusted: {
    label: "Vol Adjusted RS",
    color: solarizedMagenta,
  },
} satisfies ChartConfig;

const RelativeStrengthBarChart: React.FC<RelativeStrengthBarChartProps> = ({
  rsData,
}) => {
  // Transform the data into the format required by recharts
  const chartData = [
    {
      period: "1M",
      standard: rsData.relativeStrengthStats.oneMonth,
      adjusted: rsData.volAdjustedRelativeStrengthStats.oneMonth,
    },
    {
      period: "3M",
      standard: rsData.relativeStrengthStats.threeMonth,
      adjusted: rsData.volAdjustedRelativeStrengthStats.threeMonth,
    },
    {
      period: "6M",
      standard: rsData.relativeStrengthStats.sixMonth,
      adjusted: rsData.volAdjustedRelativeStrengthStats.sixMonth,
    },
    {
      period: "1Y",
      standard: rsData.relativeStrengthStats.oneYear,
      adjusted: rsData.volAdjustedRelativeStrengthStats.oneYear,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          Relative Strength By Timeframe
        </CardTitle>
        <CardDescription>
          Standard and Volatility Adjusted Relative Strength
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[20rem]  w-full">
          <ResponsiveContainer width="100%">
            <BarChart
              accessibilityLayer
              data={chartData}
              margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
            >
              <CartesianGrid stroke="#e0e0e0" strokeDasharray="3 3" />
              <XAxis
                dataKey="period"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tickFormatter={(value) => `${value.toFixed(1)}%`}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dashed" />}
              />

              <Legend
                verticalAlign="bottom"
                height={36}
                payload={[
                  {
                    value: "Relative Strength",
                    type: "square",
                    color: solarizedViolet,
                  },
                  {
                    value: "Volatility Adj. Relative Strength",
                    type: "square",
                    color: solarizedMagenta,
                  },
                ]}
                wrapperStyle={{ bottom: -20 }}
              />
              <Bar dataKey="standard" fill={solarizedViolet} radius={2} />
              <Bar dataKey="adjusted" fill={solarizedMagenta} radius={2} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default RelativeStrengthBarChart;
