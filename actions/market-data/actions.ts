"use server";

import { fetchWithRetries } from "@/app/api/utils";
import { Candle } from "@/lib/types/basic-types";
import {
  EarningsDateSchema,
  EtfHolding,
  EtfHoldingArraySchema,
  FMPDataLoadingError,
  FMPEarningsDate,
  FMPHistoricalResultsSchema,
  FMPIntradayChart,
  FMPIntradayChartSchema,
  FullFMPFullProfileArraySchema,
  FullFMPProfile,
  Quote,
  QuoteElementSchema,
  RealtimeQuoteResponse,
  SymbolProfile,
} from "@/lib/types/fmp-types";
import { CurrentDayMarketBreadthSnapshot } from "@/lib/types/market-breadth-types";
import {
  MarketOverviewPerformanceResponse,
  MarketOverviewPerformanceResponseSchema,
} from "@/lib/types/submarkets-sectors-themes-types";
import {
  dateSringToMillisSinceEpochInET,
  formatDateToEST,
} from "@/lib/utils/epoch-utils";
import { z } from "zod";

export async function getPriceBars(
  ticker: string,
  fromDateString: string | undefined = undefined,
  toDateString: string | undefined = undefined
): Promise<FMPDataLoadingError | Candle[]> {
  if (!process.env.FINANCIAL_MODELING_PREP_API || !process.env.FMP_API_KEY) {
    return Promise.resolve("FMP URL and key must be specified");
  }
  let url = `${process.env.FINANCIAL_MODELING_PREP_API}/historical-price-full/${ticker}?apikey=${process.env.FMP_API_KEY}`;

  if (fromDateString) {
    url = `${url}&from=${fromDateString}`;
  }

  if (toDateString) {
    url = `${url}&to=${toDateString}`;
  }

  try {
    const response = await fetchWithRetries(
      url,
      { next: { revalidate: 0 } },
      1
    );

    const parsed = FMPHistoricalResultsSchema.safeParse(response);

    if (!parsed.success) {
      console.error(parsed.error);
      return "Unable to parse candles";
    } else {
      return parsed.data.historical.map((h) => {
        const candle: Candle = {
          date: dateSringToMillisSinceEpochInET(h.date),
          dateStr: h.date,
          open: h.open,
          high: h.high,
          low: h.low,
          close: h.close,
          volume: h.volume,
        };
        return candle;
      });
    }
  } catch (error) {
    const dataError: FMPDataLoadingError = `Unable to fetch price bars`;
    return dataError;
  }
}

export async function getIntradayChart(
  ticker: string,
  period: "1min" | "5min" | "15min",
  date: Date
): Promise<FMPIntradayChart> {
  if (!process.env.FINANCIAL_MODELING_PREP_API || !process.env.FMP_API_KEY) {
    return Promise.reject("FMP URL and key must be specified");
  }

  const datePart = formatDateToEST(date);
  let url = `${process.env.FINANCIAL_MODELING_PREP_API}/historical-chart/${period}/${ticker}?apikey=${process.env.FMP_API_KEY}&from=${datePart}&to=${datePart}`;
  const response = await fetchWithRetries(url, { next: { revalidate: 0 } }, 1);

  const parsed = FMPIntradayChartSchema.safeParse(response);

  if (parsed.success) {
    return parsed.data;
  } else {
    return Promise.reject("Unable to parse Intraday chart");
  }
}

export async function getRealTimeQuotes(
  datasource: "sp500" | "ns100" | "iwm" | "nyse"
): Promise<RealtimeQuoteResponse[] | FMPDataLoadingError> {
  if (!process.env.TRADERS_LAB_API) {
    return Promise.resolve("TRADERS_LAB_API must be specified");
  }
  const url = `${process.env.TRADERS_LAB_API}/breadth/quotes/${datasource}`;

  try {
    const response = await fetch(url, { next: { revalidate: 0 } });

    if (!response.ok) {
      const message = `Error fetching realtime quotes`;
      console.error(message);
      console.error(JSON.stringify(response));
      return message;
    }

    const data = await response.json();

    return data;
  } catch (error) {
    const dataError: FMPDataLoadingError = `Unable to fetch realtime quotes`;
    return dataError;
  }
}

