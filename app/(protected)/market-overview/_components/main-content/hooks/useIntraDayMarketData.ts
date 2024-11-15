import { useQuery } from "@tanstack/react-query";

import { getIntradayChart } from "@/actions/market-data/actions";
import { FMPIntradyChartCandle } from "@/lib/types/fmp-types";

const useIntradayMarketData = (ticker: string, dateToUse: Date) => {
  return useQuery<FMPIntradyChartCandle[]>({
    queryKey: [`overview-${ticker}`],
    queryFn: async () => {
      try {
        return await getIntradayChart(ticker, "1min", dateToUse);
      } catch (error) {
        console.error(`Error fetching ${ticker} chart`, error);
        throw error;
      }
    },
    refetchInterval: 60000,
  });
};

export default useIntradayMarketData;
