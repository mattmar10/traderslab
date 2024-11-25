"use client"
import {
    Card,
    CardContent,
    CardHeader,
} from "@/components/ui/card";
import { EtfMarketData } from "@/lib/types/submarkets-sectors-themes-types";
import { useQuery } from "@tanstack/react-query";
import { getLeadingStocksForEtf, getSettingUpStocksForEtf } from "@/actions/screener/actions";
import { ChartSettings } from "@/components/settings/chart-settings";
import ScreenerMiniChartWrapper from "../../screener/_components/screener-result-minichart";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

interface RankedEtfCardProps {
    rank: number;
    etf: EtfMarketData;
    theme: "light" | "dark";
    chartSettings: ChartSettings
}

const RankedEtfCard: React.FC<RankedEtfCardProps> = ({ rank, etf, theme, chartSettings }) => {
    const { data: leadersData, error: leadersError, isLoading: leadersIsLoading } = useQuery({
        queryKey: [`leading-stocks`, etf],
        queryFn: async () => {
            try {
                const result = await getLeadingStocksForEtf(etf.ticker);
                return result;
            } catch (error) {
                console.error("Error fetching leaders for etf:", error);
                throw error;
            }
        },
        refetchInterval: 120000,
    });

    const { data: settingUpData, error: settingUpError, isLoading: settingUpIsLoading } = useQuery({
        queryKey: [`setting-up-stocks`, etf],
        queryFn: async () => {
            try {
                const result = await getSettingUpStocksForEtf(etf.ticker);
                return result;
            } catch (error) {
                console.error("Error fetching setting up for etf:", error);
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
                <div className="mt-4">
                    <div className="text-sm font-medium">Leaders</div>
                    {leadersIsLoading && (
                        <div className="h-4 p-1 bg-muted animate-pulse rounded w-full" />
                    )}
                    {leadersError && (
                        <div className="text-sm text-red-500">
                            Error loading leaders
                        </div>
                    )}
                    {leadersData && (
                        <div className="text-sm">
                            {(!leadersData?.holdings || leadersData.holdings.length === 0) ? (
                                <span className="text-muted-foreground">N/A</span>
                            ) : (
                                leadersData.holdings.slice(0, 5).map((holding, index) => (
                                    <span key={`${holding.asset}-${index}`} className="inline">
                                        <HoverCard>
                                            <HoverCardTrigger>
                                                <span className="text-primary hover:underline cursor-pointer">
                                                    {holding.asset}
                                                </span>
                                            </HoverCardTrigger>
                                            <HoverCardContent className="w-[52rem] p-4">
                                                <div className="space-y-2">
                                                    <ScreenerMiniChartWrapper
                                                        item={holding}
                                                        chartSettings={chartSettings}
                                                        theme={theme}
                                                        startDate={twoYearsAgo}
                                                    />
                                                </div>
                                            </HoverCardContent>
                                        </HoverCard>
                                        {index < Math.min(leadersData.holdings.length - 1, 4) && (
                                            <span className="text-muted-foreground">, </span>
                                        )}
                                    </span>
                                ))
                            )}
                        </div>
                    )}

                    <div className="text-sm font-medium mt-2">Setting Up</div>
                    {settingUpIsLoading && (
                        <div className="h-4 p-1 bg-muted animate-pulse rounded w-full" />
                    )}
                    {settingUpError && (
                        <div className="text-sm text-red-500">
                            Error loading setting up stocks
                        </div>
                    )}
                    {settingUpData && (
                        <div className="text-sm">
                            {(!settingUpData?.holdings || settingUpData.holdings.length === 0) ? (
                                <span className="text-muted-foreground">N/A</span>
                            ) : (
                                settingUpData.holdings.slice(0, 5).map((holding, index) => (
                                    <span key={`${holding.asset}-${index}`} className="inline">
                                        <HoverCard>
                                            <HoverCardTrigger>
                                                <span className="text-primary hover:underline cursor-pointer">
                                                    {holding.asset}
                                                </span>
                                            </HoverCardTrigger>
                                            <HoverCardContent className="w-[52rem] p-4">
                                                <div className="space-y-2">
                                                    <ScreenerMiniChartWrapper
                                                        item={holding}
                                                        chartSettings={chartSettings}
                                                        theme={theme}
                                                        startDate={twoYearsAgo}
                                                    />
                                                </div>
                                            </HoverCardContent>
                                        </HoverCard>
                                        {index < Math.min(settingUpData.holdings.length - 1, 4) && (
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
