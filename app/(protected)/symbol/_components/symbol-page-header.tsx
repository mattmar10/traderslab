import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "@/lib/types/basic-types";
import { FullFMPProfile, QuoteElementSchema } from "@/lib/types/fmp-types";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import LogoComponent from "./logo-component";
import { useQuery } from "@tanstack/react-query";

export interface SymbolPageHeaderProps {
  quote: Quote;
  profile: FullFMPProfile;
}

const SymbolPageHeader: React.FC<SymbolPageHeaderProps> = ({
  quote,
  profile,
}) => {
  const key = `/api/quote/${quote.symbol}`;

  const getQuoteApi = async () => {
    try {
      const res = await fetch(key);
      if (!res.ok) {
        throw new Error(`API request failed with status ${res.status}`);
      }
      const parsed = QuoteElementSchema.safeParse(await res.json());
      if (!parsed.success) {
        throw new Error("Unable to parse quote results");
      }
      return parsed.data;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Unknown error occurred"
      );
    }
  };

  const { data, error } = useQuery({
    queryKey: [key],
    queryFn: getQuoteApi,
    refetchInterval: 30000,
    initialData: quote,
  });

  const priceString =
    data && !error
      ? data.price.toFixed(2)
      : `${quote.price.toFixed(2)} (Delayed)`;
  const currentChange = data && !error ? data.change : quote.change;
  const currentChangePercent =
    data && !error ? data.changesPercentage : quote.changesPercentage;
  const isPositiveChange = currentChange >= 0;

  return (
    <Card className="w-full  bg-background border-none shadow-none">
      <CardContent className="pt-6 pb-4 pl-0 pr-0 flex justify-between">
        <div className="flex items-start gap-2">
          <LogoComponent ticker={profile.symbol} />

          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">
                  {quote.name || quote.symbol}
                </h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{quote.symbol}</span>
                  <span>•</span>
                  <span>{quote.exchange}</span>
                </div>
              </div>
            </div>
          </div>
          {profile.sector && (
            <Badge className="p-2" variant={"secondary"}>
              {profile.sector}
            </Badge>
          )}
          {profile.industry && (
            <Badge className="p-2" variant={"secondary"}>
              {profile.industry}
            </Badge>
          )}
        </div>
        <div className="mt-4">
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold">${priceString}</span>
            <div
              className={`flex items-center gap-1 text-lg ${
                isPositiveChange ? "text-traderslabblue" : "text-red-500"
              }`}
            >
              {isPositiveChange ? (
                <ArrowUpIcon className="h-5 w-5" />
              ) : (
                <ArrowDownIcon className="h-5 w-5" />
              )}
              <span>${Math.abs(currentChange).toFixed(2)}</span>
              <span>({Math.abs(currentChangePercent).toFixed(2)}%)</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SymbolPageHeader;
