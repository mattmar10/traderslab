"use client"
import { getLeadingStocksForEtf } from "@/actions/screener/actions";
import ScreenerMiniChartWrapper from "@/app/(protected)/screener/_components/screener-result-minichart";
import ErrorCard from "@/components/error-card";
import Loading from "@/components/loading";
import { ChartSettings, defaultChartSettings } from "@/components/settings/chart-settings";
import { Card, CardContent } from "@/components/ui/card";
import { match } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export interface LeadingProps {
    ticker: string
}

const Leading: React.FC<LeadingProps> = ({ ticker }) => {

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

    const {
        data,
        error,
        isLoading,
    } = useQuery({
        queryKey: [`setting-up-stocks`, ticker],
        queryFn: async () => {
            try {
                const result = await getLeadingStocksForEtf(ticker);
                return result;
            } catch (error) {
                console.error("Error fetching leading stocks for etf:", error);
                throw error;
            }
        },
        refetchInterval: 120000,
    });

    if (isLoading || !chartSettings) {
        return <Loading />
    }

    if (!data || error) {
        return <ErrorCard errorMessage={`Unable to load leading stocks for ${ticker}`} />
    }


    const value = match(
        data,
        err => {
            console.error(err)
            return <ErrorCard errorMessage={`Unable to load leading stocks for ${ticker}`} />
        },
        validData => {
            const currentDate = new Date();
            const chartStartDate = new Date(
                currentDate.getFullYear() - 2,
                currentDate.getMonth(),
                currentDate.getDate(),
                0,
                0,
                0,
                0
            );
            return (
                <div className="pt-4 grid grid-cols-1 lg:grid-cols-2 gap-4 lg:mt-4 px-2 lg:px-0">
                    {validData.holdings.map((item) => (
                        <Card key={item.profile.symbol}>
                            <CardContent className="pl-3 pr-5">
                                <ScreenerMiniChartWrapper
                                    profile={item.profile}
                                    relativeStrengthResults={item.relativeStrength}
                                    chartSettings={chartSettings}
                                    theme={resolvedTheme}
                                    startDate={chartStartDate}
                                />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )
        }
    )

    return (
        value
    )
}

export default Leading