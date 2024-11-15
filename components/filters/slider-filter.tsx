"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import * as SliderPrimitive from "@radix-ui/react-slider";

export interface SliderRangeFilterProps {
  header: string;
  minValue: number;
  maxValue: number;
  initialMinValue: number;
  initialMaxValue: number;
  steps: number;
  prefix?: string;
  onValueChange?: (value: number[] | undefined) => void;
  inputWidth?: string;
  decimalPlaces?: number;
}

const SliderRangeFilter = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> &
  SliderRangeFilterProps
>(
  (
    {
      className,
      header,
      minValue,
      maxValue,
      initialMinValue,
      initialMaxValue,
      steps,
      prefix,
      onValueChange,
      inputWidth = "5.5rem",
      decimalPlaces = 2,
      ...props
    },
    ref
  ) => {
    const formatValue = (value: number) =>
      decimalPlaces === 0 ? value.toFixed(0) : value.toFixed(decimalPlaces);

    // Initialize state considering -Infinity and Infinity
    const [values, setValues] = React.useState<[number, number]>(() => {
      const initMin =
        initialMinValue === -Infinity ? minValue : initialMinValue;
      const initMax = initialMaxValue === Infinity ? maxValue : initialMaxValue;
      return [initMin, initMax];
    });

    const [inputValues, setInputValues] = React.useState<[string, string]>(
      () => [formatValue(values[0]), formatValue(values[1])]
    );

    const [isValid, setIsValid] = React.useState<[boolean, boolean]>([
      true,
      true,
    ]);

    const handleSliderChange = (newValues: number[]) => {
      setValues(newValues as [number, number]);
      setInputValues([formatValue(newValues[0]), formatValue(newValues[1])]);
      setIsValid([true, true]);

      // Check if the slider is at its minimum and maximum values
      if (newValues[0] === minValue && newValues[1] === maxValue) {
        if (onValueChange) {
          onValueChange(undefined); // Clear the filter
        }

      } else {
        if (onValueChange) {
          onValueChange(newValues);
        }
      }
    };

    const handleInputChange =
      (index: 0 | 1) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        const numValue = Number(newValue);

        if (isNaN(numValue)) {
          setIsValid((prev) => {
            const newValid = [...prev];
            newValid[index] = false;
            return newValid as [boolean, boolean];
          });
          return;
        }

        const newInputValues = [...inputValues] as [string, string];
        newInputValues[index] = newValue;
        setInputValues(newInputValues);

        const newIsValid = [...isValid];

        if (index === 0) {
          newIsValid[0] = numValue >= minValue && numValue <= values[1];
        } else {
          newIsValid[1] = numValue <= maxValue && numValue >= values[0];
        }

        setIsValid(newIsValid as [boolean, boolean]);

        if (newIsValid[0] && newIsValid[1]) {
          const newValues = [
            Number(newInputValues[0]),
            Number(newInputValues[1]),
          ] as [number, number];
          setValues(newValues);
          if (onValueChange) {
            onValueChange(newValues);
          }
        }
      };

    const isLargeNumber = (value: number) => value >= 1e6;

    const roundValues = isLargeNumber(Number(inputValues[1]));

    return (
      <div>
        <div className={cn("hidden lg:block space-y-3 mt-4", className)}>
          <div className="text-sm font-semibold text-foreground/70">
            {header}
          </div>
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-3">
              <Input
                type="number"
                value={
                  roundValues
                    ? Number(inputValues[0]).toFixed(0)
                    : inputValues[0]
                }
                onChange={handleInputChange(0)}
                className={`text-sm ${!isValid[0] ? "border-red-500" : ""}`}
                style={{ width: inputWidth }}
              />
              <SliderPrimitive.Root
                ref={ref}
                className={cn(
                  "relative flex w-full touch-none select-none items-center",
                  className
                )}
                value={values}
                step={steps}
                min={minValue}
                max={maxValue}
                onValueChange={handleSliderChange}
                minStepsBetweenThumbs={1}
                {...props}
              >
                <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20">
                  <SliderPrimitive.Range className="absolute h-full bg-primary" />
                </SliderPrimitive.Track>
                <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                  <span className="hidden lg:inline-block absolute top-[-1.5rem] text-xs font-semibold">
                    {isLargeNumber(values[0]) &&
                      formatForLargeNumber(values[0])}
                  </span>
                </SliderPrimitive.Thumb>
                <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                  <span className="hidden lg:inline-block absolute top-[-1.25rem] right-[.5rem] text-xs font-semibold">
                    {isLargeNumber(values[1]) &&
                      formatForLargeNumber(values[1])}
                  </span>
                </SliderPrimitive.Thumb>
              </SliderPrimitive.Root>
              <span className="text-sm text-foreground/70">{prefix}</span>
              <Input
                type="number"
                value={
                  roundValues
                    ? Number(inputValues[1]).toFixed(0)
                    : inputValues[1]
                }
                onChange={handleInputChange(1)}
                className={`text-sm ${!isValid[1] ? "border-red-500" : ""}`}
                style={{ width: inputWidth }}
              />
            </div>
          </div>
        </div>
        <div className="space-y-3 mt-6 lg:hidden">
          <div className="text-sm font-semibold text-foreground/70">
            {header}
          </div>
          <SliderPrimitive.Root
            ref={ref}
            className={cn(
              "relative flex w-full touch-none select-none items-center",
              className
            )}
            value={values}
            step={steps}
            min={minValue}
            max={maxValue}
            onValueChange={handleSliderChange}
            minStepsBetweenThumbs={1}
            {...props}
          >
            <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20">
              <SliderPrimitive.Range className="absolute h-full bg-primary" />
            </SliderPrimitive.Track>
            <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" />
            <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" />
          </SliderPrimitive.Root>
          <div className="flex justify-between mt-4">
            <div className="flex space-x-1 items-center">
              <span className="text-sm text-foreground/70">Min:</span>
              <span className="text-sm font-semibold">
                {formatForLargeNumber(Number(inputValues[0]))}
              </span>
            </div>
            <div className="flex space-x-1 items-center">
              <span className="text-sm text-foreground/70">Max:</span>
              <span className="text-sm font-semibold">
                {formatForLargeNumber(Number(inputValues[1]))}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

SliderRangeFilter.displayName = "SliderRangeFilter";

export { SliderRangeFilter };

function formatForLargeNumber(number: number): string {
  if (!number) return "0";

  if (number >= 1e12) {
    return (number / 1e12).toFixed(1) + "T";
  } else if (number >= 1e9) {
    return (number / 1e9).toFixed(1) + "B";
  } else if (number >= 1e6) {
    return (number / 1e6).toFixed(1) + "M";
  } else if (number >= 1e3) {
    return (number / 1e3).toFixed(1) + "K";
  } else {
    return number.toString();
  }
}
