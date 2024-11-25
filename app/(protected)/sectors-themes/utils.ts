import { EtfMarketData, RankedEtfMarketData } from "@/lib/types/submarkets-sectors-themes-types";

export function calculateMarketScore(data: EtfMarketData): number {
    return (
        20 * data.percentFromFiftyTwoWeekHigh +
        2 * data.percentFromFiftyTwoWeekLow +
        5 * data.percentMonthlyChange +
        1 * data.percentWeeklyChange
    );
}

export function calculateMarketPTScore(data: EtfMarketData): number {
    return (
        20 * (data.percentFromFiftyTwoWeekHigh / data.oneMonthDailyADRP) +
        2 * (data.percentFromFiftyTwoWeekLow / data.oneMonthDailyADRP) +
        5 * (data.percentMonthlyChange / data.oneMonthDailyADRP) +
        1 * (data.percentWeeklyChange / data.oneMonthDailyADRP)
    );
}

export function rankMarketData(
    marketDataArray: EtfMarketData[],
    useAdjustedRank: boolean
): RankedEtfMarketData[] {
    const sortKey = useAdjustedRank ? "ptScore" : "score";

    const scoredData = marketDataArray.map((data) => ({
        ...data,
        score: calculateMarketScore(data),
        ptScore: calculateMarketPTScore(data),
    }));

    const sortedData = scoredData.sort((a, b) => b[sortKey] - a[sortKey]);

    let currentRank = 1;
    let previousScore = sortedData[0][sortKey];
    let skipCount = 0;

    const rankedData = sortedData.map((data, index) => {
        if (data[sortKey] < previousScore) {
            currentRank += skipCount + 1;
            skipCount = 0;
        } else if (index > 0) {
            skipCount++;
        }
        previousScore = data[sortKey];
        return { ...data, rank: currentRank };
    });

    return rankedData;
}

