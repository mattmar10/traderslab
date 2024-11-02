"use server";

import { fetchWithRetries } from "@/app/api/utils";
import { Candle, Quote } from "@/lib/types/basic-types";
import {
  EarningsDateSchema,
  FMPDataLoadingError,
  FMPEarningsDate,
  FMPHistoricalResultsSchema,
  RealtimeQuoteResponse,
} from "@/lib/types/fmp-types";
import { CurrentDayMarketBreadthSnapshot } from "@/lib/types/market-breadth-types";
import { AllPTTrendModels } from "@/lib/types/trend-model-types";
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
    const sortedData = validEarnings.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });

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
