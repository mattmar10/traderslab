import { NextResponse } from "next/server";
import { fetchWithRetries } from "../../utils";

export async function GET(
  request: Request,
  { params }: { params: { ticker: string } }
) {
  const { searchParams } = new URL(request.url);
  const fromDateString = searchParams.get("fromDateString") ?? undefined;
  const toDateString = searchParams.get("toDateString") ?? undefined;

  if (!process.env.FINANCIAL_MODELING_PREP_API || !process.env.FMP_API_KEY) {
    return NextResponse.json(
      { error: "FMP URL and key must be specified" },
      { status: 500 }
    );
  }

  let url = `${process.env.FINANCIAL_MODELING_PREP_API}/stock_news?apikey=${process.env.FMP_API_KEY}&tickers=${params.ticker}`;

  if (fromDateString) {
    url = `${url}&from=${fromDateString}`;
  }

  if (toDateString) {
    url = `${url}&to=${toDateString}`;
  }

  try {
    console.log(`fetching bars for ${params.ticker}`);
    const data = await fetchWithRetries(
      url,
      {
        next: { revalidate: 0 }, // Revalidate every 60 seconds
      },
      3
    );

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.error();
  }
}
