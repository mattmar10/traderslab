export interface UpDownDataPoint {
  dateStr: string;
  upVolume: number;
  downVolume: number;
}
export interface UpDownOverview {
  lineSeries: UpDownDataPoint[];
}

export interface FiftyTwoWeekHighsLowsDataPoint {
  dateStr: string;
  fiftyTwoWeekHighs: number;
  fiftyTwoWeekLows: number;
}

export type FiftyTwoWeekHighsLowsDataPointWithCumulative =
  FiftyTwoWeekHighsLowsDataPoint & {
    cumulativeHighs: number;
    cumulativeLows: number;
  };

export interface FiftyTwoWeekHighsLowsOverview {
  lineSeries: FiftyTwoWeekHighsLowsDataPoint[];
}

export interface MarketBreadthPoint {
  dateStr: string;
  advances: number;
  declines: number;
  upVolume: number;
  downVolume: number;
  fiftyTwoWeekHighs?: number;
  fiftyTwoWeekLows?: number;
}

export interface AdvanceDeclineDataPoint {
  dateStr: string;
  cumulative: number;
  advances: number;
  declines: number;
}

export interface SMADataPoint {
  dateStr: string;
  sma: number;
}

export interface PercentAboveMAPoint {
  dateStr: string;
  percentAboveMA: number;
}

export type MovingAverageType = "SMA" | "EMA";
export interface MovingAverageError {
  movingAvgType: MovingAverageType;
  error: string;
}
export interface DateCount {
  dateStr: string;
  count: number;
}

export interface MarketReturnsDataPoint {
  dateStr: string;
  mean: number;
  median: number;
}

export interface MarketReturnsLine {
  lineSeries: MarketReturnsDataPoint[];
}

export interface GlobalDailyBreadthDataPoint {
  dateStr: string;
  cumulative: number;
  globalDailyBreadth: number;
}

export interface GlobalDailyBreadthDataPointWithRank {
  dateStr: string;
  globalDailyBreadth: number;
  globalDailyBreadthPercentileRank: number;
}

export interface MarketBreadthOverview {
  advanceDeclineLine: AdvanceDeclineDataPoint[];
  upDownVolumeLine: UpDownDataPoint[];
  fiftyTwoWeekHighsLowsLine: FiftyTwoWeekHighsLowsDataPoint[];
  mcClellanOscillator: McClellanOscillatorPoint[];
  percentAboveTwentySMA: PercentAboveMAPoint[];
  percentAboveFiftySMA: PercentAboveMAPoint[];
  percentAboveTwoHundredSMA: PercentAboveMAPoint[];
  totalStockCount: number;
  generalMarketOverview: GeneralMarkeOverview;
  upFourPercentLine: DateCount[];
  downFourPercentLine: DateCount[];
  oneMonthUpTwentyFivePercentyLine: DateCount[];
  oneMonthDownTwentyFivePercentyLine: DateCount[];
  threeMonthsUpTwentyFivePercentyLine: DateCount[];
  threeMonthsDownTwentyFivePercentyLine: DateCount[];
  marketReturnsLine: MarketReturnsDataPoint[];
}

export interface NewMarketBreadthOverview {
  advanceDeclineLine: AdvanceDeclineDataPoint[];
  stockCountLine: DateCount[];
  upDownVolumeLine: UpDownDataPoint[];
  fiftyTwoWeekHighsLowsLine: FiftyTwoWeekHighsLowsDataPoint[];
  mcClellanOscillator: McClellanOscillatorPoint[];
  percentAboveFiveSMA: PercentAboveMAPoint[];
  percentAboveTenEMA: PercentAboveMAPoint[];
  percentAboveTwentyOneEMA: PercentAboveMAPoint[];
  percentAboveFiftySMA: PercentAboveMAPoint[];
  percentAboveTwoHundredSMA: PercentAboveMAPoint[];
  upFourPercentLine: DateCount[];
  downFourPercentLine: DateCount[];
  oneMonthUpTwentyFivePercentyLine: DateCount[];
  oneMonthDownTwentyFivePercentyLine: DateCount[];
  threeMonthsUpTwentyFivePercentyLine: DateCount[];
  threeMonthsDownTwentyFivePercentyLine: DateCount[];
  marketReturnsLine: MarketReturnsDataPoint[];
  globalDailyBreadthLine: GlobalDailyBreadthDataPoint[];
}

