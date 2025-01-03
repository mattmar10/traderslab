import {
  getFullProfiles,
  getSubMarketsSectorsThemesData,
} from "@/actions/market-data/actions";
import ErrorCard from "@/components/error-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FMPDataLoadingError,
  FMPHistoricalResultsSchema,
  isFMPDataLoadingError,
} from "@/lib/types/fmp-types";
import MarketSectorsThemesWrapper from "./market-sectors-themes-wrapper";
import { Candle } from "@/lib/types/basic-types";
import { fetchWithRetries } from "@/app/api/utils";
import { dateSringToMillisSinceEpochInET } from "@/lib/utils/epoch-utils";

const MarketsSectorsThemesContainer: React.FC = async () => {
  const data = await getSubMarketsSectorsThemesData();

  if (isFMPDataLoadingError(data)) {
    return (
      <div>
        <ErrorCard errorMessage={"Unable to load data"} />
      </div>
    );
  } else {
    const allTickers = [
      "RSP", // Add RSP since it's needed
      ...data.sectorMarketData.map((s) => s.ticker),
      ...data.subMarketData.map((s) => s.ticker),
      ...data.themeMarketData.map((t) => t.ticker),
    ];

    const [subMarketProfiles, sectorsProfiles, themesProfiles, allPriceData] =
      await Promise.all([
        getFullProfiles(data.subMarketData.map((s) => s.ticker)),
        getFullProfiles(data.sectorMarketData.map((s) => s.ticker)),
        getFullProfiles(data.themeMarketData.map((s) => s.ticker)),
        Promise.all(allTickers.map((t) => getPriceBars(t))),
      ]);

    const priceData: Record<string, Candle[]> = {};
    allTickers.forEach((ticker, index) => {
      const data = allPriceData[index];
      if (!isFMPDataLoadingError(data)) {
        const sortedCandles = [...data].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        priceData[ticker] = sortedCandles;
      }
    });

    const themePriceData: Record<string, Candle[]> = {
      RSP: priceData["RSP"], // Include RSP in each
      ...Object.fromEntries(
        data.themeMarketData
          .map((t) => t.ticker)
          .filter((ticker) => ticker in priceData)
          .map((ticker) => [ticker, priceData[ticker]])
      ),
    };

    const sectorPriceData: Record<string, Candle[]> = {
      RSP: priceData["RSP"],
      ...Object.fromEntries(
        data.sectorMarketData
          .map((s) => s.ticker)
          .filter((ticker) => ticker in priceData)
          .map((ticker) => [ticker, priceData[ticker]])
      ),
    };

    const marketPriceData: Record<string, Candle[]> = {
      RSP: priceData["RSP"],
      ...Object.fromEntries(
        data.subMarketData
          .map((s) => s.ticker)
          .filter((ticker) => ticker in priceData)
          .map((ticker) => [ticker, priceData[ticker]])
      ),
    };

    return (
      <Tabs defaultValue="themes">
        <TabsList className="mb-4">
          <TabsTrigger value="themes">Themes</TabsTrigger>
          <TabsTrigger value="sectors">Sectors</TabsTrigger>
          <TabsTrigger value="markets">Sub Markets</TabsTrigger>
        </TabsList>

        <TabsContent value="themes">
          <MarketSectorsThemesWrapper
            data={data.themeMarketData}
            profiles={themesProfiles}
            title={"Themes"}
            candlesData={themePriceData}
          />
        </TabsContent>

        <TabsContent value="sectors">
          <MarketSectorsThemesWrapper
            data={data.sectorMarketData}
            profiles={sectorsProfiles}
            title="Sectors"
            candlesData={sectorPriceData}
          />
        </TabsContent>

        <TabsContent value="markets">
          <MarketSectorsThemesWrapper
            data={data.subMarketData}
            profiles={subMarketProfiles}
            title={"Sub Markets"}
            candlesData={marketPriceData}
          />
        </TabsContent>
      </Tabs>
    );
  }
};

export default MarketsSectorsThemesContainer;

export async function getPriceBars(
  ticker: string,
  fromDateString: string | undefined = undefined,
  toDateString: string | undefined = undefined
): Promise<FMPDataLoadingError | Candle[]> {
  if (!process.env.FINANCIAL_MODELING_PREP_API || !process.env.FMP_API_KEY) {
    return Promise.resolve("FMP URL and key must be specified");
  }
  let url = `${process.env.FINANCIAL_MODELING_PREP_API}/historical-price-full/${ticker}?apikey=${process.env.FMP_API_KEY}`;

  if (fromDateString) {
    url = `${url}&from=${fromDateString}`;
  }

  if (toDateString) {
    url = `${url}&to=${toDateString}`;
  }

  try {
    const response = await fetchWithRetries(
      url,
      { next: { revalidate: 500 } },
      1
    );

    const parsed = FMPHistoricalResultsSchema.safeParse(response);

    if (!parsed.success) {
      console.error(parsed.error);
      return "Unable to parse candles";
    } else {
      return parsed.data.historical.map((h) => {
        const candle: Candle = {
          date: dateSringToMillisSinceEpochInET(h.date),
          dateStr: h.date,
          open: h.open,
          high: h.high,
          low: h.low,
          close: h.close,
          volume: h.volume,
        };
        return candle;
      });
    }
  } catch (error) {
    console.error(error);
    const dataError: FMPDataLoadingError = `Unable to fetch price bars`;
    return dataError;
  }
}
