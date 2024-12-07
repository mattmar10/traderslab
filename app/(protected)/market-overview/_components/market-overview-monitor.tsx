import React, { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getRealTimeQuotes } from "@/actions/market-data/actions";
import { isFMPDataLoadingError } from "@/lib/types/fmp-types";
import Loading from "@/components/loading";
import OverviewMainContent from "./main-content/overview-main-content";

async function MainContent() {
  const quotes = await getRealTimeQuotes("sp500");

  if (isFMPDataLoadingError(quotes)) {
    return <div>Unable to load data</div>;
  }

  return (
    <div className="h-[52rem]">
      <OverviewMainContent />
    </div>
  )
}

function LoadingState() {
  return (
    <Card className="w-full h-[55rem]">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle>Sector Performance Distribution</CardTitle>
          <CardDescription>
            High level overview of returns across sectors
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="place-items-center">
          <Loading />
        </div>
      </CardContent>
    </Card>
  );
}

const MarketOverviewMonitor: React.FC = () => {
  return (
    <div className="col-span-6">
      <Suspense fallback={<LoadingState />}>
        <MainContent />
      </Suspense>
    </div>
  );
};

export default MarketOverviewMonitor;
