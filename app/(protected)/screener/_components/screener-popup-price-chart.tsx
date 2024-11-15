import CustomizablePriceChart, { CustomizableChartMALine } from "@/components/customizable-price-chart";
import ErrorCard from "@/components/error-card";
import Loading from "@/components/loading";
import { ChartSettings } from "@/components/settings/chart-settings";
import { Candle, QuoteElementSchema } from "@/lib/types/basic-types";
import { FMPHistoricalResultsSchema, isFMPDataLoadingError } from "@/lib/types/fmp-types";
import { formatDateToEST } from "@/lib/utils/epoch-utils";
import { calculateEMA, calculateSMA, isMovingAverageError } from "@/lib/utils/moving-average";
import { useQuery } from "@tanstack/react-query";


export interface ScreenerPriceChartProps {
    ticker: string,
    name: string;
    sector?: string;
    industry?: string;
    isMobile: boolean;
    chartSettings: ChartSettings,
    theme: "light" | "dark"
}

const ScreenerPriceChart: React.FC<ScreenerPriceChartProps> = ({
    ticker,
    name,
    sector,
    industry,
    isMobile,
    chartSettings,
    theme }) => {

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
    const barsKey = `/api/bars/${ticker}?fromDateString=${formatDateToEST(
        startDate
    )}`;

    const getBars = async () => {
        const bars = await fetch(barsKey);
        const parsed = FMPHistoricalResultsSchema.safeParse(await bars.json());
        if (!parsed.success) {
            throw Error("Unable to fetch bars");
        } else {
            return parsed.data.historical.map((h) => {
                const candle: Candle = {
                    date: new Date(h.date).getTime(),
                    dateStr: h.date,
                    open: h.open,
                    high: h.high,
                    low: h.low,
                    close: h.close,
                    volume: h.volume,
                };
                return candle;
            });
        }
    };

    const { data: barsData, error: barsError, isLoading: barsIsLoading } = useQuery({
        queryKey: [barsKey, ticker],
        queryFn: getBars,
        refetchOnWindowFocus: false,
    });

    const quoteKey = `/api/quote/${ticker}`;
    const getQuoteApi = async () => {
        const res = await fetch(quoteKey);
        const parsed = QuoteElementSchema.safeParse(await res.json());
        if (!parsed.success) {
            return "Unable to parse quote results";
        } else {
            return parsed.data;
        }
    };

    const {
        data: quoteData,
    } = useQuery({
        queryKey: [quoteKey, ticker],
        queryFn: getQuoteApi,
        refetchInterval: 30000,
    });

    if (barsIsLoading) {
        return <Loading />
    }

    if (
        barsError ||
        !barsData ||

        isFMPDataLoadingError(quoteData)
    ) {
        return <ErrorCard errorMessage={`Unable to load data for ${ticker}`} />;
    }




    const filteredCandles = barsData.filter((d) => d.date >= startDate.getTime());

    if (quoteData && !isFMPDataLoadingError(quoteData)) {
        filteredCandles[filteredCandles.length - 1].close = Number(
            quoteData.price.toFixed(2)
        );

        if (quoteData.open) {
            filteredCandles[filteredCandles.length - 1].open = Number(
                quoteData.open.toFixed(2)
            );
        }

        filteredCandles[filteredCandles.length - 1].high = Number(
            quoteData.dayHigh.toFixed(2)
        );
        filteredCandles[filteredCandles.length - 1].low = Number(
            quoteData.dayLow.toFixed(2)
        );
    }

    const sortedTickerData = barsData.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const priceMovingAverages: CustomizableChartMALine[] = chartSettings.priceMovingAverages
        .reduce<CustomizableChartMALine[]>((acc, ma) => {
            const timeseries =
                ma.type === "SMA"
                    ? calculateSMA(sortedTickerData, ma.period)
                    : calculateEMA(sortedTickerData, ma.period);

            if (isMovingAverageError(timeseries)) {
                console.error(`Error calculating ${ma.type} ${ma.period}`);
                return acc;
            }

            acc.push({
                period: ma.period,
                type: ma.type,
                color: ma.color,
                timeseries: timeseries.timeseries.filter(
                    (t) => new Date(t.time).getTime() > startDate.getTime()
                ),
            });

            return acc;
        }, []);

    let volumeMovingAverage: CustomizableChartMALine | undefined;
    if (chartSettings.volumeMA.enabled) {
        const volumeMA =
            chartSettings.volumeMA.type === "SMA"
                ? calculateSMA(
                    sortedTickerData,
                    chartSettings.volumeMA.period,
                    (c) => c.volume
                )
                : calculateEMA(
                    sortedTickerData,
                    chartSettings.volumeMA.period,
                    (c) => c.volume
                );

        if (!isMovingAverageError(volumeMA)) {
            volumeMovingAverage = {
                period: chartSettings.volumeMA.period,
                type: chartSettings.volumeMA.type,
                color: chartSettings.volumeMA.color,
                timeseries: volumeMA.timeseries.filter(
                    (t) => new Date(t.time).getTime() > startDate.getTime()
                ),
            };
        }
    }

    return (
        <div className="">
            <div className="flex items-end justify-between mb-2 z-50">
                <div className="flex space-x-1 items-end">
                    <div
                        className={`text-2xl font-extrabold leading-none tracking-tight text-foreground/90 md:text-3xl lg:text-4xl overflow-x-truncate `}
                    >
                        {ticker}
                        <span className="ml-3 font-thin">{name}</span>
                    </div>
                </div>

                {!isMobile && (
                    <div className="flex space-x-2">
                        <div className="flex justify-between items-center mb-2">
                            {sector && (
                                <div className="bg-foreground/10  py-1 px-2 rounded-md text-sm font-medium">
                                    {sector}
                                </div>
                            )}
                        </div>
                        {industry && (
                            <div className="flex justify-between items-center mb-2">
                                <div className="bg-foreground/10  py-1 px-2 rounded-md text-sm font-medium">
                                    {industry}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <CustomizablePriceChart
                className="h-[38rem]"
                candles={sortedTickerData}
                volumeMovingAverage={volumeMovingAverage}
                priceMovingAverages={priceMovingAverages}
                showVolume={chartSettings.volumeMA !== undefined}
                ticker={ticker}
                earningsDates={[]}
                chartSettings={chartSettings}
                theme={theme}
            />
        </div>
    )
}

export default ScreenerPriceChart
