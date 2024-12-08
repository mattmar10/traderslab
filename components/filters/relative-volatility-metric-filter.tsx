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
    const [period, setPeriod] = useState<number | undefined>(
        filterValue?.period ?? 15
    );
    const [shortEma, setShortEma] = useState<number | undefined>(
        filterValue?.shortEma ?? 3
    );
    const [longEma, setLongEma] = useState<number | undefined>(
        filterValue?.longEma ?? 15
    );
    const [range, setRange] = useState<[number, number] | undefined>(
        filterValue?.range ?? [0, 100]
    );

    const [validationErrors, setValidationErrors] = useState({
        period: false,
        shortEma: false,
        longEma: false,
    });

    // Validate the fields
    const validate = () => {
        const periodValid =
            period !== undefined &&
            Number.isInteger(period) &&
            period >= (longEma ?? 0);

        const shortEmaValid =
            shortEma !== undefined && Number.isInteger(shortEma) && shortEma > 0;

        const longEmaValid =
            longEma !== undefined &&
            Number.isInteger(longEma) &&
            longEma > 0 &&
            (shortEma === undefined || longEma > shortEma);

        setValidationErrors({
            period: !periodValid,
            shortEma: !shortEmaValid,
            longEma: !longEmaValid,
        });

        return periodValid && shortEmaValid && longEmaValid;
    };

    // Update the parent with the new filter
    const handleChange = () => {
        if (validate()) {
            handleFilterChange("relativeVolatilityMetricFilter", {
                period,
                shortEma,
                longEma,
                range,
            });
        }
    };

    // Revalidate whenever the fields change
    useEffect(() => {
        handleChange();
    }, [period, shortEma, longEma, range]);

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
                    Lookback Period
                </label>
                <Input
                    type="number"
                    value={period ?? ""}
                    onChange={(e) => handleIntegerInput(e.target.value, setPeriod)}
                    placeholder="Default: 15"
                    style={{ width: INPUT_WIDTH }}
                    className={validationErrors.period ? "border-red-500" : ""}
                />
                {validationErrors.period && (
                    <span className="text-xs text-red-500 mt-1">
                        Must be an integer ≥ Long EMA
                    </span>
                )}
            </div>

            <div className="flex flex-col">
                <label className="text-sm mb-3 font-semibold text-foreground/70">
                    Short EMA
                </label>
                <Input
                    type="number"
                    value={shortEma ?? ""}
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
                    value={longEma ?? ""}
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
