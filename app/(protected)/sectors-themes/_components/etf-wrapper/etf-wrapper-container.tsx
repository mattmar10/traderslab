import { getFullProfile } from "@/actions/market-data/actions";
import ErrorCard from "@/components/error-card";
import { isFMPDataLoadingError } from "@/lib/types/fmp-types"
import { Lato } from "next/font/google";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ClientOverviewPriceChart from "@/components/price-chart/client-overview-price-chart";
import SettingUp from "./setting-up";
import Leading from "./leading";


const lato = Lato({
    subsets: ["latin"],
    weight: ["400", "700", "900"],
    display: "swap",
});


export interface EtfContainerProps {
    ticker: string
}

const EtfContainer: React.FC<EtfContainerProps> = async ({ ticker }) => {

    const data = await getFullProfile(ticker);

    if (isFMPDataLoadingError(data)) {
        return (
            <div>
                <ErrorCard errorMessage={`Unable to load data for ${ticker}`} />
            </div>
        );
    }

    return (
        <>
            <div className="mb-4 flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className={`text-2xl font-bold tracking-tight ${lato.className}`}>
                        {data[0].companyName}
                    </h2>
                </div>

                <div>
                    <ClientOverviewPriceChart ticker={ticker} />
                </div>
                <div className="text-foreground p-3 rounded-lg bg-secondary text-sm">
                    {data[0].description}
                </div>
            </div>

            <Tabs defaultValue="leading">
                <TabsList className="mt-4">

                    <TabsTrigger value="leading">Leading</TabsTrigger>
                    <TabsTrigger value="settingUp">Setting Up</TabsTrigger>
                    <TabsTrigger value="holdings">All Holdings</TabsTrigger>
                </TabsList>

                <TabsContent value="holdings">
                    <div>holdings</div>
                </TabsContent>

                <TabsContent value="leading">
                    <div>
                        <Leading ticker={ticker} />
                    </div>
                </TabsContent>

                <TabsContent value="settingUp" className="">
                    <div>
                        <SettingUp ticker={ticker} />
                    </div>
                </TabsContent>
            </Tabs>
        </>
    );
}

export default EtfContainer