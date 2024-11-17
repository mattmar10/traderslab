"use client"
import { Candle } from "@/lib/types/basic-types"
import { createChart, ColorType, IChartApi, ISeriesApi, CandlestickData, CrosshairMode, LineData, Time, MouseEventParams } from 'lightweight-charts'
import { useEffect, useRef, useState } from 'react'
import { ChartSettings } from "@/components/settings/chart-settings"
import { calculateEMA, calculateSMA, isMovingAverageError, MovingAverageLine } from "@/lib/utils/moving-average"
import { CustomizableChartMALine } from "@/components/customizable-price-chart"
import AVWAPMenu from "@/components/avwap-menu"

interface StoredAVWAPData {
    [ticker: string]: string[]; // Store array of start dates as strings
}

export interface MovingAverageLineWithColor extends MovingAverageLine {
    color: string;
    type: "SMA" | "EMA"
}

export interface PriceChartProps {
    ticker: string
    dailyCandles: Candle[]
    earningsDates: string[]
    theme: string,
    chartSettings: ChartSettings
}

const PriceChart: React.FC<PriceChartProps> = ({ ticker, dailyCandles, earningsDates, theme, chartSettings }) => {


    const chartContainerRef = useRef<HTMLDivElement>(null)
    const chartRef = useRef<IChartApi | null>(null)
    const [, setPriceSeries] =
        useState<ISeriesApi<"Candlestick" | "Bar">>();
    const [, setVolumeMASeries] =
        useState<ISeriesApi<"Line"> | null>(null);
    const getChartHeight = () => {
        if (typeof window === 'undefined') return 400;
        return Math.max(400, window.innerHeight * 0.65); // 65% of viewport height, minimum 400px
    }
    const [avwapSeries, setAvwapSeries] = useState<any[]>([]);
    const [isDrawingMode, setIsDrawingMode] = useState(false);
    const isDrawingModeRef = useRef(isDrawingMode); // Ref to track the current value of isDrawingMode

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

    const handleAddAvwap = () => {
        setIsDrawingMode(true);
    };

    const toggleDrawingMode = () => {
        setIsDrawingMode(!isDrawingMode);
    };

    const handleClearAvwaps = (): void => {
        avwapSeries.forEach((series) => {
            chartRef.current?.removeSeries(series);
        });

        setAvwapSeries([]);
        setIsDrawingMode(false);

        const storedData: StoredAVWAPData = JSON.parse(
            localStorage.getItem("avwapDataByTicker") || "{}"
        );

        if (storedData[ticker]) {
            delete storedData[ticker]; // Remove the AVWAP data for this ticker
            localStorage.setItem("avwapDataByTicker", JSON.stringify(storedData)); // Save back to localStorage
        }
    };

    const saveAvwapStartDateToLocalStorage = (
        ticker: string,
        avwapStartDate: string
    ): void => {
        const storedData: StoredAVWAPData = JSON.parse(
            localStorage.getItem("avwapDataByTicker") || "{}"
        );

        if (!storedData[ticker]) {
            storedData[ticker] = [];
        }

        storedData[ticker].push(avwapStartDate); // Store the date, not the AVWAP data
        localStorage.setItem("avwapDataByTicker", JSON.stringify(storedData));
    };

    const loadAvwapStartDatesFromLocalStorage = (ticker: string): string[] => {
        const storedData: StoredAVWAPData = JSON.parse(
            localStorage.getItem("avwapDataByTicker") || "{}"
        );
        return storedData[ticker] || [];
    };

    const calculateAVWAP = (startIndex: number): LineData<Time>[] => {
        let cumulativeVolume = 0;
        let cumulativeVolumePrice = 0;
        const avwapData: LineData[] = [];

        for (let i = startIndex; i < dailyCandles.length; i++) {
            const candle = dailyCandles[i];
            const volume = candle.volume;

            const typicalPrice =
                (candle.high + candle.low + candle.close + candle.open) / 4;

            cumulativeVolume += volume;
            cumulativeVolumePrice += typicalPrice * volume;

            const avwap = Number(
                (cumulativeVolumePrice / cumulativeVolume).toFixed(3)
            );
            avwapData.push({ time: candle.dateStr!, value: avwap });
        }

        return avwapData;
    };

    useEffect(() => {
        isDrawingModeRef.current = isDrawingMode;
    }, [isDrawingMode]);

    const handleChartClick = (param: MouseEventParams<Time>) => {
        const currentIsDrawingMode = isDrawingModeRef.current;

        if (currentIsDrawingMode && param.time) {
            const clickedDateStr = param.time.toString();
            const startIndex = dailyCandles.findIndex(
                (candle) => candle.dateStr === clickedDateStr
            );

            if (startIndex !== -1) {
                const avwapData = calculateAVWAP(startIndex);

                const newAvwapSeries = chartRef.current?.addLineSeries({
                    color: chartSettings.avwapSettings?.color || "#6c71c4",
                    lineWidth: 2,
                    priceLineVisible: false,
                    crosshairMarkerVisible: false,
                    title: chartSettings.avwapSettings?.showLegend
                        ? `AVWAP ${avwapData[0].time.toString()}`
                        : "",
                });

                newAvwapSeries?.setData(avwapData);

                setAvwapSeries((prevSeries) => [
                    ...prevSeries,
                    newAvwapSeries, // Save the AVWAP series
                ]);

                // Save the start date for recalculating later
                saveAvwapStartDateToLocalStorage(ticker, clickedDateStr);

                setIsDrawingMode(false);
            }
        } else {
            console.log("Drawing mode is off or no date selected.");
        }
    };

    useEffect(() => {
        if (!chartContainerRef.current) return

        const chart = createChart(chartContainerRef.current, chartOptions)
        chartRef.current = chart;

        chart.subscribeClick((param) => {
            handleChartClick(param);
        });

        const avwapStartDates = loadAvwapStartDatesFromLocalStorage(ticker);

        avwapStartDates.forEach((startDate) => {
            const startIndex = dailyCandles.findIndex(
                (candle) => candle.dateStr === startDate
            );
            if (startIndex !== -1) {
                const avwapData = calculateAVWAP(startIndex);

                const newAvwapSeries = chart.addLineSeries({
                    color: chartSettings.avwapSettings?.color || "#6c71c4",
                    lineWidth: 2,
                    priceLineVisible: false,
                    crosshairMarkerVisible: false,
                    title: chartSettings.avwapSettings?.showLegend
                        ? `AVWAP ${startDate}`
                        : "",
                });

                newAvwapSeries.setData(avwapData);
                setAvwapSeries((prevSeries) => [...prevSeries, newAvwapSeries]);
            }
        });

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

        const priceMovingAverages: MovingAverageLineWithColor[] =
            chartSettings.priceMovingAverages
                .map((ma) => {
                    const timeseries =
                        ma.type === "SMA"
                            ? calculateSMA(dailyCandles, ma.period)
                            : calculateEMA(dailyCandles, ma.period);

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


        const formattedData: CandlestickData[] = dailyCandles.map(candle => ({
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
        const volumeData = dailyCandles.map((c) => ({
            time: c.dateStr!,
            value: c.volume,
            color: "rgba(136,136,136, .4)"
            // color: earningsDates.includes(c.dateStr!)
            //   ? "rgba(38, 139, 210, 0.6)"
            //    : "rgba(136,136,136, .4)",
        }));
        newVolumeSeries.setData(volumeData);

        const markers: any[] = [];

        earningsDates.forEach(e => {
            markers.push({
                time: e,
                position: "aboveBar",
                color: "#b58900",
                text: "E"
            });
        })
        newVolumeSeries.setMarkers(markers);

        let volumeMovingAverage: CustomizableChartMALine | undefined;
        if (chartSettings.volumeMA.enabled) {
            const volumeMA =
                chartSettings.volumeMA.type === "SMA"
                    ? calculateSMA(
                        dailyCandles,
                        chartSettings.volumeMA.period,
                        (c) => c.volume
                    )
                    : calculateEMA(
                        dailyCandles,
                        chartSettings.volumeMA.period,
                        (c) => c.volume
                    );

            if (!isMovingAverageError(volumeMA)) {
                volumeMovingAverage = {
                    period: chartSettings.volumeMA.period,
                    type: chartSettings.volumeMA.type,
                    color: chartSettings.volumeMA.color,
                    timeseries: volumeMA.timeseries
                };


                const volumeMASeries = chartRef.current.addLineSeries({
                    lineWidth: 1,
                    title: chartSettings.showVolumeMovingAvgLegends
                        ? `Volume ${volumeMovingAverage.period} ${volumeMovingAverage.type}`
                        : "",
                    color: "#d33682",
                    priceLineVisible: false,
                    priceScaleId: "volume",
                    crosshairMarkerVisible: false,
                });

                volumeMASeries.setData(volumeMovingAverage.timeseries);
                setVolumeMASeries(volumeMASeries);
            }
        }


        const waterMarkColor =
            theme === "light"
                ? "rgba(128, 128, 128, 0.1)"
                : "rgba(128, 128, 128, 0.25)";

        chartRef.current.applyOptions({
            watermark: {
                visible: true,
                fontSize: 100,
                horzAlign: "center",
                vertAlign: "center",
                color: waterMarkColor,
                text: ticker,
            },
        })

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
        <div className="relative w-full p-4 border rounded-lg ">

            <div
                ref={chartContainerRef}
                className="w-full"
                style={{ height: `${getChartHeight()}px` }}
            />
            <AVWAPMenu
                isDrawingMode={isDrawingMode}
                setDrawingMode={toggleDrawingMode}
                handleAddAvwap={handleAddAvwap}
                handleClearAvwaps={handleClearAvwaps}
            />
        </div>
    )
}

export default PriceChart