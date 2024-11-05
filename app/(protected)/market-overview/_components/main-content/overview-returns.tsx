"use client";

import { getIntradayChart, getQuotesFromFMP, getRealTimeQuotes } from "@/actions/market-data/actions";
import { useQuery } from "react-query";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { FMPIntradyChartCandle } from "@/lib/types/fmp-types";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";

const OverviewReturns: React.FC = () => {
    const now = new Date();
    const markets = [
        { ticker: "^NYA", name: "NYSE", description: "NYSE Composite Index" },
        { ticker: "RSP", name: "S&P 500", description: "Equal Weighted S&P 500" },
        { ticker: "QQQE", name: "NDX100", description: "Equal Weighted Nasdaq 100" },
        { ticker: "IWM", name: "Russell 2000", description: "Small Cap Index" },
    ];

    const chartConfig: { [key: string]: { label: string; color: string } } = {
        NYSE: { label: "NYSE", color: "#8884d8" },
        "S&P 500": { label: "S&P 500", color: "#82ca9d" },
        NDX100: { label: "NDX100", color: "#ffc658" },
        "Russell 2000": { label: "Russell 2K", color: "#ff7300" },
    };

    type ChartDataPoint = {
        time: string;
        [key: string]: number | string;
    };

    const { data: quoteData, error: quoteError, isLoading: quoteLoading, } = useQuery({
        queryKey: [`maincontent-quotes`],
        queryFn: async () => {
            try {
                const result = await getQuotesFromFMP(markets.map(m => m.ticker));
                return result;
            } catch (error) {
                console.error("Error fetching market performers:", error);
                throw error;
            }
        },
        refetchInterval: 300000,
    });


    const queries = markets.map((market) => {
        return useQuery({
            queryKey: [`overview-${market.ticker}`],
            queryFn: async () => {
                try {
                    const result = await getIntradayChart(market.ticker, "1min", now);
                    return result;
                } catch (error) {
                    console.error(`Error fetching ${market.name} chart`, error);
                    throw error;
                }
            },
            refetchInterval: 60000,
        });
    });

    const isLoading = queries.some((query) => query.isLoading) || quoteLoading;
    const hasError = queries.some((query) => query.isError) || quoteError;

    if (isLoading) return <p>Loading...</p>;
    if (hasError) return <p>Error loading market data.</p>;


    const chartData: ChartDataPoint[] = [];

    queries.forEach((query, index) => {
        const market = markets[index].name;
        const marketData = query.data as FMPIntradyChartCandle[] | undefined;

        if (marketData && marketData.length > 0) {
            // Sort data by time to ensure it’s in chronological order
            const sortedMarketData = [...marketData].sort((a, b) =>
                new Date(a.date).getTime() - new Date(b.date).getTime()
            );

            const openPrice = quoteData?.find(q => q.symbol === markets[index].ticker)?.previousClose || marketData[0].open;

            sortedMarketData.forEach((point, idx) => {
                const time = point.date;
                const returnPercent = ((point.close - openPrice) / openPrice) * 100;

                if (!chartData[idx]) {
                    chartData[idx] = { time };
                }

                chartData[idx][market] = returnPercent;
            });
        }
    });

    return (
        <ChartContainer config={chartConfig} className="w-full h-full">
            <ResponsiveContainer width="100%" >
                <LineChart data={chartData}>
                    <CartesianGrid stroke="#e0e0e0" strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis unit="%" />
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                    />
                    <Legend />
                    {markets.map((market, index) => (
                        <Line
                            key={market.name}
                            dataKey={market.name}
                            name={chartConfig[market.name].label}
                            type="monotone"
                            stroke={chartConfig[market.name].color}
                            strokeWidth={2}
                            dot={false}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </ChartContainer>
    );
};

export default OverviewReturns;
