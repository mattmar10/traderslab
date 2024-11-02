
import { Suspense } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Eye } from "lucide-react";
import { getSettingUpStocks } from "@/actions/screener/actions";
import SettingUpStocksCard from "./setting-up-stocks-card";
import Loading from "@/components/loading";

async function SettingUpStocks() {
    const data = await getSettingUpStocks();

    return <SettingUpStocksCard stocks={data} />
}

function LoadingState() {
    return (
        <Card className="w-full h-[30vh] min-h-[300px] max-h-[500px]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 h-1/4">
                <div className="flex flex-col space-y-1">
                    <CardTitle>Stocks to Watch</CardTitle>
                    <CardDescription>Liquid stocks setting up</CardDescription>
                </div>
                <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="h-3/4">
                <div className="h-full flex items-center justify-center">
                    <Loading />
                </div>
            </CardContent>
        </Card>
    );
}

export const SettingUpStocksServer: React.FC = () => {
    return (
        <Suspense fallback={<LoadingState />}>
            <SettingUpStocks />
        </Suspense>
    );
};


