"use server"
import { SortableKeys } from "@/app/(protected)/sectors-themes/_components/market-rank-group-aggregate-table";
import { filterGroups } from "@/drizzle/schema";
import { getDatabaseInstance } from "@/lib/db";
import { FMPDataLoadingError } from "@/lib/types/fmp-types";
import { EtfScreenerResults, EtfScreenerResultsSchema, FilterGroup, ScreenerResults, ScreenerResultsSchema, ScreenerSortableKeys } from "@/lib/types/screener-types";
import { Either, Right, Left } from "@/lib/utils";
import { eq } from "drizzle-orm";

export async function getLeadingStocks(): Promise<Either<FMPDataLoadingError, ScreenerResults>> {

    if (!process.env.LEADING_STOCKS_FG_ID) {
        return Left("LEADING_STOCKS_FG_ID must be specified")
    }

    return getScreenerResultsFromFGId(process.env.LEADING_STOCKS_FG_ID)
}

export async function getSettingUpStocks(): Promise<Either<FMPDataLoadingError, ScreenerResults>> {

    if (!process.env.SETTING_UP_STOCKS_FG_ID) {
        return Left("SETTING_UP_STOCKS_FG_ID must be specified")
    }

    return getScreenerResultsFromFGId(process.env.SETTING_UP_STOCKS_FG_ID)
}


async function getScreenerResultsFromFGId(fgId: string): Promise<Either<FMPDataLoadingError, ScreenerResults>> {
    const db = await getDatabaseInstance();

    const filterGroupRecord = await db
        .select({ payload: filterGroups.payload })
        .from(filterGroups)
        .where(eq(filterGroups.id, fgId))
        .limit(1);


    if (!filterGroupRecord || filterGroupRecord.length === 0) {
        return Left("Filter group not found");
    }

    // Access the payload from the first record
    const filterGroup: FilterGroup = filterGroupRecord[0].payload as FilterGroup;

    // Check if `filters` is defined in the payload
    if (!filterGroup.filters) {
        return Left("Filters not found in filter group payload");
    }

    const url = `${process.env.TRADERS_LAB_API}/market-performance/stocks`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ page: 1, pageSize: 25, filterGroup: filterGroup, sortAttribute: 'rsRank', sortDirection: 'asc' }),
        });

        if (!response.ok) {
            return Left(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const parsed = ScreenerResultsSchema.safeParse(data);

        if (parsed.success) {
            return Right(parsed.data);
        } else {
            return Left("Schema validation failed: unable to parse data");
        }
    } catch (error) {
        console.error("Error:", error);
        return Left("Unable to fetch Leading Stocks");
    }
}

export async function getLeadingStocksForEtf(etfSymbol: string): Promise<Either<FMPDataLoadingError, EtfScreenerResults>> {

    if (!process.env.LEADING_STOCKS_FG_ID) {
        throw new Error("LEADING_STOCKS_FG_ID must be specified")
    }

    return getScreenerResultsForEtfFromFGId(etfSymbol, process.env.LEADING_STOCKS_FG_ID)
}

export async function getSettingUpStocksForEtf(etfSymbol: string): Promise<Either<FMPDataLoadingError, EtfScreenerResults>> {

    if (!process.env.SETTING_UP_STOCKS_FG_ID) {
        throw new Error("SETTING_UP_STOCKS_FG_ID must be specified")
    }

    return getScreenerResultsForEtfFromFGId(etfSymbol, process.env.SETTING_UP_STOCKS_FG_ID)
}


async function getScreenerResultsForEtfFromFGId(etf: string, fgId: string): Promise<Either<FMPDataLoadingError, EtfScreenerResults>> {
    const db = await getDatabaseInstance();

    const filterGroupRecord = await db
        .select({ payload: filterGroups.payload })
        .from(filterGroups)
        .where(eq(filterGroups.id, fgId))
        .limit(1);


    if (!filterGroupRecord || filterGroupRecord.length === 0) {
        return Left("Filter group not found");
    }

    // Access the payload from the first record
    const filterGroup: FilterGroup = filterGroupRecord[0].payload as FilterGroup;

    // Check if `filters` is defined in the payload
    if (!filterGroup.filters) {
        return Left("Filters not found in filter group payload");
    }

    const url = `${process.env.TRADERS_LAB_API}/market-performance/etf/${etf}`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ page: 1, pageSize: 25, filterGroup: filterGroup, sortAttribute: 'rsRank', sortDirection: 'asc' }),
        });

        if (!response.ok) {
            return Left(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const parsed = EtfScreenerResultsSchema.safeParse(data);

        if (parsed.success) {
            return Right(parsed.data);
        } else {
            throw new Error("Schema validation failed: unable to parse data");
        }
    } catch (error) {
        console.error("Error:", error);
        return Left("Unable to fetch Leading Stocks");
    }
}

export async function getScreenerResultsForEtf(
    etf: string,
    page: number = 1,
    pageSize: number = 1000,
    sortAttribute: ScreenerSortableKeys = "rsRank",
    sortDirection: "asc" | "desc" = "asc"): Promise<Either<FMPDataLoadingError, EtfScreenerResults>> {
    const db = await getDatabaseInstance();


    const url = `${process.env.TRADERS_LAB_API}/market-performance/etf/${etf}`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ page: page, pageSize: pageSize, filterGroup: {}, sortAttribute: sortAttribute, sortDirection: sortDirection }),
        });

        if (!response.ok) {
            return Left(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const parsed = EtfScreenerResultsSchema.safeParse(data);

        if (parsed.success) {
            return Right(parsed.data);
        } else {
            throw new Error("Schema validation failed: unable to parse data");
        }
    } catch (error) {
        console.error("Error:", error);
        return Left("Unable to fetch Leading Stocks");
    }
}