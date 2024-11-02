import React, { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  EconomicEvent,
  EconomicEventArray,
  EconomicEventSchema,
  FMPDataLoadingError,
  isFMPDataLoadingError,
} from "@/lib/types/fmp-types";
import { formatDateToEST } from "@/lib/utils/epoch-utils";
import EconcomicCalenderCard from "./economic-calendar-card";
import { CalendarIcon } from "lucide-react";
import { z } from "zod"; // Import Zod if not already

async function EconomicCalendar() {
  const events = await getEconomicCalendar();

  if (isFMPDataLoadingError(events)) {
    return <div>Unable to load data</div>;
  }

  return <EconcomicCalenderCard events={events} />;
}

function LoadingState() {
  const skeletonRows = Array(6).fill(null);

  return (
    <Card className="w-full h-[400px]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex flex-col space-y-1">
          <CardTitle>Economic Calendar</CardTitle>
          <CardDescription>Upcoming Market Events</CardDescription>
        </div>
        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="w-full max-w-3xl">
          {/* Header Row */}
          <div className="grid grid-cols-3 gap-4 px-4 py-2 border-b text-sm font-medium text-gray-500">
            <div>Date</div>
            <div>Event</div>
            <div>Impact</div>
          </div>

          {/* Skeleton Rows */}
          {skeletonRows.map((_, index) => (
            <div
              key={index}
              className="grid grid-cols-3 gap-4 px-4 py-3 border-b"
            >
              {/* Date */}
              <div className="flex items-center">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
              </div>

              {/* Event - Making this wider to accommodate longer event names */}
              <div className="flex items-center">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-48"></div>
              </div>

              {/* Impact - Adding a circular skeleton for the impact dot */}
              <div className="flex items-center gap-2">
                <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 w-3 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
const EconomicCalendarServer: React.FC = () => {
  return (
    <Suspense fallback={<LoadingState />}>
      <EconomicCalendar />
    </Suspense>
  );
};

export default EconomicCalendarServer;

export async function getEconomicCalendar(
  currencyFilter: string = "USD"
): Promise<EconomicEventArray | FMPDataLoadingError> {
  "use server";
  if (!process.env.FINANCIAL_MODELING_PREP_API || !process.env.FMP_API_KEY) {
    return "FMP URL and key must be specified";
  }

  const today = new Date();
  const oneWeekLater = new Date();
  oneWeekLater.setDate(today.getDate() + 7);

  const fromDate = formatDateToEST(today);
  const toDate = formatDateToEST(oneWeekLater);

  const url = `${process.env.FINANCIAL_MODELING_PREP_API}/economic_calendar?from=${fromDate}&to=${toDate}&apikey=${process.env.FMP_API_KEY}`;

  try {
    const response = await fetch(url, { next: { revalidate: 300 } }); // 5 minutes revalidation

    if (!response.ok) {
      const message = `Error fetching economic calendar`;
      console.error(message);
      return message;
    }
    const data: unknown[] = await response.json(); // Type the response as unknown[]

    // Filter valid entries by validating each individually and keeping the successful ones
    const validatedData = data
      .map((item: unknown) => EconomicEventSchema.safeParse(item)) // Safe parse each item
      .filter(
        (
          result
        ): result is z.SafeParseReturnType<unknown, EconomicEvent> & {
          success: true;
        } => result.success
      ) // Filter successful results
      .map((result) => result.data); // Extract data from successful results

    if (validatedData.length === 0) {
      console.error("No valid data after filtering");
      return "No valid data after filtering";
    }

    // Filter data based on currency
    const filteredData = validatedData.filter(
      (event) => event.currency === currencyFilter
    );

    // Sort filtered data by date in ascending order
    const sortedData = filteredData.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });

    return sortedData;
  } catch (error) {
    console.error("Unable to fetch economic calendar", error);
    return "Unable to fetch economic calendar";
  }
}
