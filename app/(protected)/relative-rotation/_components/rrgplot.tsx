import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine, Cell, LabelList, Tooltip, Label } from "recharts";
import { useMemo, useState } from "react";
import TimelineControls from "./timer-controls";

interface RRGPoint {
    rsRatio: number;
    rsMomentum: number;
    date?: number;
    dateStr?: string;
}

interface RRGTrail {
    symbol: string;
    color: string;
    trail: RRGPoint[];
}

interface RRGScatterChartProps {
    data: RRGTrail[];
    windowSize?: number;
    onPointClick?: (point: { symbol: string; rsRatio: number; rsMomentum: number }) => void;
}

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-background border rounded-lg shadow-lg p-3">
                <p className="font-medium" style={{ color: data.color }}>
                    {data.symbol}
                </p>
                <p className="text-sm text-muted-foreground">
                    RS-Ratio: {data.rsRatio.toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">
                    RS-Momentum: {data.rsMomentum.toFixed(2)}
                </p>
                {data.dateStr && (
                    <p className="text-sm text-muted-foreground">
                        Date: {data.dateStr}
                    </p>
                )}
            </div>
        );
    }
    return null;
};

const RRGScatterChart: React.FC<RRGScatterChartProps> = ({
    data,
    windowSize = 10,
    onPointClick
}) => {
    const maxIndex = Math.max(...data.map(d => d.trail.length)) - windowSize;
    const [currentIndex, setCurrentIndex] = useState(maxIndex);

    const roundTo5 = (num: number) => Math.round(num / 5) * 5;
    const getSymmetricRange = (values: number[]) => {
        const min = Math.min(...values);
        const max = Math.max(...values);
        const distanceBelow = 100 - min;
        const distanceAbove = max - 100;
        const maxDistance = roundTo5(Math.ceil(Math.max(distanceBelow, distanceAbove) * 1.1));
        const roundedMin = 100 - maxDistance;
        const roundedMax = 100 + maxDistance;

        return {
            min: roundedMin,
            max: roundedMax,
            ticks: Array.from(
                { length: (roundedMax - roundedMin) / 5 + 1 },
                (_, i) => roundedMin + i * 5
            )
        };
    };

    const getGlobalRange = (data: RRGTrail[]) => {
        const allRsRatios = data.flatMap((trail) => trail.trail.map((point) => point.rsRatio));
        const allRsMomentums = data.flatMap((trail) => trail.trail.map((point) => point.rsMomentum));

        const xRange = getSymmetricRange(allRsRatios);
        const yRange = getSymmetricRange(allRsMomentums);

        return { xRange, yRange };
    };

    const { xRange, yRange } = useMemo(() => getGlobalRange(data), [data]);

    const visibleData = data.map(trail => ({
        ...trail,
        trail: trail.trail
            .slice(currentIndex, currentIndex + windowSize)
            .map((point, idx) => ({
                ...point,
                symbol: trail.symbol,
                color: trail.color,
                opacity: 1 - ((windowSize - idx - 1) * 0.8 / windowSize)
            }))
    }));

    const getCurrentDate = (data: RRGTrail[], index: number) => {
        const firstTrail = data.find(trail =>
            trail.trail[index] && trail.trail[index].dateStr
        );
        return firstTrail?.trail[index]?.dateStr || '';
    };

    return (
        <div className="space-y-4">
            <div className="h-[39vh]">
                <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart
                        margin={{
                            top: 20,
                            right: 20,
                            bottom: 20,
                            left: 0,
                        }}
                    >
                        <CartesianGrid stroke="#e0e0e0" strokeDasharray="3 3" />

                        {/* Quadrant Dividers */}
                        <ReferenceLine x={100} stroke="#999" strokeWidth={1.5} />
                        <ReferenceLine y={100} stroke="#999" strokeWidth={1.5} />

                        {/* Quadrant Labels */}
                        <ReferenceLine x={xRange.max} y={yRange.max} stroke="none">
                            <Label
                                value="Leading"
                                position="insideTopRight"
                                offset={15}
                                fill="#82ca9d"
                                fontSize={14}
                                fontWeight="bold"
                            />
                        </ReferenceLine>
                        <ReferenceLine x={xRange.min} y={yRange.max} stroke="none">
                            <Label
                                value="Improving"
                                position="insideTopLeft"
                                offset={15}
                                fill="#8884d8"
                                fontSize={14}
                                fontWeight="bold"
                            />
                        </ReferenceLine>
                        <ReferenceLine x={xRange.max} y={yRange.min} stroke="none">
                            <Label
                                value="Weakening"
                                position="insideBottomRight"
                                offset={15}
                                fill="#ff7300"
                                fontSize={14}
                                fontWeight="bold"
                            />
                        </ReferenceLine>
                        <ReferenceLine x={xRange.min} y={yRange.min} stroke="none">
                            <Label
                                value="Lagging"
                                position="insideBottomLeft"
                                offset={15}
                                fill="#d62728"
                                fontSize={14}
                                fontWeight="bold"
                            />
                        </ReferenceLine>
                        <XAxis
                            type="number"
                            dataKey="rsRatio"
                            domain={[xRange.min, xRange.max]}
                            ticks={xRange.ticks}
                            stroke="#555"
                            fontSize={12}
                        />
                        <YAxis
                            type="number"
                            dataKey="rsMomentum"
                            domain={[yRange.min, yRange.max]}
                            ticks={yRange.ticks}
                            stroke="#555"
                            fontSize={12}
                        />
                        <Tooltip content={<CustomTooltip />} />

                        {visibleData.map((trail) => (
                            <Scatter
                                key={trail.symbol}
                                name={trail.symbol}
                                data={trail.trail}
                                fill={trail.color}
                                line={{
                                    stroke: trail.color,
                                    strokeWidth: 2,
                                    strokeOpacity: 0.4
                                }}
                                onClick={(point) => {
                                    if (onPointClick) {
                                        onPointClick({
                                            symbol: trail.symbol,
                                            rsRatio: point.rsRatio,
                                            rsMomentum: point.rsMomentum
                                        });
                                    }
                                }}
                            >
                                {trail.trail.map((point, index) => (
                                    <Cell
                                        key={`cell-${trail.symbol}-${index}`}
                                        fill={trail.color}
                                        fillOpacity={index === trail.trail.length - 1 ? 1 : (point.opacity * 0.5)}
                                        strokeOpacity={point.opacity}
                                    />
                                ))}
                                <LabelList
                                    dataKey="rsRatio"
                                    content={({ x, y, index }) => {
                                        if (index === trail.trail.length - 1) {
                                            return (
                                                <text
                                                    x={x}
                                                    y={y}
                                                    dy={-10}
                                                    dx={10}
                                                    fontSize={12}
                                                    fill={trail.color}
                                                >
                                                    {trail.symbol}
                                                </text>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                            </Scatter>
                        ))}
                    </ScatterChart>
                </ResponsiveContainer>
            </div>
            <div className="px-4">
                <TimelineControls
                    currentIndex={currentIndex}
                    maxIndex={maxIndex}
                    onIndexChange={setCurrentIndex}
                    startDate={data[0]?.trail[0]?.dateStr || ''}
                    endDate={data[0]?.trail[data[0]?.trail.length - 1]?.dateStr || ''}
                    currentDate={getCurrentDate(data, currentIndex)}
                />
            </div>

        </div>
    );
};

export default RRGScatterChart;