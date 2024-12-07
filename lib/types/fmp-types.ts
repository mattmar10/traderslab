import * as z from "zod";

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

export const MoverElementSchema = z.object({
  symbol: z.string(),
  name: z.string().nullable(),
  price: z.number(),
  changesPercentage: z.number(),
  change: z.number(),
});

export type Mover = z.infer<typeof MoverElementSchema>;
export const MoverArraySchema = MoverElementSchema.array();

export function isMover(object: any): object is Quote {
  return MoverElementSchema.safeParse(object).success;
}
export function isMoverArray(array: any): array is Quote[] {
  if (!Array.isArray(array)) {
    return false;
  }
  return array.every((obj) => isMover(obj));
}

export const SectorPerformanceSchema = z.object({
  sector: z.string(),
  changesPercentage: z.string(),
});

export type SectorPerformance = z.infer<typeof SectorPerformanceSchema>;

export function isSectorPerformance(object: any): object is SectorPerformance {
  return SectorPerformanceSchema.safeParse(object).success;
}
export function isSectorPerformanceArray(
  array: any
): array is SectorPerformance[] {
  if (!Array.isArray(array)) {
    return false;
  }
  return array.every((obj) => isSectorPerformance(obj));
}
export const SectorPerformanceArraySchema = SectorPerformanceSchema.array();

export const FMPIntradayChartCandleSchema = z.object({
  date: z.string(),
  open: z.number(),
  high: z.number(),
  low: z.number(),
  close: z.number(),
  volume: z.number(),
})
export type FMPIntradyChartCandle = z.infer<typeof FMPIntradayChartCandleSchema>;
export const FMPIntradayChartSchema = z.array(FMPIntradayChartCandleSchema);
export type FMPIntradayChart = z.infer<typeof FMPIntradayChartSchema>;

export const FMPHistoricalSchema = z.object({
  date: z.string(),
  open: z.number(),
  high: z.number(),
  low: z.number(),
  close: z.number(),
  adjClose: z.number().nullable(),
  volume: z.number(),
  unadjustedVolume: z.number(),
  change: z.number().optional(),
  changePercent: z.number().optional(),
  //vwap: z.number().optional(),
  label: z.string().optional(),
  //changeOverTime: z.number().optional(),
});
export type FMPHistorical = z.infer<typeof FMPHistoricalSchema>;
export const FMPHistoricalArraySchema = z.array(FMPHistoricalSchema);
export type FMPHistoricalArray = z.infer<typeof FMPHistoricalArraySchema>;

export const FMPHistoricalResultsSchema = z.object({
  symbol: z.string(),
  historical: z.array(FMPHistoricalSchema),
});

export type FmpHistoricalResult = z.infer<typeof FMPHistoricalResultsSchema>;

export const HistoricalStockSchema = z.object({
  symbol: z.string(),
  historical: z.array(FMPHistoricalSchema),
});

export type HistoricalStockList = z.infer<typeof HistoricalStockSchema>;
export const FMPHistoricalStockList = z.array(HistoricalStockSchema);

export const FmpHistoricalListResultSchema = z.object({
  historicalStockList: z.array(HistoricalStockSchema),
});

export type FMPHistoricalListResult = z.infer<typeof FMPHistoricalStockList>;

export const CandleSchema = z.object({
  date: z.number(),
  dateStr: z.string(),
  open: z.number(),
  low: z.number(),
  high: z.number(),
  close: z.number(),
  volume: z.number(),
});
export const CandleListSchema = CandleSchema.array();
export type FMPCandle = z.infer<typeof CandleSchema>;
export type CandlesList = z.infer<typeof CandleListSchema>;

export const EtfHoldingSchema = z.object({
  asset: z.string(),
  name: z.string(),
  sharesNumber: z.number(),
  weightPercentage: z.number(),
});

export type EtfHolding = z.infer<typeof EtfHoldingSchema>;

export type HoldingWithQuote = EtfHolding & {
  quote: Quote;
};

export const EtfHoldingArraySchema = EtfHoldingSchema.array();

const FMPSymbolProfileDataSchema = z.object({
  symbol: z.string(),
  price: z.number(),
  volAvg: z.number(),
  mktCap: z.number(),
  companyName: z.string(),
  currency: z.string(),
  exchangeShortName: z.string(),
  industry: z.string().nullable(),
  sector: z.string().nullable(),
  country: z.string().nullable(),
  isEtf: z.boolean(),
  isActivelyTrading: z.boolean(),
  isFund: z.boolean(),
  isAdr: z.boolean(),
});

