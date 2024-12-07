
import { Suspense } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Eye } from "lucide-react";
import Loading from "@/components/loading";
import { getUpgradesAndDowngrades } from "@/actions/news/actions";
import UpgradesAndDowngrades from "./upgrades-downgrades-card";
import { isFMPDataLoadingError } from "@/lib/types/fmp-types";
import ErrorCard from "@/components/error-card";

async function UpgradesDownGrades() {
    const data = await getUpgradesAndDowngrades();


    if (isFMPDataLoadingError(data)) {
        return <ErrorCard errorMessage={"Unable to load upgrades and downgrades"} />
    }

    return <UpgradesAndDowngrades grades={data} />
}

function LoadingState() {
    return (
        <Card className="w-full h-[30vh] min-h-[300px] max-h-[500px]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 h-1/4">
                <div className="flex flex-col space-y-1">
                    <CardTitle className="text-xl">Upgrades and DownGrades</CardTitle>
                    <CardDescription>Changes in Stock Grades</CardDescription>
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

export const UpgradesDownGradesServer: React.FC = () => {
    return (
        <Suspense fallback={<LoadingState />}>
            <UpgradesDownGrades />
        </Suspense>
    );
};


