import { CurrentDayMarketBreadthSnapshotPoint } from "@/lib/types/market-breadth-types";
import { PTTrendStateModel, DataError } from "@/lib/types/trend-model-types";

import React from "react";
import CircularGauge from "../ui/circular-gauge";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Badge } from "../ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface BreadthCardProps {
  ticker: string;
  name: string;
  description: string;
  data: CurrentDayMarketBreadthSnapshotPoint;
  ptTrendModel: PTTrendStateModel | DataError;
}
const BreadthCard: React.FC<BreadthCardProps> = ({
  name,
  description,
  data,
  ptTrendModel,
}) => {
  const isDataError = (
    model: PTTrendStateModel | DataError
  ): model is DataError => {
    return model && typeof (model as DataError).errorMessage === "string";
  };

  return (
    <Card className="w-full p-3 border border-foreground/10 rounded-md shadow-none group hover:bg-accent">
      <CardHeader className="p-1">
        <div className="flex justify-between items-start">
          {/* Left Section: Name and Description */}
          <div>
            <div className="flex space-x-2 items-center ">
              <div className="text-base font-bold text-foreground/90">
                {name}
              </div>
              {!isDataError(ptTrendModel) && (
                <Badge variant={"outline"} className="text-xs ">
                  {ptTrendModel.trendStateModel}
                </Badge>
              )}
            </div>

            <div className="text-sm text-foreground/50 ">{description}</div>
          </div>

          {/* Right Section: Circular Gauge */}
          <div className="flex items-center">
            <div className="text-center">
              <div className="flex space-x-1 items-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="cursor-default">
                      <CircularGauge
                        size={40}
                        strokeWidth={3}
                        value={data.globalDailyBreadthPercentileRank}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Global Daily Breadth</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-1 py-2 border-t">
        <div className="grid grid-cols-2 gap-x-2 text-sm">
          {/* Left Column (Advances / Declines) */}
          <div>
            <div>
              <span className="font-semibold">Advances/Declines: </span>
              {data.advanceDecline.advances}/{data.advanceDecline.declines}
            </div>
          </div>

          {/* 52-Week Highs/Lows */}
          {data.fiftyTwoWeekHighsLows && (
            <div>
              <div>
                <span className="font-semibold">52 Week Highs/Lows: </span>
                {data.fiftyTwoWeekHighsLows.fiftyTwoWeekHighs}/
                {data.fiftyTwoWeekHighsLows.fiftyTwoWeekLows}
              </div>
            </div>
          )}

          {/* Returns */}
          <div className="col-span-2">
            <div className=" mt-1">
              <span className="font-semibold">Median Return: </span>
              <span>{data.returns?.median}%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BreadthCard;