export async function getProfile(ticker: string): Promise<SymbolProfile> {
  if (!process.env.TRADERS_LAB_API) {
    return Promise.reject("TRADERS_LAB_API must be specified");
  }
  const url = `${process.env.TRADERS_LAB_API}/symbol/${ticker}/profile`;

  try {
    const response = await fetch(url, { next: { revalidate: 0 } });

    if (!response.ok) {
      const message = `Error fetching profile`;
      console.error(message);
      console.error(JSON.stringify(response));
      return Promise.reject("Error fetching profile");
    }

    const data = await response.json();

    return data;
  } catch (error) {
    const dataError: FMPDataLoadingError = `Unable to fetch profile`;
    return Promise.reject(dataError);
  }
}

export async function getFullProfile(
  ticker: string
): Promise<FullFMPProfile[]> {
  if (!process.env.FINANCIAL_MODELING_PREP_API || !process.env.FMP_API_KEY) {
    return Promise.reject("FMP URL and key must be specified");
  }
  const url = `${process.env.FINANCIAL_MODELING_PREP_API}/profile/${ticker}?apikey=${process.env.FMP_API_KEY}`;
  try {
    const response = await fetch(url, { next: { revalidate: 0 } });

    if (!response.ok) {
      const message = `Error fetching profile`;
      console.error(message);
      console.error(JSON.stringify(response));
      return Promise.reject("Error fetching profile");
    }

    const data = await response.json();

    const parsed = FullFMPFullProfileArraySchema.safeParse(data);
    if (parsed.success) {
      return parsed.data;
    } else {
      return Promise.reject("Unable to parse profiles");
    }
  } catch (error) {
    const dataError: FMPDataLoadingError = `Unable to fetch profile`;
    return Promise.reject(dataError);
  }
}

export async function getFullProfiles(
  tickers: string[]
): Promise<FullFMPProfile[]> {
  if (!process.env.FINANCIAL_MODELING_PREP_API || !process.env.FMP_API_KEY) {
    return Promise.reject("FMP URL and key must be specified");
  }
  const tickersPart = tickers.join(",")
  const url = `${process.env.FINANCIAL_MODELING_PREP_API}/profile/${tickersPart}?apikey=${process.env.FMP_API_KEY}`;
  try {
    const response = await fetch(url, { next: { revalidate: 500 } });

    if (!response.ok) {
      const message = `Error fetching profiles`;
      console.error(message);
      console.error(JSON.stringify(response));
      return Promise.reject("Error fetching profiles");
    }

    const data = await response.json();

    const parsed = FullFMPFullProfileArraySchema.safeParse(data);
    if (parsed.success) {
      return parsed.data;
    } else {
      return Promise.reject("Unable to parse profiles");
    }
  } catch (error) {
    const dataError: FMPDataLoadingError = `Unable to fetch profiles`;
    return Promise.reject(dataError);
  }
}

