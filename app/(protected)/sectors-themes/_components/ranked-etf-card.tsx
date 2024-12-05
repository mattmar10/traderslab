import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EtfMarketData } from "@/lib/types/submarkets-sectors-themes-types";
import { useQuery } from "@tanstack/react-query";
import { getLeadingStocksForEtf, getSettingUpStocksForEtf } from "@/actions/screener/actions";
import { ChartSettings } from "@/components/settings/chart-settings";
import ScreenerMiniChartWrapper from "../../screener/_components/screener-result-minichart";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { isRight } from "@/lib/utils";
import EtfReturnsRadarChart from "./etf-returns-radar-chart";
import Link from "next/link";
import EtfReturnsBarChart from "./etf-returns-barchart";

interface RankedEtfCardProps {
  rank: number;
  etf: EtfMarketData;
  allEtfs: EtfMarketData[];
  theme: "light" | "dark";
  chartSettings: ChartSettings;
}

const RankedEtfCard: React.FC<RankedEtfCardProps> = ({
  rank,
  etf,
  allEtfs,
  theme,
  chartSettings,
}) => {
  const {
    data: leadersData,
    error: leadersError,
    isLoading: leadersIsLoading,
  } = useQuery({
    queryKey: [`leading-stocks`, etf],
    queryFn: async () => {
      try {
        const result = await getLeadingStocksForEtf(etf.ticker);
        return result;
      } catch (error) {
        console.error("Error fetching leaders for etf:", error);
        throw error;
      }
    },
    refetchInterval: 120000,
  });

  const {
    data: settingUpData,
    error: settingUpError,
    isLoading: settingUpIsLoading,
  } = useQuery({
    queryKey: [`setting-up-stocks`, etf],
    queryFn: async () => {
      try {
        const result = await getSettingUpStocksForEtf(etf.ticker);
        return result;
      } catch (error) {
        console.error("Error fetching setting up for etf:", error);
        throw error;
      }
    },
    refetchInterval: 120000,
  });

  const currentDate = new Date();
  const twoYearsAgo = new Date(
    currentDate.getFullYear() - 2,
    currentDate.getMonth(),
    currentDate.getDate()
  );

  const renderStockList = (holdings: any[], isLoading: boolean, error: any) => {
    if (isLoading) {
      return <div className="h-4 p-1 bg-muted animate-pulse rounded w-full" />;
    }
    if (error) {
      return <div className="text-sm text-destructive">Error loading data</div>;
    }
    if (!holdings || holdings.length === 0) {
      return <span className="text-muted-foreground">N/A</span>;
    }

    return holdings.slice(0, 5).map((holding, index) => (
      <span key={`${holding.asset}-${index}`} className="inline">
        <HoverCard>
          <HoverCardTrigger>
            <Link href={`/symbol/${holding.asset}`}>
              <span className="text-foreground/70 hover:text-foreground cursor-pointer">
                ${holding.asset}
              </span>
            </Link>
          </HoverCardTrigger>
          <HoverCardContent className="w-[52rem] p-4">
            <ScreenerMiniChartWrapper
              profile={holding.profile}
              relativeStrengthResults={holding.relativeStrength}
              chartSettings={chartSettings}
              theme={theme}
              startDate={twoYearsAgo}
            />
          </HoverCardContent>
        </HoverCard>
        {index < Math.min(holdings.length - 1, 4) && (
          <span className="text-muted-foreground">, </span>
        )}
      </span>
    ));
  };

  return (
    <Card className="h-full bg-card">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between border-b border-border/40 pb-3">
          <div className="flex-1 min-w-0">
            <div className="font-bold text-lg tracking-tight truncate" title={etf.name}>
              {etf.name}
            </div>
          </div>
          <Badge variant="secondary" className="text-lg px-3 py-1 ml-4">
            #{rank + 1}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pb-4 pt-2 px-4">
        <div className="space-y-6">
          <div>
            <h3 className="text-base font-semibold mb-2">Leaders</h3>
            <div className="text-sm px-3 py-2 bg-accent/70 rounded-md">
              {leadersData && isRight(leadersData)
                ? renderStockList(
                  leadersData.value.holdings,
                  leadersIsLoading,
                  leadersError
                )
                : null}
            </div>
          </div>

          <div>
            <h3 className="text-base font-semibold mb-2">Setting Up</h3>
            <div className="text-sm px-3 py-2 bg-accent/70 rounded-md">
              {settingUpData && isRight(settingUpData)
                ? renderStockList(
                  settingUpData.value.holdings,
                  settingUpIsLoading,
                  settingUpError
                )
                : null}
            </div>
          </div>
        </div>

        <div>
          <EtfReturnsRadarChart etf={etf} all={allEtfs} />
        </div>

        <div>
          <EtfReturnsBarChart etf={etf} />
        </div>
      </CardContent>
    </Card>
  );
};

export default RankedEtfCard;