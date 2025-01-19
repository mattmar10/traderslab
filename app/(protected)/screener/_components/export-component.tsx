"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { DownloadIcon, ClipboardCopyIcon, CheckIcon, FileTextIcon, BarChartIcon, OrbitIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { FaXTwitter } from "react-icons/fa6";
import {
  ScreenerSortableKeys,
  SymbolWithStatsWithRank,
} from "@/lib/types/screener-types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { Column } from "./screener-table-columns";
import { useRouter } from "next/navigation";

interface ExportComponentProps {
  toExport: SymbolWithStatsWithRank[];
  filterGroupName: string;
  sortAttribute: ScreenerSortableKeys;
  headers: Column[];
}

type ExportFormat = "csv" | "tradingview" | "clipboard" | "rrg" | "twitter";

const ExportComponent: React.FC<ExportComponentProps> = ({
  toExport,
  filterGroupName,
  sortAttribute,
  headers,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("csv");
  const [isOpen, setIsOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const allStocks = toExport;
      if (exportFormat === "clipboard") {
        await copyToClipboard(allStocks);
      } else if (exportFormat === "twitter") {
        shareToTwitter(allStocks.slice(0, 20));
      } else if (exportFormat === "rrg") {
        shareToRRG(allStocks);
      } else {
        let content: string;
        let filename: string;

        if (exportFormat === "csv") {
          content = convertToCSV(allStocks);
          filename = "stocks_export.csv";
        } else {
          content = convertToTradingView(allStocks);
          filename = "PTMM-Export.txt";
        }

        downloadFile(content, filename);
      }
      setIsOpen(false);
      if (exportFormat !== "twitter") {
        toast({
          title: "Export Successful",
          description: `Data exported to ${exportFormat === "clipboard"
            ? "clipboard"
            : exportFormat.toUpperCase()
            }`,
        });
      }
    } catch (error) {
      console.error("Export failed:", error);
      toast({
        title: "Export Failed",
        description: "An error occurred while exporting. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const shareToRRG = (stocks: SymbolWithStatsWithRank[]) => {
    // Take top 100 stocks
    const top100 = stocks.slice(0, 100);
    console.log('Sharing top 100 stocks to RRG:', top100);
    localStorage.setItem("rrgScreenerData", JSON.stringify(top100));
    router.push("/relative-rotation?source=screener");
  };

  const convertToCSV = (stocks: SymbolWithStatsWithRank[]) => {
    const csvHeaders = headers.map((column) => column.label);

    const rows = stocks.map((stock) =>
      headers.map((column) =>
        getValueFromColumn(column, stock).replaceAll(",", "")
      )
    );

    // Combine headers and rows into CSV format
    return [csvHeaders, ...rows].map((row) => row.join(",")).join("\n");
  };
  const convertToTradingView = (stocks: SymbolWithStatsWithRank[]) => {
    return stocks
      .map(
        (stock) => `${stock.profile.exchangeShortName}:${stock.profile.symbol}`
      )
      .join("\n");
  };

  const copyToClipboard = async (stocks: SymbolWithStatsWithRank[]) => {
    const tickers = stocks.map((stock) => stock.profile.symbol).join(", ");
    try {
      await navigator.clipboard.writeText(tickers);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
      throw new Error("Failed to copy to clipboard");
    }
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getSortName = (sortKey: ScreenerSortableKeys): string => {
    const sortKeyMap: { [key in ScreenerSortableKeys]: string } = {
      price: "Price",
      rsRank: "RS Rank",
      rsScore: "RS Score",
      oneDayAbsoluteChange: "1-Day Change",
      oneDayReturnPercent: "1-Day Return",
      oneWeekReturnPercent: "1-Week Return",
      oneMonthReturnPercent: "1-Month Return",
      threeMonthReturnPercent: "3-Month Return",
      sixMonthReturnPercent: "6-Month Return",
      oneYearReturnPercent: "1-Year Return",
      percentFromFiftyTwoWeekHigh: "% From 52-Week High",
      trendMomentum: "Trend Momentum",
      percentFromFiftyTwoWeekLow: "% From 52-Week Low",
      industry: "Industry",
      sector: "Sector",
      breakoutIntensityScore: "Breakout Intensity Score",
    };

    return sortKeyMap[sortKey] || "Unknown Sort Key";
  };

  const shareToTwitter = (stocks: SymbolWithStatsWithRank[]) => {
    const symbols = stocks
      .map((stock) => `$${stock.profile.symbol}`)
      .join(", ");
    const tagline = `${filterGroupName || "Check out these hot stocks"
      } sorted by ${getSortName(sortAttribute)}.`;
    console.log(tagline);

    const tweetText = `${tagline}\n\n${symbols}\n\n By @TradersLab_`;
    //const hashtags = "traderslab,stocks,investing";

    const twitterUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(
      tweetText
    )}`; //&url=${encodeURIComponent(url)}

    window.open(twitterUrl, "_blank");
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          size={"sm"}
          variant={"outline"}
          className="rounded-none text-sm text-foreground/80"
        >
          <DownloadIcon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <h4 className="font-medium">Export Options</h4>
          <Select
            value={exportFormat}
            onValueChange={(value: ExportFormat) => setExportFormat(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">
                <div className="flex items-center">
                  <FileTextIcon className="mr-2 h-4 w-4" />
                  CSV
                </div>
              </SelectItem>
              <SelectItem value="tradingview">
                <div className="flex items-center">
                  <BarChartIcon className="mr-2 h-4 w-4" />
                  TradingView
                </div>
              </SelectItem>
              <SelectItem value="clipboard">
                <div className="flex items-center">
                  <ClipboardCopyIcon className="mr-2 h-4 w-4" />
                  Copy Tickers to Clipboard
                </div>
              </SelectItem>
              <SelectItem value="rrg">
                <div className="flex items-center">
                  <OrbitIcon className="mr-2 h-4 w-4" />
                  View as RRG
                </div>
              </SelectItem>
              <SelectItem value="twitter">
                <div className="flex items-center">
                  <FaXTwitter className="mr-2 h-4 w-4" />
                  Share on X
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full"
          >
            {isExporting ? (
              "Exporting..."
            ) : (
              <>
                {exportFormat === "csv" && (
                  <>
                    <FileTextIcon className="mr-2 h-4 w-4" />
                    Export to CSV
                  </>
                )}
                {exportFormat === "tradingview" && (
                  <>
                    <BarChartIcon className="mr-2 h-4 w-4" />
                    Export to TradingView
                  </>
                )}
                {exportFormat === "clipboard" && (
                  <>
                    {isCopied ? (
                      <CheckIcon className="mr-2 h-4 w-4" />
                    ) : (
                      <ClipboardCopyIcon className="mr-2 h-4 w-4" />
                    )}
                    {isCopied ? "Copied!" : "Copy Tickers to Clipboard"}
                  </>
                )}
                {exportFormat === "rrg" && (
                  <>
                    <OrbitIcon className="mr-2 h-4 w-4" />
                    View as RRG
                  </>
                )}
                {exportFormat === "twitter" && (
                  <>
                    <FaXTwitter className="mr-2 h-4 w-4" />
                    Share on X
                  </>
                )}
              </>
            )}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ExportComponent;

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

function getValueFromColumn(
  column: Column,
  item: SymbolWithStatsWithRank
): string {
  switch (column.key) {
    case "rsRank":
      return item.rsRank.toString();
    case "profile.symbol":
      return item.profile.symbol;
    case "profile.companyName":
      return item.profile.companyName;
    case "sector":
      return item.profile.sector || "";
    case "industry":
      return item.profile.industry || "";
    case "quote.price":
      return item.quote.price.toFixed(2);
    case "oneDayReturnPercent":
      return `${item.oneDayReturnPercent.toFixed(2)}%`;
    case "oneWeekReturnPercent":
      return `${item.oneWeekReturnPercent.toFixed(2)}%`;
    case "oneMonthReturnPercent":
      return `${item.oneMonthReturnPercent.toFixed(2)}%`;
    case "threeMonthReturnPercent":
      return `${item.threeMonthReturnPercent.toFixed(2)}%`;
    case "sixMonthReturnPercent":
      return `${item.sixMonthReturnPercent.toFixed(2)}%`;
    case "oneMonthRS":
      return `${item.relativeStrength.relativeStrengthStats.oneMonth.toFixed(
        2
      )}%`;
    case "threeMonthRS":
      return `${item.relativeStrength.relativeStrengthStats.threeMonth.toFixed(
        2
      )}%`;
    case "sixMonthRS":
      return `${item.relativeStrength.relativeStrengthStats.sixMonth.toFixed(
        2
      )}%`;
    case "oneYearRS":
      return `${item.relativeStrength.relativeStrengthStats.oneYear.toFixed(
        2
      )}%`;
    case "compositeRS":
      return `${item.relativeStrength.relativeStrengthStats.composite.toFixed(
        2
      )}%`;
    case "percentFromFiftyTwoWeekLow":
      return `${item.percentFromFiftyTwoWeekLow.toFixed(2)}%`;
    case "percentFromFiftyTwoWeekHigh":
      return `${item.percentFromFiftyTwoWeekHigh.toFixed(2)}%`;
    case "nextEarnings":
      return item.quote.earningsAnnouncement
        ? formatEarnings(item.quote.earningsAnnouncement)
        : "";
    case "relativeVolume":
      return item.relativeVolume.toFixed(2);
    case "breakoutIntensityScore":
      return item.breakoutIntensityScore.toFixed(2);
    default:
      return "";
  }
}
