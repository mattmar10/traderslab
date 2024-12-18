"use client";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState } from "react";
import OverviewReturns from "./overview-returns";
import SectorSwarmplot from "./swarmplot/sector-swarm";
import OverviewIntradayGDB from "./overview-intraday-gdb";
import { BorderBeam } from "@/components/magicui/border-beam";

const OverviewMainContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "sectorPerformance" | "returns" | "intradayGDB"
  >("sectorPerformance");

  return (
    <Card className="relative w-full h-full flex flex-col">
      <BorderBeam />
      <CardHeader className="flex-none flex flex-row items-center justify-between px-4 lg:px-6 pb-4">
        <div className="flex-shrink">
          <CardTitle className="text-lg lg:text-xl">At A Glance</CardTitle>
          <CardDescription className="text-sm">
            {activeTab === "sectorPerformance"
              ? "Compare the return distribution across sectors"
              : activeTab === "returns"
                ? "Compare the returns across the major markets using representatitive ETFs/Indexes"
                : "Compare intraday global daily breadth across the major markets"}
          </CardDescription>
        </div>
      </CardHeader>
      <div className="flex-1 min-h-0 w-full">
        <Tabs
          defaultValue={activeTab}
          className="h-full flex flex-col px-4 lg:px-6"
          onValueChange={(value) =>
            setActiveTab(
              value as "sectorPerformance" | "returns" | "intradayGDB"
            )
          }
        >
          <TabsList className="flex space-x-2 max-w-fit flex-none">
            <TabsTrigger value="sectorPerformance">
              Sector Distribution
            </TabsTrigger>
            <TabsTrigger value="intradayGDB">Intraday GDB</TabsTrigger>
            <TabsTrigger value="returns">Returns</TabsTrigger>
          </TabsList>
          <div className="flex-1 min-h-0 pt-4 w-full">
            <TabsContent value="sectorPerformance" className="h-full m-0 w-full">
              {activeTab === "sectorPerformance" && (
                <div className="h-full w-full">
                  <SectorSwarmplot market={"sp500"} />
                </div>
              )}
            </TabsContent>
            <TabsContent value="returns" className="h-full m-0 w-full">
              {activeTab === "returns" && (
                <div className="h-full w-full">
                  <OverviewReturns />
                </div>
              )}
            </TabsContent>
            <TabsContent value="intradayGDB" className="h-full m-0 w-full">
              {activeTab === "intradayGDB" && (
                <div className="h-full w-full">
                  <OverviewIntradayGDB />
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </Card>
  );
};

export default OverviewMainContent;
