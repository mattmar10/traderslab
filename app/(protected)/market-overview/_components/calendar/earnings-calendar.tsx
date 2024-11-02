import React, { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import EarningsCalendarCard from "./earnings-calendar-card";
import { isFMPDataLoadingError } from "@/lib/types/fmp-types";
import { CalendarIcon } from "lucide-react";
import { getEarningsCalendar } from "@/actions/market-data/actions";

async function EarningsCalendar() {
  const events = await getEarningsCalendar();

  if (isFMPDataLoadingError(events)) {
    return <div>Unable to load data</div>;
  }

  return <EarningsCalendarCard earnings={events} />;
}

function LoadingState() {
  const skeletonRows = Array(6).fill(null);

  return (
    <Card className="w-full h-[385px]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex flex-col space-y-1">
          <CardTitle>Earnings Calendar</CardTitle>
          <CardDescription>Upcoming Earnings Reports</CardDescription>
        </div>
        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="w-full max-w-3xl">
          {/* Header Row */}
          <div className="grid grid-cols-5 gap-4 px-4 py-2 border-b text-sm font-medium text-gray-500">
            <div>Date</div>
            <div>Time</div>
            <div>Symbol</div>
            <div>Est. EPS</div>
            <div>Est. Rev.</div>
          </div>

          {/* Skeleton Rows */}
          {skeletonRows.map((_, index) => (
            <div
              key={index}
              className="grid grid-cols-5 gap-4 px-4 py-3 border-b"
            >
              {/* Date */}
              <div className="flex items-center">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
              </div>

              {/* Time */}
              <div className="flex items-center">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-6"></div>
              </div>

              {/* Symbol */}
              <div className="flex items-center">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-14"></div>
              </div>

              {/* Est. EPS */}
              <div className="flex items-center">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-10"></div>
              </div>

              {/* Est. Rev. */}
              <div className="flex items-center">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

const EarningsCalendarServer: React.FC = () => {
  return (
    <div className="col-span-2">
      <Suspense fallback={<LoadingState />}>
        <EarningsCalendar />
      </Suspense>
    </div>
  );
};

export default EarningsCalendarServer;
