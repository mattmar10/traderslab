
"use client"
import PageContainer from "@/components/layout/page-container";
import SymbolPageHeader from "./symbol-page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { FullFMPProfile, Quote } from "@/lib/types/fmp-types";
import { Candle } from "@/lib/types/basic-types";
import PriceChart from "./price-chart";
import { useTheme } from "next-themes";
import { ChartSettings, defaultChartSettings } from "@/components/settings/chart-settings";
import OverviewPageWrapper from "./overview/overview-wrapper";

export interface SymbolPageProps {
    quote: Quote,
    profile: FullFMPProfile
    candles: Candle[]
}

const SymbolPageWrapper: React.FC<SymbolPageProps> = ({ quote, profile, candles }) => {

    const [activeTab, setActiveTab] = useState("overview")
    const { theme } = useTheme();
    const resolvedTheme = (theme as "light" | "dark") || "light";

    const [chartSettings,] =
        useState<ChartSettings>(loadChartSettings);

    return (
        <PageContainer scrollable>
            <div className="space-y-2 ">
                <SymbolPageHeader quote={quote} profile={profile} />
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="flex space-x-2 max-w-fit">                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="chart">Chart</TabsTrigger>
                        <TabsTrigger value="relative-strength">Relative Strength</TabsTrigger>
                        <TabsTrigger value="financials">Financials</TabsTrigger>
                    </TabsList>
                    <TabsContent value="overview">
                        <OverviewPageWrapper quote={quote} profile={profile} candles={candles} />
                    </TabsContent>
                    <TabsContent value="chart">
                        <PriceChart ticker={profile.symbol} dailyCandles={candles} theme={resolvedTheme} chartSettings={chartSettings} />
                    </TabsContent>
                    <TabsContent value="relative-strength">
                        <div>rs</div>
                    </TabsContent>
                    <TabsContent value="financials">
                        <div>financials</div>
                    </TabsContent>

                </Tabs>
            </div>

        </PageContainer>
    )
}


export default SymbolPageWrapper

function loadChartSettings(): ChartSettings {
    const savedSettings = localStorage.getItem("chartSettings");
    if (savedSettings) {
        return (JSON.parse(savedSettings));
    } else {
        return defaultChartSettings;
    }
}