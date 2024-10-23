"use server";

import {
  EtfHolding,
  EtfHoldingArraySchema,
  FMPDataLoadingError,
} from "@/lib/types/fmp-types";
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
