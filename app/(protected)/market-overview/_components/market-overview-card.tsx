import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUpIcon, TrendingDownIcon, AlertCircle } from "lucide-react";

import { useQuery } from "@tanstack/react-query";
import {
  PTTrendModel,
  QuoteElementSchema,
  isFMPDataLoadingError,
} from "@/lib/types/fmp-types";

export interface MarketOverviewCardProps {
  ticker: string;
  description: string;
  medianReturn: number;
  trendModel: PTTrendModel;
  globalDailyBreadthRank: number;
}

const MarketOverviewCard: React.FC<MarketOverviewCardProps> = ({
  ticker,
  description,
  medianReturn,
  trendModel,
  globalDailyBreadthRank,
}) => {
  const key = `/api/quote/${ticker}`;

  const getQuoteApi = async () => {
    try {
      const res = await fetch(key);
      if (!res.ok) {
        throw new Error(`API request failed with status ${res.status}`);
      }
      const parsed = QuoteElementSchema.safeParse(await res.json());
      if (!parsed.success) {
        throw new Error("Unable to parse quote results");
      }
      return parsed.data;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Unknown error occurred"
      );
    }
  };

  const { data, error, isLoading } = useQuery({
    queryKey: [key],
    queryFn: getQuoteApi,
    refetchInterval: 45000,
  });

  // Helper function to determine if a number is positive
  const isPositive = (num: number | null | undefined): boolean => {
    return typeof num === "number" && num > 0;
  };

  // Helper function to format percentage
  const formatPercentage = (value: number | null | undefined): string => {
    if (typeof value !== "number") return "N/A";
    return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
  };

  // Helper function to get trend color
  const getTrendColor = (trend: string): string => {
    switch (trend) {
      case "BULLISH":
      case "UPTREND":
        return "text-uptrend";
      case "BEARISH":
      case "PULLBACK":
        return "text-orange-500";
      case "NEUTRAL":
        return "text-gray-500";
      default:
        return "text-gray-500";
    }
  };

  // Determine color classes based on value
  const getColorClass = (value: number | null | undefined): string => {
    if (typeof value !== "number") return "text-gray-500";
    return value > 0
      ? "text-uptrend"
      : value < 0
      ? "text-destructive"
      : "text-gray-500";
  };

  const getBorderClass = (value: number | null | undefined): string => {
    if (typeof value !== "number") return "border-foreground/50";
    return value > 0
      ? "border-uptrend"
      : value < 0
      ? "border-destructive"
      : "border-accent";
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-40">
            <div className="animate-pulse text-muted-foreground">
              Loading...
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data || isFMPDataLoadingError(data)) {
    return (
      <Card className="w-full max-w-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-40 text-muted-foreground">
            <AlertCircle className="mr-2 h-5 w-5" />
            <span>Unable to load market data</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const quoteReturn = data.changesPercentage;
  const price = data.price;
  const quoteColorClass = getColorClass(quoteReturn);
  const trendColorClass = getTrendColor(trendModel.trendStateModel);
  const isMedianPositive = isPositive(medianReturn);
  const borderClass = getBorderClass(quoteReturn)

  return (
    <Card className="w-full hover:bg-accent/50">
      <CardContent className={`p-4 border-l-2 ${borderClass}`}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <div className="flex items-center space-x-1">
            <Badge
              variant="secondary"
              className={`text-sm font-medium ${trendColorClass}`}
            >
              {trendModel.trendStateModel}
            </Badge>
            <div className={`flex items-center `}>
              <span className="text-sm font-semibold">
                {globalDailyBreadthRank.toFixed(2)} GDB{" "}
              </span>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between ">
            <div className="text-3xl font-bold">{ticker} </div>
            {/*<div className={`flex items-center `}>
              <span className="text-xl font-semibold">
                {globalDailyBreadthRank.toFixed(2)} GDB{" "}
              </span>
            </div>*/}
            <div className="flex space-x-2 items-end">
              <div className="text-xl">
                <span className="ml-1 font-medium">${price.toFixed(2)}</span>
              </div>
              <div>
                <span className={`font-medium text-xl ${quoteColorClass}`}>
                  {formatPercentage(quoteReturn)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col space-y-1">
            {/*}  <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Change %</span>
              <span className={`font-medium ${quoteColorClass}`}>
                {formatPercentage(quoteReturn)}
              </span>
            </div>
            */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Median Return</span>
              <div
                className={`flex items-center font-medium ${getColorClass(
                  medianReturn
                )}`}
              >
                {isMedianPositive ? (
                  <TrendingUpIcon className="mr-1 h-4 w-4" />
                ) : (
                  <TrendingDownIcon className="mr-1 h-4 w-4" />
                )}
                {formatPercentage(medianReturn)}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketOverviewCard;
