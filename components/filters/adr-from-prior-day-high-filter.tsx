"use client";
import { Input } from "../ui/input";
import { useState, useEffect } from "react";
import { SliderRangeFilter } from "./slider-filter";
import { FilterCriteria } from "@/lib/types/screener-types";

type AdrFromPreviousHighType = FilterCriteria["adrFromPreviousHigh"];

export interface AdrFromPreviousHighFilterProps {
    filterValue: AdrFromPreviousHighType;
    handleFilterChange: (key: keyof FilterCriteria, value: any) => void;
}

const INPUT_WIDTH = "7.5rem";

const AdrFromPreviousHighFilter: React.FC<AdrFromPreviousHighFilterProps> = ({ filterValue, handleFilterChange }) => {

    const [validationErrors, setValidationErrors] = useState({
        lookback: false,
    });

    const [lookback, setLookback] = useState<number | undefined>(
        filterValue?.lookback ?? 20
    );

    const [range, setRange] = useState<[number, number] | undefined>(
        filterValue?.range ?? [-25, 25]
    );


    useEffect(() => {
        handleChange();
    }, [lookback, range]);

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

    const validate = () => {

        const lookbackValid =
            lookback !== undefined && Number.isInteger(lookback);

        setValidationErrors({
            lookback: !lookbackValid
        });

        return lookbackValid
    };

    const handleChange = () => {
        if (validate()) {
            handleFilterChange("adrFromPreviousHigh", {
                lookback: lookback,
                range,
            });
        }
    };

    return (
        <div className="flex items-start space-x-4 w-full">
            <div className="flex flex-col">
                <label className="text-sm mb-3 font-semibold text-foreground/70">
                    Lookback
                </label>
                <Input
                    type="number"
                    value={lookback ?? ""}
                    onChange={(e) => handleIntegerInput(e.target.value, setLookback)}
                    placeholder="Default: 20"
                    style={{ width: INPUT_WIDTH }}
                    className={validationErrors.lookback ? "border-red-500" : ""}
                />
                {validationErrors.lookback && (
                    <span className="text-xs text-red-500">
                        Must be an integer &gt; 0
                    </span>
                )}
            </div>


            <div className="flex-1">
                <SliderRangeFilter
                    minValue={-25}
                    maxValue={25}
                    initialMinValue={range?.[0] ?? -25}
                    initialMaxValue={range?.[1] ?? 25}
                    steps={.01} // Integer-only slider steps
                    onValueChange={(value) => setRange(value as [number, number])}
                    header={"ADR From Prior High Range"}
                    className="ml-6 py-0 mt-0"
                    inputWidth="6rem"
                />
            </div>
        </div>
    );
}

export default AdrFromPreviousHighFilter