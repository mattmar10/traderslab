"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { DownloadIcon, ClipboardCopyIcon, CheckIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { FaXTwitter } from "react-icons/fa6";
import { SymbolWithStatsWithRank } from "@/lib/types/screener-types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";

interface ExportComponentProps {
  getAllStocks: () => Promise<SymbolWithStatsWithRank[]>;
}

type ExportFormat = "csv" | "tradingview" | "clipboard" | "twitter";

const ExportComponent: React.FC<ExportComponentProps> = ({ getAllStocks }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("csv");
  const [isOpen, setIsOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const allStocks = await getAllStocks();
      if (exportFormat === "clipboard") {
        await copyToClipboard(allStocks);
      } else if (exportFormat === "twitter") {
        shareToTwitter(allStocks.slice(0, 20));
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
          description: `Data exported to ${
            exportFormat === "clipboard"
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
  const convertToCSV = (stocks: SymbolWithStatsWithRank[]) => {
    const headers = [
      "Symbol",
      "Company Name",
      "Industry",
      "RS Rank",
      "Price",
      "1D %",
      "1W %",
      "1M %",
      "3M %",
      "6M %",
      "% from 52W Low",
      "% from 52W High",
    ];
    const rows = stocks.map((stock) => [
      stock.profile.symbol,
      stock.profile.companyName,
      stock.profile.industry,
      stock.rsRank,
      stock.quote.price,
      stock.oneDayReturnPercent,
      stock.oneWeekReturnPercent,
      stock.oneMonthReturnPercent,
      stock.threeMonthReturnPercent,
      stock.sixMonthReturnPercent,
      stock.percentFromFiftyTwoWeekLow,
      stock.percentFromFiftyTwoWeekHigh,
    ]);
    return [headers, ...rows].map((row) => row.join(",")).join("\n");
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

  const shareToTwitter = (stocks: SymbolWithStatsWithRank[]) => {
    const symbols = stocks
      .map((stock) => `$${stock.profile.symbol}`)
      .join(", ");
    const tagline = "Check out these top performing stocks:";
    const tweetText = `${tagline}\n\n${symbols}\n\n`;
    const url = "https://ptmmapp.com";
    const hashtags = "ptmm,stocks,investing";

    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      tweetText
    )}&hashtags=${hashtags}`; //&url=${encodeURIComponent(url)}

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
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="tradingview">TradingView</SelectItem>
              <SelectItem value="clipboard">
                Copy Tickers to Clipboard
              </SelectItem>
              <SelectItem value="twitter">
                <div className="flex space-x-1 items-center">
                  <div>Share on</div>
                  <FaXTwitter className="mr-2 h-4 w-4" />
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
            ) : exportFormat === "clipboard" ? (
              <>
                {isCopied ? (
                  <CheckIcon className="mr-2 h-4 w-4" />
                ) : (
                  <ClipboardCopyIcon className="mr-2 h-4 w-4" />
                )}
                {isCopied ? "Copied!" : "Copy to Clipboard"}
              </>
            ) : exportFormat === "twitter" ? (
              <>
                <FaXTwitter className="mr-2 h-4 w-4" />
                Share on X
              </>
            ) : (
              `Export to ${exportFormat.toUpperCase()}`
            )}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ExportComponent;
