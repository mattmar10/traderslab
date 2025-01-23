


import { NextResponse } from "next/server";
import { fetchWithRetries } from "../utils";
import { CurrentDayMarketBreadthSnapshot, CurrentDayMarketBreadthSnapshotArraySchema, CurrentDayMarketBreadthSnapshotPoint } from "@/lib/types/market-breadth-types";

export async function GET() {
    if (!process.env.TRADERS_LAB_COMPUTE_API) {
        return NextResponse.json(
            { error: "TRADERS_LAB_COMPUTE_API must be specified" },
            { status: 500 }
        );
    }
    const url = `${process.env.TRADERS_LAB_COMPUTE_API}/breadth/snapshots`;

    try {
        console.log(`fetching breadth snapshots from ${url}`);
        const data = await fetchWithRetries(
            url,
            {
                next: { revalidate: 0 },
            },
            0
        );

        const parsed = CurrentDayMarketBreadthSnapshotArraySchema.safeParse(data);
        if (!parsed.success) {
            console.error("Failed to parse snapshot data:", parsed.error);
            return undefined;
        }

        const gdbSnapshots = parsed.data.map(d => convertFromCurrentDayMarketBreadthSnapshotToGDBSnapshot(d));

        return NextResponse.json(gdbSnapshots);
    } catch (error) {
        console.error(error)
        return NextResponse.error();
    }
}

const convertFromCurrentDayMarketBreadthSnapshotPointToGDBSnapshot = (snapshot: CurrentDayMarketBreadthSnapshotPoint) => {
    return {
        globalDailyBreadthPercentileRank: snapshot.globalDailyBreadthPercentileRank,
    };
};

const convertFromCurrentDayMarketBreadthSnapshotToGDBSnapshot = (snapshot: CurrentDayMarketBreadthSnapshot) => {
    return {
        timestamp: snapshot.timestamp,
        nyseOverview: convertFromCurrentDayMarketBreadthSnapshotPointToGDBSnapshot(snapshot.nyseOverview),
        rspTradingOverview: convertFromCurrentDayMarketBreadthSnapshotPointToGDBSnapshot(snapshot.rspTradingOverview),
        qqqETradingOverview: convertFromCurrentDayMarketBreadthSnapshotPointToGDBSnapshot(snapshot.qqqETradingOverview),
        iwmTradingOverview: convertFromCurrentDayMarketBreadthSnapshotPointToGDBSnapshot(snapshot.iwmTradingOverview),
        //sectorsOverviews: snapshot.sectorsOverviews.map(convertFromSectorCurrentDayMarketBreadthSnapshotToGDBSnapshot),
    };
};

/*const convertFromSectorCurrentDayMarketBreadthSnapshotToGDBSnapshot = (snapshot: SectorCurrentDayMarketBreadthSnapshot) => {
    return {
        sector: snapshot.sector,
        overview: convertFromCurrentDayMarketBreadthSnapshotPointToGDBSnapshot(snapshot.overview),
    };
};*/