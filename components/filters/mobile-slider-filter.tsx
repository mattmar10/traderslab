"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

export interface MobileSliderRangeFilterProps {
  header: string;
  minValue: number;
  maxValue: number;
  initialMinValue: number;
  initialMaxValue: number;
  steps: number;
  prefix?: string;
  onValueChange?: (value: number[]) => void;
}

const MobileSliderRangeFilter = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> &
    MobileSliderRangeFilterProps
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
      ...props
    },
    ref
  ) => {
    const [values, setValues] = React.useState<[number, number]>([
      initialMinValue,
      initialMaxValue,
    ]);
    const [inputValues, setInputValues] = React.useState<[string, string]>([
      initialMinValue.toFixed(2),
      initialMaxValue.toFixed(2),
    ]);
    const [isValid, setIsValid] = React.useState<[boolean, boolean]>([
      true,
      true,
    ]);

    const handleSliderChange = (newValues: number[]) => {
      setValues(newValues as [number, number]);
      setInputValues([newValues[0].toFixed(2), newValues[1].toFixed(2)]);
      setIsValid([true, true]);
      onValueChange && onValueChange(newValues);
    };

    return (
      <div className="space-y-3 mt-6">
        <div className="text-sm font-semibold text-foreground">{header}</div>{" "}
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
          {" "}
          <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20">
            {" "}
            <SliderPrimitive.Range className="absolute h-full bg-primary" />{" "}
          </SliderPrimitive.Track>{" "}
          <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" />{" "}
          <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" />{" "}
        </SliderPrimitive.Root>{" "}
        <div className="flex justify-between mt-4">
          {" "}
          <div className="flex space-x-1 items-center">
            {" "}
            <span className="text-sm text-foreground/70">Min:</span>{" "}
            <span className="text-sm font-semibold">
              {" "}
              {prefix} {values[0].toFixed(2)}{" "}
            </span>{" "}
          </div>{" "}
          <div className="flex space-x-1 items-center">
            {" "}
            <span className="text-sm text-foreground/70">Max:</span>{" "}
            <span className="text-sm font-semibold">
              {" "}
              {prefix} {values[1].toFixed(2)}{" "}
            </span>{" "}
          </div>{" "}
        </div>{" "}
      </div>
    );
  }
);

MobileSliderRangeFilter.displayName = "MobileSliderRangeFilter";

export { MobileSliderRangeFilter };
