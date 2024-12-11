import React, { useRef, useEffect } from 'react';
import { createChart, ColorType, IChartApi, Time, LineData, CrosshairMode, TickMarkType, LineStyle } from 'lightweight-charts';
import moment from 'moment-timezone';
import { useTheme } from 'next-themes';

type MarketConfig = {
    ticker: string;
    name: string;
    color: string;
};

interface ChartDataPoint {
    time: string;
    [key: string]: number | string;
}

interface MarketChartProps {
    data: ChartDataPoint[];
    marketConfigs: MarketConfig[];
}

const OverviewReturnsChart: React.FC<MarketChartProps> = ({ data, marketConfigs }) => {
    const chartContainerRef = useRef<HTMLDivElement | null>(null);
    const chartInstanceRef = useRef<IChartApi | null>(null);
    const { theme } = useTheme();
    const bgColor = theme === 'light' ? 'white' : 'black';
    const gridColor = theme === 'light' ? '#F0F0F0' : '#333';
    const timezone = moment.tz.guess();

    useEffect(() => {
        const formatTime = (time: Time) => {
            return moment
                .tz((time as number) * 1000, timezone)
                .format("MM/DD HH:mm");
        };

        const chartOptions = {
            layout: {
                textColor: theme === 'light' ? 'black' : 'white',
                background: { type: ColorType.Solid, color: bgColor },
            },
            rightPriceScale: {
                borderColor: 'gray',
                scaleMargins: {
                    top: 0.1,
                    bottom: 0.1,
                },
            },
            timeScale: {
                borderColor: 'gray',
                rightOffset: 35,
                timeVisible: true,
                tickMarkFormatter: (time: Time, tickMarkType: TickMarkType) => {
                    const date = moment.tz((time as number) * 1000, timezone);
                    if (tickMarkType === TickMarkType.Time) {
                        return date.format('HH:mm');
                    }
                    return date.format('MM/DD');
                },
            },

            grid: {
                vertLines: { color: gridColor },
                horzLines: { color: gridColor },
            },
            autoSize: true,
            crosshair: {
                mode: CrosshairMode.Normal,
            },
            localization: {
                timeFormatter: formatTime,
            },
        };

        if (!chartContainerRef.current) return;

        const lineChart = createChart(chartContainerRef.current, chartOptions);
        chartInstanceRef.current = lineChart;

        // Create a line series for each market
        marketConfigs.forEach(({ ticker, name, color }) => {
            const lineSeries = lineChart.addLineSeries({
                title: name,
                color: color,
                lineWidth: 2,
                priceLineVisible: false,
                crosshairMarkerVisible: true,
            });

            // Format data for this market
            const marketData: LineData[] = data.map((point) => ({
                // Convert the time string to Unix timestamp in seconds
                time: Math.floor(new Date(point.time).getTime() / 1000) as Time,
                value: point[name] as number,
            }));

            lineSeries.setData(marketData);

            if (ticker === 'RSP') {
                lineSeries.createPriceLine({
                    price: 0,
                    color: "red",
                    lineWidth: 1,
                    lineStyle: LineStyle.Solid,
                    axisLabelVisible: false,
                    title: "0",
                });

            }
        });

        chartInstanceRef.current.timeScale().fitContent();

        // Add crosshair move handler for tooltips
        chartInstanceRef.current.subscribeCrosshairMove((param) => {
            if (param.time) {
                const tooltipTime = moment.tz((param.time as number) * 1000, timezone);
                console.log(
                    `Crosshair time in ${timezone}: ${tooltipTime.format('HH:mm')}`
                );
            }
        });

        const handleResize = () => {
            if (chartContainerRef.current) {
                lineChart.applyOptions({
                    width: chartContainerRef.current.clientWidth,
                });
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            lineChart.remove();
        };
    }, [data, marketConfigs, theme]);

    return <div ref={chartContainerRef} className="h-full w-full pb-8 " />;
};

export default OverviewReturnsChart;