// _components/sectors-themes-content.tsx
import { getPriceBars, getSubMarketsSectorsThemesData } from "@/actions/market-data/actions";
import { isFMPDataLoadingError } from "@/lib/types/fmp-types";
import ErrorCard from "@/components/error-card";
import RelativeStrengthGraph from "./relative-strength-rotation-graph";
import { Candle } from "@/lib/types/basic-types";
import { formatDateToEST } from "@/lib/utils/epoch-utils";

export default async function RelativeStrengthContent() {
    const data = await getSubMarketsSectorsThemesData();
    const currentDate = new Date();
    const twoYearsAgo = new Date(
        currentDate.getFullYear() - 2,
        currentDate.getMonth(),
        currentDate.getDate()
    );
    if (isFMPDataLoadingError(data)) {
        return <ErrorCard errorMessage={"Unable to load data"} />;
    }

    const sectorTickers = data.sectorMarketData.map(sector => sector.ticker);

    // Fetch price data for SPY, RSP and all sector tickers
    const allTickers = ["SPY", "RSP", ...sectorTickers];
    const priceDataPromises = allTickers.map(ticker => getPriceBars(ticker, formatDateToEST(twoYearsAgo)));
    const priceDataResults = await Promise.all(priceDataPromises);

    // Create a map of ticker to price data
    const priceDataMap = new Map<string, Candle[]>();
    allTickers.forEach((ticker, index) => {
        const priceData = priceDataResults[index];
        if (!isFMPDataLoadingError(priceData)) {
            const sortedTickerData = priceData.sort(
                (a, b) => a.date - b.date
            );
            priceDataMap.set(ticker, sortedTickerData);
        }
    });

    return (
        <RelativeStrengthGraph initialBenchmark={""} initialData={priceDataMap} />
    );
}