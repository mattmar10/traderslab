"use client"
import { Candle } from "@/lib/types/basic-types"
import { createChart, ColorType, IChartApi, ISeriesApi, CandlestickData, CrosshairMode } from 'lightweight-charts'
import { useEffect, useRef, useState } from 'react'
import { Card } from "@/components/ui/card"
import { ChartSettings } from "@/components/settings/chart-settings"
import { calculateEMA, calculateSMA, isMovingAverageError, MovingAverageLine } from "@/lib/utils/moving-average"


export interface MovingAverageLineWithColor extends MovingAverageLine {
    color: string;
    type: "SMA" | "EMA"
}

export interface PriceChartProps {
    ticker: string
    dailyCandles: Candle[]
    theme: string,
    chartSettings: ChartSettings
}

const PriceChart: React.FC<PriceChartProps> = ({ ticker, dailyCandles, theme, chartSettings }) => {




    const chartContainerRef = useRef<HTMLDivElement>(null)
    const chartRef = useRef<IChartApi | null>(null)
    const [, setPriceSeries] =
        useState<ISeriesApi<"Candlestick" | "Bar">>();
    const getChartHeight = () => {
        if (typeof window === 'undefined') return 400;
        return Math.max(400, window.innerHeight * 0.65); // 65% of viewport height, minimum 400px
    }
    const [, setVolumeSeries] =
        useState<ISeriesApi<"Histogram"> | null>(null);

    const [maSeriesMap, setMaSeriesMap] = useState<
        Map<number, ISeriesApi<"Line">>
    >(new Map());

    const bgColor = theme === "light" ? "white" : "black";
    const gridColor = theme === "light" ? "#F0F0F0" : "rgba(136,136,136, .2)";

    const chartOptions = {
        layout: {
            textColor: theme === "light" ? "black" : "white",
            background: { type: ColorType.Solid, color: bgColor },
        },
        rightPriceScale: {
            borderColor: "gray",
        },
        timeScale: {
            borderColor: "gray",
            rightOffset: 10,
        },
        grid: {
            vertLines: { color: gridColor },
            horzLines: { color: gridColor },
        },
        autoSize: true,
        crosshair: {
            mode: CrosshairMode.Normal,
        },
    };

    useEffect(() => {
        if (!chartContainerRef.current) return

        const chart = createChart(chartContainerRef.current, chartOptions)
        chartRef.current = chart;

        const newPriceSeries =
            chartSettings.seriesType === "candlestick"
                ? chart.addCandlestickSeries({
                    upColor: chartSettings.upColor,
                    downColor: chartSettings.downColor,
                    wickUpColor: chartSettings.wickUpColor,
                    wickDownColor: chartSettings.wickDownColor,
                    borderUpColor: chartSettings.upBorderColor,
                    borderDownColor: chartSettings.downBorderColor,
                    borderVisible: true,
                    lastValueVisible: false,
                    priceLineVisible: false,
                    priceLineStyle: 2,
                    priceLineColor: "purple",
                })
                : chart.addBarSeries({
                    upColor: chartSettings.upColor,
                    downColor: chartSettings.downColor,
                    thinBars: chartSettings.useThinBars,
                    lastValueVisible: false,
                    priceLineVisible: false,
                    priceLineStyle: 2,
                    priceLineColor: "purple",
                });
        setPriceSeries(newPriceSeries);



        const sortedCandles = [...dailyCandles].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())


        const priceMovingAverages: MovingAverageLineWithColor[] =
            chartSettings.priceMovingAverages
                .map((ma) => {
                    const timeseries =
                        ma.type === "SMA"
                            ? calculateSMA(sortedCandles, ma.period)
                            : calculateEMA(sortedCandles, ma.period);

                    if (isMovingAverageError(timeseries)) {
                        console.error(`Error calculating ${ma.type} ${ma.period}`);
                        return null;
                    }

                    return {
                        period: ma.period,
                        type: ma.type,
                        color: ma.color,
                        timeseries: timeseries.timeseries
                    };
                }).filter((ma): ma is MovingAverageLineWithColor => ma !== null); // Filter out null values


        priceMovingAverages.forEach((ma) => {
            let series = maSeriesMap.get(ma.period);
            if (!series) {
                series = chartRef.current!.addLineSeries({
                    lineWidth: 1,
                    priceLineVisible: false,
                    crosshairMarkerVisible: false,
                });
                maSeriesMap.set(ma.period, series);
            }
            series.applyOptions({
                color: ma.color,
                title: chartSettings.showPriceMovingAvgLegends
                    ? `${ma.period} ${ma.type}`
                    : "",
            });
            series.setData(ma.timeseries);
        });



        setMaSeriesMap(new Map(maSeriesMap));


        const formattedData: CandlestickData[] = sortedCandles.map(candle => ({
            time: candle.dateStr as string,
            open: candle.open,
            high: candle.high,
            low: candle.low,
            close: candle.close
        }))

        newPriceSeries.setData(formattedData)

        const newVolumeSeries = chartRef.current.addHistogramSeries({
            priceFormat: { type: "volume" },
            priceScaleId: "volume",
        });
        setVolumeSeries(newVolumeSeries);
        const volumeData = sortedCandles.map((c) => ({
            time: c.dateStr!,
            value: c.volume,
            color: "rgba(136,136,136, .4)"
            // color: earningsDates.includes(c.dateStr!)
            //   ? "rgba(38, 139, 210, 0.6)"
            //    : "rgba(136,136,136, .4)",
        }));
        newVolumeSeries.setData(volumeData);

        newVolumeSeries.priceScale().applyOptions({
            scaleMargins: {
                top: 0.7,
                bottom: 0,
            },
        });

        newPriceSeries.priceScale().applyOptions({
            scaleMargins: {
                top: 0.15,
                bottom: 0.1,
            },
        });

        chartRef.current = chart

        chartRef.current.timeScale().setVisibleLogicalRange({
            from: formattedData.length - 252,
            to: formattedData.length + 10,
        });
        // Cleanup
        return () => {
            chart.remove()
        }
    }, [dailyCandles])

    // Handle resize
    useEffect(() => {
        const handleResize = () => {
            if (chartContainerRef.current && chartRef.current) {
                chartRef.current.applyOptions({
                    width: chartContainerRef.current.clientWidth,
                    height: getChartHeight()
                })
            }
        }

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    return (
        <Card className="w-full p-4 ">
            <div className="mb-4">
                <h2 className="text-xl font-bold text-foreground/70">{ticker}</h2>
            </div>
            <div
                ref={chartContainerRef}
                className="w-full"
                style={{ height: `${getChartHeight()}px` }}
            />
        </Card>
    )
}

export default PriceChart