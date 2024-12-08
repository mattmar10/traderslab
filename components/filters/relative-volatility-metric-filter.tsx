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

    // Function to update the parent with the new filter
    const handleChange = () => {
        handleFilterChange("relativeVolatilityMetricFilter", {
            period,
            shortEma,
            longEma,
            range,
        });
    };

    // Update filter whenever any of the fields change
    useEffect(() => {
        handleChange();
    }, [period, shortEma, longEma, range]);

    return (

        <div className="flex items-start space-x-4  w-full">
            <div className="flex flex-col">
                <label className="text-sm mb-3 font-semibold text-foreground/70">
                    Lookback Period
                </label>
                <Input
                    type="number"
                    value={period ?? ""}
                    onChange={(e) => setPeriod(Number(e.target.value))}
                    placeholder="Default: 15"
                    style={{ width: INPUT_WIDTH }}
                />
            </div>

            <div className="flex flex-col">
                <label className="text-sm mb-3 font-semibold text-foreground/70">
                    Short EMA
                </label>
                <Input
                    type="number"
                    value={shortEma ?? ""}
                    onChange={(e) => setShortEma(Number(e.target.value))}
                    placeholder="Default: 3"
                    style={{ width: INPUT_WIDTH }}
                />
            </div>

            <div className="flex flex-col">
                <label className="text-sm mb-3 font-semibold text-foreground/70">
                    Long EMA
                </label>
                <Input
                    type="number"
                    value={longEma ?? ""}
                    onChange={(e) => setLongEma(Number(e.target.value))}
                    placeholder="Default: 15"
                    style={{ width: INPUT_WIDTH }}
                />
            </div>

            <div className="flex-1">
                <SliderRangeFilter
                    minValue={0}
                    maxValue={100}
                    initialMinValue={range?.[0] ?? 0}
                    initialMaxValue={range?.[1] ?? 100}
                    steps={0.01}
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