// Define the schema for an array of FMPSymbolProfileData
const FMPSymbolProfileArraySchema = z.array(FMPSymbolProfileDataSchema);

export { FMPSymbolProfileDataSchema, FMPSymbolProfileArraySchema };
export type FMPSymbolProfile = z.infer<typeof FMPSymbolProfileDataSchema>;



export const FullFMPFullProfileSchema = z.object({
  symbol: z.string(),
  price: z.number(),
  companyName: z.string(),
  beta: z.number().nullable(),
  volAvg: z.number().nullable(),
  mktCap: z.number().nullable(),
  lastDiv: z.number().nullable(),
  range: z.string().nullable(),
  changes: z.number().nullable(),
  currency: z.string().nullable(),
  cik: z.string().nullable(),
  isin: z.string().nullable(),
  cusip: z.string().nullable(),
  exchange: z.string().nullable(),
  exchangeShortName: z.string().nullable(),
  industry: z.string().nullable(),
  website: z.string().url().nullable(),
  description: z.string().nullable(),
  ceo: z.string().nullable(),
  sector: z.string().nullable(),
  country: z.string().nullable(),
  fullTimeEmployees: z.string().nullable(),
  phone: z.string().nullable(),
  address: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  zip: z.string().nullable(),
  dcfDiff: z.number().nullable(),
  dcf: z.number().nullable(),
  image: z.string().url().nullable(),
  ipoDate: z.string().nullable(), // Consider z.string().datetime().nullable() if date format validation is needed
  defaultImage: z.boolean().nullable(),
  isEtf: z.boolean().nullable(),
  isActivelyTrading: z.boolean().nullable(),
  isAdr: z.boolean().nullable(),
  isFund: z.boolean().nullable()
});

export const FullFMPFullProfileArraySchema = z.array(FullFMPFullProfileSchema);
export type FullFMPProfile = z.infer<typeof FullFMPFullProfileSchema>


export type RealtimeQuoteResponse = {
  ticker: string;
  name: string;
  sector: string;
  change: number;
  changesPercentage: number;
  open: number;
  dayHigh: number;
  dayLow: number;
  price: number;
  volume: number;
};
export interface SymbolSearchResult {
  symbols: SymbolResult[];
}

export interface SymbolResult {
  ticker: string;
  title: string;
}

export interface StockSymbolSearchResult {
  symbol: string;
  name: string;
  industry: string;
  sector: string;
  quote?: Quote;
}

export interface EtfSymbolSearchResult {
  symbol: string;
  name: string;
  quote?: Quote;
}

export interface SearchResult {
  stocks: StockSymbolSearchResult[];
  etfs: EtfSymbolSearchResult[];
}

export const SymbolProfileSchema = z.object({
  symbol: z.string(),
  mktCap: z.number(),
  currency: z.string(),
  companyName: z.string(),
  industry: z.string().nullable(),
  sector: z.string().nullable(),
  website: z.string().nullable(),
  description: z.string(),
  isEtf: z.boolean(),
});
export type SymbolProfile = z.infer<typeof SymbolProfileSchema>;

export const SymbolProfileArraySchema = SymbolProfileSchema.array();
export type SymolProfileArray = z.infer<typeof SymbolProfileArraySchema>;

export const PTTrendModelSchema = z.object({
  shortTerm: z.boolean(),
  mediumTerm: z.boolean(),
  longTerm: z.boolean(),
  trendStateModel: z.string(),
  secondaryOpportunity: z.string(),
});
export type PTTrendModel = z.infer<typeof PTTrendModelSchema>;

export type PTTrendStateStatus =
  | "UPTREND"
  | "PULLBACK"
  | "CORRECTION"
  | "RALLY"
  | "UPTREND ATTEMPT"
  | "UNKNOWN";

export type PTTrendSecondaryState =
  | "ST BUYING OPPORTUNITY"
  | "LT BUYING OPPORTUNITY"
  | "SHORTING OPPORTUNITY"
  | "TRIMMING OPPORTUNITY"
  | "NONE";

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
export interface IndexSymbolResponse {
  symbol: string;
  name: string;
}

export interface SearchResponse {
  stocks: StockSymbolResponse[];
  etfs: EtfSymbolResponse[];
  indexes: IndexSymbolResponse[];
}

export const EarningsDateSchema = z.object({
  date: z.string(),
  symbol: z.string(),
  eps: z.nullable(z.number()),
  epsEstimated: z.nullable(z.number()),
  time: z.enum(["bmo", "amc", "--"]),
  revenue: z.nullable(z.number()),
  revenueEstimated: z.nullable(z.number()),
  updatedFromDate: z.string(),
  fiscalDateEnding: z.string(),
});

