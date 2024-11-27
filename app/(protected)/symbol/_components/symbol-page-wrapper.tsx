
"use client"
import PageContainer from "@/components/layout/page-container";
import SymbolPageHeader from "./symbol-page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { FMPEarningsCalendar, FMPEarningsCalendarSchema, FullFMPProfile, IncomeStatement, Quote } from "@/lib/types/fmp-types";
import { Candle } from "@/lib/types/basic-types";
import PriceChart from "./price-chart";
import { useTheme } from "next-themes";
import { ChartSettings, defaultChartSettings } from "@/components/settings/chart-settings";
import OverviewPageWrapper from "./overview/overview-wrapper";
import { useQuery } from "@tanstack/react-query";
import { FmpStockNewsList } from "@/lib/types/news-types";
import RelativeStrengthWrapper from "./relative-strength/relative-strength-wrapper";

export interface SymbolPageProps {
    quote: Quote,
    profile: FullFMPProfile
    candles: Candle[]
    news: FmpStockNewsList
    incomeStatement?: IncomeStatement
}

const SymbolPageWrapper: React.FC<SymbolPageProps> = ({ quote, profile, candles, news, incomeStatement }) => {

    const [activeTab, setActiveTab] = useState("overview")
    const { theme } = useTheme();
    const resolvedTheme = (theme as "light" | "dark") || "light";

    const [chartSettings,] =
        useState<ChartSettings>(loadChartSettings);

    const earningsKey = `/api/earnings/${profile.symbol}`;

    const getEarnings = async () => {
        const response = await fetch(earningsKey);
        const data = await response.json();
        const parsed = FMPEarningsCalendarSchema.safeParse(data);
        if (!parsed.success) {
            throw Error("Unable to fetch quote");
        }
        return parsed.data;
    };

    const currentDate = new Date();
    const startDate = new Date(
        currentDate.getFullYear() - 3,
        currentDate.getMonth(),
        currentDate.getDate(),
        currentDate.getHours(),
        currentDate.getMinutes(),
        currentDate.getSeconds(),
        currentDate.getMilliseconds()
    );

    const {
        data: earningsData,
    } = useQuery({
        queryKey: [earningsKey],
        queryFn: getEarnings,
        staleTime: 3000000,
    });

    const filteredEarnings = filterAndSortEarningsDates(
        earningsData || [],
        startDate
    );

    const adjustedDates = filteredEarnings.map((e) => {
        const dateObj = new Date(e.date);
        if (e.time === "amc") {
            dateObj.setDate(dateObj.getDate() + 1);
        }
        return dateObj.toISOString().split("T")[0];
    });


    const sortedCandles = [...candles].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

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
                        <OverviewPageWrapper quote={quote} profile={profile} candles={candles} news={news} incomeStatement={incomeStatement} />
                    </TabsContent>
                    <TabsContent value="chart">
                        <PriceChart ticker={profile.symbol} dailyCandles={sortedCandles} earningsDates={adjustedDates} theme={resolvedTheme} chartSettings={chartSettings} />
                    </TabsContent>
                    <TabsContent value="relative-strength">
                        <RelativeStrengthWrapper quote={quote} profile={profile} candles={candles} startDate={startDate} />
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


const filterAndSortEarningsDates = (
    earningsCalendar: FMPEarningsCalendar,
    startDate: Date,
) => {
    const currentDate = new Date();

    const filteredSortedDates = earningsCalendar
        .filter((item) => {
            const dateObj = new Date(item.date);
            if (item.time === "amc") {
                dateObj.setDate(dateObj.getDate() + 1);
            }
            return (
                dateObj.getTime() > startDate.getTime() &&
                dateObj.getTime() <= currentDate.getTime()
            );
        })
        .sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            if (a.time === "amc") dateA.setDate(dateA.getDate() + 1);
            if (b.time === "amc") dateB.setDate(dateB.getDate() + 1);
            return dateA.getTime() - dateB.getTime();
        });

    return filteredSortedDates;
};