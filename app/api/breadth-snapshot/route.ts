import { NextResponse } from "next/server";
import { fetchWithRetries } from "../utils";

export async function GET() {
  if (!process.env.TRADERS_LAB_COMPUTE_API) {
    return NextResponse.json(
      { error: "TRADERS_LAB_COMPUTE_API must be specified" },
      { status: 500 }
    );
  }
  const url = `${process.env.TRADERS_LAB_COMPUTE_API}/breadth/snapshot`;

  try {
    console.log(`fetching breadth snapshot from ${url}`);
    const data = await fetchWithRetries(
      url,
      {
        next: { revalidate: 0 },
      },
      1
    );

    return NextResponse.json(data);
  } catch (error) {
    console.log(error);
    return NextResponse.error();
  }
}
