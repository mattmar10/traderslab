"use client";

import { useState } from "react";
import { CalendarIcon } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { EconomicEventArray } from "@/lib/types/fmp-types";

export interface EconomicCalendarProps {
  events?: EconomicEventArray;
}

export default function EconomicCalendarCard({
  events = [],
}: EconomicCalendarProps) {
  const [showMedium, setShowMedium] = useState(false);
  const [showHigh, setShowHigh] = useState(true);

  const filteredEvents = events.filter(
    (e) =>
      (showHigh && e.impact === "High") || (showMedium && e.impact === "Medium")
  );

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex flex-col space-y-1">
          <CardTitle className="text-xl">Economic Calendar</CardTitle>
          <CardDescription>Upcoming Market Events</CardDescription>
        </div>
        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="flex-1  overflow-hidden">

        <div className="flex space-x-4 mt-1 mb-2">
          <div className="flex items-center space-x-2">
            <Switch
              id="showHigh"
              checked={showHigh}
              onCheckedChange={setShowHigh}
            />
            <Label htmlFor="showHigh">High Impact</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="showMedium"
              checked={showMedium}
              onCheckedChange={setShowMedium}
            />
            <Label htmlFor="showMedium">Medium Impact</Label>
          </div>
        </div>
        <ScrollArea className="h-full w-full overflow-auto pb-4">
          {filteredEvents.length > 0 ? (
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead className="w-[80px]">Date</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead className="w-[70px]">Impact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.map((event) => (
                  <TableRow key={`${event.date}-${event.event}`}>
                    <TableCell className="font-medium">
                      {formatDate(event.date)}
                    </TableCell>
                    <TableCell>{event.event}</TableCell>
                    <TableCell>
                      <ImpactIndicator impact={event.impact} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">No upcoming events</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function ImpactIndicator({
  impact,
}: {
  impact: "Low" | "Medium" | "High" | "None";
}) {
  const colors = {
    Low: "bg-green-500",
    Medium: "bg-yellow-500",
    High: "bg-red-500",
    None: "bg-gray-500",
  };

  const impactText = impact === "Medium" ? "Med" : impact;

  return (
    <div className="flex items-center">
      <div className={`h-2 w-2 rounded-full ${colors[impact]} mr-2`} />
      {impactText}
    </div>
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
