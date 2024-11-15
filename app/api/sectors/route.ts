import { NextResponse } from "next/server";
import { fetchWithRetries } from "../utils";

export async function GET() {
    if (!process.env.FINANCIAL_MODELING_PREP_API || !process.env.FMP_API_KEY) {
        return NextResponse.json(
            { error: "FMP URL and key must be specified" },
            { status: 500 }
        );
    }
    const url = `${process.env.FINANCIAL_MODELING_PREP_API}/sectors-list?apikey=${process.env.FMP_API_KEY}`;

    try {
        const data = await fetchWithRetries(
            url,
            {
                next: { revalidate: 86000 },
            },
            1
        );

        return NextResponse.json(data);
    } catch (error) {
        console.error(error)
        return NextResponse.error();
    }
}
