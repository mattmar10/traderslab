"use client"
import {
    Card,
    CardContent,
    CardHeader,
} from "@/components/ui/card";
import { EtfMarketData } from "@/lib/types/submarkets-sectors-themes-types";
import { useQuery } from "@tanstack/react-query";
import { getLeadingStocksForEtf } from "@/actions/screener/actions";
import { ChartSettings } from "@/components/settings/chart-settings";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import ScreenerMiniChartWrapper from "../../screener/_components/screener-result-minichart";
import { Button } from "@/components/ui/button";


interface RankedEtfCardProps {
    rank: number;
    etf: EtfMarketData;
    theme: "light" | "dark";
    chartSettings: ChartSettings
}

const RankedEtfCard: React.FC<RankedEtfCardProps> = ({ rank, etf, theme, chartSettings }) => {
    const { data, error, isLoading } = useQuery({
        queryKey: [`leading-stocks`, etf],
        queryFn: async () => {
            try {
                const result = await getLeadingStocksForEtf(etf.ticker);
                return result;
            } catch (error) {
                console.error("Error fetching market performers for etf:", error);
                throw error;
            }
        },
        refetchInterval: 120000,
    });


    const currentDate = new Date();
    const twoYearsAgo = new Date(
        currentDate.getFullYear() - 2,
        currentDate.getMonth(),
        currentDate.getDate(),
        0,
        0,
        0,
        0
    );


    return (
        <Card className="h-full">
            <CardHeader className="p-4">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="font-semibold">{etf.ticker}</div>
                        <div className="text-sm text-muted-foreground truncate">{etf.name}</div>
                    </div>
                    <div className="text-lg font-semibold text-foreground">#{rank + 1}</div>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                {/*<div className="space-y-1">
                    <div className="flex justify-between">
                        <span className="text-sm">1M</span>
                        <span className={`font-mono ${etf.percentMonthlyChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {etf.percentMonthlyChange.toFixed(1)}%
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-sm">3M</span>
                        <span className={`font-mono ${etf.percentThreeMonthChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {etf.percentThreeMonthChange.toFixed(1)}%
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-sm">6M</span>
                        <span className={`font-mono ${etf.percentSixMonthChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {etf.percentSixMonthChange.toFixed(1)}%
                        </span>
                    </div>
                </div>*/}
                {/* Holdings Section */}
                <div className="mt-4">
                    <div className="text-sm font-medium ">Leaders</div>
                    {isLoading && (
                        <div className="h-4 p-1 bg-muted animate-pulse rounded w-full" />)}
                    {error && (
                        <div className="text-sm text-red-500">
                            Error loading holdings
                        </div>
                    )}
                    {data && (
                        <div className="text-sm">
                            {(!data?.holdings || data.holdings.length === 0) ? (
                                <span className="text-muted-foreground">N/A</span>
                            ) : (
                                data.holdings.slice(0, 5).map((holding, index) => (
                                    <span key={`${holding.asset}-${index}`} className="inline">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant={'link'} className="p-0 h-auto min-h-0 font-normal leading-none">
                                                    {holding.asset}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[52rem] p-4">
                                                <div className="space-y-2">
                                                    <ScreenerMiniChartWrapper
                                                        item={holding}
                                                        chartSettings={chartSettings}
                                                        theme={theme}
                                                        startDate={twoYearsAgo}
                                                    />
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                        {index < Math.min(data.holdings.length - 1, 4) && (
                                            <span className="text-muted-foreground">, </span>
                                        )}
                                    </span>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default RankedEtfCard;

