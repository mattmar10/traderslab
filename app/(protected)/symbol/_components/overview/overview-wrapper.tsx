"use client"
import { FullFMPProfile, IncomeStatement, Quote } from "@/lib/types/fmp-types";
import { Candle } from "@/lib/types/basic-types";
import OverviewChart from "./overview-chart";
import KeyStatsCard from "./overview-key-stats";
import { FmpStockNewsList } from "@/lib/types/news-types";
import OverviewNewsCard from "./overview-news-card";
import OverviewFinancialsCard from "./overview-financials-card";

export interface OverviewPageWrapperProps {
    quote: Quote,
    profile: FullFMPProfile
    candles: Candle[]
    news: FmpStockNewsList
    incomeStatement?: IncomeStatement
}

const OverviewPageWrapper: React.FC<OverviewPageWrapperProps> = ({ quote, profile, candles, news, incomeStatement }) => {


    return (
        <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
                <OverviewChart ticker={profile.symbol} candles={candles} />
            </div>

            <div>
                <KeyStatsCard quote={quote} profile={profile} />
            </div>
            {incomeStatement && incomeStatement.length > 0 && <div className="col-span-3">

                <OverviewFinancialsCard incomeStatement={incomeStatement} />

            </div>}
            <div className="col-span-3">
                <OverviewNewsCard news={news} />
            </div>
        </div>
    )
}

export default OverviewPageWrapper
