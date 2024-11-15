"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

export interface MarketCapSliderProps {
  header: string;
  minValue: number;
  maxValue: number;
  steps: number;
  initialMinValue?: number;
  initialMaxValue?: number;
  onValueChange?: (value: number[]) => void;
}

const MarketCapSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> &
    MarketCapSliderProps
>(
  (
    {
      className,
      header,
      minValue,
      maxValue,
      steps,
      initialMinValue = minValue,
      initialMaxValue = maxValue,
      onValueChange,
      ...props
    },
    ref
  ) => {
    const [values, setValues] = React.useState<[number, number]>([
      initialMinValue,
      initialMaxValue,
    ]);

    const handleSliderChange = (newValues: number[]) => {
      setValues(newValues as [number, number]);
      onValueChange && onValueChange(newValues);
    };

    function formatMarketCap(number: number): string {
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

    return (
      <div className="space-y-3 mt-6">
        <div className="text-sm font-semibold text-foreground/70">{header}</div>
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
              {formatMarketCap(values[0])}
            </span>
          </div>
          <div className="flex space-x-1 items-center">
            <span className="text-sm text-foreground/70">Max:</span>
            <span className="text-sm font-semibold">
              {formatMarketCap(values[1])}
            </span>
          </div>
        </div>
      </div>
    );
  }
);

MarketCapSlider.displayName = "MarketCapSlider";

export { MarketCapSlider };
