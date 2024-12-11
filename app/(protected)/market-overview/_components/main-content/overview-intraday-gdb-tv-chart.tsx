import React, { useEffect, useRef } from "react";
import {
    createChart,
    IChartApi,
    LineData,
    Time,
    ColorType,
    CrosshairMode,
    TickMarkType,
    LineStyle,
    LineWidth,
} from "lightweight-charts";
import { useTheme } from "next-themes";
import moment from "moment-timezone";

export interface IntradayGDBChartPoint {
    timestamp: number;
    value: number;
}

export interface IntradayGDBChartSeries {
    title: string;
    dataSeries: IntradayGDBChartPoint[];
    color?: string;
    lineThickness: 1 | 2 | 3 | 4;
}

export interface IntradayGDBChartProps {
    series: IntradayGDBChartSeries[];
}

const IntradayGDBTVChart: React.FC<IntradayGDBChartProps> = ({ series }) => {
    const chartContainerRef = useRef<HTMLDivElement | null>(null);
    const chartInstanceRef = useRef<IChartApi | null>(null);
    const { theme } = useTheme();
    const bgColor = theme === "light" ? "white" : "black";
    const gridColor = theme === "light" ? "#F0F0F0" : "#333";
    const timezone = moment.tz.guess();

    useEffect(() => {
        const formatTime = (time: Time) => {
            return moment
                .tz((time as number) * 1000, timezone)
                .format("MM/DD HH:mm:ss");
        };

        const chartOptions = {
            layout: {
                textColor: theme === "light" ? "black" : "white",
                background: { type: ColorType.Solid, color: bgColor },
            },
            rightPriceScale: {
                borderColor: "gray",
                minValue: -100,
                maxValue: 100,
                scaleMargins: {
                    top: 0.1,
                    bottom: 0.1,
                },
            },
            timeScale: {
                borderColor: "gray",
                rightOffset: 13,
                timeVisible: true,
                secondsVisible: true,
                tickMarkFormatter: (time: Time, tickMarkType: TickMarkType) => {
                    const date = moment.tz((time as number) * 1000, timezone);
                    if (
                        tickMarkType === TickMarkType.Time ||
                        tickMarkType === TickMarkType.TimeWithSeconds
                    ) {
                        return date.format("HH:mm"); // Format time
                    }
                    return date.format("MM/DD"); // Format date
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

        const lineChart = createChart(chartContainerRef.current!, chartOptions);
        chartInstanceRef.current = lineChart;

        series.forEach(({ title, dataSeries, color, lineThickness }) => {
            const lineSeries = lineChart.addLineSeries({
                title,
                color: color || "blue",
                lineWidth: lineThickness as LineWidth,
                priceLineVisible: false,
                crosshairMarkerVisible: false,
            });

            lineSeries.createPriceLine({
                price: 0,
                color: "red",
                lineWidth: 1,
                lineStyle: LineStyle.Solid,
                axisLabelVisible: false,
                title: "0",
            });

            const formattedData: LineData[] = dataSeries.map((point) => ({
                time: (point.timestamp / 1000) as Time,
                value: point.value,
            }));

            lineSeries.setData(formattedData);
        });

        chartInstanceRef.current.timeScale().fitContent();

        // Crosshair move to customize tooltip
        chartInstanceRef.current.subscribeCrosshairMove((param) => {
            if (param.time) {
                const tooltipTime = moment.tz((param.time as number) * 1000, timezone);
                console.log(
                    `Crosshair time in ${timezone}: ${tooltipTime.format("HH:mm:ss")}`
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

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            lineChart.remove();
        };
    }, [series, theme]);

    return <div ref={chartContainerRef} className="h-full w-full pb-8" />;
};

export default IntradayGDBTVChart;