export async function getQuotesFromFMP(tickers: string[]): Promise<Quote[]> {
  if (!process.env.FINANCIAL_MODELING_PREP_API || !process.env.FMP_API_KEY) {
    return Promise.reject("FMP URL and key must be specified");
  }

  const tickersPart = tickers.join(",");
  const url = `${process.env.FINANCIAL_MODELING_PREP_API}/quote/${tickersPart}?apikey=${process.env.FMP_API_KEY}`;

  try {
    const response = await fetch(url, { next: { revalidate: 0 } });

    if (!response.ok) {
      const message = `Error fetching realtime quotes from FMP`;
      console.error(message);
      console.error(JSON.stringify(response));
      return Promise.reject(message);
    }

    const data = await response.json();

    // Parse each quote individually
    const validQuotes: Quote[] = [];
    const invalidQuotes: any[] = [];

    data.forEach((quote: any) => {
      const result = QuoteElementSchema.safeParse(quote);
      if (result.success) {
        validQuotes.push(result.data);
      } else {
        console.warn("Invalid quote:", quote, result.error.errors);
        invalidQuotes.push(quote);
      }
    });

    if (invalidQuotes.length > 0) {
      console.warn(`${invalidQuotes.length} invalid quotes encountered`);
    }

    return validQuotes;
  } catch (error) {
    const dataError = `Unable to fetch quotes: ${error}`;
    console.error(dataError);
    return Promise.reject(dataError);
  }
}
export async function getMarketPerformers(
  kind: "gainers" | "losers" | "actives"
): Promise<Quote[] | FMPDataLoadingError> {
  if (!process.env.TRADERS_LAB_API) {
    return Promise.resolve("TRADERS_LAB_API must be specified");
  }
  const url = `${process.env.TRADERS_LAB_API}/market-performance/${kind}`;

  try {
    const response = await fetch(url, { next: { revalidate: 60 } });

    if (!response.ok) {
      const message = `Error fetching gainers`;
      console.error(message);
      console.error(JSON.stringify(response));
      return message;
    }

    const data = await response.json();

    return data;
  } catch (error) {
    const dataError: FMPDataLoadingError = `Unable to fetch realtime quotes`;
    return dataError;
  }
}

export async function getEarningsCalendar(): Promise<
  FMPEarningsDate[] | FMPDataLoadingError
> {
  "use server";
  if (!process.env.FINANCIAL_MODELING_PREP_API || !process.env.FMP_API_KEY) {
    return "FMP URL and key must be specified";
  }

  const today = new Date();
  const oneWeekLater = new Date();
  oneWeekLater.setDate(today.getDate() + 7);

  const fromDate = formatDateToEST(today);
  const toDate = formatDateToEST(oneWeekLater);

  const url = `${process.env.TRADERS_LAB_API}/earnings/calendar?fromDateStr=${fromDate}&toDateStr=${toDate}`;

  try {
    const response = await fetch(url, { next: { revalidate: 300 } }); // 5 minutes revalidation

    if (!response.ok) {
      const message = `Error fetching earnings calendar`;
      console.error(message);
      return message;
    }
    const data = await response.json();

    // Validate each entry individually and keep only valid ones
    const validEarnings = data
      .map((item: unknown) => EarningsDateSchema.safeParse(item))
      .filter(
        (
          result: z.SafeParseReturnType<unknown, FMPEarningsDate>
        ): result is z.SafeParseSuccess<FMPEarningsDate> => result.success
      )
      .map((result: { data: any }) => result.data);

    if (validEarnings.length === 0) {
      return "No valid earnings data found";
    }

    // Sort valid data by date in ascending order
    const sortedData = validEarnings.sort(
      (
        a: { date: string | number | Date },
        b: { date: string | number | Date }
      ) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA.getTime() - dateB.getTime();
      }
    );

    return sortedData;
  } catch (error) {
    console.error("Unable to fetch economic calendar", error);
    return "Unable to fetch economic calendar";
  }
}

