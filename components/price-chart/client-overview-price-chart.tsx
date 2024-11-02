"use client";

import { getPriceBars } from "@/actions/market-data/actions";
import {} from "@/lib/types/basic-types";
import { useQuery } from "react-query";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import ErrorCard from "../error-card";
import Loading from "../loading";
import OverviewPriceChartWrapper from "./overview-price-chart-wrapper";
import { isFMPDataLoadingError } from "@/lib/types/fmp-types";

export interface ClientOverviewPriceChartProps {
  ticker: string;
}

const ClientOverviewPriceChart: React.FC<ClientOverviewPriceChartProps> = ({
  ticker,
}) => {
  const { data, error, isLoading } = useQuery({
    queryKey: [`candles-${ticker}`],
    queryFn: () => getPriceBars(ticker),
    refetchInterval: 60000, // Refetch every minute
    staleTime: 55000, // Consider data stale after 55 seconds
  });

  if (isLoading) {
    return (
      <div className="pt-12">
        <Loading />
      </div>
    );
  }

  if (isFMPDataLoadingError(data) || error) {
    return (
      <Card>
        <CardHeader className="py-2 px-2">
          <CardTitle className={`text-lg `}>
            <div className="flex justify-between">
              <div>Price Action Performance {ticker} </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorCard errorMessage={`Unable to load candles for ${ticker}`} />
        </CardContent>
      </Card>
    );
  }

  return <OverviewPriceChartWrapper ticker={ticker} candles={data || []} />;
};

export default ClientOverviewPriceChart;
