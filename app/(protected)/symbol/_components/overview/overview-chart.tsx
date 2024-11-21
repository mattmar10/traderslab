"use client";
import React, { useState, useEffect } from 'react';
import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, } from "@/components/ui/card";
import { Candle } from '@/lib/types/basic-types';
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";


export interface OverviewChartProps {
    ticker: string;
    candles: Candle[];
}

const timeFrames = ['2Y', '1Y', '6M', '3M', '1M'];

const OverviewChart: React.FC<OverviewChartProps> = ({ ticker, candles }) => {
    const [timeFrame, setTimeFrame] = useState('1Y');
    const [filteredCandles, setFilteredCandles] = useState<Candle[]>([]);
    const [timeFrameChanges, setTimeFrameChanges] = useState<{ [key: string]: number }>({});

    // Sort candles by date to ensure they appear in the correct order
    const sortedCandles = [...candles].sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Function to filter candles by selected time frame
    const filterCandles = (frame: string) => {
        const now = new Date();
        let filteredData = sortedCandles;

        switch (frame) {
            case '2Y':
                filteredData = sortedCandles.filter(candle => new Date(candle.date) >= new Date(new Date().setFullYear(now.getFullYear() - 2)));
                break;
            case '1Y':
                filteredData = sortedCandles.filter(candle => new Date(candle.date) >= new Date(new Date().setFullYear(now.getFullYear() - 1)));
                break;
            case '6M':
                filteredData = sortedCandles.filter(candle => new Date(candle.date) >= new Date(new Date().setMonth(now.getMonth() - 6)));
                break;
            case '3M':
                filteredData = sortedCandles.filter(candle => new Date(candle.date) >= new Date(new Date().setMonth(now.getMonth() - 3)));
                break;
            case '1M':
                filteredData = sortedCandles.filter(candle => new Date(candle.date) >= new Date(new Date().setMonth(now.getMonth() - 1)));
                break;
            default:
                break;
        }

        return filteredData;
    };

    // Calculate percent change for each time frame
    useEffect(() => {
        const changes = {} as { [key: string]: number };
        timeFrames.forEach((frame) => {
            const data = filterCandles(frame);
            const firstPrice = data[0]?.close ?? 0;
            const lastPrice = data[data.length - 1]?.close ?? 0;
            changes[frame] = firstPrice ? ((lastPrice - firstPrice) / firstPrice) * 100 : 0;
        });
        setTimeFrameChanges(changes);
    }, [candles]);

    // Update filtered candles when time frame changes
    useEffect(() => {
        setFilteredCandles(filterCandles(timeFrame));
    }, [timeFrame]);

    // Calculate color based on price change direction
    const firstPrice = filteredCandles[0]?.close ?? 0;
    const lastPrice = filteredCandles[filteredCandles.length - 1]?.close ?? 0;
    const priceChange = firstPrice ? ((lastPrice - firstPrice) / firstPrice) * 100 : 0;
    const isPositive = priceChange >= 0;

    const gradientColor = isPositive ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)";
    const strokeColor = isPositive ? "rgb(21, 128, 61)" : "rgb(185, 28, 28)";

    return (
        <Card className="w-full">
            <CardHeader className="">
                <div className='font-semibold text-lg mb-2'>{ticker} Price Chart</div>
                <div className=" flex space-x-2 flex-row items-center  space-y-0 ">
                    {timeFrames.map((frame) => (
                        <div
                            key={frame}
                            onClick={() => setTimeFrame(frame)}
                            className={`text-sm cursor-pointer border p-1 rounded text-center shadow-sm ${frame === timeFrame ? 'text-background bg-foreground  border-foreground' : 'hover:bg-accent/50 '
                                }`}
                            style={{ minWidth: '80px' }}
                        >
                            <div className="p-1 text-sm font-medium">{frame}
                                <span className={` text-sm pl-2 ${timeFrameChanges[frame] >= 0 ? 'text-traderslabblue' : 'text-red-500'}`}>
                                    {timeFrameChanges[frame]?.toFixed(2)}%
                                </span>
                            </div>

                        </div>
                    ))}
                </div>

            </CardHeader>

            <CardContent>

                <ChartContainer className='w-full h-[18rem]' config={{
                    returns: {
                        label: "date",
                        color: "text-gray-700",
                    },
                }}>
                    <AreaChart
                        data={filteredCandles}
                        margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={gradientColor} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={gradientColor} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="dateStr"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                            tickFormatter={(value) =>
                                new Date(value).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric"
                                })
                            }
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => `$${value.toFixed(2)}`}
                            domain={['auto', 'auto']}
                        />
                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            className="stroke-muted"
                        />
                        <Tooltip
                            content={
                                <ChartTooltipContent
                                    className="w-[180px]"
                                    labelFormatter={(label) => `Date: ${label}`}
                                    formatter={(value) => [
                                        <span key="label" className="ml-2 font-semibold">
                                            {ticker}
                                        </span>,
                                        <span
                                            key="value"
                                            className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground"
                                        >
                                            ${parseFloat(value as string).toFixed(2)}
                                        </span>
                                    ]}
                                />
                            }
                            cursor={{ stroke: "rgba(0, 0, 0, 0.2)" }}
                        />
                        <Area
                            type="monotone"
                            dataKey="close"
                            stroke={strokeColor}
                            fill="url(#colorGradient)"
                            strokeWidth={2}
                        />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
};

export default OverviewChart;