export type FMPEarningsDate = z.infer<typeof EarningsDateSchema>;
export const FMPEarningsCalendarSchema = EarningsDateSchema.array();
export type FMPEarningsCalendar = z.infer<typeof FMPEarningsCalendarSchema>;

export function isFMPEarningsDate(data: any): data is FMPEarningsDate {
  // Check if data matches the schema
  return (
    typeof data === "object" &&
    data !== null &&
    typeof data.date === "string" &&
    typeof data.symbol === "string" &&
    (typeof data.eps === "number" || data.eps === null) &&
    (typeof data.epsEstimated === "number" || data.epsEstimated === null) &&
    ["bmo", "amc", "--"].includes(data.time) &&
    (typeof data.revenue === "number" || data.revenue === null) &&
    (typeof data.revenueEstimated === "number" ||
      data.revenueEstimated === null) &&
    typeof data.updatedFromDate === "string" &&
    typeof data.fiscalDateEnding === "string"
    // Add more checks if needed
  );
}

export function isFMPEarningsCalendar(data: any): data is FMPEarningsCalendar {
  if (!Array.isArray(data)) {
    return false;
  }

  for (const item of data) {
    if (!isFMPEarningsDate(item)) {
      return false;
    }
  }

  return true;
}

export const EconomicEventSchema = z.object({
  date: z.string(), // Assuming the date is in string format
  country: z.string().length(2), // Two-letter country code
  event: z.string(),
  currency: z.string().length(3), // Three-letter currency code
  previous: z.number().nullable(), // Nullable number
  estimate: z.number().nullable(), // Nullable number
  actual: z.number().nullable(), // Nullable number
  change: z.number().nullable(), // Nullable number
  impact: z.enum(["Low", "Medium", "High", "None"]), // Enum for impact levels
  changePercentage: z.number(),
  unit: z.string(),
});

export type EconomicEvent = z.infer<typeof EconomicEventSchema>;
export type EconomicEventArray = EconomicEvent[];


export const IncomeStatementDataSchema = z.object({
  date: z.string(),
  symbol: z.string(),
  reportedCurrency: z.string(),
  cik: z.string(),
  fillingDate: z.string(),
  acceptedDate: z.string(),
  calendarYear: z.string(),
  period: z.string(),
  revenue: z.number(),
  costOfRevenue: z.number(),
  grossProfit: z.number(),
  grossProfitRatio: z.number(),
  researchAndDevelopmentExpenses: z.number(),
  generalAndAdministrativeExpenses: z.number(),
  sellingAndMarketingExpenses: z.number(),
  sellingGeneralAndAdministrativeExpenses: z.number(),
  otherExpenses: z.number(),
  operatingExpenses: z.number(),
  costAndExpenses: z.number(),
  interestIncome: z.number().nullable(),
  interestExpense: z.number().nullable(),
  depreciationAndAmortization: z.number(),
  ebitda: z.number(),
  ebitdaratio: z.number(),
  operatingIncome: z.number(),
  operatingIncomeRatio: z.number(),
  totalOtherIncomeExpensesNet: z.number(),
  incomeBeforeTax: z.number(),
  incomeBeforeTaxRatio: z.number(),
  incomeTaxExpense: z.number(),
  netIncome: z.number(),
  netIncomeRatio: z.number(),
  eps: z.number(),
  epsdiluted: z.number(),
  weightedAverageShsOut: z.number(),
  weightedAverageShsOutDil: z.number(),
  link: z.string().nullable(),
  finalLink: z.string().nullable(),
});

export const IncomeStatementSchema = z.array(IncomeStatementDataSchema);

export type IncomeStatementData = z.infer<typeof IncomeStatementDataSchema>;
export type IncomeStatement = z.infer<typeof IncomeStatementSchema>;

export const StockGradeSchema = z.object({
  symbol: z.string(),
  publishedDate: z.string(),
  newsURL: z.string().url(),
  newsTitle: z.string(),
  newsBaseURL: z.string(),
  newsPublisher: z.string(),
  newGrade: z.string(),
  previousGrade: z.string().nullable(),
  gradingCompany: z.string(),
  action: z.enum([
    'upgrade',
    'downgrade',
    'buy',
    'hold',
    'sell',
    'outperform',
    'underperform',
    'positive',
    'negative',
    'equal-weight',
    'underweight',
    'overweight'
  ]),
  priceWhenPosted: z.number()
});

export type StockGrade = z.infer<typeof StockGradeSchema>;
export const StockGradesArraySchema = z.array(StockGradeSchema);