export async function getEarningsCalendarForSymbol(
  ticker: string
): Promise<FMPEarningsDate[] | FMPDataLoadingError> {
  "use server";
  if (!process.env.FINANCIAL_MODELING_PREP_API || !process.env.FMP_API_KEY) {
    return "FMP URL and key must be specified";
  }

  const today = new Date();
  const oneWeekLater = new Date();
  oneWeekLater.setDate(today.getDate() + 7);

  const fromDate = formatDateToEST(today);
  const toDate = formatDateToEST(oneWeekLater);

  const url = `${process.env.TRADERS_LAB_API}/earnings/calendar?fromDateStr=${fromDate}&toDateStr=${toDate}`;

  try {
    const response = await fetch(url, { next: { revalidate: 300 } }); // 5 minutes revalidation

    if (!response.ok) {
      const message = `Error fetching earnings calendar`;
      console.error(message);
      return message;
    }
    const data = await response.json();

    // Validate each entry individually and keep only valid ones
    const validEarnings = data
      .map((item: unknown) => EarningsDateSchema.safeParse(item))
      .filter(
        (
          result: z.SafeParseReturnType<unknown, FMPEarningsDate>
        ): result is z.SafeParseSuccess<FMPEarningsDate> => result.success
      )
      .map((result: { data: any }) => result.data);

    if (validEarnings.length === 0) {
      return "No valid earnings data found";
    }

    // Sort valid data by date in ascending order
    const sortedData = validEarnings.sort(
      (
        a: { date: string | number | Date },
        b: { date: string | number | Date }
      ) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA.getTime() - dateB.getTime();
      }
    );

    return sortedData;
  } catch (error) {
    console.error("Unable to fetch economic calendar", error);
    return "Unable to fetch economic calendar";
  }
}

export async function getBreadthOvervewSnapshot(): Promise<
  CurrentDayMarketBreadthSnapshot | FMPDataLoadingError
> {
  if (!process.env.TRADERS_LAB_API) {
    return Promise.resolve("TRADERS_LAB_API must be specified");
  }
  const url = `${process.env.TRADERS_LAB_API}/breadth/overview/snapshot`;
  try {
    console.log(`fetching breadth snapshot from ${url}`);
    const response = await fetch(url, { next: { revalidate: 0 } });

    if (!response.ok) {
      const message = `Error fetching all trend models`;
      console.error(message);
      console.error(JSON.stringify(response));
      return message;
    }
    const data = await response.json();

    return data;
  } catch (error) {
    console.log(error);
    const dataError: FMPDataLoadingError = `Unable to fetch all trend models`;
    return dataError;
  }
}

export async function getSubMarketsSectorsThemesData(): Promise<
  MarketOverviewPerformanceResponse | FMPDataLoadingError
> {
  if (!process.env.TRADERS_LAB_API) {
    return Promise.resolve("TRADERS_LAB_API must be specified");
  }

  const url = `${process.env.TRADERS_LAB_API}/market-performance`;

  try {
    const response = await fetch(url, { next: { revalidate: 0 } });

    if (!response.ok) {
      const message = `Error fetching breadth snapshot overview`;
      console.error(message);
      console.error(JSON.stringify(response));
      return message;
    }

    const rawData = await response.json();

    // Use Zod to parse and validate the data
    const validatedData =
      MarketOverviewPerformanceResponseSchema.safeParse(rawData);

    if (!validatedData.success) {
      console.error("Data validation failed:", validatedData.error);
      return "Data validation failed";
    }

    return validatedData.data;
  } catch (error) {
    const dataError: FMPDataLoadingError = `Unable to fetch market breadth`;
    return dataError;
  }
}

import { Either, Left, Right } from "@/lib/utils";

export async function getEtfHoldings(
  etfSymbol: string
): Promise<Either<FMPDataLoadingError, EtfHolding[]>> {
  console.log(`fetching etf holdings for for ${etfSymbol}`);
  const url = `${process.env.FINANCIAL_MODELING_PREP_API}/etf-holder/${etfSymbol}?apikey=${process.env.FMP_API_KEY}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const parsed = EtfHoldingArraySchema.safeParse(data);

    if (parsed.success) {
      return Right(parsed.data);
    } else {
      return Left<FMPDataLoadingError>(
        `Error parsing ETF holdings for ${etfSymbol}`
      );
    }
  } catch (error) {
    console.error(error);
    return Promise.resolve(
      Left<FMPDataLoadingError>(
        `Unable to get ETF holdings for symbol ${etfSymbol}`
      )
    );
  }
}