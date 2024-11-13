"use client"
import { FullFMPProfile, Quote } from "@/lib/types/fmp-types";
import { Candle } from "@/lib/types/basic-types";
import OverviewChart from "./overview-chart";
import KeyStatsCard from "./overview-key-stats";

export interface OverviewPageWrapperProps {
    quote: Quote,
    profile: FullFMPProfile
    candles: Candle[]
}

const OverviewPageWrapper: React.FC<OverviewPageWrapperProps> = ({ quote, profile, candles }) => {




    return (
        <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
                <OverviewChart ticker={profile.symbol} candles={candles} />
            </div>

            <div>
                <KeyStatsCard quote={quote} profile={profile} />
            </div>

        </div>
    )
}

export default OverviewPageWrapper
