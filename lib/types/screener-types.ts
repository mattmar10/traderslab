import * as z from "zod";

import { FMPSymbolProfileDataSchema, QuoteElementSchema } from "./fmp-types";
import { RelativeStrengthResultsSchema } from "./relative-strength-types";

const InclusionExclusionSchema = z.object({
  include: z.array(z.string()).optional(),
  exclude: z.array(z.string()).optional(),
});

export type InclusionExclusion = z.infer<typeof InclusionExclusionSchema>;
export type FilterGroupPermissionType = "PRIVATE" | "SHARED" | "SYSTEM";

export const MovingAvgTypeEnum = z.enum([
  "5SMA",
  "10EMA",
  "21EMA",
  "20SMA",
  "50SMA",
  "200SMA",
]);

export const MovingAvgFilterSchema = z.object({
  type: MovingAvgTypeEnum,
  isAdvancing: z.boolean(), // true for advancing, false for declining
});

export const FilterCriteriaSchema = z.object({
  priceRange: z.tuple([z.number(), z.number()]).optional(),
  volumeRange: z.tuple([z.number(), z.number()]).optional(),
  relativeVolumeRange: z.tuple([z.number(), z.number()]).optional(),
  adrPercentRange: z.tuple([z.number(), z.number()]).optional(),
  sector: InclusionExclusionSchema.optional(),
  industry: InclusionExclusionSchema.optional(),
  country: InclusionExclusionSchema.optional(),
  marketCapRange: z.tuple([z.number(), z.number()]).optional(),
  movingAvgAdvancingFilters: z.array(MovingAvgFilterSchema).optional(),
  movingAvgDecliningFilters: z.array(MovingAvgFilterSchema).optional(),
  movingAvgFilters: z
    .array(
      z.object({
        type: z.enum(["5SMA", "10EMA", "21EMA", "20SMA", "50SMA", "200SMA"]),
        percentRange: z.tuple([z.number(), z.number()]), // Updated to a tuple for range
      })
    )
    .optional(),
  adrPercentFromMovingAvgFilter: z
    .array(
      z.object({
        type: z.enum(["5SMA", "10EMA", "21EMA", "20SMA", "50SMA", "200SMA"]),
        adrPercentMultiple: z.tuple([z.number(), z.number()]),
      })
    )
    .optional(),
  rsRankRange: z.tuple([z.number(), z.number()]).optional(),
  oneDayAbsoluteChangeRange: z.tuple([z.number(), z.number()]).optional(),
  oneMonthRSRange: z.tuple([z.number(), z.number()]).optional(),
  threeMonthRSRange: z.tuple([z.number(), z.number()]).optional(),
  sixMonthRSRange: z.tuple([z.number(), z.number()]).optional(),
  oneYearRSRange: z.tuple([z.number(), z.number()]).optional(),
  compositeRSRange: z.tuple([z.number(), z.number()]).optional(),
  oneDayReturnPercentRange: z.tuple([z.number(), z.number()]).optional(),
  oneWeekReturnPercentRange: z.tuple([z.number(), z.number()]).optional(),
  oneMonthReturnPercentRange: z.tuple([z.number(), z.number()]).optional(),
  threeMonthReturnPercentRange: z.tuple([z.number(), z.number()]).optional(),
  sixMonthReturnPercentRange: z.tuple([z.number(), z.number()]).optional(),
  oneYearReturnPercentRange: z.tuple([z.number(), z.number()]).optional(),
  fiftyTwoWeekHighPercentageRange: z.tuple([z.number(), z.number()]).optional(),
  fiftyTwoWeekLowPercentageRange: z.tuple([z.number(), z.number()]).optional(),
  twentyVolumeSMARange: z.tuple([z.number(), z.number()]).optional(),
  dailyLiquidityRange: z.tuple([z.number(), z.number()]).optional(),
  dailyClosingRangePercentRange: z.tuple([z.number(), z.number()]).optional(),
  volatilityContractionScoreRange: z.tuple([z.number(), z.number()]).optional(),
  volumeContractionScoreRange: z.tuple([z.number(), z.number()]).optional(),
  insideDay: z.boolean().optional(),
  narrowRangeDay: z.boolean().optional(),
  bullishMovingAvgPattern: z.boolean().optional(),
  bearishMovingAvgPattern: z.boolean().optional(),
  aboveAverageVolume: z.boolean().optional(),
  increasingVolume: z.boolean().optional(),
  trendMomentumRange: z.tuple([z.number(), z.number()]).optional(),
  volatilityAdjustedTrendMomentumRange: z
    .tuple([z.number(), z.number()])
    .optional(),
  dailyRangeHistoricalVolatilityRange: z
    .tuple([z.number(), z.number()])
    .optional(),
  minimumDaysBeforeEarnings: z.number().optional(),
  relativeVolatilityMetricFilter: z
    .object({
      period: z.number().optional(),
      shortLookback: z.number().optional(),
      longLookback: z.number().optional(),
      range: z.tuple([z.number(), z.number()]).optional(),
    })
    .optional(),
  percentBRange: z.tuple([z.number(), z.number()]).optional(),
  adrFromPreviousHigh: z
    .object({
      lookback: z.number().optional(),
      range: z.tuple([z.number(), z.number()]).optional(),
    })
    .optional(),
});
export type FilterCriteria = z.infer<typeof FilterCriteriaSchema>;

