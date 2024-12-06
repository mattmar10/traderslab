"use client";
import {
    EtfHoldingWithStatsWithRankWithWeight,
    EtfScreenerSortConfig,
    ScreenerRanges,
} from "@/lib/types/screener-types";
import { Column, mobileColumns } from "./screener-table-columns";
import { useIsMobile } from "@/hooks/use-mobile";
import {
    calculateColorFromPercentage,
    calculateColorFromPercentageInverted,
} from "@/lib/utils/table-utils";
import { Fira_Code } from "next/font/google";
import { ChartSettings } from "@/components/settings/chart-settings";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
import { useRouter } from "next/navigation";
import ScreenerMiniChartWrapper from "./screener-result-minichart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const firaCode = Fira_Code({
    subsets: ["latin"],
    weight: ["300", "400", "500", "700"],
});

export interface EtfScreenerResultsTableProps {
    ticker: string
    etfs: EtfHoldingWithStatsWithRankWithWeight[];
    sortConfig: EtfScreenerSortConfig;
    ranges: ScreenerRanges;
    columns: Column[];
    theme: "light" | "dark";
    chartSettings: ChartSettings;
}

const EtfScreenerResultsTable: React.FC<EtfScreenerResultsTableProps> = ({
    ticker,
    etfs: stocks,
    ranges,
    columns,
    theme,
    chartSettings,
}) => {
    const router = useRouter();
    const isMobile = useIsMobile();

    const handleClick = (symbol: string) => {
        router.push(`/symbol/${symbol}`);
    };

    const columnsToUse = isMobile ? mobileColumns : columns;

    const currentDate = new Date();
    const startDate = new Date(
        currentDate.getFullYear() - 2,
        currentDate.getMonth(),
        currentDate.getDate(),
        currentDate.getHours(),
        currentDate.getMinutes(),
        currentDate.getSeconds(),
        currentDate.getMilliseconds()
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">All Holdings of {ticker}</CardTitle>
                <CardDescription>Sorted by Percentage Weight</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="w-full pt-0 px-4 lg:px-0">
                    <div className="relative overflow-x-auto overflow-y-auto ">
                        <table className="w-full">
                            <thead className="sticky top-0 z-20 ">
                                <tr
                                    className="text-sm "
                                    style={{ boxShadow: "0 0px 0.5px 1px gray" }}
                                >
                                    {columnsToUse.map((column) => (
                                        <th
                                            key={column.key}
                                            className={`py-1 px-2`}
                                            style={{
                                                minWidth: column.minWidth, // Apply minWidth
                                                maxWidth: column.maxWidth, // Apply maxWidth
                                            }}
                                        >
                                            <div
                                                className={`pl-1 flex w-full items-center whitespace-nowrap py-2 ${column.alignment === "left"
                                                    ? "justify-start"
                                                    : column.alignment === "right"
                                                        ? "justify-end"
                                                        : "justify-center"
                                                    }`}
                                            >
                                                <span className={`text-${column.alignment}`}>
                                                    {column.label}
                                                </span>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {stocks.map((item) => (
                                    <HoverCard
                                        key={item.profile.symbol}
                                        openDelay={200}
                                        closeDelay={200}
                                    >
                                        <HoverCardTrigger asChild>
                                            <tr
                                                onClick={() => handleClick(item.profile.symbol)}
                                                className="text-sm border-b border-foreground/20 hover:bg-foreground/5 cursor-pointer"
                                            >
                                                {columnsToUse.map((column) => {
                                                    let value;
                                                    let style = {};
                                                    let customContent;

                                                    switch (column.key) {
                                                        case "weightPercentage":
                                                            value = `${item.weightPercentage.toFixed(2)}%`;
                                                            break;
                                                        case "rsRank":
                                                            value = item.rsRank;
                                                            style = {
                                                                background: calculateColorFromPercentageInverted(
                                                                    item.rsRank,
                                                                    ranges.rsRankRange[0],
                                                                    ranges.rsRankRange[1] / 2,
                                                                    ranges.rsRankRange[1]
                                                                ),
                                                            };
                                                            break;
                                                        case "profile.symbol":
                                                            value = item.profile.symbol;
                                                            break;
                                                        case "profile.companyName":
                                                            value = item.profile.companyName;
                                                            break;
                                                        case "sector":
                                                            value = item.profile.sector;
                                                            break;
                                                        case "industry":
                                                            value = item.profile.industry;
                                                            break;
                                                        case "quote.price":
                                                            value = item.quote.price.toFixed(2);
                                                            break;
                                                        case "oneDayReturnPercent":
                                                            value = `${item.oneDayReturnPercent.toFixed(2)}%`;
                                                            style = {
                                                                background: calculateColorFromPercentage(
                                                                    item.oneDayReturnPercent,
                                                                    theme,
                                                                    -4,
                                                                    0,
                                                                    4
                                                                ),
                                                            };
                                                            break;
                                                        case "oneWeekReturnPercent":
                                                            value = `${item.oneWeekReturnPercent.toFixed(2)}%`;
                                                            style = {
                                                                background: calculateColorFromPercentage(
                                                                    item.oneWeekReturnPercent,
                                                                    theme,
                                                                    -10,
                                                                    0,
                                                                    10
                                                                ),
                                                            };
                                                            break;
                                                        case "oneMonthReturnPercent":
                                                            value = `${item.oneMonthReturnPercent.toFixed(2)}%`;
                                                            style = {
                                                                background: calculateColorFromPercentage(
                                                                    item.oneMonthReturnPercent,
                                                                    theme,
                                                                    -10,
                                                                    0,
                                                                    10
                                                                ),
                                                            };
                                                            break;
                                                        case "threeMonthReturnPercent":
                                                            value = `${item.threeMonthReturnPercent.toFixed(2)}%`;
                                                            style = {
                                                                background: calculateColorFromPercentage(
                                                                    item.threeMonthReturnPercent,
                                                                    theme,
                                                                    -15,
                                                                    0,
                                                                    15
                                                                ),
                                                            };
                                                            break;
                                                        case "sixMonthReturnPercent":
                                                            value = `${item.sixMonthReturnPercent.toFixed(2)}%`;
                                                            style = {
                                                                background: calculateColorFromPercentage(
                                                                    item.sixMonthReturnPercent,
                                                                    theme,
                                                                    -20,
                                                                    0,
                                                                    20
                                                                ),
                                                            };
                                                            break;

                                                        case "oneMonthRS":
                                                            value = `${item.relativeStrength.relativeStrengthStats.oneMonth.toFixed(
                                                                2
                                                            )}%`;
                                                            style = {
                                                                background: calculateColorFromPercentage(
                                                                    item.relativeStrength.relativeStrengthStats
                                                                        .oneMonth,
                                                                    theme,
                                                                    0,
                                                                    50,
                                                                    100
                                                                ),
                                                            };
                                                            break;
                                                        case "threeMonthRS":
                                                            value = `${item.relativeStrength.relativeStrengthStats.threeMonth.toFixed(
                                                                2
                                                            )}%`;
                                                            style = {
                                                                background: calculateColorFromPercentage(
                                                                    item.relativeStrength.relativeStrengthStats
                                                                        .threeMonth,
                                                                    theme,
                                                                    0,
                                                                    50,
                                                                    100
                                                                ),
                                                            };
                                                            break;
                                                        case "sixMonthRS":
                                                            value = `${item.relativeStrength.relativeStrengthStats.sixMonth.toFixed(
                                                                2
                                                            )}%`;
                                                            style = {
                                                                background: calculateColorFromPercentage(
                                                                    item.relativeStrength.relativeStrengthStats
                                                                        .sixMonth,
                                                                    theme,
                                                                    0,
                                                                    50,
                                                                    100
                                                                ),
                                                            };
                                                            break;
                                                        case "oneYearRS":
                                                            value = `${item.relativeStrength.relativeStrengthStats.oneYear.toFixed(
                                                                2
                                                            )}%`;
                                                            style = {
                                                                background: calculateColorFromPercentage(
                                                                    item.relativeStrength.relativeStrengthStats
                                                                        .oneYear,
                                                                    theme,
                                                                    0,
                                                                    50,
                                                                    100
                                                                ),
                                                            };
                                                            break;

                                                        case "compositeRS":
                                                            value = `${item.relativeStrength.relativeStrengthStats.composite.toFixed(
                                                                2
                                                            )}%`;
                                                            style = {
                                                                background: calculateColorFromPercentage(
                                                                    item.relativeStrength.relativeStrengthStats
                                                                        .composite,
                                                                    theme,
                                                                    0,
                                                                    50,
                                                                    100
                                                                ),
                                                            };
                                                            break;

                                                        case "percentFromFiftyTwoWeekLow":
                                                            value = `${item.percentFromFiftyTwoWeekLow.toFixed(
                                                                2
                                                            )}%`;
                                                            customContent = (
                                                                <div className="relative border-l border-foreground py-1">
                                                                    <div
                                                                        className="absolute left-0 top-0 bottom-0 bg-foreground/5 "
                                                                        style={{
                                                                            width: `${Math.max(
                                                                                5,
                                                                                Math.min(
                                                                                    Math.log1p(
                                                                                        Math.abs(
                                                                                            item.percentFromFiftyTwoWeekLow
                                                                                        )
                                                                                    ) * 10,
                                                                                    100
                                                                                )
                                                                            )}%`,
                                                                        }}
                                                                    ></div>
                                                                    <span className="relative z-10">{value}</span>
                                                                </div>
                                                            );
                                                            break;
                                                        case "percentFromFiftyTwoWeekHigh":
                                                            value = `${item.percentFromFiftyTwoWeekHigh.toFixed(
                                                                2
                                                            )}%`;
                                                            customContent = (
                                                                <div className="relative border-r border-foreground py-1">
                                                                    <div
                                                                        className="absolute right-0 top-0 bottom-0 bg-foreground/5"
                                                                        style={{
                                                                            width: `${Math.max(
                                                                                5,
                                                                                Math.min(
                                                                                    Math.log1p(
                                                                                        Math.abs(
                                                                                            item.percentFromFiftyTwoWeekHigh
                                                                                        )
                                                                                    ) * 10,
                                                                                    100
                                                                                )
                                                                            )}%`,
                                                                        }}
                                                                    ></div>
                                                                    <span className="relative z-10 pr-2">
                                                                        {value}
                                                                    </span>
                                                                </div>
                                                            );
                                                            break;
                                                        case "nextEarnings":
                                                            value = `${item.quote.earningsAnnouncement
                                                                ? formatEarnings(item.quote.earningsAnnouncement)
                                                                : ""
                                                                }`;
                                                            break;

                                                        case "relativeVolume":
                                                            value = `${item.relativeVolume.toFixed(2)}`;
                                                            break;

                                                        case "breakoutIntensityScore":
                                                            value = `${item.breakoutIntensityScore.toFixed(2)}`;
                                                            style = {
                                                                background: calculateColorFromPercentage(
                                                                    item.breakoutIntensityScore,
                                                                    theme,
                                                                    0,
                                                                    1,
                                                                    10
                                                                ),
                                                            };
                                                            break;
                                                        // Add other cases as needed
                                                        default:
                                                            value = "";
                                                    }

                                                    const isName = column.key === "profile.companyName";

                                                    const nonNumberic =
                                                        column.key === "profile.companyName" ||
                                                        column.key === "sector" ||
                                                        column.key === "industry" ||
                                                        column.key === "profile.symbol";

                                                    const fontClassName = !nonNumberic
                                                        ? firaCode.className
                                                        : "";

                                                    return (
                                                        <td
                                                            key={column.key}
                                                            className={`${fontClassName} py-2 text-${column.alignment
                                                                } px-2 ${isName ? "font-semibold" : ""}`} // Apply alignment from Column
                                                            style={{
                                                                ...style,
                                                                minWidth: column.minWidth, // Apply minWidth
                                                                maxWidth: column.maxWidth, // Apply maxWidth
                                                            }}
                                                        >
                                                            {customContent || value}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        </HoverCardTrigger>
                                        <HoverCardContent className="w-[50vw] p-4 " sideOffset={0}>
                                            <div className="px-2">
                                                <ScreenerMiniChartWrapper
                                                    profile={item.profile}
                                                    relativeStrengthResults={item.relativeStrength}
                                                    chartSettings={chartSettings}
                                                    theme={theme}
                                                    startDate={startDate}
                                                />
                                            </div>
                                        </HoverCardContent>
                                    </HoverCard>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </CardContent>
        </Card>

    );
};

export default EtfScreenerResultsTable;

const formatEarnings = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    const now = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const day = String(date.getDate()).padStart(2, "0");

    // Calculate the difference in days
    const diffTime = Math.abs(date.getTime() - now.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return `${month}/${day}/${year} (${diffDays})`;
};
