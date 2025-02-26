import { NextResponse } from "next/server";
import { fetchWithRetries } from "../../utils";

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
  const url = `${process.env.TRADERS_LAB_API}/symbol/${params.ticker}/quote`;

  try {
    const data = await fetchWithRetries(
      url,
      {
        next: { revalidate: 0 },
      },
      1
    );

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.error();
  }
}
