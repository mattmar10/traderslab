import React from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { EtfMarketData } from "@/lib/types/submarkets-sectors-themes-types";
import { solarizedBase01 } from "@/lib/utils/color-utils";

export interface EtfRetursRadarChartProps {
  etf: EtfMarketData;
  all: EtfMarketData[];
}

const EtfReturnsRadarChart: React.FC<EtfRetursRadarChartProps> = ({
  etf,
  all,
}) => {
  const calculateRankingForMetric = (
    metric: keyof Pick<
      EtfMarketData,
      | "percentDailyChange"
      | "percentWeeklyChange"
      | "percentMonthlyChange"
      | "percentThreeMonthChange"
      | "percentSixMonthChange"
      | "percent1YearChange"
    >
  ) => {
    const sorted = [...all].sort((a, b) => b[metric] - a[metric]);
    const position = sorted.findIndex((item) => item.ticker === etf.ticker);
    return ((all.length - position) / all.length) * 100;
  };

  const rankingData = [
    {
      period: "Week",
      ranking: calculateRankingForMetric("percentWeeklyChange"),
      actualChange: etf.percentWeeklyChange.toFixed(2),
    },
    {
      period: "Month",
      ranking: calculateRankingForMetric("percentMonthlyChange"),
      actualChange: etf.percentMonthlyChange.toFixed(2),
    },
    {
      period: "3M",
      ranking: calculateRankingForMetric("percentThreeMonthChange"),
      actualChange: etf.percentThreeMonthChange.toFixed(2),
    },
    {
      period: "6M",
      ranking: calculateRankingForMetric("percentSixMonthChange"),
      actualChange: etf.percentSixMonthChange.toFixed(2),
    },
    {
      period: "1Y",
      ranking: calculateRankingForMetric("percent1YearChange"),
      actualChange: etf.percent1YearChange.toFixed(2),
    },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded p-2 shadow-sm">
          <p className="font-medium">{payload[0].payload.period}</p>
          <p className="text-sm"> RS Rank: {payload[0].value.toFixed(1)}%</p>
          <p className="text-sm">Change: {payload[0].payload.actualChange}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full aspect-square max-h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart
          data={rankingData}
          margin={{ top: 0, right: 20, bottom: 0, left: 20 }}
        >
          <PolarGrid />
          <PolarAngleAxis
            dataKey="period"
            tick={{ fill: "currentColor", fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Radar
            name="Relative Strength"
            dataKey="ranking"
            fill={solarizedBase01}
            fillOpacity={0.4}
            stroke={solarizedBase01}
            dot={{
              fill: solarizedBase01,
              strokeWidth: 0,
              r: 3,
            }}
            activeDot={{
              fill: solarizedBase01,
              strokeWidth: 2,
              stroke: solarizedBase01,
              r: 3,
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EtfReturnsRadarChart;