export interface MarketBreadthResponse {
  marketBreadthOverview: NewMarketBreadthOverview;
  generalMarketOverview: GeneralMarkeOverview;
}

export interface McClellanOscillatorPoint {
  dateStr: string;
  value: number;
  cumulative: number;
}

export interface McClellanOscillator {
  lineSeries: McClellanOscillatorPoint[];
}

export interface ETFSnapshot {
  lastPrice: number;
  fiveSMA: number;
  tenEMA: number;
  twentyOneEMA: number;
  fiftySMA: number;
  twoHundredSMA: number;
}

export interface GeneralMarkeOverview {
  spySnapshot: ETFSnapshot | MovingAverageError[];
  rspSnapshot: ETFSnapshot | MovingAverageError[];
  qqqSnapshot: ETFSnapshot | MovingAverageError[];
  qqqeSnapshot: ETFSnapshot | MovingAverageError[];
  percentOfSuccesfulTenDayHighs: number;
}

export interface CurrentDayMarketBreadthSnapshotPoint {
  advanceDecline: AdvanceDeclineDataPoint;
  fiftyTwoWeekHighsLows?: FiftyTwoWeekHighsLowsDataPoint;
  upFourPercent?: number;
  downFourPercent?: number;
  returns?: MarketReturnsDataPoint;
  totalStockCount: number;
}

export interface SectorCurrentDayMarketBreadthSnapshot {
  sector: string;
  overview: CurrentDayMarketBreadthSnapshotPoint;
}
/*export interface CurrentDayMarketBreadthSnapshot {
  //universeOverview: CurrentDayMarketBreadthSnapshotPoint;
  nyseOverview: CurrentDayMarketBreadthSnapshotPoint;
  //nasdaqOverview: CurrentDayMarketBreadthSnapshotPoint;
  rspTradingOverview: CurrentDayMarketBreadthSnapshotPoint;
  qqqETradingOverview: CurrentDayMarketBreadthSnapshotPoint;
  sectorsOverviews: SectorCurrentDayMarketBreadthSnapshot[];
}
*/
export interface CurrentDayMarketBreadthSnapshotPoint {
  advanceDecline: AdvanceDeclineDataPoint;
  fiftyTwoWeekHighsLows?: FiftyTwoWeekHighsLowsDataPoint;
  upFourPercent?: number;
  downFourPercent?: number;
  percentAboveFiveSMA?: number;
  percentAboveTenEMA?: number;
  percentAboveTwentyOneEMA?: number;
  percentAboveFiftySMA?: number;
  percentAboveTwoHundredSMA?: number;
  returns?: MarketReturnsDataPoint;
  totalStockCount: number;
  globalDailyBreadthPercentileRank: number;
}

export type STMomentumRow = {
  dateStr: string;
  upFourPercent: number;
  downFourPercent: number;
  dayRatio: number;
  fiveDayRatio: number;
  tenDayRatio: number;
  dailyMomo: number;
};

export type MTLTMomentumRow = {
  dateStr: string;
  upTwentyFivePercent: number;
  downTwentyFivePercent: number;
  ratio: number;
};

export type MomentumRow = {
  stMomentumRow: STMomentumRow;
  mtMomentumRow: MTLTMomentumRow;
  ltMomentumRow: MTLTMomentumRow;
};

export type UpAndDown = {
  dateStr: string;
  upCount: number;
  downCount: number;
};

