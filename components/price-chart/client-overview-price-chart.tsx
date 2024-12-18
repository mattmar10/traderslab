"use client";

import { getPriceBars } from "@/actions/market-data/actions";
import { } from "@/lib/types/basic-types";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import ErrorCard from "../error-card";
import Loading from "../loading";
import OverviewPriceChartWrapper from "./overview-price-chart-wrapper";
import { isFMPDataLoadingError } from "@/lib/types/fmp-types";
import { isWithinMarketHours } from "@/lib/utils";

export interface ClientOverviewPriceChartProps {
  ticker: string;
}

const ClientOverviewPriceChart: React.FC<ClientOverviewPriceChartProps> = ({
  ticker,
}) => {
  const { data, error, isLoading } = useQuery({
    queryKey: [`candles-${ticker}`],
    queryFn: () => getPriceBars(ticker),
    refetchInterval: isWithinMarketHours() ? 60000 : 300000,
    enabled: isWithinMarketHours()
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
