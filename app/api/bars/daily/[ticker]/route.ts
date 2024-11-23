import { fetchWithRetries } from "@/app/api/utils";
import { NextResponse } from "next/server";
import { Candle } from "@/lib/types/basic-types";

export async function GET(
  request: Request,
  { params }: { params: { ticker: string } }
) {
  if (!process.env.TRADERS_LAB_API) {
    return NextResponse.json(
      { error: "TRADERS_LAB_API must be specified" },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const startDateParam = searchParams.get("startDate");

  // Default to 1 year ago if no startDate provided
  const startDate = startDateParam
    ? new Date(startDateParam)
    : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);

  const url = `${process.env.TRADERS_LAB_API}/symbol/${params.ticker}/candles/daily`;

  try {
    const data: Candle[] = await fetchWithRetries(
      url,
      {
        next: { revalidate: 0 },
      },
      0
    );

    // Filter candles based on startDate
    const filteredData = data.filter((candle) => {
      const candleDate = new Date(candle.dateStr!);
      return candleDate >= startDate;
    });

    // Sort filtered data by date
    const sortedData = filteredData.sort(
      (a, b) => new Date(a.dateStr!).getTime() - new Date(b.dateStr!).getTime()
    );

    return NextResponse.json(sortedData);
  } catch (error) {
    console.error(error);
    return NextResponse.error();
  }
}