//zod
import { z } from "zod";

// Supporting schemas
const AdvanceDeclineDataPointSchema = z.object({
  dateStr: z.string(),
  cumulative: z.number(),
  advances: z.number(),
  declines: z.number(),
});

const FiftyTwoWeekHighsLowsDataPointSchema = z.object({
  dateStr: z.string(),
  fiftyTwoWeekHighs: z.number(),
  fiftyTwoWeekLows: z.number(),
});

const MarketReturnsDataPointSchema = z.object({
  dateStr: z.string(),
  mean: z.number(),
  median: z.number(),
});

const CurrentDayMarketBreadthSnapshotPointSchema = z.object({
  advanceDecline: AdvanceDeclineDataPointSchema,
  fiftyTwoWeekHighsLows: FiftyTwoWeekHighsLowsDataPointSchema.optional(),
  upFourPercent: z.number().optional(),
  downFourPercent: z.number().optional(),
  percentAboveFiveSMA: z.number().optional(),
  percentAboveTenEMA: z.number().optional(),
  percentAboveTwentyOneEMA: z.number().optional(),
  percentAboveFiftySMA: z.number().optional(),
  percentAboveTwoHundredSMA: z.number().optional(),
  returns: MarketReturnsDataPointSchema.optional(),
  totalStockCount: z.number(),
  globalDailyBreadthPercentileRank: z.number(),
});

const MarketBreadthGDBSnapshotPointSchema = z.object({
  globalDailyBreadthPercentileRank: z.number(),
});

/*const SectorMarketBreadthGDBSnapshotSchema = z.object({
  sector: z.string(),
  overview: MarketBreadthGDBSnapshotPointSchema,
});*/

export const MarketBreadthGDBSnapshotSchema = z.object({
  timestamp: z.number(),
  nyseOverview: MarketBreadthGDBSnapshotPointSchema,
  rspTradingOverview: MarketBreadthGDBSnapshotPointSchema,
  qqqETradingOverview: MarketBreadthGDBSnapshotPointSchema,
  iwmTradingOverview: MarketBreadthGDBSnapshotPointSchema,
  //sectorsOverviews: z.array(SectorMarketBreadthGDBSnapshotSchema),
});

const SectorCurrentDayMarketBreadthSnapshotSchema = z.object({
  sector: z.string(),
  overview: CurrentDayMarketBreadthSnapshotPointSchema,
});

export type SectorCurrentDayMarketBreadthSnapshotElement = z.infer<
  typeof SectorCurrentDayMarketBreadthSnapshotSchema
>;

// Main schema for CurrentDayMarketBreadthSnapshot
export const CurrentDayMarketBreadthSnapshotSchema = z.object({
  timestamp: z.number(),
  nyseOverview: CurrentDayMarketBreadthSnapshotPointSchema,
  rspTradingOverview: CurrentDayMarketBreadthSnapshotPointSchema,
  qqqETradingOverview: CurrentDayMarketBreadthSnapshotPointSchema,
  iwmTradingOverview: CurrentDayMarketBreadthSnapshotPointSchema,
  sectorsOverviews: z.array(SectorCurrentDayMarketBreadthSnapshotSchema),
});

// Type inference
export type CurrentDayMarketBreadthSnapshot = z.infer<
  typeof CurrentDayMarketBreadthSnapshotSchema
>;

export const CurrentDayMarketBreadthSnapshotArraySchema = z.array(
  CurrentDayMarketBreadthSnapshotSchema
);
export type CurrentDayMarketBreadthSnapshotList = z.infer<
  typeof CurrentDayMarketBreadthSnapshotArraySchema
>;

export type MarketBreadthGDBSnapshot = z.infer<
  typeof MarketBreadthGDBSnapshotSchema
>;

export const MarketBreadthSnapshotArraySchema = z.array(
  MarketBreadthGDBSnapshotSchema
);
