import { getSettingUpStocksForEtf } from "@/actions/screener/actions";
import { match } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { etf: string } }
) {
  const result = await getSettingUpStocksForEtf(params.etf);

  const matched = match(
    result,
    (error) => {
      console.error(error);
      return NextResponse.error();
    },
    (data) => NextResponse.json(data)
  );

  return matched;
}
