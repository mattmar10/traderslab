


import { NextResponse } from "next/server";
import { fetchWithRetries } from "../utils";
import { IntradayGDBResponseSchema } from "@/lib/types/market-breadth-types";

export async function GET() {
    if (!process.env.TRADERS_LAB_COMPUTE_API) {
        return NextResponse.json(
            { error: "TRADERS_LAB_COMPUTE_API must be specified" },
            { status: 500 }
        );
    }
    const url = `${process.env.TRADERS_LAB_COMPUTE_API}/breadth/intraday-gdb`;

    try {
        console.log(`fetching breadth snapshots from ${url}`);
        const data = await fetchWithRetries(
            url,
            {
                next: { revalidate: 0 },
            },
            0
        );

        const parsed = IntradayGDBResponseSchema.safeParse(data);
        if (!parsed.success) {
            console.error("Failed to parse snapshot data:", parsed.error);
            return undefined;
        }


        return NextResponse.json(parsed.data);
    } catch (error) {
        console.error(error)
        return NextResponse.error();
    }
}

