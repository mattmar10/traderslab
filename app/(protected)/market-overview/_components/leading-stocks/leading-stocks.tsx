
import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Trophy } from "lucide-react";
import LeadingStocksCard from "./leading-stocks-card";
import { getLeadingStocks } from "@/actions/screener/actions";
import Loading from "@/components/loading";

async function LeadingStocks() {
  const data = await getLeadingStocks();

  return <LeadingStocksCard stocks={data} />
}

function LoadingState() {
  return (
    <Card className="h-full min-h-[300px] max-h-[30vh] flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 h-1/4">
        <div className="flex flex-col space-y-1">
          <CardTitle>Leading Stocks</CardTitle>
          <CardDescription>TradersLab market leaders</CardDescription>
        </div>
        <Trophy className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="h-3/4">
        <div className="h-full flex items-center justify-center">
          <Loading />
        </div>
      </CardContent>
    </Card>
  );
}

export const LeadingStocksServer: React.FC = () => {
  return (
    <Suspense fallback={<LoadingState />}>
      <LeadingStocks />
    </Suspense>
  );
};


