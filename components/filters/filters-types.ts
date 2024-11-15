import { ScreenerRanges } from "@/lib/types/screener-types";

export type RangeKeys =
  | keyof Pick<
      ScreenerRanges,
      | "priceRange"
      | "volumeRange"
      | "marketCapRange"
      | "adrPercentRange"
      | "rsRankRange"
      | "relativeVolumeRange"
      | "oneDayAbsoluteChangeRange"
      | "oneDayReturnPercentRange"
      | "oneWeekReturnPercentRange"
      | "oneMonthReturnPercentRange"
      | "threeMonthReturnPercentRange"
      | "sixMonthReturnPercentRange"
      | "oneYearReturnPercentRange"
      | "fiftyTwoWeekHighPercentageRange"
      | "fiftyTwoWeekLowPercentageRange"
      | "twentyVolumeSMARange"
      | "dailyLiquidityRange"
      | "volatilityContractionScoreRange"
      | "dailyRangeHistoricalVolatilityRange"
      | "trendMomentumRange"
      | "volatilityAdjustedTrendMomentumRange"
    >
  | "dailyClosingRangePercentRange";

export function isRangeKey(key: string): key is RangeKeys {
  return [
    "priceRange",
    "volumeRange",
    "relativeVolumeRange",
    "marketCapRange",
    "adrPercentRange",
    "rsRankRange",
    "dailyClosingRangePercentRange",
    "oneDayAbsoluteChangeRange",
    "oneDayReturnPercentRange",
    "oneWeekReturnPercentRange",
    "oneMonthReturnPercentRange",
    "threeMonthReturnPercentRange",
    "sixMonthReturnPercentRange",
    "oneYearReturnPercentRange",
    "fiftyTwoWeekHighPercentageRange",
    "fiftyTwoWeekLowPercentageRange",
    "twentyVolumeSMARange",
    "dailyLiquidityRange",
    "volatilityContractionScoreRange",
    "dailyRangeHistoricalVolatilityRange",
    "trendMomentumRange",
    "volatilityAdjustedTrendMomentumRange",
  ].includes(key);
}
