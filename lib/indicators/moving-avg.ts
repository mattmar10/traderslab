import { Candle, LineChartPoint } from "@/lib/types/basic-types";
import { Either, Left, Right } from "../utils";

export type IndicatorError = {
  errorMessage: string;
};

export function calculateSMAForChart(
  candles: Candle[],
  period: number,
  extractorFn: (c: Candle) => number = (c) => c.close
): Either<IndicatorError, LineChartPoint[]> {
  if (!candles || candles.length < period) {
    return Left({
      errorMessage: "Not enough data to calculate EMA",
    });
  }

  const smaData: LineChartPoint[] = [];

  for (let i = period - 1; i < candles.length; i++) {
    const sum = candles
      .slice(i - period + 1, i + 1)
      .reduce((total, c) => total + extractorFn(c), 0);
    const average = sum / period;
    smaData.push({ time: candles[i].dateStr!, value: average });
  }

  return Right(smaData);
}

export function calculateEMA(
  candles: Candle[],
  period: number
): Either<IndicatorError, LineChartPoint[]> {
  if (!candles || candles.length < period) {
    return Left({
      errorMessage: "Not enough data to calculate EMA",
    });
  }

  const emaData: LineChartPoint[] = [];
  const multiplier = 2 / (period + 1);

  for (let i = period - 1; i < candles.length; i++) {
    if (i === period - 1) {
      const sum = candles
        .slice(i - period + 1, i + 1)
        .reduce((total, c) => total + c.close, 0);
      const initialSMA = sum / period;
      emaData.push({ time: candles[i].dateStr!, value: initialSMA });
    } else {
      const prevEMA = emaData[i - period];
      const currentEMA =
        (candles[i].close - prevEMA.value) * multiplier + prevEMA.value;
      emaData.push({ time: candles[i].dateStr!, value: currentEMA });
    }
  }

  return Right(emaData);
}
