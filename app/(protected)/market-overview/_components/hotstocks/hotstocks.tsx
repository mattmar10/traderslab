import React, { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FlameIcon } from "lucide-react";
import { getMarketPerformers } from "@/actions/market-data/actions";
import HotStocksCard from "./hotstocks-card";
import { isFMPDataLoadingError } from "@/lib/types/fmp-types";

async function HotStocks() {
  const gainers = await getMarketPerformers("gainers");

  if (isFMPDataLoadingError(gainers)) {
    return <div>Unable to load data</div>;
  }

  return <HotStocksCard stocks={gainers} />;
}

function LoadingState() {
  return (
    <Card className="w-full h-[30vh] min-h-[300px] max-h-[500px]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 h-1/4">
        <div className="flex flex-col space-y-1">
          <CardTitle>Hot Stocks</CardTitle>
          <CardDescription>Whats Moving Today</CardDescription>
        </div>
        <FlameIcon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="h-3/4">
        <div className="h-full flex items-center justify-center">
          <div className="animate-pulse space-y-4">
            <div className="h-4 w-48 bg-foreground/20 rounded"></div>
            <div className="h-4 w-48 bg-foreground/20 rounded"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
const HotStocksServer: React.FC = () => {
  return (
    <Suspense fallback={<LoadingState />}>
      <HotStocks />
    </Suspense>
  );
};

export default HotStocksServer;
