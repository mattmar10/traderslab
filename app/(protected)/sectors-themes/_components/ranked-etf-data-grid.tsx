"use client";
import { EtfMarketData } from "@/lib/types/submarkets-sectors-themes-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RankedEtfCard from "./ranked-etf-card";
import {
  ChartSettings,
  defaultChartSettings,
} from "@/components/settings/chart-settings";
import { useState } from "react";
import { FullFMPProfile } from "@/lib/types/fmp-types";

export interface RankedEtfDataPoint {
  etfData: EtfMarketData;
  profile: FullFMPProfile;
}

export interface RankedEtfDataGridProps {
  rankedData: RankedEtfDataPoint[];
  title: string;
  theme: "light" | "dark";
}

const RankedMarketDataGrid: React.FC<RankedEtfDataGridProps> = ({
  rankedData,
  title,
  theme,
}) => {
  const [chartSettings] = useState<ChartSettings>(loadChartSettings);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Top {title}</CardTitle>
      </CardHeader>

      <CardContent>
        <div className=" grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 3xl:grid-cols-5 gap-2">
          {rankedData.map((etf, index) => (
            <RankedEtfCard
              key={etf.profile.symbol}
              profile={etf.profile}
              rank={index}
              etf={etf.etfData}
              chartSettings={chartSettings}
              theme={theme}
              allEtfs={rankedData.map((e) => e.etfData)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RankedMarketDataGrid;

function loadChartSettings(): ChartSettings {
  const savedSettings = localStorage.getItem("chartSettings");
  if (savedSettings) {
    return JSON.parse(savedSettings);
  } else {
    return defaultChartSettings;
  }
}
