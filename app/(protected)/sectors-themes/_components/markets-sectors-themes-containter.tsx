import { getSubMarketsSectorsThemesData } from "@/actions/market-data/actions";
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
    return (
      <Tabs defaultValue="markets">
        <TabsList className="mb-4">
          <TabsTrigger value="markets">Sub Markets</TabsTrigger>
          <TabsTrigger value="sectors">Sectors</TabsTrigger>
          <TabsTrigger value="themes">Themes</TabsTrigger>
        </TabsList>

        <TabsContent value="markets" >
          <MarketSectorsThemesWrapper
            data={data.subMarketData}
            title={"Sub Markets"}
          />
        </TabsContent>
        <TabsContent value="sectors">
          <MarketSectorsThemesWrapper
            data={data.sectorMarketData}
            title="Sectors"
          />
        </TabsContent>
        <TabsContent value="themes">
          <MarketSectorsThemesWrapper
            data={data.themeMarketData}
            title={"Themes"}
          />
        </TabsContent>
      </Tabs>
    );
  }
};

export default MarketsSectorsThemesContainer;
