import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { FullFMPProfile, Quote } from "@/lib/types/fmp-types"

function formatNumber(num: number, style: "decimal" | "currency" | "percent" = "decimal", minimumFractionDigits = 2) {
    if (style === "currency") {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            notation: "compact",
            maximumFractionDigits: 2,
        }).format(num)
    }

    if (style === "percent") {
        return new Intl.NumberFormat("en-US", {
            style: "percent",
            minimumFractionDigits,
            maximumFractionDigits: 2,
        }).format(num / 100)
    }

    return new Intl.NumberFormat("en-US", {
        minimumFractionDigits,
        maximumFractionDigits: 2,
    }).format(num)
}

function formatDate(timestamp: number) {
    return new Date(timestamp).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    })
}

export default function KeyStatsCard({ quote, profile }: { quote: Quote, profile: FullFMPProfile }) {
    const currentPrice = quote.price
    const dayRangePercent = ((currentPrice - quote.dayLow) / (quote.dayHigh - quote.dayLow)) * 100
    const yearRangePercent = ((currentPrice - quote.yearLow) / (quote.yearHigh - quote.yearLow)) * 100

    return (
        <Card className="w-full ">
            <CardHeader>
                <CardTitle className="text-lg">Key Statistics</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 h-[22.8rem]">
                <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between text-sm">
                            <div className="text-muted-foreground">1-day range</div>
                            <div className="flex gap-2">
                                <span>${formatNumber(quote.dayLow)}</span>
                                <span>-</span>
                                <span>${formatNumber(quote.dayHigh)}</span>
                            </div>
                        </div>
                        <div className="relative h-1.5 w-full rounded-full bg-muted">
                            <div
                                className="absolute h-full rounded-full bg-primary"
                                style={{ width: `${dayRangePercent}%` }}
                            />
                            <div
                                className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/4 rounded-full border-2 border-primary bg-background"
                                style={{ left: `${dayRangePercent}%` }}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">52-week range</span>
                            <div className="flex gap-2">
                                <span>${formatNumber(quote.yearLow)}</span>
                                <span>-</span>
                                <span>${formatNumber(quote.yearHigh)}</span>
                            </div>
                        </div>
                        <div className="relative h-1.5 w-full rounded-full bg-muted">
                            <div
                                className="absolute h-full rounded-full bg-primary"
                                style={{ width: `${yearRangePercent}%` }}
                            />
                            <div
                                className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/4 rounded-full border-2 border-primary bg-background"
                                style={{ left: `${yearRangePercent}%` }}
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Market cap</span>
                        <span className="font-medium">{quote.marketCap ? formatNumber(quote.marketCap, "currency") : "N/A"}</span>
                    </div>
                    <Separator />

                    <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Beta</span>
                        <span className="font-medium">{profile.beta ? `${formatNumber(profile.beta)}` : "N/A"}</span>
                    </div>
                    <Separator />

                    <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">EPS</span>
                        <span className="font-medium">{quote.eps ? `${formatNumber(quote.eps)}` : "N/A"}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">P/E ratio</span>
                        <span className="font-medium">{quote.pe ? `${formatNumber(quote.pe)}x` : "N/A"}</span>
                    </div>
                    <Separator />

                    <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Next Earnings Date</span>
                        <span className="font-medium">
                            {quote.earningsAnnouncement ? formatDate(new Date(quote.earningsAnnouncement).getTime()) : "N/A"}
                        </span>
                    </div>
                    <Separator />

                    <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Volume</span>
                        <div className="flex items-center gap-2">
                            <span className="font-medium">{formatNumber(quote.volume)}</span>
                            <span className="text-xs text-muted-foreground">
                                Avg: {formatNumber(quote.avgVolume)}
                            </span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