export const FilterGroupSchema: z.ZodType<FilterGroup> = z.lazy(() =>
  z.object({
    name: z.string().optional(),
    operator: z.enum(["AND", "OR"]).optional().default("AND"),
    filters: z.array(
      z.union([FilterCriteriaSchema, z.lazy(() => FilterGroupSchema)])
    ),
  })
);

export const FilterGroupArraySchema = z.array(FilterGroupSchema);

export interface FilterGroup {
  name?: string;
  operator?: "AND" | "OR";
  filters: (FilterCriteria | FilterGroup)[];
}

export interface FilterGroupDTO {
  filterGroupId?: string;
  filterGroupName: string;
  filterGroupDescription: string;
  userId?: string;
  permission: FilterGroupPermissionType;
  filterGroup: FilterGroup;
  tags: string[];
}

export const EtfHoldingSchema = z.object({
  asset: z.string(),
  name: z.string(),
  sharesNumber: z.number(),
  weightPercentage: z.number(),
});

export type EtfHolding = z.infer<typeof EtfHoldingSchema>;

const SymbolWithStatsSchema = z.object({
  profile: FMPSymbolProfileDataSchema,
  quote: QuoteElementSchema,
  adrPercent: z.number(),
  fiveSMA: z.tuple([z.number(), z.number()]),
  tenEMA: z.tuple([z.number(), z.number()]),
  twentySMA: z.tuple([z.number(), z.number()]),
  standardDeviation: z.number(),
  twentyOneEMA: z.tuple([z.number(), z.number()]),
  fiftySMA: z.tuple([z.number(), z.number()]),
  twoHundredSMA: z.tuple([z.number(), z.number()]),
  twentyVolumeSMA: z.number(),
  thirtyVolumeSMA: z.number(),
  oneDayReturnPercent: z.number(),
  oneWeekReturnPercent: z.number(),
  oneMonthReturnPercent: z.number(),
  threeMonthReturnPercent: z.number(),
  sixMonthReturnPercent: z.number(),
  oneYearReturnPercent: z.number(),
  percentFromFiftyTwoWeekHigh: z.number(),
  percentFromFiftyTwoWeekLow: z.number(),
  ptScore: z.number(),
  relativeVolume: z.number(),
  volatilityContractionScore: z.number(),
  relativeStrength: RelativeStrengthResultsSchema,
  breakoutIntensityScore: z.number(),
});

export type SymbolWithStats = z.infer<typeof SymbolWithStatsSchema>;

const SymbolWithStatsWithRankSchema = SymbolWithStatsSchema.extend({
  rsRank: z.number(),
});

export type SymbolWithStatsWithRank = z.infer<
  typeof SymbolWithStatsWithRankSchema
>;

export const EtfHoldingWithStatsSchema = EtfHoldingSchema.merge(
  SymbolWithStatsSchema
);

