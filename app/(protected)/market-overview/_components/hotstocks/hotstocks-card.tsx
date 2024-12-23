"use client";
import { getMarketPerformers } from "@/actions/market-data/actions";
import Loading from "@/components/loading";
import { Button } from "@/components/ui/button";
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
import { isFMPDataLoadingError, Quote } from "@/lib/types/fmp-types";
import { AlertCircle, Flame, FlameIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

export interface HotStocksCardProps {
  stocks: Quote[];
}

const filterButtons = [
  { label: "Gainers", value: "gainers" },
  { label: "Losers", value: "losers" },
  { label: "Most Active", value: "actives" },
] as const;

export default function HotStocksCard({ stocks }: HotStocksCardProps) {
  const [filter, setFilter] = useState<"gainers" | "losers" | "actives">(
    "gainers"
  );

  const { data, error, isLoading, refetch } = useQuery({
    queryKey: [`hotstocks-${filter}`],
    queryFn: async () => {
      try {
        const result = await getMarketPerformers(filter);
        return result;
      } catch (error) {
        console.error("Error fetching market performers:", error);
        throw error;
      }
    },
    refetchInterval: 60000,
    initialData: stocks,
  });

  if (isLoading) {
    return loadingState;
  }

  if (isFMPDataLoadingError(data) || error || !data) {
    return <ErrorState refetch={refetch} />;
  }

  return (
    <Card className="h-full min-h-[300px] max-h-[30vh] flex flex-col">
      <CardHeader className="flex-none pb-0">
        <div className="flex items-center justify-between pb-2">
          <div>
            <CardTitle className="text-xl">Today&apos;s Hot Stocks</CardTitle>
            <CardDescription>Find stocks on the move today</CardDescription>
          </div>
          <Flame className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex  gap-2 w-64">
          {filterButtons.map((button) => (
            <Button
              key={button.value}
              variant={filter === button.value ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(button.value)}
              className="flex-1"
            >
              {button.label}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden ">
        <ScrollArea className="h-full w-full overflow-auto mt-2 pb-4">
          {data.length > 0 ? (
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
                {data.map((stock: Quote) => (
                  <TableRow key={`${stock.symbol}-${stock.timestamp}`}>
                    <Link href={`/symbol/${stock.symbol}`} className="contents">
                      <TableCell className="font-medium">
                        {stock.symbol}
                      </TableCell>
                      <TableCell className="truncate max-w-[150px]">
                        <span title={stock.name || ""}>{stock.name}</span>
                      </TableCell>
                      <TableCell className="text-right w-[4rem]">
                        {stock.price}
                      </TableCell>
                      <TableCell className="text-right w-[4rem]">
                        {stock.change.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right w-[4rem]">
                        {stock.changesPercentage.toFixed(2)}%
                      </TableCell>
                    </Link>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">No data</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

const loadingState = (
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
        <Loading />
      </div>
    </CardContent>
  </Card>
);

interface ErrorStateProps {
  refetch: () => void;
}

const ErrorState = ({ refetch }: ErrorStateProps) => (
  <Card className="w-full min-h-[300px] max-h-[500px] h-[30vh] animate-in fade-in duration-500">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <div className="space-y-1">
        <CardTitle>Hot Stocks</CardTitle>
        <CardDescription>What&apos;s Moving Today</CardDescription>
      </div>
      <Flame className="h-5 w-5 text-muted-foreground" />
    </CardHeader>
    <CardContent className="h-[calc(100%-5rem)] flex items-center">
      <div className="w-full flex flex-col items-center justify-center space-y-4 text-center">
        <AlertCircle className="h-12 w-12 text-destructive animate-in zoom-in duration-300" />
        <div className="text-lg font-semibold">Unable to load data</div>
        <p className="text-muted-foreground max-w-[380px] mx-auto">
          There was an issue retrieving the data. Please check your connection
          and try again.
        </p>
        <Button onClick={() => refetch()} className="mt-2">
          Retry
        </Button>
      </div>
    </CardContent>
  </Card>
);
