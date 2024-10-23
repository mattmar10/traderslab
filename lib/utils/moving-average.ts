import { Candle } from "@/lib/types/basic-types";

export type MovingAverageType = "SMA" | "EMA";

export interface MovingAverageError {
  movingAvgType: MovingAverageType;
  error: string;
}

export function isMovingAverageError(value: any): value is MovingAverageError {
  return (
    typeof value === "object" &&
    value !== null &&
    "movingAvgType" in value &&
    "error" in value
  );
}

export function ema(
  period: number,
  data: number[]
): MovingAverageError | number {
  if (data.length < period) {
    return {
      movingAvgType: "EMA",
      error: "Not enough data",
    };
  } else {
    const alpha = 2 / (period + 1);
    let ema = data[0]; // Initialize EMA with the first data point

    for (let i = 1; i < data.length; i++) {
      ema = alpha * data[i] + (1 - alpha) * ema;
    }

    return ema;
  }
}

export function sma(
  period: number,
  data: number[]
): MovingAverageError | number {
  if (data.length < period) {
    return {
      movingAvgType: "SMA",
      error: "Not enough data",
    };
  } else {
    const sliced = data.slice(-period);
    const sum = sliced.reduce((acc, num) => acc + num, 0);

    return sum / sliced.length;
  }
}

export interface MovingAverageLinePoint {
  time: string;
  value: number;
}
export interface MovingAverageLine {
  period: number;
  timeseries: MovingAverageLinePoint[];
}

export function calculateSMA(
  candles: Candle[],
  period: number,
  extractor: (c: Candle) => number = (c) => c.close
): MovingAverageLine | MovingAverageError {
  if (candles.length < period) {
    return {
      movingAvgType: "SMA",
      error: "Not enough data to calculate SMA",
    };
  }

  const smaData = [];

  for (let i = period - 1; i < candles.length; i++) {
    const sum = candles
      .slice(i - period + 1, i + 1)
      .reduce((total, c) => total + extractor(c), 0);

    const average = sum / period;
    smaData.push({ time: candles[i].dateStr!, value: average });
  }

  return {
    period: period,
    timeseries: smaData,
  };
}

export function calculateEMA(
  candles: Candle[],
  period: number,
  extractor: (c: Candle) => number = (c) => c.close
): MovingAverageLine | MovingAverageError {
  if (candles.length < period) {
    return {
      movingAvgType: "EMA",
      error: "Not enough data to calculate EMA",
    };
  }

  const multiplier = 2 / (period + 1);

  const emaData = [];
  let ema =
    candles.slice(0, period).reduce((sum, c) => sum + extractor(c), 0) / period;

  for (let i = period; i < candles.length; i++) {
    ema = (candles[i].close - ema) * multiplier + ema;
    emaData.push({ time: candles[i].dateStr!, value: ema });
  }

  return {
    period: period,
    timeseries: emaData,
  };
}

export function smaSeq(
  period: number,
  data: number[]
): MovingAverageError | number[] {
  if (data.length < period) {
    return {
      movingAvgType: "SMA",
      error: "Not enough data to calculate SMA",
    };
  } else {
    const smaSeq: number[] = [];
    let sum = 0;

    for (let i = 0; i < data.length; i++) {
      sum += data[i];
      if (i >= period - 1) {
        smaSeq.push(sum / period);
        sum -= data[i - (period - 1)];
      }
    }

    return smaSeq;
  }
}
