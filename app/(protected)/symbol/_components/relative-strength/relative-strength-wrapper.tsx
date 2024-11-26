"use client"
import { getRelativeStrengthStatsForSymbol } from "@/actions/relative-strength/actions";
import ErrorCard from "@/components/error-card";
import Loading from "@/components/loading";
import { Candle } from "@/lib/types/basic-types";
import { FullFMPProfile, isFMPDataLoadingError, Quote } from "@/lib/types/fmp-types";
import { useQuery } from "@tanstack/react-query";

export interface RelativeStrengthWrapperProps {
    quote: Quote,
    profile: FullFMPProfile
    candles: Candle[]
}

const RelativeStrengthWrapper: React.FC<RelativeStrengthWrapperProps> = ({ quote, profile, candles }) => {

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

    if (rsIsLoading) {
        return <Loading />
    }

    if (rsError || isFMPDataLoadingError(rsData)) {
        return <ErrorCard errorMessage={"Error fetching relative strength"} />
    }


    return (
        <div>{JSON.stringify(rsData)}</div>
    )
}

export default RelativeStrengthWrapper