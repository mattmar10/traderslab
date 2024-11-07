import {
  GlobalDailyBreadthDataPoint,
  GlobalDailyBreadthDataPointWithRank,
} from "@/lib/types/market-breadth-types";
import { negativeRed, positiveBlue } from "@/lib/utils/color-utils";

export const calculateColorFromPercentage = (
  value: number,
  theme: "dark" | "light",
  min: number,
  neutral: number,
  max: number
): string => {
  // Define colors for light and dark themes
  const positiveColor = positiveBlue
  const negativeColor = negativeRed

  // Calculate opacity based on distance from neutral value
  let opacity;
  if (value < neutral) {
    opacity = Math.max(0, Math.min(1, (neutral - value) / (neutral - min)));
  } else {
    opacity = Math.max(0, Math.min(1, (value - neutral) / (max - neutral)));
  }

  // Interpolate opacity
  const interpolatedOpacity = Math.round(opacity * 100);

  // Determine color based on value and neutral
  let color;
  if (value === neutral) {
    color = positiveColor;
  } else {
    color = value >= neutral ? positiveColor : negativeColor;
  }

  color =
    color + Math.min(interpolatedOpacity, 100).toString(16).padStart(2, "0");

  return color;
};

export function calculatePercentileRank(
  data: GlobalDailyBreadthDataPoint[],
  day: string
): number {
  const positiveValues = data
    .filter((entry) => entry.globalDailyBreadth > 0)
    .map((entry) => entry.globalDailyBreadth);
  const negativeValues = data
    .filter((entry) => entry.globalDailyBreadth < 0)
    .map((entry) => -entry.globalDailyBreadth);

  const sortedPositiveValues = positiveValues.sort((a, b) => a - b);
  const sortedNegativeValues = negativeValues.sort((a, b) => a - b);

  const value =
    data.find((entry) => entry.dateStr === day)?.globalDailyBreadth ?? 0;

  let rank: number;
  if (value > 0) {
    const index = sortedPositiveValues.indexOf(value);
    rank = ((index + 1) / sortedPositiveValues.length) * 100;
  } else if (value < 0) {
    const index = sortedNegativeValues.indexOf(-value);
    rank = -(((index + 1) / sortedNegativeValues.length) * 100);
  } else {
    rank = 0;
  }

  return rank;
}

export function addPercentileRankToData(
  data: GlobalDailyBreadthDataPoint[]
): GlobalDailyBreadthDataPointWithRank[] {
  return data.map((entry) => ({
    dateStr: entry.dateStr,
    globalDailyBreadthPercentileRank: calculatePercentileRank(
      data,
      entry.dateStr
    ),
    globalDailyBreadth: entry.globalDailyBreadth,
  }));
}
