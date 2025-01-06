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
    const [subMarketProfiles, sectorsProfiles, themesProfiles] =
      await Promise.all([
        getFullProfiles(data.subMarketData.map((s) => s.ticker)),
        getFullProfiles(data.sectorMarketData.map((s) => s.ticker)),
        getFullProfiles(data.themeMarketData.map((s) => s.ticker)),
      ]);

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
          />
        </TabsContent>

        <TabsContent value="sectors">
          <MarketSectorsThemesWrapper
            data={data.sectorMarketData}
            profiles={sectorsProfiles}
            title="Sectors"
          />
        </TabsContent>

        <TabsContent value="markets">
          <MarketSectorsThemesWrapper
            data={data.subMarketData}
            profiles={subMarketProfiles}
            title={"Sub Markets"}
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
