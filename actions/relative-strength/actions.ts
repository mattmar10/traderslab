"use server"

import { FMPDataLoadingError } from "@/lib/types/fmp-types";
import { RelativeStrengthResults, RelativeStrengthResultsSchema } from "@/lib/types/relative-strength-types";

export async function getRelativeStrengthStatsForSymbol(
    ticker: string
): Promise<RelativeStrengthResults | FMPDataLoadingError> {
    if (!process.env.TRADERS_LAB_API) {
        return Promise.resolve("TRADERS_LAB_API must be specified");
    }
    const url = `${process.env.TRADERS_LAB_API}/relative-strength/symbol/${ticker}`;

    try {
        const response = await fetch(url, { next: { revalidate: 60 } });

        if (!response.ok) {
            const message = `Error fetching relative strength for symbol`;
            console.error(message);
            console.error(JSON.stringify(response));
            return message;
        }

        const data = await response.json();
        const parsed = RelativeStrengthResultsSchema.safeParse(data);

        if (parsed.success) {
            return parsed.data;
        } else {
            throw new Error("Schema validation failed: unable to parse relative strength data");
        }

    } catch (error) {
        console.error(error)
        const dataError: FMPDataLoadingError = `Unable to fetch realtime relative strenghth stats for ${ticker}`;
        return dataError;
    }
}