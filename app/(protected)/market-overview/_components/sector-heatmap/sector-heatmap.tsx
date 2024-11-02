import React, { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TableIcon } from "lucide-react";
import { getBreadthOvervewSnapshot } from "@/actions/market-data/actions";

import { isFMPDataLoadingError } from "@/lib/types/fmp-types";
import SectorHeatmapCard from "./sector-heatmap-card";

async function SectorHeatmap() {
  const snapshot = await getBreadthOvervewSnapshot();

  if (isFMPDataLoadingError(snapshot)) {
    return <div>Error fetching Sector Data</div>;
  }

  return <SectorHeatmapCard snapshot={snapshot} />;
}

function LoadingState() {
  const skeletonRows = Array(11).fill(null);
  return (
    <Card className="w-full h-full min-h-[625px] max-h-[40vh]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex flex-col space-y-1">
          <CardTitle>Sector Heatmap</CardTitle>
          <CardDescription>Sector Comparison</CardDescription>
        </div>
        <TableIcon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="w-full max-w-3xl">
          <div className="grid grid-cols-4 gap-4 px-4 py-2 border-b">
            <div className="col-span-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
            </div>
            <div className="text-right">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
            </div>
            <div className="text-right">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
            </div>
          </div>

          {/* Skeleton Rows */}
          {skeletonRows.map((_, index) => (
            <div
              key={index}
              className="grid grid-cols-4 gap-4 px-4 py-2 border-b"
            >
              <div className="flex items-center col-span-2 w-full">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
              </div>

              <div className="flex items-center text-right w-full">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
              </div>

              <div className="flex items-center w-full">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
const SectorHeatmapServer: React.FC = () => {
  return (
    <Suspense fallback={<LoadingState />}>
      <SectorHeatmap />
    </Suspense>
  );
};

export default SectorHeatmapServer;
