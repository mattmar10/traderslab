import React from "react";
import { SliderRangeFilter } from "./slider-filter";
import { FilterCriteria } from "@/lib/types/screener-types";

interface TechnicalFiltersProps {
    filters: FilterCriteria;
    handleFilterChange: (key: keyof FilterCriteria, value: any) => void;
    ranges: {
        oneDayAbsoluteChangeRange: [number, number];
        adrPercentRange: [number, number];
        volatilityContractionScoreRange: [number, number];
        fiftyTwoWeekLowPercentageRange: [number, number];
        fiftyTwoWeekHighPercentageRange: [number, number];
        twentyVolumeSMARange: [number, number];
        // Add other ranges as needed
    };
}

const TechnicalFilters: React.FC<TechnicalFiltersProps> = ({
    filters,
    handleFilterChange,
    ranges,
}) => {
    const handleRangeChange = (
        key: keyof FilterCriteria,
        value: number[] | undefined
    ) => {
        if (value === undefined) {
            handleFilterChange(key, undefined);
        } else {
            handleFilterChange(key, value as [number, number]);
        }
    };

    return (
        <div className="mt-4 w-full ">
            <SliderRangeFilter
                minValue={ranges.adrPercentRange[0]}
                maxValue={ranges.adrPercentRange[1]}
                initialMinValue={
                    filters.adrPercentRange
                        ? filters.adrPercentRange[0]
                        : ranges.adrPercentRange[0]
                }
                initialMaxValue={
                    filters.adrPercentRange
                        ? filters.adrPercentRange[1]
                        : ranges.adrPercentRange[1]
                }
                steps={0.1}
                onValueChange={(value) => handleRangeChange("adrPercentRange", value)}
                header={"ADR% Range"}
                className="py-2"
                inputWidth="6rem"
            />

            <SliderRangeFilter
                minValue={1}
                maxValue={100}
                initialMinValue={
                    filters.dailyClosingRangePercentRange
                        ? filters.dailyClosingRangePercentRange[0]
                        : 1
                }
                initialMaxValue={
                    filters.dailyClosingRangePercentRange
                        ? filters.dailyClosingRangePercentRange[1]
                        : 100
                }
                steps={1}
                onValueChange={(value) =>
                    handleRangeChange("dailyClosingRangePercentRange", value)
                }
                header={"Daily Closing Range"}
                className="py-2"
                inputWidth="6rem"
            />

            <SliderRangeFilter
                minValue={ranges.fiftyTwoWeekLowPercentageRange[0]}
                maxValue={ranges.fiftyTwoWeekLowPercentageRange[1]}
                initialMinValue={
                    filters.fiftyTwoWeekLowPercentageRange
                        ? filters.fiftyTwoWeekLowPercentageRange[0]
                        : ranges.fiftyTwoWeekLowPercentageRange[0]
                }
                initialMaxValue={
                    filters.fiftyTwoWeekLowPercentageRange
                        ? filters.fiftyTwoWeekLowPercentageRange[1]
                        : ranges.fiftyTwoWeekLowPercentageRange[1]
                }
                steps={0.01}
                onValueChange={(value) =>
                    handleRangeChange("fiftyTwoWeekLowPercentageRange", value)
                }
                header={"% From 52 Week Low"}
                className="py-2"
                inputWidth="6rem"
            />

            <SliderRangeFilter
                minValue={ranges.fiftyTwoWeekHighPercentageRange[0]}
                maxValue={ranges.fiftyTwoWeekHighPercentageRange[1]}
                initialMinValue={
                    filters.fiftyTwoWeekHighPercentageRange
                        ? filters.fiftyTwoWeekHighPercentageRange[0]
                        : ranges.fiftyTwoWeekHighPercentageRange[0]
                }
                initialMaxValue={
                    filters.fiftyTwoWeekHighPercentageRange
                        ? filters.fiftyTwoWeekHighPercentageRange[1]
                        : ranges.fiftyTwoWeekHighPercentageRange[1]
                }
                steps={0.01}
                onValueChange={(value) =>
                    handleRangeChange("fiftyTwoWeekHighPercentageRange", value)
                }
                header={"% From 52 Week High"}
                className="py-2"
                inputWidth="6rem"
            />
        </div>
    );
};

export default TechnicalFilters;
