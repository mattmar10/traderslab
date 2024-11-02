import { filterGroups } from "@/drizzle/schema";
import { getDatabaseInstance } from "@/lib/db";
import { ScreenerResultsSchema } from "@/lib/types/screener-types";
import { eq } from "drizzle-orm";
import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Trophy } from "lucide-react";
async function LeadingStocks() {
  const leadingStocksFGId = "4ed66008-163d-494f-a683-8d03021ee3cb";
  const data = await getLeadingStocks(leadingStocksFGId);

  return <div>{JSON.stringify(data)}</div>;
}

function LoadingState() {
  return (
    <Card className="w-full h-[30vh] min-h-[300px] max-h-[500px]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 h-1/4">
        <div className="flex flex-col space-y-1">
          <CardTitle>Hot Stocks</CardTitle>
          <CardDescription>Whats Moving Today</CardDescription>
        </div>
        <Trophy className="h-4 w-4 text-muted-foreground" />
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

export const LeadingStocksServer: React.FC = () => {
  return (
    <Suspense fallback={<LoadingState />}>
      <LeadingStocks />
    </Suspense>
  );
};

export async function getLeadingStocks(filterGroupId: string) {
  if (!process.env.TRADERS_LAB_API) {
    throw new Error("TRADERS_LAB_API must be specified");
  }

  const db = await getDatabaseInstance();
  const payload = await db
    .select({ payload: filterGroups.payload })
    .from(filterGroups)
    .where(eq(filterGroups.id, filterGroupId))
    .limit(1);

  const url = `${process.env.TRADERS_LAB_API}/market-performance/stocks`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload[0].payload!),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const parsed = ScreenerResultsSchema.safeParse(data);

    if (parsed.success) {
      return parsed.data;
    } else {
      throw Error("Unable to fetch more data");
    }
  } catch (error) {
    console.error("Error:", error);
    throw new Error("Unable to fetch Leading Stocks");
  }
}
