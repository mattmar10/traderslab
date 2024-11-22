import { calculateColorFromPercentage } from "@/lib/utils/table-utils";
import React from "react";

export interface NameValuePair {
  name: string;
  value: number;
}

export interface CompactStrengthIndicatorProps {
  scores: NameValuePair[];
  theme: "light" | "dark";
}

const CompactStrengthIndicator: React.FC<CompactStrengthIndicatorProps> = ({
  scores,
  theme,
}) => {
  // Get color based on score
  const getColor = (score: number) =>
    calculateColorFromPercentage(score, theme, 0, 50, 100);

  return (
    <div className=" flex items-center gap-1  rounded-md p-1 shadow-sm">
      {scores.map((value, index) => (
        <div key={index} className="flex flex-col items-center">
          <div
            className={`w-6 h-6 rounded  flex items-center justify-center text-xs text-foreground/70`}
            style={{
              background: getColor(value.value),
            }}
          >
            {value.value.toFixed(0)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CompactStrengthIndicator;
