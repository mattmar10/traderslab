import { z } from "zod";

// Define the enum-like values for trendStateModel and secondaryOpportunity
const PTTrendStateStatus = z.enum([
  "PULLBACK",
  "UPTREND",
  "RALLY",
  "CORRECTION",
  "UPTREND ATTEMPT",
  "UNKNOWN",
]);

export type PTTrendStateStatusType = z.infer<typeof PTTrendStateStatus>;

const PTTrendSecondaryState = z.enum([
  "NONE",
  "TRIMMING OPPORTUNITY",
  "ST BUYING OPPORTUNITY",
  "LT BUYING OPPORTUNITY",
  "SHORTING OPPORTUNITY",
]);

export type PTTrendSecondaryStateType = z.infer<typeof PTTrendStateStatus>;

// Define the DataError type
const DataError = z.object({
  errorMessage: z.string(),
});

// Define the PTTrendStateModel type
const PTTrendStateModel = z.object({
  shortTerm: z.boolean(),
  mediumTerm: z.boolean(),
  longTerm: z.boolean(),
  trendStateModel: PTTrendStateStatus,
  secondaryOpportunity: PTTrendSecondaryState.optional(),
});

// Define the AllPTTrendModels type
const AllPTTrendModels = z.object({
  nyseTrendModel: z.union([PTTrendStateModel, DataError]),
  rspTrendModel: z.union([PTTrendStateModel, DataError]),
  qqqeTrendModel: z.union([PTTrendStateModel, DataError]),
  iwmTrendModel: z.union([PTTrendStateModel, DataError]),
});

// Use z.infer to create the types
export type PTTrendStateModel = z.infer<typeof PTTrendStateModel>;
export type DataError = z.infer<typeof DataError>;
export type AllPTTrendModels = z.infer<typeof AllPTTrendModels>;

// Export the Zod schemas as well if needed
export {
  PTTrendStateStatus,
  PTTrendSecondaryState,
  DataError,
  PTTrendStateModel,
  AllPTTrendModels,
};
