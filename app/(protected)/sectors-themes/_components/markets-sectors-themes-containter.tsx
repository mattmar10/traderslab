import { getFullProfiles, getSubMarketsSectorsThemesData } from "@/actions/market-data/actions";
import ErrorCard from "@/components/error-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { isFMPDataLoadingError } from "@/lib/types/fmp-types";
import MarketSectorsThemesWrapper from "./market-sectors-themes-wrapper";

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
      await Promise.all(
        [
          getFullProfiles(data.subMarketData.map(s => s.ticker)),
          getFullProfiles(data.sectorMarketData.map(s => s.ticker)),
          getFullProfiles(data.themeMarketData.map(s => s.ticker))
        ])


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
