import {
  AdvanceDeclineDataPoint,
  FiftyTwoWeekHighsLowsDataPoint,
  MomentumRow,
  UpDownDataPoint,
} from "@/lib/types/market-breadth-types";

export type AdvanceDeclineRow = AdvanceDeclineDataPoint & {
  net: number;
  netRatio: number;
};

export type NewHighLowRow = FiftyTwoWeekHighsLowsDataPoint & {
  net: number;
  netRatio: number;
};

export type GreaterThanSMARow = {
  percentAboveFiveSMA: number;
  percentAboveTenEMA: number;
  percentAboveTwentyOneEMA: number;
  percentAboveFiftySMA: number;
  percentAboveTwoHundredSMA: number;
};

export type GlobalDailyBreadthRow = {
  globalDailyBreadth: number;
  globalDailyBreadthPercentRank: number;
};

export type MarkBreadthRow = {
  advanceDeclineRow: AdvanceDeclineRow;
  newHighNewLowRow: NewHighLowRow;
  upDownVolumeRow: UpDownVolumeRow;
  greaterThanSMARow: GreaterThanSMARow;
  globalDailyBreadthRow: GlobalDailyBreadthRow;
  momentumRow: MomentumRow;
};

export type UpDownVolumeRow = UpDownDataPoint & {
  upDownRatio: number;
};
