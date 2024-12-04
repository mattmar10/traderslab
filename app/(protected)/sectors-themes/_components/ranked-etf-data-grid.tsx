import { EtfMarketData } from "@/lib/types/submarkets-sectors-themes-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RankedEtfCard from "./ranked-etf-card";
import {
  ChartSettings,
  defaultChartSettings,
} from "@/components/settings/chart-settings";
import { useState } from "react";

export interface RankedEtfDataGridProps {
  rankedData: EtfMarketData[];
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
        <div className=" grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
          {rankedData.map((etf, index) => (
            <RankedEtfCard
              key={etf.ticker}
              rank={index}
              etf={etf}
              chartSettings={chartSettings}
              theme={theme}
              allEtfs={rankedData}
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
