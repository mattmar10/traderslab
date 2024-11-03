import React, { Suspense } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Newspaper } from "lucide-react";
import { isFMPDataLoadingError } from "@/lib/types/fmp-types";
import { getGeneralNews, getStockNews } from "@/actions/news/actions";
import HeadlinesCard from "./headlines-card";

async function Headlines() {
    const [generalNews, stockNews] = await Promise.all([getGeneralNews(), getStockNews()]);

    if (isFMPDataLoadingError(generalNews) || isFMPDataLoadingError(stockNews)) {
        return <div>Unable to load data</div>;
    }

    return <HeadlinesCard generalNews={generalNews} stockNews={stockNews} />
}

function LoadingState() {
    return (
        <Card className="w-full h-[30vh] min-h-[300px] max-h-[500px]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 h-1/4">
                <div className="flex flex-col space-y-1">
                    <CardTitle>News Headlines</CardTitle>
                    <CardDescription>Today&apos;s top stories</CardDescription>
                </div>
                <Newspaper className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="h-3/4">
                <div className="h-full flex items-center justify-center">
                    <div className="animate-pulse space-y-4">
                        <div className="h-4 w-48 bg-foreground/20 rounded"></div>
                        <div className="h-4 w-48 bg-foreground/20 rounded"></div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
const HeadlinesServer: React.FC = () => {
    return (
        <Suspense fallback={<LoadingState />}>
            <Headlines />
        </Suspense>
    );
};

export default HeadlinesServer;
