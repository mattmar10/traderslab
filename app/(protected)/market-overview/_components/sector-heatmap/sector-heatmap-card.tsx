"use client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Table,
} from "@/components/ui/table";
import { CurrentDayMarketBreadthSnapshot } from "@/lib/types/market-breadth-types";
import { calculateColorFromPercentage } from "@/lib/utils/table-utils";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { TableIcon } from "lucide-react";
import { useTheme } from "next-themes";

export interface SectorHeatmapCardProps {
  snapshot: CurrentDayMarketBreadthSnapshot;
}

const SectorHeatmapCard: React.FC<SectorHeatmapCardProps> = ({ snapshot }) => {
  const { theme } = useTheme();
  const resolvedTheme = (theme as "light" | "dark") || "light";

  return (
    <Card className="w-full h-full min-h-[625px] max-h-[50vh]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex flex-col space-y-1">
          <CardTitle>Sector Heatmap</CardTitle>
        </div>
        <TableIcon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-full w-full">
          {snapshot.sectorsOverviews.length > 0 ? (
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead className="">Sector</TableHead>
                  <TableHead className="text-right"> Return</TableHead>
                  <TableHead className="text-right">GDB</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {snapshot.sectorsOverviews
                  .sort((a, b) => {
                    const nameA = sectorDisplayNames[a.sector] || a.sector;
                    const nameB = sectorDisplayNames[b.sector] || b.sector;
                    return nameA.localeCompare(nameB);
                  })
                  .map((overview) => {
                    const medRet = overview.overview.returns?.median || 0;
                    const medianReturnBg = calculateColorFromPercentage(
                      medRet,
                      resolvedTheme,
                      -3,
                      0,
                      3
                    );

                    const gdb =
                      overview.overview.globalDailyBreadthPercentileRank || 0;
                    const gdbBg = calculateColorFromPercentage(
                      gdb,
                      resolvedTheme,
                      -100,
                      0,
                      100
                    );

                    return (
                      <TableRow
                        key={`${overview.sector}-${overview.overview.totalStockCount}`}
                      >
                        <TableCell className="font-medium text-sm">
                          {sectorDisplayNames[overview.sector]}
                        </TableCell>
                        <TableCell
                          className="text-right text-sm"
                          style={{ backgroundColor: medianReturnBg }}
                        >
                          {overview.overview.returns?.median.toFixed(2)}%
                        </TableCell>
                        <TableCell
                          className="text-right text-sm"
                          style={{ backgroundColor: gdbBg }}
                        >
                          {overview.overview.globalDailyBreadthPercentileRank?.toFixed(
                            2
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">No data</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default SectorHeatmapCard;

const sectorDisplayNames: Record<string, string> = {
  "basic-materials": "Basic Materials",
  "communication-services": "Comm. Services",
  "consumer-cyclical": "Consumer Cyclical",
  "consumer-defensive": "Consumer Defensive",
  energy: "Energy",
  "financial-services": "Financial Services",
  healthcare: "Healthcare",
  industrials: "Industrials",
  "real-estate": "Real Estate",
  technology: "Technology",
  utilities: "Utilities",
};
