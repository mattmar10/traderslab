"use client";

import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, ReferenceLine } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import Loading from "@/components/loading";
import { iwmColor, nyseColor, qqqeColor, rspColor } from "@/lib/utils/color-utils";
import useMarketData from "./hooks/useMarketData";

const marketConfigs = [
    { ticker: "QQQE", name: "NDX100", color: qqqeColor },
    { ticker: "^NYA", name: "NYSE", color: nyseColor },
    { ticker: "RSP", name: "S&P 500", color: rspColor },
    { ticker: "IWM", name: "Russell 2000", color: iwmColor },
];

type ChartDataPoint = {
    time: string;
} & {
    [market: string]: number;
};

const OverviewReturns: React.FC = () => {
    const dateToUse = new Date(); // Placeholder for actual date calculation logic
    const { chartData, isLoading, hasError } = useMarketData(dateToUse);

    if (isLoading) return <Loading />;
    if (hasError) return <p>Error loading market data.</p>;

    // Generate ticks at a specified interval for the X-axis
    const generateTicks = (data: ChartDataPoint[], interval: number = 30): string[] => {
        return data.filter((_, index) => index % interval === 0).map(point => point.time);
    };

    const ticks = generateTicks(chartData, 30); // Customize interval as needed

    return (
        <div className="w-full h-full">
            <ChartContainer config={{
                returns: {
                    label: "Returns",
                    color: "text-gray-700",
                },
            }}
                className="h-full w-full" >
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={chartData} margin={{ top: 30, right: 20, bottom: 10, left: 5 }}>
                        <CartesianGrid stroke="#e0e0e0" strokeDasharray="3 3" />
                        <XAxis dataKey="time" ticks={ticks} />
                        <YAxis domain={['auto', 'auto']} tickFormatter={(value) => `${value.toFixed(1)}%`} />
                        <ReferenceLine y={0} stroke="#999" strokeWidth={1.5} />

                        <ChartTooltip
                            content={
                                <ChartTooltipContent
                                    className="w-[180px]"
                                    labelFormatter={(label) => `Time: ${label}`}
                                    formatter={(value, name) => {
                                        // Get chart configuration for this data series
                                        const config = marketConfigs.find(m => m.name === name);
                                        const color = config ? config.color : "#000"; // Fallback color if not found

                                        // Return formatted JSX for tooltip
                                        return [
                                            <div
                                                className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                                                style={{ backgroundColor: color }}
                                                key="dot"
                                            />,
                                            <span key="label" className="ml-2 font-semibold">{config?.name || name}</span>,
                                            <span key="value" className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground">
                                                {`${parseFloat(value as string).toFixed(2)}%`}
                                            </span>,
                                        ];
                                    }}
                                />
                            }
                            cursor={{ stroke: "rgba(0, 0, 0, 0.2)" }}
                        />

                        <Legend />

                        {marketConfigs.map((market) => (
                            <Line
                                key={market.name}
                                type="monotone"
                                dataKey={market.name}
                                name={market.name}
                                stroke={market.color}
                                dot={false}
                                strokeWidth={2}
                                connectNulls
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </ChartContainer>
        </div>
    );
};

export default OverviewReturns;
