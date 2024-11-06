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

const OverviewMainContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "sectorPerformance" | "returns" | "intradayGDB"
  >("returns");

  return (
    <Card className="w-full relative h-[60vh] 4xl:h-[50vh]">
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

      <div className="px-4 lg:px-6 ">
        <Tabs
          defaultValue={activeTab}
          onValueChange={(value) =>
            setActiveTab(
              value as "sectorPerformance" | "returns" | "intradayGDB"
            )
          }
        >
          <TabsList className="flex space-x-2 max-w-fit">
            <TabsTrigger value="returns">Returns</TabsTrigger>
            <TabsTrigger value="sectorPerformance">
              Sector Distribution
            </TabsTrigger>
            <TabsTrigger value="intradayGDB">Intraday GDB</TabsTrigger>
          </TabsList>

          <TabsContent value="sectorPerformance">
            {activeTab === "sectorPerformance" && (
              <SectorSwarmplot market={"sp500"} />
            )}
          </TabsContent>
          <TabsContent value="returns">
            {activeTab === "returns" && <OverviewReturns />}
          </TabsContent>
          <TabsContent value="intradayGDB">
            {activeTab === "intradayGDB" && <OverviewIntradayGDB />}
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
};

export default OverviewMainContent;
