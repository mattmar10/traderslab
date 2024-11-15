

import { Checkbox } from "@/components/ui/checkbox";
import { SliderRangeFilter } from "./slider-filter";
import { FilterCriteria, ScreenerRanges } from "@/lib/types/screener-types";

interface VolumeFiltersProps {
    filters: FilterCriteria;
    handleFilterChange: (key: keyof FilterCriteria, value: any) => void;
    ranges: ScreenerRanges;
}

const VolumeFilters: React.FC<VolumeFiltersProps> = ({
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

    const handleCheckboxChange = (
        key:
            | "aboveAverageVolume"
            | "increasingVolume"
            | "bullishMovingAvgPattern"
            | "bearishMovingAvgPattern",
        value: boolean
    ) => {
        handleFilterChange(key, value ? true : undefined);
    };

    return (
        <div className="mt-4 w-full ">
            <SliderRangeFilter
                minValue={ranges.volumeRange[0]}
                maxValue={ranges.volumeRange[1]}
                initialMinValue={
                    filters.volumeRange ? filters.volumeRange[0] : ranges.volumeRange[0]
                }
                initialMaxValue={
                    filters.volumeRange ? filters.volumeRange[1] : ranges.volumeRange[1]
                }
                steps={1000}
                onValueChange={(value) => handleRangeChange("volumeRange", value)}
                header={"Volume Range"}
                className="py-2"
                inputWidth="9rem"
            />
            <SliderRangeFilter
                minValue={ranges.twentyVolumeSMARange[0]}
                maxValue={ranges.twentyVolumeSMARange[1]}
                initialMinValue={
                    filters.twentyVolumeSMARange
                        ? filters.twentyVolumeSMARange[0]
                        : ranges.twentyVolumeSMARange[0]
                }
                initialMaxValue={
                    filters.twentyVolumeSMARange
                        ? filters.twentyVolumeSMARange[1]
                        : ranges.twentyVolumeSMARange[1]
                }
                steps={1000}
                onValueChange={(value) =>
                    handleRangeChange("twentyVolumeSMARange", value)
                }
                header={"Volume SMA (20 Day)"}
                className="py-2"
                inputWidth="9rem"
            />
            <SliderRangeFilter
                minValue={ranges.volumeContractionScoreRange[0]}
                maxValue={ranges.volumeContractionScoreRange[1]}
                initialMinValue={
                    filters.volumeContractionScoreRange
                        ? filters.volumeContractionScoreRange[0]
                        : ranges.volumeContractionScoreRange[0]
                }
                initialMaxValue={
                    filters.volumeContractionScoreRange
                        ? filters.volumeContractionScoreRange[1]
                        : ranges.volumeContractionScoreRange[1]
                }
                steps={1}
                onValueChange={(value) =>
                    handleFilterChange("volumeContractionScoreRange", value)
                }
                header={"Volume Contraction"}
                className="py-2"
                inputWidth="6rem"
            />

            <div className="mt-6">
                <div className="font-semibold mb-3">Volume Patterns</div>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                        <Checkbox
                            id="aboveAverageVolume"
                            checked={filters.aboveAverageVolume || false}
                            onCheckedChange={(checked) => {
                                handleCheckboxChange("aboveAverageVolume", checked as boolean);
                            }}
                        />
                        <label
                            htmlFor="aboveAverageVolume"
                            className="text-sm font-medium leading-none ml-2 cursor-pointer hover:text-primary transition-colors"
                        >
                            Above Average Volume
                        </label>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                            <Checkbox
                                id="increasingVolume"
                                checked={filters.increasingVolume || false}
                                onCheckedChange={(checked) => {
                                    handleCheckboxChange("increasingVolume", checked as boolean);
                                }}
                            />
                            <label
                                htmlFor="increasingVolume"
                                className="text-sm font-medium leading-none ml-2 cursor-pointer hover:text-primary transition-colors"
                            >
                                Increasing Volume
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VolumeFilters;
