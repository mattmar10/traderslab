import { NextResponse } from "next/server";
import { fetchWithRetries } from "../../utils";


export async function GET(req: Request,
    { params }: { params: { dataset: string } }
) {
    if (!process.env.TRADERS_LAB_API) {
        return NextResponse.json(
            { error: "TRADERS_LAB_API URL must be specified" },
            { status: 500 }
        );
    }
    const url = `${process.env.TRADERS_LAB_API
        }/breadth/overview/trend-model/${params.dataset.toUpperCase()}`;

    try {
        console.log(`fetching trend model from ${url}`);
        const data = await fetchWithRetries(
            url,
            {
                next: { revalidate: 0 },
            },
            2
        );

        return NextResponse.json(data);
    } catch (error) {
        console.error(error)
        return NextResponse.error();
    }
}