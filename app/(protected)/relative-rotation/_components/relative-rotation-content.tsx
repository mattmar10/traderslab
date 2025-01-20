import { getPriceBars, getSubMarketsSectorsThemesData } from "@/actions/market-data/actions";
import { isFMPDataLoadingError } from "@/lib/types/fmp-types";
import ErrorCard from "@/components/error-card";
import RelativeStrengthGraph from "./relative-rotation-graph";
import { Candle } from "@/lib/types/basic-types";
import { formatDateToEST } from "@/lib/utils/epoch-utils";


export interface RelativeStrengthContentProps {
    source: "sectors" | "themes"
}

export default async function RelativeStrengthContent({ source }: RelativeStrengthContentProps) {
    const data = await getSubMarketsSectorsThemesData();
    const currentDate = new Date();
    const twoYearsAgo = new Date(
        currentDate.getFullYear() - 1,
        currentDate.getMonth() - 7,
        currentDate.getDate()
    );
    if (isFMPDataLoadingError(data)) {
        return <ErrorCard errorMessage={"Unable to load data"} />;
    }

    const sectorTickers = data.sectorMarketData.map(sector => sector.ticker);
    const themeTickers = data.themeMarketData.map(theme => theme.ticker);

    const allTickers = ["RSP", "SPY", ...(source === "sectors" ? sectorTickers : themeTickers)];
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
        <RelativeStrengthGraph initialBenchmark={"SPY"} initialData={priceDataMap} />
    );
}