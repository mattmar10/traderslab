import { NextResponse } from "next/server";

export async function POST(
  request: Request
  //{ params }: { params: { etfSymbol: string } }
) {
  if (!process.env.TRADERS_LAB_API) {
    return NextResponse.json(
      { error: "PTMM API URL must be specified" },
      { status: 500 }
    );
  }

  const url = `${process.env.TRADERS_LAB_API}/market-performance/stocks`;

  try {
    // Read the request body
    const body = await request.json();

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
