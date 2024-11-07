"use client"
import FiftyTwoWeekHighsLowsLineTV from "@/components/ptmm-dashboard/high-lows-line-tv";
import McclellanOscillatorTV from "@/components/ptmm-dashboard/mcclellan-oscillator-tv";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MarketBreadthResponse } from "@/lib/types/market-breadth-types";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";


export interface CombinedHighsLowsMcClellanProps {
    overview: MarketBreadthResponse;

}
type TabOption = "mcclellan" | "highs-lows"
const CombinedHighsLowsMcClellan: React.FC<CombinedHighsLowsMcClellanProps> = ({
    overview }) => {
    const [activeTab, setActiveTab] = useState<TabOption>("mcclellan");
    return (
        <div className="col-span-1">
            <Card>
                <CardContent className="py-3 px-3">
                    <Tabs defaultValue={activeTab} onValueChange={(value) => setActiveTab(value as TabOption)}>
                        <TabsList className="flex space-x-2 max-w-fit">
                            <TabsTrigger value="mcclellan">McClellan </TabsTrigger>
                            <TabsTrigger value="highs-lows">Highs/Lows</TabsTrigger>
                        </TabsList>

                        <TabsContent value="mcclellan">
                            {activeTab === "mcclellan" && <McclellanOscillatorTV
                                mcClellanOscillator={
                                    overview.marketBreadthOverview.mcClellanOscillator
                                }
                            />}
                        </TabsContent>
                        <TabsContent value="highs-lows">
                            {activeTab === "highs-lows" && <FiftyTwoWeekHighsLowsLineTV
                                highsLowsLine={
                                    overview.marketBreadthOverview.fiftyTwoWeekHighsLowsLine
                                }
                            />}
                        </TabsContent>

                    </Tabs>
                </CardContent>
            </Card>
        </div>)
}

export default CombinedHighsLowsMcClellan