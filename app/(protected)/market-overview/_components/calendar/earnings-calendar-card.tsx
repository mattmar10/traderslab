"use client";

import { CalendarIcon, SunriseIcon, MoonIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FMPEarningsDate } from "@/lib/types/fmp-types";

export interface EarningsCalendarProps {
  earnings: FMPEarningsDate[];
}

const EarningsCalendarCard: React.FC<EarningsCalendarProps> = ({
  earnings = [],
}: EarningsCalendarProps) => {
  return (
    <Card className="w-full h-[385px]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex flex-col space-y-1">
          <CardTitle className="text-xl">Earnings Calendar</CardTitle>
          <CardDescription>Upcoming Earnings Reports</CardDescription>
        </div>
        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] w-full">
          {earnings.length > 0 ? (
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead className="w-[100px]">Date</TableHead>
                  <TableHead className="w-[40px]">Time</TableHead>
                  <TableHead className="w-[80px]">Symbol</TableHead>
                  <TableHead className="text-right">Est. EPS</TableHead>
                  <TableHead className="text-right">Est. Rev.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {earnings.map((earning) => (
                  <TableRow key={`${earning.date}-${earning.symbol}`}>
                    <TableCell className="font-medium">
                      {formatDate(earning.date)}
                    </TableCell>
                    <TableCell>
                      {earning.time === "bmo" ? (
                        <SunriseIcon className="h-4 w-4" />
                      ) : (
                        <MoonIcon className="h-4 w-4" />
                      )}
                    </TableCell>
                    <TableCell>{earning.symbol}</TableCell>
                    <TableCell className="text-right">
                      {formatNumber(earning.epsEstimated)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatNumber(earning.revenueEstimated, true)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">No upcoming earnings</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default EarningsCalendarCard;

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatNumber(
  value: number | null,
  isRevenue: boolean = false
): string {
  if (value === null) return "N/A";
  if (isRevenue) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  }
  return value.toFixed(2);
}
