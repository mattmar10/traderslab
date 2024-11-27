"use client"

import ErrorCard from "@/components/error-card";
import Loading from "@/components/loading";
import { Candle } from "@/lib/types/basic-types";
import { FMPHistoricalResultsSchema, FullFMPProfile, isFMPDataLoadingError, Quote } from "@/lib/types/fmp-types";
import { formatDateToEST } from "@/lib/utils/epoch-utils";
import { useQuery } from "@tanstack/react-query";
import RelativeStrengthBarChart from "./relative-strength-bar-chart";
import RSLineChart from "./relative-strength-multitimeframe-chart";
import { getRelativeStrengthStatsForSymbol } from "@/actions/relativer-strength/actions";

export interface RelativeStrengthWrapperProps {
    quote: Quote,
    profile: FullFMPProfile
    candles: Candle[]
    startDate: Date
}

const RelativeStrengthWrapper: React.FC<RelativeStrengthWrapperProps> = ({ profile, candles, startDate }) => {

    const { data: rsData, error: rsError, isLoading: rsIsLoading } = useQuery({
        queryKey: [`relative-strength-stats`, profile.symbol],
        queryFn: async () => {
            try {
                const result = await getRelativeStrengthStatsForSymbol(profile.symbol);
                return result;
            } catch (error) {
                console.error("Error fetching relative strength stats:", error);
                throw error;
            }
        },
        refetchInterval: 120000,
        staleTime: 60000
    });

    const barsKey = `/api/bars/RSP?fromDateString=${formatDateToEST(
        startDate
    )}`;

    const getBars = async () => {
        const bars = await fetch(barsKey);
        const parsed = FMPHistoricalResultsSchema.safeParse(await bars.json());
        if (!parsed.success) {
            throw Error("Unable to fetch bars");
        } else {
            return parsed.data.historical.map((h) => {
                const candle: Candle = {
                    date: new Date(h.date).getTime(),
                    dateStr: h.date,
                    open: h.open,
                    high: h.high,
                    low: h.low,
                    close: h.close,
                    volume: h.volume,
                };
                return candle;
            });
        }
    };

    const { data: rspBars, isLoading: barsIsLoading, error: barsError } = useQuery({
        queryKey: [barsKey],
        queryFn: getBars,
    });

    if (rsIsLoading || barsIsLoading) {
        return <Loading />
    }

    if (rsError || isFMPDataLoadingError(rsData) || !rsData) {
        return <ErrorCard errorMessage={"Error fetching relative strength"} />
    }

    if (barsError || !rspBars) {
        return <ErrorCard errorMessage={"Error fetching relative strength benchmark"} />
    }


    return (
        <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
                <RSLineChart symbol={profile.symbol} symbolCandles={candles} benchmark="RSP" benchmarkCandles={rspBars} />

            </div>

            <div>
                <RelativeStrengthBarChart rsData={rsData} />
            </div>

        </div>
    )
}

export default RelativeStrengthWrapper