"use client"
import EtfScreenerResultsTable from "@/app/(protected)/screener/_components/etf-screener-results-table";
import { defaultEtfColumns } from "@/app/(protected)/screener/_components/screener-table-columns";
import Loading from "@/components/loading";
import { ChartSettings, defaultChartSettings } from "@/components/settings/chart-settings";
import { EtfHolding, FullFMPProfile } from "@/lib/types/fmp-types";
import { EtfHoldingWithStatsWithRankWithWeight, EtfScreenerResults, EtfScreenerSortConfig } from "@/lib/types/screener-types";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";



export interface EtfHoldingsProps {
    profile: FullFMPProfile,
    holdings: EtfHolding[],
    screenerResults: EtfScreenerResults
}

const sortConfig: EtfScreenerSortConfig = {
    key: 'weightPercentage',
    direction: "desc"
}
const EtfHoldings: React.FC<EtfHoldingsProps> = ({ profile, holdings, screenerResults }) => {
    const { theme } = useTheme();
    const resolvedTheme = (theme as "light" | "dark") || "light";
    const [chartSettings, setChartSettings] =
        useState<ChartSettings | undefined>(undefined);

    useEffect(() => {
        const loadData = () => {
            const savedSettings = localStorage.getItem("chartSettings");
            if (savedSettings) {
                setChartSettings(JSON.parse(savedSettings));
            } else {
                setChartSettings(defaultChartSettings);
            }
        };

        loadData();
    }, []);

    if (!chartSettings) {
        return <Loading />
    }

    const data: EtfHoldingWithStatsWithRankWithWeight[] = []
    screenerResults.holdings.forEach(h => {
        const holding = holdings.find(ho => h.asset === ho.asset)

        if (holding) {
            data.push({ ...h, ...holding })
        }
    })

    const sorted = data.sort((a, b) => b.weightPercentage - a.weightPercentage)





    return (
        <EtfScreenerResultsTable
            etfs={sorted}
            sortConfig={sortConfig}
            ranges={screenerResults.ranges}
            columns={defaultEtfColumns} theme={resolvedTheme} chartSettings={chartSettings} ticker={profile.symbol} />
    )

}

export default EtfHoldings