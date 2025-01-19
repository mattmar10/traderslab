import { memo, useMemo } from 'react';
import RRGScatterChart from './rrgplot';
import { SecurityRRG } from './relative-rotation-graph';

interface MemoizedRRGChartProps {
    securities: SecurityRRG[];
}

const MemoizedRRGChart = memo(({ securities }: MemoizedRRGChartProps) => {
    const chartData = useMemo(() =>
        securities.map((security) => ({
            symbol: security.ticker,
            color: security.color ?? "#000000",
            trail: security.trail?.map((point) => ({
                rsRatio: point.rsRatio,
                rsMomentum: point.rsMomentum,
                date: point.date,
                dateStr: point.dateStr,
            })).sort((a, b) => a.date - b.date) ?? [],
        }))
        , [securities]);

    const onPointClick = (point: { symbol: string; rsRatio: number; rsMomentum: number }) => {
        console.log(point);
    };

    return (
        <RRGScatterChart data={chartData} onPointClick={onPointClick} />
    );
});

export default MemoizedRRGChart;

MemoizedRRGChart.displayName = "RRGChart";