export interface PricePoint {
  open: number;
  high: number;
  low: number;
  close: number;
  time: string;
}
export function isPricePoint(obj: any): obj is PricePoint {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof obj.open === "number" &&
    typeof obj.high === "number" &&
    typeof obj.low === "number" &&
    typeof obj.close === "number" &&
    typeof obj.time === "string"
  );
}

export interface ATRMultipFromFiftySMAPoint {
  time: string;
  atr: number;
  percentFromFiftySMA: number;
}

export interface LastCrosshairPoint {
  x: string;
  y: number | null;
}

export const calcATRPercentMultipleFromFiftySMA = (
  lastClose: number,
  fiftySMA: number,
  atr: number
) => {
  if (!fiftySMA) {
    return undefined;
  } else {
    const aVal = 100 * (atr / lastClose);
    const percentFromFifty = ((lastClose - fiftySMA) / fiftySMA) * 100;

    return Number((percentFromFifty / aVal).toFixed(2));
  }
};
