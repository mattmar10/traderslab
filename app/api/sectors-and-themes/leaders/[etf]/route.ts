import { getLeadingStocksForEtf } from "@/actions/screener/actions";
import { match } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { etf: string } }
) {
  const result = await getLeadingStocksForEtf(params.etf);

  const matched = match(
    result,
    (err) => {
      console.error(err);
      return NextResponse.error();
    },
    (data) => NextResponse.json(data)
  );

  return matched;
}
