import React from "react";
import { Button } from "@/components/ui/button";
import { EtfMarketData } from "@/lib/types/submarkets-sectors-themes-types";
import EtfReturnsRadarChart from "./etf-returns-radar-chart";
import EtfReturnsBarChart from "./etf-returns-barchart";
import { BarChart3, Radar } from "lucide-react";

interface EtfChartSwitcherProps {
    etf: EtfMarketData;
    allEtfs: EtfMarketData[];
}

const EtfChartSwitcher: React.FC<EtfChartSwitcherProps> = ({ etf, allEtfs }) => {
    const [showRadar, setShowRadar] = React.useState(true);

    return (
        <div className="space-y-4 mt-2">
            <div className="flex items-center justify-center space-x-2">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowRadar(false)}
                    className={!showRadar ? "bg-accent" : "hover:bg-accent/50"}
                >
                    <BarChart3 size={16} />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowRadar(true)}
                    className={showRadar ? "bg-accent" : "hover:bg-accent/50"}
                >
                    <Radar size={16} />
                </Button>
            </div>

            <div>
                {showRadar ? (
                    <div>
                        <EtfReturnsRadarChart etf={etf} all={allEtfs} />
                    </div>
                ) : (
                    <div>
                        <EtfReturnsBarChart etf={etf} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default EtfChartSwitcher;