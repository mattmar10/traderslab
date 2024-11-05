
"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import OverviewReturns from "./overview-returns";

const OverviewMainContent: React.FC = () => {

    const [activeTab, setActiveTab] = useState<"sectorPerformance" | "returns" | "intradayGDB">("sectorPerformance");
    const [containerHeight, setContainerHeight] = useState("625px");

    useEffect(() => {
        const updateHeight = () => {
            const vh = window.innerHeight;
            setContainerHeight(vh < 800 ? `max(500px, ${Math.min(80, vh * 0.8)}px)` : "min(800px, 80vh)");
        };
        updateHeight();
        window.addEventListener("resize", updateHeight);
        return () => window.removeEventListener("resize", updateHeight);
    }, []);

    return (
        <Card className="w-full relative" style={{ height: containerHeight }}>
            <CardHeader className="flex-none flex flex-row items-center justify-between px-4 lg:px-6 pb-4">
                <div className="flex-shrink">
                    <CardTitle className="text-lg lg:text-xl">At A Glance</CardTitle>
                    <CardDescription className="text-sm">
                        {activeTab === "sectorPerformance"
                            ? "High level overview of returns across sectors"
                            : activeTab === "returns"
                                ? "Return statistics and insights"
                                : "Intraday GDB analysis"}
                    </CardDescription>
                </div>
            </CardHeader>

            <div className="px-4 lg:px-6 ">
                <Tabs defaultValue={activeTab} onValueChange={(value) => setActiveTab(value as "sectorPerformance" | "returns" | "intradayGDB")}>
                    <TabsList className="flex space-x-2 max-w-fit">
                        <TabsTrigger value="returns">Returns</TabsTrigger>
                        <TabsTrigger value="sectorPerformance">Sector Performance</TabsTrigger>
                        <TabsTrigger value="intradayGDB">Intraday GDB</TabsTrigger>
                    </TabsList>

                    <TabsContent value="sectorPerformance">
                        {activeTab === "sectorPerformance" && <p>Sector Performance Content</p>}
                    </TabsContent>
                    <TabsContent value="returns">
                        {activeTab === "returns" && <OverviewReturns />}
                    </TabsContent>
                    <TabsContent value="intradayGDB">
                        {activeTab === "intradayGDB" && <p>Intraday GDB Content</p>}
                    </TabsContent>
                </Tabs>
            </div>
        </Card>)
}

export default OverviewMainContent