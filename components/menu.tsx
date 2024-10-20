"use client";

import Link from "next/link";
import * as React from "react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import {
  CurrentDayMarketBreadthSnapshot,
  CurrentDayMarketBreadthSnapshotSchema,
} from "@/lib/types/market-breadth-types";
import { useQuery } from "react-query";
import BreadthCard from "./nav/breadth-card";
import { AllPTTrendModels } from "@/lib/types/trend-model-types";
import { Button } from "./ui/button";
import { SignedIn } from "@clerk/nextjs";

export default function NavigationMenuDemo() {
  const snapshotKey = `/api/breadth-snapshot`;
  const getSnapshots = async (): Promise<
    CurrentDayMarketBreadthSnapshot | undefined
  > => {
    const res = await fetch(snapshotKey);
    const data = await res.json();
    const parsed = CurrentDayMarketBreadthSnapshotSchema.safeParse(data);
    if (!parsed.success) {
      console.error("Failed to parse snapshot data:", parsed.error);
      return undefined;
    }
    return parsed.data;
  };

  const { data: snapshotsData } = useQuery({
    queryKey: [snapshotKey],
    queryFn: getSnapshots,
    refetchInterval: 60000,
    staleTime: 10000,
  });

  const trendModelsKey = `/api/trend-models/all`;
  const getTrendModels = async (): Promise<AllPTTrendModels | undefined> => {
    const res = await fetch(trendModelsKey);
    const data = await res.json();
    const parsed = AllPTTrendModels.safeParse(data);
    if (!parsed.success) {
      console.error("Failed to parse trend models data:", parsed.error);
      return undefined;
    }
    return parsed.data;
  };

  const { data: trendModelsData } = useQuery({
    queryKey: [trendModelsKey],
    queryFn: getTrendModels,
    refetchInterval: 60000,
    staleTime: 10000,
  });

  const renderBreadthCards = () => {
    if (!snapshotsData || !trendModelsData) return null;

    const cardData = [
      {
        key: "nyse",
        ticker: "^NYA",
        name: "NYSE",
        description: "NYSE Composite Index",
        data: snapshotsData.nyseOverview,
        ptTrendModel: trendModelsData.nyseTrendModel,
        href: "/ptmm/nyse",
      },
      {
        key: "rsp",
        ticker: "RSP",
        name: "S&P 500",
        description: "Equal Weighted S&P 500",
        data: snapshotsData.rspTradingOverview,
        ptTrendModel: trendModelsData.rspTrendModel,
        href: "/ptmm/s&p500",
      },
      {
        key: "ndx",
        ticker: "QQQE",
        name: "NDX100",
        description: "Equal Weighted Nasdaq 100",
        data: snapshotsData.qqqETradingOverview,
        ptTrendModel: trendModelsData.qqqeTrendModel,
        href: "/ptmm/ndx100",
      },
      {
        key: "iwm",
        ticker: "IWM",
        name: "Russell 2000",
        description: "Small Cap Index",
        data: snapshotsData.iwmTradingOverview,
        ptTrendModel: trendModelsData.iwmTrendModel,
        href: "/ptmm/iwm",
      },
    ];

    return cardData.map(
      ({ key, ticker, name, description, data, ptTrendModel, href }) => (
        <li key={key} className="py-2">
          {data && ptTrendModel && (
            <NavigationMenuLink asChild>
              <Link href={href}>
                <BreadthCard
                  ticker={ticker}
                  name={name}
                  description={description}
                  data={data}
                  ptTrendModel={ptTrendModel}
                />
              </Link>
            </NavigationMenuLink>
          )}
        </li>
      )
    );
  };

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <SignedIn>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Breadth</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="p-6  w-[500px] md:w-[500px] lg:w-[500px]">
                {renderBreadthCards()}
              </ul>

              <div className="text-center pb-6">
                <Button>Intraday GDB Chart</Button>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Screener</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className={`p-6  w-[300px]`}>
                <ListItem
                  key={"sectors-themes"}
                  href={"/sectors-themes"}
                  title={"Sectors & Themes"}
                  className="hover:bg-primary/10"
                >
                  Sectors & Themes Description Here
                </ListItem>
                <ListItem
                  key={"screener"}
                  href={"/screener"}
                  title={"Screener"}
                  className="hover:bg-primary/10"
                >
                  Screener Description Here
                </ListItem>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </SignedIn>

        <NavigationMenuItem>
          <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
            <Link href={"/blog"} target="_arya">
              Blog
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground py-4",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});

ListItem.displayName = "ListItem";
