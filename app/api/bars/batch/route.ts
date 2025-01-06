import { NextResponse } from "next/server";
import { fetchWithRetries } from "../../utils";
import { FMPHistoricalResultsSchema } from "@/lib/types/fmp-types"; // Assuming your schema is imported here

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tickers = searchParams.get("tickers")?.split(",") || [];
  const fromDateString = searchParams.get("fromDateString") ?? undefined;
  const toDateString = searchParams.get("toDateString") ?? undefined;

  if (!process.env.FINANCIAL_MODELING_PREP_API || !process.env.FMP_API_KEY) {
    return NextResponse.json(
      { error: "FMP URL and key must be specified" },
      { status: 500 }
    );
  }

  if (tickers.length === 0) {
    return NextResponse.json({ error: "No tickers provided" }, { status: 400 });
  }

  const promises = tickers.map(async (ticker) => {
    let url = `${process.env.FINANCIAL_MODELING_PREP_API}/historical-price-full/${ticker}?apikey=${process.env.FMP_API_KEY}`;

    if (fromDateString) {
      url = `${url}&from=${fromDateString}`;
    }
    if (toDateString) {
      url = `${url}&to=${toDateString}`;
    }

    try {
      console.log(`Fetching bars for ${ticker}`);
      const response = await fetchWithRetries(
        url,
        {
          next: { revalidate: 0 },
        },
        0
      );

      //const jsonData = await response.json();
      const parsed = FMPHistoricalResultsSchema.safeParse(response);

      if (!parsed.success) {
        console.error(`Invalid data format received for ${ticker}`);
        return { ticker, error: "Invalid data format" };
      }

      const sortedTickerData = parsed.data.historical
        .map((h) => ({
          date: new Date(h.date).getTime(),
          dateStr: h.date,
          open: h.open,
          high: h.high,
          low: h.low,
          close: h.close,
          volume: h.volume,
        }))
        .sort((a, b) => a.date - b.date); // Sort by ascending date

      return { ticker, data: sortedTickerData };
    } catch (error) {
      console.error(`Error fetching data for ${ticker}:`, error);
      return { ticker, error: "Failed to fetch data" };
    }
  });

  try {
    const results = await Promise.all(promises);

    const formattedResult = results.reduce((acc, result) => {
      if (result.data) {
        acc[result.ticker] = result.data;
      } else {
        acc[result.ticker] = { error: result.error };
      }
      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json(formattedResult);
  } catch (error) {
    console.error("Error fetching batch data:", error);
    return NextResponse.json(
      { error: "Failed to fetch batch data" },
      { status: 500 }
    );
  }
}
