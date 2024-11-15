"use client";
import React, { FC } from "react";

import { RiInformationLine } from "react-icons/ri";

import {
  PTTrendModelSchema,
  PTTrendSecondaryState,
  PTTrendStateStatus,
} from "@/lib/types/fmp-types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Dataset, getTickerForDataset } from "@/lib/types/basic-types";
import { useQuery } from "@tanstack/react-query";

export interface DesktopTrendModelStatusProps {
  dataset: Dataset;
}

const DesktopTrendModelStatus: FC<DesktopTrendModelStatusProps> = ({
  dataset,
}) => {
  const key = `/api/trend-model/${getTickerForDataset(dataset)}`;

  const getTrendModel = async () => {
    const res = await fetch(key);
    const parsed = PTTrendModelSchema.safeParse(await res.json());
    if (!parsed.success) {
      throw new Error("Unable to parse result");
    } else {
      return parsed.data;
    }
  };

  const { data } = useQuery({
    queryKey: [key],
    queryFn: getTrendModel,
    refetchInterval: 60000,
  });

  if (status === "loading") {
    return <div></div>;
  }

  const model: PTTrendStateStatus =
    (data?.trendStateModel as PTTrendStateStatus) || "UNKNOWN";

  return (
    <div className="flex items-start">
      <div className="flex gap-x-1">
        <div className={makePrimaryOutterStyle(model)}>
          <div className="flex items-center text-xs font-semibold p-1">
            {model.toLowerCase().charAt(0).toUpperCase() +
              model.toLowerCase().slice(1)}
          </div>
        </div>
        {makeSecondary(
          (data?.secondaryOpportunity || "NONE") as PTTrendSecondaryState
        )}
      </div>
      <Popover>
        <PopoverTrigger asChild>
          <button className="ml-1 cursor-pointer">
            <RiInformationLine className="text-foreground/60 hover:text-foreground/90" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          side="right"
          align="end"
          className="p-2 bg-background shadow-md rounded-md mt-20"
          style={{ width: "1100px", top: "60%" }}
        >
          <img
            src={
              "https://ptmm-online-assets.s3.us-east-2.amazonaws.com/trend-state-model.png"
            }
            alt="PT Trend Status Model"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DesktopTrendModelStatus;
/*const makeInnerStyle = (status: PTTrendStateStatus) => {
    const baseStyle = `w-2 h-2 rounded-full mr-1.5`; // Reduced size and margin
    const uptrend = `${baseStyle} bg-uptrend/90`;
    const caution = `${baseStyle} bg-caution/90`;
    const warning = `${baseStyle} bg-warning/90`;
    const destructive = `${baseStyle} bg-destructive/90`;
    const blue = `${baseStyle} bg-solarizedblue/90`;

    switch (status) {
        case "UPTREND": return uptrend;
        case "RALLY": return caution;
        case "PULLBACK": return warning;
        case "CORRECTION": return destructive;
        case "UPTREND ATTEMPT": return blue;
        default: return caution;
    }
};
*/
const makePrimaryOutterStyle = (status: PTTrendStateStatus) => {
  const baseStyle =
    "flex items-center justify-center p-1 bg-opacity-10 border rounded shadow-sm"; // Unified base style
  const uptrend = `${baseStyle} bg-uptrend/10 border-uptrend/50 text-uptrend`;
  const caution = `${baseStyle} bg-caution/10 border-caution/50 text-caution`;
  const warning = `${baseStyle} bg-warning/10 border-warning/50 text-warning`;
  const destructive = `${baseStyle} bg-destructive/10 border-destructive/50 text-destructive`;
  const blue = `${baseStyle} bg-solarizedblue/10 border-solarizedblue/50 text-solarizedblue`;
  const hidden = `${baseStyle} bg-transparent border-none text-transparent hidden`;

  switch (status) {
    case "UPTREND":
      return uptrend;
    case "RALLY":
      return caution;
    case "PULLBACK":
      return warning;
    case "CORRECTION":
      return destructive;
    case "UPTREND ATTEMPT":
      return blue;
    default:
      return hidden;
  }
};

const makeSecondary = (secondaryOpp: PTTrendSecondaryState) => {
  if (secondaryOpp === "NONE") {
    return <></>;
  }

  const labelMap: Record<PTTrendSecondaryState, string> = {
    "ST BUYING OPPORTUNITY": "ST Buy",
    "LT BUYING OPPORTUNITY": "LT Buy",
    "SHORTING OPPORTUNITY": "Short Opportunity",
    "TRIMMING OPPORTUNITY": "Trim Opportunity",
    NONE: "NONE",
  };

  const classNameMap: Record<PTTrendSecondaryState, string> = {
    "ST BUYING OPPORTUNITY":
      "flex items-center justify-center p-1 bg-uptrend/10 border border-uptrend/20 text-uptrend rounded",
    "LT BUYING OPPORTUNITY":
      "flex items-center justify-center p-1 bg-uptrend/10 border border-uptrend/20 text-uptrend rounded",
    "SHORTING OPPORTUNITY":
      "flex items-center justify-center p-1 bg-destructive/10 border border-destructive/20 text-destructive rounded",
    "TRIMMING OPPORTUNITY":
      "flex items-center justify-center p-1 bg-warning/10 border border-warning/20 text-warning rounded",
    NONE: "flex items-center justify-center p-1 bg-foreground/5 border border-foreground/10 text-foreground/60 rounded",
  };

  return (
    <div className={`text-xs font-semibold ${classNameMap[secondaryOpp]}`}>
      {labelMap[secondaryOpp]}
    </div>
  );
};
