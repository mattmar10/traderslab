import { getEtfHoldings, getPriceBars } from "@/actions/market-data/actions";
import ErrorCard from "@/components/error-card";
import PageContainer from "@/components/layout/page-container";
import { Candle } from "@/lib/types/basic-types";
import { isFMPDataLoadingError } from "@/lib/types/fmp-types";
import { isLeft } from "@/lib/utils";
import { formatDateToEST } from "@/lib/utils/epoch-utils";
import RelativeStrengthGraph from "./relative-rotation-graph";


export interface RelativeStrengthEtfContentProps {
    etf: string;
}

const RelativeStrengthEtfContent = async ({ etf }: RelativeStrengthEtfContentProps) => {
    const holdings = await getEtfHoldings(etf)

    if (isLeft(holdings)) {
        return <ErrorCard errorMessage={`Unable to load holdings of ${etf}`} />
    }

    const etfHoldings = holdings.value

    if (etfHoldings.length === 0) {
        return <PageContainer scrollable={false}>
            <ErrorCard errorMessage={`No holdings found for ${etf}`} />
        </PageContainer>
    }
    const currentDate = new Date();
    const twoYearsAgo = new Date(
        currentDate.getFullYear() - 2,
        currentDate.getMonth(),
        currentDate.getDate()
    );
    const etfHoldingsSymbols = etfHoldings
        .sort((a, b) => b.weightPercentage - a.weightPercentage)
        .slice(0, 100)
        .map(holding => holding.asset);
    const allTickers = [etf, "RSP", "SPY", "QQQ", "QQQE", ...etfHoldingsSymbols];
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
        <RelativeStrengthGraph initialBenchmark={etf} initialData={priceDataMap} />
    )
}

export default RelativeStrengthEtfContent;