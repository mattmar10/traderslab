import { z } from "zod";

export const EtfMarketDataSchema = z.object({
  ticker: z.string(),
  name: z.string(),
  percentDailyChange: z.number(),
  percentWeeklyChange: z.number(),
  percentMonthlyChange: z.number(),
  percentThreeMonthChange: z.number(),
  percentSixMonthChange: z.number(),
  percent1YearChange: z.number(),
  percentFromFiftyTwoWeekLow: z.number(),
  percentFromFiftyTwoWeekHigh: z.number(),
  oneMonthDailyADRP: z.number(),
});

export const MarketOverviewPerformanceResponseSchema = z.object({
  subMarketData: z.array(EtfMarketDataSchema),
  sectorMarketData: z.array(EtfMarketDataSchema),
  themeMarketData: z.array(EtfMarketDataSchema),
});

export type MarketOverviewPerformanceResponse = z.infer<
  typeof MarketOverviewPerformanceResponseSchema
>;

export type EtfMarketData = z.infer<typeof EtfMarketDataSchema>;
export type RankedEtfMarketData = EtfMarketData & {
  rank: number;
};
