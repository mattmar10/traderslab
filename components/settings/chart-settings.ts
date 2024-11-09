import { negativeRed, positiveBlue } from "@/lib/utils/color-utils";

export interface ChartSettings {
  priceMovingAverages: MovingAverageSetting[];
  showPriceMovingAvgLegends: boolean;
  showVolumeMovingAvgLegends: boolean;
  volumeMA: {
    enabled: boolean;
    type: "SMA" | "EMA";
    period: number;
    color: string;
  };
  seriesType: "candlestick" | "bar";
  useThinBars?: boolean; // New option for bar series type
  upColor: string;
  downColor: string;
  wickUpColor: string;
  wickDownColor: string;
  upBorderColor: string;
  downBorderColor: string;
  screenerRefreshInterval: number;
  avwapSettings: AVWAPSetting;
}

export const defaultChartSettings: ChartSettings = {
  priceMovingAverages: [
    { id: 1, type: "EMA", period: 10, color: "#888" },
    { id: 2, type: "EMA", period: 21, color: "#268bd2" },
    { id: 3, type: "SMA", period: 50, color: "#b58900" },
  ],
  showPriceMovingAvgLegends: true,
  showVolumeMovingAvgLegends: true,
  volumeMA: {
    enabled: true,
    type: "SMA",
    period: 20,
    color: "#d33682",
  },
  seriesType: "candlestick",
  useThinBars: false,
  upColor: positiveBlue,
  downColor: negativeRed,
  wickUpColor: positiveBlue,
  wickDownColor: negativeRed,
  upBorderColor: positiveBlue,
  downBorderColor: negativeRed,
  screenerRefreshInterval: 30000,
  avwapSettings: {
    color: "#6c71c4",
    showLegend: true,
  },
};

export interface MovingAverageSetting {
  id: number;
  type: "SMA" | "EMA";
  period: number;
  color: string;
}

export interface VolumeMovingAverageSetting {
  enabled: boolean;
  type: "SMA" | "EMA";
  period: number;
  color: string;
}

export interface AVWAPSetting {
  color: string;
  showLegend: boolean;
}
