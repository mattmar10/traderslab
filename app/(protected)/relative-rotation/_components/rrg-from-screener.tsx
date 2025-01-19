"use client"

import { SymbolWithStatsWithRank } from "@/lib/types/screener-types";
import { useQueries } from "@tanstack/react-query";
import { FMPHistoricalResultsSchema } from "@/lib/types/fmp-types";
import { Candle } from "@/lib/types/basic-types";
import BuildingContentLoader from "@/components/animated-loader";
import PageContainer from "@/components/layout/page-container";
import ErrorCard from "@/components/error-card";
import RelativeStrengthGraph from "./relative-rotation-graph";

const RRGFromScreener = () => {
    const data = JSON.parse(localStorage.getItem("rrgScreenerData") || "{}");


    const screenerResults = (data as SymbolWithStatsWithRank[]).map((stock) =>
        stock.profile.symbol
    );

    // All symbols including benchmarks
    const allSymbols = ["SPY", "QQQ", "RSP", ...screenerResults];

    // Setup date range for data fetch
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 2);
    const fromDate = startDate.toISOString().split('T')[0];

    // Setup parallel queries for all symbols
    const queries = useQueries({
        queries: allSymbols.map(ticker => ({
            queryKey: ['candles', ticker],
            queryFn: async () => {
                const bars = await fetch(`/api/bars/${ticker}?fromDateString=${fromDate}&toDateString=${endDate}`);
                const parsed = FMPHistoricalResultsSchema.safeParse(await bars.json());

                if (!parsed.success) {
                    throw Error(`Unable to fetch bars for ${ticker}`);
                }

                return parsed.data.historical.map((h): Candle => ({
                    date: new Date(h.date).getTime(),
                    dateStr: h.date,
                    open: h.open,
                    high: h.high,
                    low: h.low,
                    close: h.close,
                    volume: h.volume,
                })).sort((a, b) => a.date - b.date);
            }
        }))
    });

    // Check if all queries are completed
    const isLoading = queries.some(query => query.isLoading);
    const isError = queries.some(query => query.isError);

    if (isLoading) {
        return <BuildingContentLoader />;
    }

    if (isError) {
        return <PageContainer scrollable={false}>
            <ErrorCard errorMessage={`Unable to load RRG from Screener`} />
        </PageContainer>
    }

    // Create the price data map for all symbols
    const priceDataMap = new Map<string, Candle[]>();
    queries.forEach((query, index) => {
        if (query.data) {
            priceDataMap.set(allSymbols[index], query.data);
        }
    });

    // Only render RelativeStrengthGraph when we have all the data
    if (priceDataMap.size === allSymbols.length) {
        return <RelativeStrengthGraph initialBenchmark="SPY" initialData={priceDataMap} />;
    }

    return <BuildingContentLoader />;
}

export default RRGFromScreener;
