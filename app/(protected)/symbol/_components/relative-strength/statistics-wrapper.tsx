"use client";

import { Candle } from "@/lib/types/basic-types";
import { FullFMPProfile, Quote } from "@/lib/types/fmp-types";

import ReturnDistribution from "./returns-distribution";
import Beta from "../statistics/beta";

export interface StatisticsWrapperProps {
  quote: Quote;
  profile: FullFMPProfile;
  candles: Candle[];
  startDate: Date;
}

const StatisticsWrapper: React.FC<StatisticsWrapperProps> = ({
  profile,
  candles,
}) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-3">
        <ReturnDistribution ticker={profile.symbol} candles={candles} />
      </div>
      <div className="col-span-3">
        <Beta ticker={profile.symbol} candles={candles} />
      </div>
    </div>
  );
};

export default StatisticsWrapper;
