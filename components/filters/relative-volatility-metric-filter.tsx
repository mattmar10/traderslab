"use client";
import { Input } from "../ui/input";
import { useState, useEffect } from "react";
import { SliderRangeFilter } from "./slider-filter";
import { FilterCriteria } from "@/lib/types/screener-types";

type RelativeVolatilityMetricFilterType = FilterCriteria["relativeVolatilityMetricFilter"];

export interface RelativeVolatilityMetricFilterProps {
    filterValue: RelativeVolatilityMetricFilterType;
    handleFilterChange: (key: keyof FilterCriteria, value: any) => void;
}

const INPUT_WIDTH = "7.5rem";

const RelativeVolatiltyMetricFilter: React.FC<RelativeVolatilityMetricFilterProps> = ({
    filterValue,
    handleFilterChange,
}) => {

    const [shortLookback, setShortEma] = useState<number | undefined>(
        filterValue?.shortLookback ?? 3
    );
    const [longLookback, setLongEma] = useState<number | undefined>(
        filterValue?.longLookback ?? 15
    );
    const [range, setRange] = useState<[number, number] | undefined>(
        filterValue?.range ?? [0, 100]
    );

    const [validationErrors, setValidationErrors] = useState({
        shortEma: false,
        longEma: false,
    });

    // Validate the fields
    const validate = () => {

        const shortEmaValid =
            shortLookback !== undefined && Number.isInteger(shortLookback) && shortLookback > 0;

        const longEmaValid =
            longLookback !== undefined &&
            Number.isInteger(longLookback) &&
            longLookback > 0 &&
            (shortLookback === undefined || longLookback > shortLookback);

        setValidationErrors({
            shortEma: !shortEmaValid,
            longEma: !longEmaValid,
        });

        return shortEmaValid && longEmaValid;
    };

    // Update the parent with the new filter
    const handleChange = () => {
        if (validate()) {
            handleFilterChange("relativeVolatilityMetricFilter", {
                shortLookback: shortLookback,
                longLookback: longLookback,
                range,
            });
        }
    };

    // Revalidate whenever the fields change
    useEffect(() => {
        handleChange();
    }, [shortLookback, longLookback, range]);

    // Helper function to sanitize input to integers only
    const handleIntegerInput = (
        value: string | undefined,
        setter: React.Dispatch<React.SetStateAction<number | undefined>>
    ) => {
        const intValue = Math.floor(Number(value));
        if (Number.isNaN(intValue)) {
            setter(undefined);
        } else {
            setter(intValue);
        }
    };

    return (
        <div className="flex items-start space-x-4 w-full">


            <div className="flex flex-col">
                <label className="text-sm mb-3 font-semibold text-foreground/70">
                    Short EMA
                </label>
                <Input
                    type="number"
                    value={shortLookback ?? ""}
                    onChange={(e) => handleIntegerInput(e.target.value, setShortEma)}
                    placeholder="Default: 3"
                    style={{ width: INPUT_WIDTH }}
                    className={validationErrors.shortEma ? "border-red-500" : ""}
                />
                {validationErrors.shortEma && (
                    <span className="text-xs text-red-500">
                        Must be an integer &gt; 0
                    </span>
                )}
            </div>

            <div className="flex flex-col">
                <label className="text-sm mb-3 font-semibold text-foreground/70">
                    Long EMA
                </label>
                <Input
                    type="number"
                    value={longLookback ?? ""}
                    onChange={(e) => handleIntegerInput(e.target.value, setLongEma)}
                    placeholder="Default: 15"
                    style={{ width: INPUT_WIDTH }}
                    className={validationErrors.longEma ? "border-red-500" : ""}
                />
                {validationErrors.longEma && (
                    <span className="text-xs text-red-500">
                        Must be an integer &gt; Short EMA and &gt; 0
                    </span>
                )}
            </div>

            <div className="flex-1">
                <SliderRangeFilter
                    minValue={0}
                    maxValue={100}
                    initialMinValue={range?.[0] ?? 0}
                    initialMaxValue={range?.[1] ?? 100}
                    steps={1} // Integer-only slider steps
                    onValueChange={(value) => setRange(value as [number, number])}
                    header={"Relative Volatility Metric Range"}
                    className="ml-6 py-0 mt-0"
                    inputWidth="6rem"
                />
            </div>
        </div>
    );
};

export default RelativeVolatiltyMetricFilter;
