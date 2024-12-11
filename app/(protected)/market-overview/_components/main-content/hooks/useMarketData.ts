import { useQuery } from "@tanstack/react-query";
import {
  getIntradayChart,
  getQuotesFromFMP,
} from "@/actions/market-data/actions";

type ChartDataPoint = {
  time: string;
} & {
  [market: string]: number;
};

// Define static market configurations
const marketConfigs = [
  { ticker: "QQQE", name: "NDX100" },
  { ticker: "^NYA", name: "NYSE" },
  { ticker: "RSP", name: "S&P 500" },
  { ticker: "IWM", name: "Russell 2000" },
];

const useMarketData = (dateToUse: Date) => {
  // Fetch quotes for all markets
  const {
    data: quoteData,
    isLoading: quoteLoading,
    isError: quoteError,
  } = useQuery({
    queryKey: [`maincontent-quotes`],
    queryFn: async () => {
      return await getQuotesFromFMP(marketConfigs.map((m) => m.ticker));
    },
    refetchInterval: 300000,
  });

  // Fetch individual intraday data for each market
  const ndx100Data = useQuery({
    queryKey: [`overview-QQQE`],
    queryFn: () => getIntradayChart("QQQE", "1min", dateToUse),
    refetchInterval: 60000,
  });

  const nyseData = useQuery({
    queryKey: [`overview-^NYA`],
    queryFn: () => getIntradayChart("^NYA", "1min", dateToUse),
    refetchInterval: 60000,
  });

  const sp500Data = useQuery({
    queryKey: [`overview-RSP`],
    queryFn: () => getIntradayChart("RSP", "1min", dateToUse),
    refetchInterval: 60000,
  });

  const russell2000Data = useQuery({
    queryKey: [`overview-IWM`],
    queryFn: () => getIntradayChart("IWM", "1min", dateToUse),
    refetchInterval: 60000,
  });

  // Aggregate loading and error states
  const isLoading =
    quoteLoading ||
    ndx100Data.isLoading ||
    nyseData.isLoading ||
    sp500Data.isLoading ||
    russell2000Data.isLoading;
  const hasError =
    quoteError ||
    ndx100Data.isError ||
    nyseData.isError ||
    sp500Data.isError ||
    russell2000Data.isError;

  // Initialize timeMap to hold ChartDataPoints
  const timeMap = new Map<string, ChartDataPoint>();

  if (quoteData && !isLoading && !hasError) {
    const marketData = [
      {
        name: "NDX100",
        data: ndx100Data.data,
        openPrice: quoteData.find((q) => q.symbol === "QQQE")?.previousClose,
      },
      {
        name: "NYSE",
        data: nyseData.data,
        openPrice: quoteData.find((q) => q.symbol === "^NYA")?.previousClose,
      },
      {
        name: "S&P 500",
        data: sp500Data.data,
        openPrice: quoteData.find((q) => q.symbol === "RSP")?.previousClose,
      },
      {
        name: "Russell 2000",
        data: russell2000Data.data,
        openPrice: quoteData.find((q) => q.symbol === "IWM")?.previousClose,
      },
    ];

    marketData.forEach(({ name, data, openPrice }) => {
      if (data && openPrice !== undefined) {
        data.forEach((point) => {
          //  const time = format(new Date(point.date), "HH:mm");
          const time = point.date
          const returnPercent = ((point.close - openPrice) / openPrice) * 100;

          if (!timeMap.has(time)) {
            timeMap.set(time, { time } as ChartDataPoint);
          }

          const existingPoint = timeMap.get(time)!;
          existingPoint[name] = parseFloat(returnPercent.toFixed(2));
        });
      }
    });
  }

  // Convert timeMap to sorted array for chart data
  const chartData = Array.from(timeMap.values()).sort((a, b) =>
    a.time.localeCompare(b.time)
  );

  return { chartData, isLoading, hasError };
};

export default useMarketData;
