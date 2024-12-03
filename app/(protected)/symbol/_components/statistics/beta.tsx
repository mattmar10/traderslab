import { Candle } from "@/lib/types/basic-types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatDateToEST } from "@/lib/utils/epoch-utils";
import { useMemo } from "react";
import { FMPHistoricalResultsSchema } from "@/lib/types/fmp-types";
import { useQuery } from "@tanstack/react-query";
import { Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ComposedChart, Legend, ReferenceLine } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer } from "@/components/ui/chart";
import { solarizedBase01, solarizedYellow } from "@/lib/utils/color-utils";

export interface BetaProps {
    ticker: string;
    candles: Candle[];
}

interface ScatterPoint {
    x: number;
    y: number;
    name: string;
    category: string;
    value: number;
    benchmarkValue: number;
}

const chartConfig = {
    return: {
        label: "Daily Returns",
        color: solarizedBase01,
    },
} as const;

const Beta: React.FC<BetaProps> = ({
    ticker,
    candles,
}) => {
    const benchMarkTicker = "RSP";

    const currentDate = new Date();
    const startDate = new Date(
        currentDate.getFullYear() - 1,
        currentDate.getMonth(),
        currentDate.getDate(),
        0, 0, 0, 0
    );

    const benchmarkBarsKey = useMemo(
        () => `/api/bars/${benchMarkTicker}?fromDateString=${formatDateToEST(startDate)}`,
        [benchMarkTicker, startDate]
    );

    const getBenchmarkBars = async () => {
        const bars = await fetch(benchmarkBarsKey);
        const parsed = FMPHistoricalResultsSchema.safeParse(await bars.json());
        if (!parsed.success) {
            throw Error("Unable to fetch bars");
        }
        return parsed.data.historical.map((h) => ({
            date: new Date(h.date).getTime(),
            dateStr: h.date,
            open: h.open,
            high: h.high,
            low: h.low,
            close: h.close,
            volume: h.volume,
        } as Candle));
    };

    const {
        data: benchMarkBars,
        error: benchMarkBarsError,
        isLoading: benchmarkBarsIsLoading,
    } = useQuery({
        queryKey: [benchmarkBarsKey, ticker],
        queryFn: getBenchmarkBars,
        refetchOnWindowFocus: false,
        refetchInterval: 120000,
        staleTime: 120000,
    });

    const scatterData = useMemo(() => {
        if (!benchMarkBars || !candles) return [];

        // Create maps for easy date lookup
        const candleMap = new Map<string, Candle>();
        const benchmarkMap = new Map<string, Candle>();

        candles.forEach(candle => {
            if (candle.dateStr) candleMap.set(candle.dateStr, candle);
        });

        benchMarkBars.forEach(bar => {
            if (bar.dateStr) benchmarkMap.set(bar.dateStr, bar);
        });

        // Get matching dates
        const commonDates = [...candleMap.keys()].filter(date => benchmarkMap.has(date)).sort();

        // Calculate returns
        const points: ScatterPoint[] = [];
        for (let i = 1; i < commonDates.length; i++) {
            const currentDate = commonDates[i];
            const previousDate = commonDates[i - 1];

            const currentTickerCandle = candleMap.get(currentDate);
            const previousTickerCandle = candleMap.get(previousDate);
            const currentBenchmarkCandle = benchmarkMap.get(currentDate);
            const previousBenchmarkCandle = benchmarkMap.get(previousDate);

            if (!currentTickerCandle || !previousTickerCandle ||
                !currentBenchmarkCandle || !previousBenchmarkCandle) continue;

            const tickerReturn = ((currentTickerCandle.close - previousTickerCandle.close) / previousTickerCandle.close) * 100;
            const benchmarkReturn = ((currentBenchmarkCandle.close - previousBenchmarkCandle.close) / previousBenchmarkCandle.close) * 100;

            points.push({
                x: benchmarkReturn,
                y: tickerReturn,
                name: currentDate,
                category: ticker,
                value: tickerReturn,
                benchmarkValue: benchmarkReturn,
            });
        }

        return points;
    }, [candles, benchMarkBars, ticker]);

    const { beta, correlation, regressionLine } = useMemo(() => {
        if (!scatterData.length) return { beta: 0, correlation: 0, regressionLine: null };

        const n = scatterData.length;
        const x = scatterData.map(d => d.x);
        const y = scatterData.map(d => d.y);

        const xMean = x.reduce((a, b) => a + b, 0) / n;
        const yMean = y.reduce((a, b) => a + b, 0) / n;

        // Calculate covariance
        const covariance = x.reduce((sum, xi, i) =>
            sum + (xi - xMean) * (y[i] - yMean), 0) / n;

        // Calculate variances
        const varianceX = x.reduce((sum, xi) =>
            sum + Math.pow(xi - xMean, 2), 0) / n;
        const varianceY = y.reduce((sum, yi) =>
            sum + Math.pow(yi - yMean, 2), 0) / n;

        // Calculate beta and correlation
        const beta = parseFloat((covariance / varianceX).toFixed(2));
        const correlation = parseFloat((covariance / (Math.sqrt(varianceX) * Math.sqrt(varianceY))).toFixed(2));

        // Calculate regression line
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
        const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        const xMin = Math.min(...x);
        const xMax = Math.max(...x);
        const lineData = [
            { x: xMin, y: slope * xMin + intercept },
            { x: xMax, y: slope * xMax + intercept },
        ];

        return { beta, correlation, regressionLine: lineData };
    }, [scatterData]);

    if (benchmarkBarsIsLoading) {
        return <div className="p-4">Loading...</div>;
    }

    if (benchMarkBarsError) {
        return <div className="p-4">Error loading data</div>;
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Returns Analysis: {ticker} vs Benchmark</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-4 gap-4">
                <div className="overflow-auto max-h-[30rem] col-span-1">
                    <Table className="tabular-nums">
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Return (%)</TableHead>
                                <TableHead className="text-right">Benchmark (%)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[...scatterData].reverse().map((row) => (
                                <TableRow key={row.name}>
                                    <TableCell>{row.name}</TableCell>
                                    <TableCell className="text-right">{row.value.toFixed(2)}</TableCell>
                                    <TableCell className="text-right">{row.benchmarkValue.toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                <div className="h-[30rem] col-span-3">
                    <div className="text-lg font-semibold ml-4 flex gap-4">
                        <span>Beta: {beta}</span>
                        <span>Correlation: {correlation}</span>
                    </div>
                    <ChartContainer config={chartConfig} className="h-[30rem] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart
                                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                            >
                                <CartesianGrid />
                                <XAxis
                                    type="number"
                                    dataKey="x"
                                    name="Benchmark Return"
                                    unit="%"
                                />
                                <YAxis
                                    type="number"
                                    dataKey="y"
                                    name="Ticker Return"
                                    unit="%"
                                />
                                <Tooltip
                                    content={({ active, payload }) => {
                                        if (!active || !payload?.length) return null;

                                        const data = payload[0].payload;

                                        return (
                                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                <div className="grid gap-2">
                                                    {data.name && (
                                                        <div className="flex flex-col">
                                                            <span className="text-muted-foreground">Date</span>
                                                            <span className="font-medium">{data.name}</span>
                                                        </div>
                                                    )}
                                                    {data.category && (
                                                        <div className="flex flex-col">
                                                            <span className="text-muted-foreground">{data.category}</span>
                                                            <span className="font-medium">{data.value?.toFixed(2)}%</span>
                                                        </div>
                                                    )}
                                                    {typeof data.benchmarkValue === 'number' && (
                                                        <div className="flex flex-col">
                                                            <span className="text-muted-foreground">Benchmark</span>
                                                            <span className="font-medium">{data.benchmarkValue.toFixed(2)}%</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    }}
                                    cursor={{ strokeDasharray: "3 3" }}
                                />
                                <Scatter
                                    name="return"
                                    data={scatterData}
                                    fill={chartConfig.return.color}
                                    opacity={0.8}
                                />
                                {regressionLine && (
                                    <Line
                                        type="linear"
                                        dataKey="y"
                                        data={regressionLine}
                                        stroke={solarizedYellow}
                                        dot={false}
                                    />
                                )}
                                <ReferenceLine y={0} stroke="gray" strokeDasharray="3 3" />
                                <Legend
                                    formatter={(value) => {
                                        if (value === "return") return "Daily Returns";
                                        if (value === "y") return "Regression Line";
                                        return value;
                                    }}
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </div>
            </CardContent>
        </Card>
    );
};

export default Beta;