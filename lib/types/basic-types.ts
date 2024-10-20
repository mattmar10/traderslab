export interface Candle {
  date: number;
  dateStr: string | undefined;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export function isCandle(object: any): object is Candle {
  return (
    typeof object === "object" &&
    "date" in object &&
    "open" in object &&
    "high" in object &&
    "low" in object &&
    "close" in object &&
    "volume" in object &&
    typeof object.date === "number" &&
    typeof object.open === "number" &&
    typeof object.high === "number" &&
    typeof object.low === "number" &&
    typeof object.close === "number" &&
    typeof object.volume === "number"
  );
}

export interface LineChartPoint {
  time: string;
  value: number;
}

export type Dataset = "S&P500" | "NDX100" | "NYSE" | "IWM";
export function isDataset(value: any): value is Dataset {
  return (
    value === "S&P500" ||
    value === "NDX100" ||
    value === "NYSE" ||
    value === "IWM"
  );
}

export function getTickerForDataset(dataset: Dataset) {
  if (dataset === "NDX100") {
    return "QQQE";
  } else if (dataset === "S&P500") {
    return "RSP";
  } else if (dataset === "IWM") {
    return "IWM";
  } else {
    return "^NYA";
  }
}

export function getDatasetFromTicker(
  ticker: "RSP" | "QQQE" | "^NYA" | "IWM"
): Dataset {
  if (ticker === "QQQE") {
    return "NDX100";
  } else if (ticker === "RSP") {
    return "S&P500";
  } else if (ticker === "IWM") {
    return "IWM";
  } else {
    return "NYSE";
  }
}

export function getDescriptionForDataset(dataset: Dataset) {
  if (dataset === "NDX100") {
    return "QQQE";
  } else if (dataset === "S&P500") {
    return "RSP";
  } else if (dataset === "IWM") {
    return "IWM";
  } else {
    return "^NYA";
  }
}
