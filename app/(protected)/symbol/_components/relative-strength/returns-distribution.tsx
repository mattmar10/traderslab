import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { Candle } from "@/lib/types/basic-types";
import {
  solarizedBase01,
  solarizedBlue,
  solarizedMagenta,
  solarizedYellow,
} from "@/lib/utils/color-utils";

export interface ReturnDistributionProps {
  ticker: string;
  candles: Candle[];
}

const ReturnDistribution: React.FC<ReturnDistributionProps> = ({
  ticker,
  candles,
}) => {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const filteredCandles = candles.filter((c) => c.date >= oneYearAgo.getTime());

  const calculateReturns = (candles: Candle[]) => {
    if (candles.length < 2) return [];
    return candles
      .slice(1)
      .map(
        (candle, index) =>
          (candle.close - candles[index].close) / candles[index].close
      );
  };

  const calculateStats = (returns: number[]) => {
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance =
      returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    return { mean, stdDev };
  };

  const createHistogramBins = (
    returns: number[],
    range: { min: number; max: number },
    binSize: number
  ) => {
    const bins: { return: number; frequency: number }[] = [];
    for (let bin = range.min; bin <= range.max; bin += binSize) {
      const count = returns.filter((r) => r >= bin && r < bin + binSize).length;
      bins.push({
        return: bin * 100,
        frequency: (count / returns.length) * 100,
      });
    }
    return bins;
  };

  const calculateAdditionalStats = (returns: number[]) => {
    const sortedReturns = returns.map((r) => r * 100).sort((a, b) => a - b);
    const n = sortedReturns.length;

    // Skewness
    const skewness =
      returns.reduce((acc, r) => {
        const normalizedReturn =
          (r * 100 - stats.mean * 100) / (stats.stdDev * 100);
        return acc + Math.pow(normalizedReturn, 3);
      }, 0) /
      (n - 1);

    // Kurtosis
    const kurtosis =
      returns.reduce((acc, r) => {
        const normalizedReturn =
          (r * 100 - stats.mean * 100) / (stats.stdDev * 100);
        return acc + Math.pow(normalizedReturn, 4);
      }, 0) /
        (n - 1) -
      3; // Excess kurtosis (normal = 0)

    // Percentiles
    const p95 = sortedReturns[Math.floor(0.95 * (n - 1))];
    const p5 = sortedReturns[Math.floor(0.05 * (n - 1))];

    return {
      skewness: skewness.toFixed(2),
      kurtosis: kurtosis.toFixed(2),
      p95: p95.toFixed(2),
      p5: p5.toFixed(2),
      observations: n,
      maxDrawdown: Math.min(...returns.map((r) => r * 100)).toFixed(2),
      maxGain: Math.max(...returns.map((r) => r * 100)).toFixed(2),
    };
  };

  const returns = calculateReturns(filteredCandles);
  const stats = calculateStats(returns);
  const additionalStats = calculateAdditionalStats(returns);

  const meanFormatted = (stats.mean * 100).toFixed(2);
  const maxReturn = Math.max(...returns.map((s) => Math.abs(s)));

  const binSize = 0.005;
  const range = { min: -maxReturn, max: maxReturn };
  const histogram = createHistogramBins(returns, range, binSize);

  const chartData = histogram.map((bin) => ({
    return: bin.return,
    frequency: bin.frequency,
  }));

  return (
    <div className="grid grid-cols-4 gap-4">
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Distribution of Daily Returns for {ticker}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full h-[30rem] text-sm">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                width={undefined}
                height={undefined}
                data={chartData}
                margin={{
                  top: 20,
                  right: 10,
                  left: 60,
                  bottom: 40,
                }}
                barGap={0}
                barCategoryGap={0}
              >
                <CartesianGrid color={solarizedBase01} strokeDasharray="3 3" />
                <XAxis
                  dataKey="return"
                  type="number"
                  tickFormatter={(value) => value.toFixed(1)}
                  label={{
                    value: "Daily Return (%)",
                    position: "bottom",
                    offset: 20,
                  }}
                />
                <YAxis
                  tickFormatter={(value) => value.toFixed(1)}
                  label={{
                    value: "Frequency (%)",
                    angle: -90,
                    position: "insideLeft",
                    offset: -40,
                  }}
                />
                <Tooltip
                  formatter={(value) => [
                    `${Number(value).toFixed(2)}%`,
                    "Frequency",
                  ]}
                  labelFormatter={(label) =>
                    `Return: ${Number(label).toFixed(2)}%`
                  }
                />
                <ReferenceLine
                  className="text-xs"
                  x={stats.mean * 100}
                  stroke={solarizedYellow}
                  strokeWidth={2}
                  label={{
                    value: `μ: ${meanFormatted}%`,
                    position: "top",
                    fill: solarizedYellow,
                  }}
                />
                <ReferenceLine
                  strokeDasharray="3 3"
                  className="text-xs"
                  x={(stats.mean + stats.stdDev) * 100}
                  stroke={solarizedBase01}
                  label={{
                    value: `+1σ: ${((stats.mean + stats.stdDev) * 100).toFixed(
                      2
                    )}%`,
                    position: "top",
                    fill: solarizedBase01,
                  }}
                />
                <ReferenceLine
                  className="text-xs"
                  strokeDasharray="3 3"
                  x={(stats.mean - stats.stdDev) * 100}
                  stroke={solarizedBase01}
                  label={{
                    value: `-1σ: ${((stats.mean - stats.stdDev) * 100).toFixed(
                      2
                    )}%`,
                    position: "top",
                    fill: solarizedBase01,
                  }}
                />
                <ReferenceLine
                  className="text-xs"
                  x={(stats.mean + 2 * stats.stdDev) * 100}
                  stroke={solarizedMagenta}
                  label={{
                    value: `+2σ: ${(
                      (stats.mean + 2 * stats.stdDev) *
                      100
                    ).toFixed(2)}%`,
                    position: "top",
                    fill: solarizedMagenta,
                  }}
                />
                <ReferenceLine
                  className="text-xs"
                  x={(stats.mean - 2 * stats.stdDev) * 100}
                  stroke={solarizedMagenta}
                  label={{
                    value: `-2σ: ${(
                      (stats.mean - 2 * stats.stdDev) *
                      100
                    ).toFixed(2)}%`,
                    position: "top",
                    fill: solarizedMagenta,
                  }}
                />
                <Bar
                  dataKey="frequency"
                  fill={solarizedBlue}
                  fillOpacity={0.6}
                  name="Distribution"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Distribution Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="font-medium">Mean (μ)</div>
            <div>{meanFormatted}%</div>

            <div className="font-medium">Std Dev (σ)</div>
            <div>{(stats.stdDev * 100).toFixed(2)}%</div>

            <div className="font-medium">Skewness</div>
            <div>{additionalStats.skewness}</div>

            <div className="font-medium">Excess Kurtosis</div>
            <div>{additionalStats.kurtosis}</div>

            <div className="font-medium">95th Percentile</div>
            <div>{additionalStats.p95}%</div>

            <div className="font-medium">5th Percentile</div>
            <div>{additionalStats.p5}%</div>

            <div className="font-medium">Max Return</div>
            <div>{additionalStats.maxGain}%</div>

            <div className="font-medium">Max Drawdown</div>
            <div>{additionalStats.maxDrawdown}%</div>

            <div className="font-medium">Observations</div>
            <div>{additionalStats.observations}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReturnDistribution;
