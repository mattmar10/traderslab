import * as z from "zod";

export const RelativeStrengthPeriodSchema = z.enum([
  "oneMonth",
  "threeMonth",
  "sixMonth",
  "oneYear",
  "composite",
]);

// Schema for RelativeStrengthStats interface
export const RelativeStrengthStatsSchema = z.object({
  oneMonth: z.number(),
  threeMonth: z.number(),
  sixMonth: z.number(),
  oneYear: z.number(),
  composite: z.number(),
});

// Schema for RelativeStrengthResults interface
export const RelativeStrengthResultsSchema = z.object({
  relativeStrengthStats: RelativeStrengthStatsSchema,
  volAdjustedRelativeStrengthStats: RelativeStrengthStatsSchema,
});

// You can also create type aliases from these schemas if needed
export type RelativeStrengthPeriod = z.infer<
  typeof RelativeStrengthPeriodSchema
>;
export type RelativeStrengthStats = z.infer<typeof RelativeStrengthStatsSchema>;
export type RelativeStrengthResults = z.infer<
  typeof RelativeStrengthResultsSchema
>;
