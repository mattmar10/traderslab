"use client";

import {
  CurrentDayMarketBreadthSnapshot,
  CurrentDayMarketBreadthSnapshotSchema,
} from "@/lib/types/market-breadth-types";
import { AllPTTrendModels } from "@/lib/types/trend-model-types";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import MarketOverviewCard from "./market-overview-card";
import { PTTrendModel } from "@/lib/types/fmp-types";

const MarketOverViewCards: React.FC = () => {
  const trendModelsKey = `/api/trend-models/all`;
  const getTrendModels = async (): Promise<AllPTTrendModels | undefined> => {
    const res = await fetch(trendModelsKey);
    const data = await res.json();
    const parsed = AllPTTrendModels.safeParse(data);
    if (!parsed.success) {
      console.error("Failed to parse trend models data:", parsed.error);
      return undefined;
    }
    return parsed.data;
  };

  const { data: trendModelsData } = useQuery({
    queryKey: [trendModelsKey],
    queryFn: getTrendModels,
    refetchInterval: 60000,
    staleTime: 10000,
  });

  const snapshotKey = `/api/breadth-snapshot`;
  const getSnapshots = async (): Promise<
    CurrentDayMarketBreadthSnapshot | undefined
  > => {
    const res = await fetch(snapshotKey);
    const data = await res.json();
    const parsed = CurrentDayMarketBreadthSnapshotSchema.safeParse(data);
    if (!parsed.success) {
      console.error("Failed to parse snapshot data:", parsed.error);
      return undefined;
    }
    return parsed.data;
  };

  const { data: snapshotsData } = useQuery({
    queryKey: [snapshotKey],
    queryFn: getSnapshots,
    refetchInterval: 60000,
    staleTime: 10000,
  });

  const renderCards = () => {
    if (!snapshotsData || !trendModelsData) return null;

    const cardData = [
      {
        key: "nyse",
        ticker: "^NYA",
        name: "NYSE",
        description: "NYSE Composite Index",
        data: snapshotsData.nyseOverview,
        ptTrendModel: trendModelsData.nyseTrendModel,
        href: "/ptmm/nyse",
      },
      {
        key: "rsp",
        ticker: "RSP",
        name: "S&P 500",
        description: "Equal Weight S&P 500",
        data: snapshotsData.rspTradingOverview,
        ptTrendModel: trendModelsData.rspTrendModel,
        href: "/ptmm/s&p500",
      },
      {
        key: "ndx",
        ticker: "QQQE",
        name: "NDX100",
        description: "Equal Weight Nasdaq 100",
        data: snapshotsData.qqqETradingOverview,
        ptTrendModel: trendModelsData.qqqeTrendModel,
        href: "/ptmm/ndx100",
      },
      {
        key: "iwm",
        ticker: "IWM",
        name: "Russell 2000",
        description: "Small Cap Index",
        data: snapshotsData.iwmTradingOverview,
        ptTrendModel: trendModelsData.iwmTrendModel,
        href: "/ptmm/iwm",
      },
    ];

    return cardData.map(
      ({ key, ticker, description, data, ptTrendModel, href }) => (
        <div key={key} className="">
          {data && ptTrendModel && (
            <Link href={href}>
              <MarketOverviewCard
                ticker={ticker}
                description={description}
                medianReturn={data.returns?.median || 0}
                trendModel={ptTrendModel as PTTrendModel}
                globalDailyBreadthRank={data.globalDailyBreadthPercentileRank}
              />
            </Link>
          )}
        </div>
      )
    );
  };

  return (
    <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-4">
      {renderCards()}
    </div>
  );
};

export default MarketOverViewCards;
