"use client";
import React, { useState, useEffect } from 'react';
import { LineChart, Line, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, } from "@/components/ui/card";
import { Candle } from '@/lib/types/basic-types';
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

export interface RSLineChartProps {
    symbol: string;
    symbolCandles: Candle[];
    benchmark?: string;
    benchmarkCandles: Candle[];
}

const timeFrames = ['1Y', '6M', '3M', '1M'];
const MA_PERIOD = 20;

const RSLineChart: React.FC<RSLineChartProps> = ({
    symbol,
    symbolCandles,
    benchmark = 'RSP',
    benchmarkCandles
}) => {
    const [timeFrame, setTimeFrame] = useState('Y');
    const [rsLineData, setRsLineData] = useState<any[]>([]);

    // Calculate Moving Average
    const calculateMA = (data: number[], period: number) => {
        const result = [];
        for (let i = 0; i < data.length; i++) {
            if (i < period - 1) {
                result.push(null);
                continue;
            }
            const slice = data.slice(i - period + 1, i + 1);
            const avg = slice.reduce((sum, val) => sum + val, 0) / period;
            result.push(avg);
        }
        return result;
    };

    // Calculate RS Line data with MA
    const calculateRSLine = (symbolData: Candle[], benchmarkData: Candle[]) => {
        const benchmarkMap = new Map(
            benchmarkData.map(candle => [candle.dateStr!, candle.close])
        );

        // Calculate basic RS values
        const rsData = symbolData
            .filter(candle => benchmarkMap.has(candle.dateStr!))
            .map(candle => ({
                date: candle.dateStr!,
                dateStr: candle.dateStr!,
                rsValue: candle.close / (benchmarkMap.get(candle.dateStr!) || 1)
            }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Calculate 20-period MA
        const rsValues = rsData.map(d => d.rsValue);
        const maValues = calculateMA(rsValues, MA_PERIOD);

        // Add MA values
        return rsData.map((point, i) => ({
            ...point,
            ma20: maValues[i],
            rsValue: point.rsValue
        }));
    };

    const filterByTimeFrame = (data: any[], frame: string) => {
        const now = new Date();

        switch (frame) {
            case '1Y':
                return data.filter(point => new Date(point.date) >= new Date(new Date().setFullYear(now.getFullYear() - 1)));
            case '6M':
                return data.filter(point => new Date(point.date) >= new Date(new Date().setMonth(now.getMonth() - 6)));
            case '3M':
                return data.filter(point => new Date(point.date) >= new Date(new Date().setMonth(now.getMonth() - 3)));
            case '1M':
                return data.filter(point => new Date(point.date) >= new Date(new Date().setMonth(now.getMonth() - 1)));
            default:
                return data;
        }
    };

    useEffect(() => {
        const fullRSLine = calculateRSLine(symbolCandles, benchmarkCandles);
        setRsLineData(filterByTimeFrame(fullRSLine, timeFrame));
    }, [symbolCandles, benchmarkCandles, timeFrame]);

    return (
        <Card className="w-full">
            <CardHeader className="">
                <div className='font-semibold text-lg mb-2'>{symbol} vs {benchmark} Relative Strength Line</div>
                <div className="flex space-x-2 flex-row items-center space-y-0">
                    {timeFrames.map((frame) => (
                        <div
                            key={frame}
                            onClick={() => setTimeFrame(frame)}
                            className={`text-sm cursor-pointer border p-1 rounded text-center shadow-sm ${frame === timeFrame ? 'bg-accent' : 'hover:bg-accent/50'}`}
                            style={{ minWidth: '40px' }}
                        >
                            <div className="p-1 text-sm font-medium">{frame}</div>
                        </div>
                    ))}
                </div>
            </CardHeader>

            <CardContent>
                <ChartContainer className='w-full h-[18vh]' config={{
                    returns: {
                        label: "date",
                        color: "text-gray-700",
                    },
                }}>
                    <LineChart
                        data={rsLineData}
                        margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
                    >
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
                                    formatter={(value, name) => [
                                        <span key="label" className="ml-2 font-semibold">
                                            {name === 'rsValue' ? `${symbol}/${benchmark} RS` : '20MA'}
                                        </span>,
                                        <span
                                            key="value"
                                            className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground"
                                        >
                                            {parseFloat(value as string).toFixed(4)}
                                        </span>
                                    ]}
                                />
                            }
                            cursor={{ stroke: "rgba(0, 0, 0, 0.2)" }}
                        />
                        <Line
                            type="monotone"
                            dataKey="rsValue"
                            stroke="rgb(21, 128, 61)"
                            strokeWidth={2}
                            dot={false}
                        />
                        <Line
                            type="monotone"
                            dataKey="ma20"
                            stroke="#666"
                            strokeWidth={1}
                            dot={false}
                            strokeDasharray="3 3"
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
};

export default RSLineChart;