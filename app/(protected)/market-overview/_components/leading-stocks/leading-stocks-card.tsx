"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Table,
} from "@/components/ui/table";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import Loading from "@/components/loading";
import { useQuery } from "@tanstack/react-query";
import {
  ScreenerResults,
  SymbolWithStatsWithRank,
} from "@/lib/types/screener-types";
import { getLeadingStocks } from "@/actions/screener/actions";
import Link from "next/link";
import { FMPDataLoadingError } from "@/lib/types/fmp-types";
import { Either, isRight } from "@/lib/utils";
import ErrorCard from "@/components/error-card";
import { Trophy } from "lucide-react";
import { useTheme } from "next-themes";
import { useMemo } from "react";
import ScreenerMiniChartWrapper from "@/app/(protected)/screener/_components/screener-result-minichart";
import { useChartSettings } from "@/app/context/chart-settigns-context";

export interface LeadingStocksCardProps {
  stocks: Either<FMPDataLoadingError, ScreenerResults>;
}

const LeadingStocksCard: React.FC<LeadingStocksCardProps> = ({ stocks }) => {
  const { theme } = useTheme();
  const resolvedTheme = (theme as "light" | "dark") || "light";
  const { chartSettings } = useChartSettings();
  const { data, error, isLoading } = useQuery({
    queryKey: [`leading-stocks`],
    queryFn: async () => {
      try {
        const result = await getLeadingStocks();
        return result;
      } catch (error) {
        console.error("Error fetching market performers:", error);
        throw error;
      }
    },
    refetchInterval: 60000,
    initialData: stocks
  });

  if (isLoading) {
    return loadingState;
  }

  if (error || !data) {
    return <ErrorCard errorMessage={"Unable to load leaders"} />;
  }

  const twoYearsAgo = useMemo(() => {
    const currentDate = new Date();
    return new Date(
      currentDate.getFullYear() - 2,
      currentDate.getMonth(),
      currentDate.getDate()
    );
  }, []);


  return (
    <Card className="h-full min-h-[300px] max-h-[30vh] flex flex-col">
      {" "}
      <CardHeader className="flex-none pb-0">
        <div className="flex items-center justify-between ">
          <div>
            <CardTitle className="text-xl">Leading Stocks</CardTitle>
            <CardDescription>TradersLab market leaders</CardDescription>
          </div>
          <Trophy className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden ">
        <ScrollArea className="h-full w-full overflow-auto mt-2 pb-4">
          {data && isRight(data) && data.value.stocks.length > 0 ? (
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right w-[4rem]">Price</TableHead>
                  <TableHead className="text-right w-[4rem]">Change</TableHead>
                  <TableHead className="text-right w-[5.5rem]">
                    Change %
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.value.stocks.map((stock: SymbolWithStatsWithRank) => (
                  <HoverCard key={`${stock.profile.symbol}-leading`}>
                    <HoverCardTrigger asChild>
                      <TableRow>
                        <Link
                          href={`/symbol/${stock.profile.symbol}`}
                          className="contents"
                        >
                          <TableCell className="font-medium">
                            {stock.profile.symbol}
                          </TableCell>
                          <TableCell className="truncate max-w-[150px]">
                            <span title={stock.profile.companyName || ""}>
                              {stock.profile.companyName}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            {stock.quote.price}
                          </TableCell>
                          <TableCell className="text-right">
                            {stock.quote.change.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            {stock.quote.changesPercentage.toFixed(2)}%
                          </TableCell>
                        </Link>
                      </TableRow>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-[52rem] p-4 bg-popover z-20 shadow-lg rounded-md">
                      <ScreenerMiniChartWrapper
                        profile={stock.profile}
                        relativeStrengthResults={stock.relativeStrength}
                        chartSettings={chartSettings}
                        theme={resolvedTheme}
                        startDate={twoYearsAgo}
                      />
                    </HoverCardContent>
                  </HoverCard>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">No results.</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default LeadingStocksCard;

const loadingState = (
  <Card className="w-full h-[30vh] min-h-[300px] max-h-[500px]">
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
