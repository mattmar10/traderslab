"use client"

import React from "react";
import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { EtfMarketData } from "@/lib/types/submarkets-sectors-themes-types";
import { solarizedBase01, solarizedMagenta } from "@/lib/utils/color-utils";

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

  const calculateRankingVolAdustedForMetric = (
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
    const sorted = [...all].sort((a, b) => {
      const aRiskAdjusted = a[metric] / a.oneMonthDailyADRP;
      const bRiskAdjusted = b[metric] / b.oneMonthDailyADRP;
      return bRiskAdjusted - aRiskAdjusted;
    });
    const position = sorted.findIndex((item) => item.ticker === etf.ticker);
    return ((all.length - position) / all.length) * 100;
  };

  const rankingData = [
    {
      period: "Week",
      ranking: calculateRankingForMetric("percentWeeklyChange"),
      volAdjustedRanking: calculateRankingVolAdustedForMetric("percentWeeklyChange"),
      actualChange: etf.percentWeeklyChange.toFixed(2),
    },
    {
      period: "Month",
      ranking: calculateRankingForMetric("percentMonthlyChange"),
      volAdjustedRanking: calculateRankingVolAdustedForMetric("percentMonthlyChange"),
      actualChange: etf.percentMonthlyChange.toFixed(2),
    },
    {
      period: "3M",
      ranking: calculateRankingForMetric("percentThreeMonthChange"),
      volAdjustedRanking: calculateRankingVolAdustedForMetric("percentThreeMonthChange"),
      actualChange: etf.percentThreeMonthChange.toFixed(2),
    },
    {
      period: "6M",
      ranking: calculateRankingForMetric("percentSixMonthChange"),
      volAdjustedRanking: calculateRankingVolAdustedForMetric("percentSixMonthChange"),
      actualChange: etf.percentSixMonthChange.toFixed(2),
    },
    {
      period: "1Y",
      ranking: calculateRankingForMetric("percent1YearChange"),
      volAdjustedRanking: calculateRankingVolAdustedForMetric("percent1YearChange"),
      actualChange: etf.percent1YearChange.toFixed(2),
    },
  ];


  const renderLegendContent = (props: any) => {
    const { payload } = props;

    return (
      <ul className="flex justify-center items-center space-x-4 text-xs">
        {payload.map((entry: any, index: number) => (
          <li key={`item-${index}`} className="flex items-center space-x-2">
            <span className="inline-block w-3 h-3" style={{ backgroundColor: entry.color }} />
            <span className="text-foreground/70">{entry.value}</span>
          </li>
        ))}
      </ul>
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const period = payload[0].payload.period;
      const regularRanking = payload.find((p: { dataKey: string; }) => p.dataKey === "ranking")?.value.toFixed(1);
      const volAdjustedRanking = payload.find((p: { dataKey: string; }) => p.dataKey === "volAdjustedRanking")?.value.toFixed(1);

      return (
        <div className="bg-background border rounded p-2 shadow-sm">
          <p className="font-medium">{period}</p>
          <p className="text-sm">RS Rank: {regularRanking}%</p>
          <p className="text-sm">Vol-Adjusted RS: {volAdjustedRanking}%</p>
          <p className="text-sm">Change: {payload[0].payload.actualChange}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="90%">
          <RadarChart
            data={rankingData}
            margin={{ top: 0, right: 30, bottom: 0, left: 30 }}
          >
            <PolarGrid />
            <PolarAngleAxis
              dataKey="period"
              tick={{ fill: "currentColor", fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              content={renderLegendContent}
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{ bottom: "-5px" }}
            />
            <Radar
              name="RS Rank"
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
            <Radar
              name="Vol-Adjusted RS"
              dataKey="volAdjustedRanking"
              fill={solarizedMagenta}
              fillOpacity={0.3}
              stroke={solarizedMagenta}
              dot={{
                fill: solarizedMagenta,
                strokeWidth: 0,
                r: 3,
              }}
              activeDot={{
                fill: solarizedMagenta,
                strokeWidth: 2,
                stroke: solarizedMagenta,
                r: 3,
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EtfReturnsRadarChart;