export type EtfHoldingWithStats = z.infer<typeof EtfHoldingWithStatsSchema>;

const EtfHoldingWithStatsWithRankSchema = EtfHoldingWithStatsSchema.extend({
  rsRank: z.number(),
});

export type EtfHoldingWithStatsWithRank = z.infer<
  typeof EtfHoldingWithStatsWithRankSchema
>;

export type EtfHoldingWithStatsWithRankWithWeight =
  EtfHoldingWithStatsWithRank & {
    weightPercentage: number;
    sharesNumber: number;
  };

export const ScreenerRangesSchema = z.object({
  countries: z.array(z.string()),
  priceRange: z.tuple([z.number(), z.number()]),
  volumeRange: z.tuple([z.number(), z.number()]),
  relativeVolumeRange: z.tuple([z.number(), z.number()]),
  rsRankRange: z.tuple([z.number(), z.number()]),
  marketCapRange: z.tuple([z.number(), z.number()]),
  adrPercentRange: z.tuple([z.number(), z.number()]),
  twentyVolumeSMARange: z.tuple([z.number(), z.number()]),
  dailyLiquidityRange: z.tuple([z.number(), z.number()]),
  volatilityContractionScoreRange: z.tuple([z.number(), z.number()]),
  volumeContractionScoreRange: z.tuple([z.number(), z.number()]),
  oneDayAbsoluteChangeRange: z.tuple([z.number(), z.number()]),
  oneDayReturnPercentRange: z.tuple([z.number(), z.number()]),
  oneWeekReturnPercentRange: z.tuple([z.number(), z.number()]),
  oneMonthReturnPercentRange: z.tuple([z.number(), z.number()]),
  threeMonthReturnPercentRange: z.tuple([z.number(), z.number()]),
  sixMonthReturnPercentRange: z.tuple([z.number(), z.number()]),
  oneYearReturnPercentRange: z.tuple([z.number(), z.number()]),
  fiftyTwoWeekHighPercentageRange: z.tuple([z.number(), z.number()]),
  fiftyTwoWeekLowPercentageRange: z.tuple([z.number(), z.number()]),
  trendMomentumRange: z.tuple([z.number(), z.number()]),
  volatilityAdjustedTrendMomentumRange: z.tuple([z.number(), z.number()]),
  dailyRangeHistoricalVolatilityRange: z.tuple([z.number(), z.number()]),
  percentBRange: z.tuple([z.number(), z.number()]),
});

export type ScreenerRanges = z.infer<typeof ScreenerRangesSchema>;

export const EtfScreenerResultsSchema = z.object({
  holdings: z.array(EtfHoldingWithStatsWithRankSchema),
  ranges: ScreenerRangesSchema,
  total: z.number(),
  pages: z.number(),
  currentPage: z.number(),
  pageSize: z.number(),
});

export type EtfScreenerResults = z.infer<typeof EtfScreenerResultsSchema>;

export const ScreenerResultsSchema = z.object({
  stocks: z.array(SymbolWithStatsWithRankSchema),
  ranges: ScreenerRangesSchema,
  total: z.number(),
  pages: z.number(),
  currentPage: z.number(),
  pageSize: z.number(),
});

export type ScreenerResults = z.infer<typeof ScreenerResultsSchema>;

export type ScreenerSortableKeys =
  | "price"
  | "rsRank"
  | "rsScore"
  | "oneDayReturnPercent"
  | "oneDayAbsoluteChange"
  | "oneWeekReturnPercent"
  | "oneMonthReturnPercent"
  | "threeMonthReturnPercent"
  | "sixMonthReturnPercent"
  | "oneYearReturnPercent"
  | "percentFromFiftyTwoWeekHigh"
  | "trendMomentum"
  | "percentFromFiftyTwoWeekLow"
  | "industry"
  | "sector"
  | "breakoutIntensityScore";

export interface ScreenerSortConfig {
  key: ScreenerSortableKeys;
  direction: "asc" | "desc";
}

export type EtfScreenerSortableKeys = ScreenerSortableKeys | "weightPercentage";

export interface EtfScreenerSortConfig {
  key: EtfScreenerSortableKeys;
  direction: "asc" | "desc";
}
