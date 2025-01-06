import PageContainer from "@/components/layout/page-container";
import { Lato } from "next/font/google";

import MarketsSectorsThemesContainer from "./_components/markets-sectors-themes-containter";
import { getSubMarketsSectorsThemesData } from "@/actions/market-data/actions";
import { isFMPDataLoadingError } from "@/lib/types/fmp-types";
import ErrorCard from "@/components/error-card";

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  display: "swap",
});


const SectorsThemesPage: React.FC = async () => {

  const data = await getSubMarketsSectorsThemesData();
  if (isFMPDataLoadingError(data)) {
    return (
      <div>
        <ErrorCard errorMessage={"Unable to load data"} />
      </div>
    );
  }

  return (
    <PageContainer scrollable={false}>
      <div className="space-y-4 mt-2">
        <div className="flex items-center justify-between space-y-2">
          <h2 className={`text-2xl font-bold tracking-tight ${lato.className}`}>
            Themes, Sectors, and Sub Markets
          </h2>
        </div>

        <MarketsSectorsThemesContainer data={data} />
      </div>
    </PageContainer>
  );
};
export default SectorsThemesPage;
