"use client";
import React from "react";
import { IncomeStatement } from "@/lib/types/fmp-types";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Line, LineChart, CartesianGrid, Legend, XAxis, YAxis } from "recharts";

export interface OverviewFinancialsCardProps {
  incomeStatement: IncomeStatement;
}

const IncomeStatementChart: React.FC<OverviewFinancialsCardProps> = ({
  incomeStatement,
}) => {
  const colors = {
    primary: "#d33682", // Solarized magenta
    secondary: "#6c71c4", // Solarized violet
    grid: "#94A3B8", // Neutral gray
    regressionPrimary: "#d33682aa", // Semi-transparent version
    regressionSecondary: "#6c71c4aa", // Semi-transparent version
  };

  // Helper function to format numbers consistently
  const formatNumber = (value: number) => {
    if (Math.abs(value) >= 1e9) {
      return `$${(value / 1e9).toFixed(1)}B`;
    } else if (Math.abs(value) >= 1e6) {
      return `$${(value / 1e6).toFixed(1)}M`;
    } else if (Math.abs(value) >= 1e3) {
      return `$${(value / 1e3).toFixed(1)}K`;
    } else {
      return `$${value.toFixed(1)}`;
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}:{" "}
              {entry.name === "EPS"
                ? `$${entry.value.toFixed(2)}`
                : formatNumber(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const currentYear = new Date().getFullYear();
  const filteredData = incomeStatement.filter(
    (statement) => parseInt(statement.calendarYear, 10) >= currentYear - 1
  );

  const groupedData = filteredData.reduce((acc, statement) => {
    const key = `${statement.calendarYear} ${statement.period}`;
    if (!acc[key]) {
      acc[key] = {
        period: key,
        revenue: 0,
        epsDiluted: 0,
      };
    }
    acc[key].revenue += statement.revenue;
    acc[key].epsDiluted += statement.epsdiluted;
    return acc;
  }, {} as Record<string, { period: string; revenue: number; epsDiluted: number }>);

  const chartData = Object.values(groupedData).sort((a, b) => {
    const [yearA, periodA] = a.period.split(" ");
    const [yearB, periodB] = b.period.split(" ");

    if (yearA !== yearB) {
      return parseInt(yearA) - parseInt(yearB);
    }

    const periodOrder = { Q1: 1, Q2: 2, Q3: 3, Q4: 4 };
    return (
      periodOrder[periodA as keyof typeof periodOrder] -
      periodOrder[periodB as keyof typeof periodOrder]
    );
  });

  const revenueRegression = calculateLinearRegression(
    chartData,
    "period",
    "revenue"
  );
  const epsRegression = calculateLinearRegression(
    chartData,
    "period",
    "epsDiluted"
  );

  const dataWithRegression = chartData.map((item, index) => ({
    ...item,
    revenueRegression: revenueRegression[index].revenueRegression,
    epsDilutedRegression: epsRegression[index].epsDilutedRegression,
  }));

  console.log(dataWithRegression);

  const chartConfig = {
    revenue: {
      label: "Revenue",
      color: colors.primary,
    },
    epsDiluted: {
      label: "EPS",
      color: colors.secondary,
    },
    revenueRegression: {
      label: "Revenue Trend",
      color: colors.regressionPrimary,
    },
    epsDilutedRegression: {
      label: "EPS Trend",
      color: colors.regressionSecondary,
    },
  } satisfies ChartConfig;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Financial Snapshot</CardTitle>
        <CardDescription>1Y Quarter by Quarter Overview</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="w-full h-[20rem]">
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{ top: 40, right: 40, left: 40, bottom: 20 }}
          >
            <CartesianGrid
              vertical={false}
              stroke={colors.grid}
              strokeOpacity={0.2}
            />
            <XAxis
              dataKey="period"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              stroke={colors.grid}
            />
            <YAxis
              yAxisId="revenue"
              orientation="left"
              tickFormatter={formatNumber}
              stroke={colors.grid}
              label={{
                value: "Revenue ($)",
                position: "insideTop",
                offset: -30,
                style: {
                  fill: colors.primary,
                  textAnchor: "middle",
                  dy: -10,
                },
              }}
            />
            <YAxis
              yAxisId="eps"
              orientation="right"
              tickFormatter={(value) => `$${value.toFixed(2)}`}
              stroke={colors.grid}
              label={{
                value: "EPS ($)",
                position: "insideTop",
                offset: -30,
                style: {
                  fill: colors.secondary,
                  textAnchor: "middle",
                  dy: -10,
                },
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              wrapperStyle={{
                paddingTop: "20px",
              }}
            />
            <ChartTooltip cursor={false} content={<CustomTooltip />} />
            <Line
              yAxisId="revenue"
              type="monotone"
              dataKey="revenue"
              stroke={colors.primary}
              strokeWidth={2}
              dot={{ r: 4, fill: colors.primary }}
              activeDot={{ r: 6, fill: colors.primary }}
              name="Revenue"
            />
            <Line
              yAxisId="eps"
              type="monotone"
              dataKey="epsDiluted"
              stroke={colors.secondary}
              strokeWidth={2}
              dot={{ r: 4, fill: colors.secondary }}
              activeDot={{ r: 6, fill: colors.secondary }}
              name="EPS"
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default IncomeStatementChart;

function calculateLinearRegression(data: any[], xKey: string, yKey: string) {
  const n = data.length;

  // Convert x values (dates) to numeric indices
  const xValues = data.map((_, index) => index);
  const yValues = data.map((item) => item[yKey]);

  // Calculate means
  const xMean = xValues.reduce((a, b) => a + b, 0) / n;
  const yMean = yValues.reduce((a, b) => a + b, 0) / n;

  // Calculate coefficients
  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i < n; i++) {
    numerator += (xValues[i] - xMean) * (yValues[i] - yMean);
    denominator += Math.pow(xValues[i] - xMean, 2);
  }

  const slope = numerator / denominator;
  const intercept = yMean - slope * xMean;

  // Generate regression line points
  return data.map((_, index) => ({
    period: data[index].period,
    [yKey + "Regression"]: slope * index + intercept,
  }));
}
