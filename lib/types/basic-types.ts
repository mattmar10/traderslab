import * as z from "zod";

export interface Candle {
  date: number;
  dateStr: string | undefined;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export function isCandle(object: any): object is Candle {
  return (
    typeof object === "object" &&
    "date" in object &&
    "open" in object &&
    "high" in object &&
    "low" in object &&
    "close" in object &&
    "volume" in object &&
    typeof object.date === "number" &&
    typeof object.open === "number" &&
    typeof object.high === "number" &&
    typeof object.low === "number" &&
    typeof object.close === "number" &&
    typeof object.volume === "number"
  );
}

export interface LineChartPoint {
  time: string;
  value: number;
}

export type Dataset = "S&P500" | "NDX100" | "NYSE" | "IWM";
export function isDataset(value: any): value is Dataset {
  return (
    value === "S&P500" ||
    value === "NDX100" ||
    value === "NYSE" ||
    value === "IWM"
  );
}

export function getTickerForDataset(dataset: Dataset) {
  if (dataset === "NDX100") {
    return "QQQE";
  } else if (dataset === "S&P500") {
    return "RSP";
  } else if (dataset === "IWM") {
    return "IWM";
  } else {
    return "^NYA";
  }
}

export function getDatasetFromTicker(
  ticker: "RSP" | "QQQE" | "^NYA" | "IWM"
): Dataset {
  if (ticker === "QQQE") {
    return "NDX100";
  } else if (ticker === "RSP") {
    return "S&P500";
  } else if (ticker === "IWM") {
    return "IWM";
  } else {
    return "NYSE";
  }
}

export function getDescriptionForDataset(dataset: Dataset) {
  if (dataset === "NDX100") {
    return "QQQE";
  } else if (dataset === "S&P500") {
    return "RSP";
  } else if (dataset === "IWM") {
    return "IWM";
  } else {
    return "^NYA";
  }
}

export type MajorStockIndex = "SP500" | "DOW" | "NS100";
export const StockIndexConstituentSchema = z.object({
  symbol: z.string(),
  name: z.string(),
  sector: z.string(),
  subSector: z.string(),
});

export type FMPDataLoadingError = string;
export function isFMPDataLoadingError(
  error: any
): error is FMPDataLoadingError {
  return typeof error === "string";
}

export type StockIndexConstituent = z.infer<typeof StockIndexConstituentSchema>;

export const StockIndexConstituentListSchema =
  StockIndexConstituentSchema.array();

export type StockIndexConstituentList = z.infer<
  typeof StockIndexConstituentListSchema
>;

export function isStockIndexConstituentList(
  obj: any
): obj is StockIndexConstituentList {
  if (!Array.isArray(obj)) {
    return false;
  }

  return obj.every(
    (item) =>
      typeof item.symbol === "string" &&
      typeof item.name === "string" &&
      typeof item.sector === "string" &&
      typeof item.subSector === "string"
  );
}

export const QuoteElementSchema = z.object({
  symbol: z.string(),
  name: z.string().nullable(),
  price: z.number(),
  changesPercentage: z.number(),
  change: z.number(),
  dayLow: z.number(),
  dayHigh: z.number(),
  yearHigh: z.number(),
  yearLow: z.number(),
  marketCap: z.number().nullable(),
  priceAvg50: z.number(),
  priceAvg200: z.number(),
  exchange: z.string(),
  volume: z.number(),
  avgVolume: z.number(),
  open: z.number(),
  previousClose: z.number(),
  eps: z.number().nullable(),
  pe: z.number().nullable(),
  earningsAnnouncement: z.string().nullable(),
  sharesOutstanding: z.number().nullable(),
  timestamp: z.number(),
});

export type Quote = z.infer<typeof QuoteElementSchema>;

export function isQuote(object: any): object is Quote {
  return QuoteElementSchema.safeParse(object).success;
}
export function isQuoteArray(array: any): array is Quote[] {
  if (!Array.isArray(array)) {
    return false;
  }
  return array.every((obj) => isQuote(obj));
}
export const QuoteArraySchema = QuoteElementSchema.array();

export interface StockSymbolSearchResult {
  symbol: string;
  name: string;
  industry: string;
  sector: string;
  quote?: Quote;
}

export interface StockSymbolResponse {
  symbol: string;
  name: string;
  industry: string;
  sector: string;
  quote?: Quote;
}

export interface EtfSymbolResponse {
  symbol: string;
  name: string;
}
export interface EtfSymbolSearchResult {
  symbol: string;
  name: string;
  quote?: Quote;
}

export interface IndexSymbolResponse {
  symbol: string;
  name: string;
}

export interface SearchResult {
  stocks: StockSymbolSearchResult[];
  etfs: EtfSymbolSearchResult[];
}

export interface SearchResponse {
  stocks: StockSymbolResponse[];
  etfs: EtfSymbolResponse[];
  indexes: IndexSymbolResponse[];
}
