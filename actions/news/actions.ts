import { FMPDataLoadingError, IncomeStatement, IncomeStatementSchema, StockGrade, StockGradesArraySchema } from "@/lib/types/fmp-types";
import { FmpGeneralNewsList, FmpGeneralNewsListSchema, FmpStockNewsList, FmpStockNewsListSchema } from "@/lib/types/news-types";
import { formatDateToEST } from "@/lib/utils/epoch-utils";

export async function getGeneralNews(): Promise<FmpGeneralNewsList | FMPDataLoadingError> {
    if (!process.env.TRADERS_LAB_API) {
        return Promise.resolve("TRADERS_LAB_API must be specified");
    }
    const url = `${process.env.TRADERS_LAB_API}/news/general-news`;

    try {
        const response = await fetch(url, { next: { revalidate: 0 } });

        if (!response.ok) {
            const message = `Error fetching general news`;
            console.error(message);
            console.error(JSON.stringify(response));
            return message;
        }

        const data = await response.json();
        const parsed = FmpGeneralNewsListSchema.safeParse(data);

        if (parsed.success) {
            return parsed.data;
        } else {
            throw new Error("Schema validation failed: unable to parse data");
        }


        return data;
    } catch (error) {
        const dataError: FMPDataLoadingError = `Unable to fetch news`;
        return dataError;
    }
}

export async function getStockNews(): Promise<FmpStockNewsList | FMPDataLoadingError> {
    if (!process.env.TRADERS_LAB_API) {
        return Promise.resolve("TRADERS_LAB_API must be specified");
    }
    const url = `${process.env.TRADERS_LAB_API}/news/stock-news`;

    try {
        const response = await fetch(url, { next: { revalidate: 0 } });

        if (!response.ok) {
            const message = `Error fetching stock news`;
            console.error(message);
            console.error(JSON.stringify(response));
            return message;
        }

        const data = await response.json();
        const parsed = FmpStockNewsListSchema.safeParse(data);

        if (parsed.success) {
            return parsed.data;
        } else {
            throw new Error("Schema validation failed: unable to parse data");
        }

        return data;
    } catch (error) {
        const dataError: FMPDataLoadingError = `Unable to fetch news`;
        return dataError;
    }
}

export async function getNewsForSymbol(ticker: string): Promise<FmpStockNewsList | FMPDataLoadingError> {
    if (!process.env.FINANCIAL_MODELING_PREP_API || !process.env.FMP_API_KEY) {
        return "FMP URL and key must be specified";
    }

    const today = new Date();
    const oneWeekLater = new Date();
    oneWeekLater.setDate(today.getDate() - 365);

    const toDate = formatDateToEST(today);
    const fromDate = formatDateToEST(oneWeekLater);

    const url = `${process.env.FINANCIAL_MODELING_PREP_API}/stock_news?tickers=${ticker}&from=${fromDate}&to=${toDate}&apikey=${process.env.FMP_API_KEY}`;


    try {
        const response = await fetch(url, { next: { revalidate: 0 } });


        if (!response.ok) {
            const message = `Error fetching stock news`;
            console.error(message);
            console.error(JSON.stringify(response));
            return message;
        }

        const data = await response.json();
        const parsed = FmpStockNewsListSchema.safeParse(data);

        console.log(parsed.error)

        if (parsed.success) {
            return parsed.data;
        } else {
            throw new Error("Schema validation failed: unable to parse data");
        }

    } catch (error) {
        const dataError: FMPDataLoadingError = `Unable to fetch news`;
        return dataError;
    }
}

export async function getIncomeStatementForSymbol(ticker: string, period: "annual" | "quarter"): Promise<IncomeStatement | FMPDataLoadingError> {
    if (!process.env.FINANCIAL_MODELING_PREP_API || !process.env.FMP_API_KEY) {
        return "FMP URL and key must be specified";
    }

    const url = `${process.env.FINANCIAL_MODELING_PREP_API}/income-statement/${ticker}?period=${period}&apikey=${process.env.FMP_API_KEY}`;

    try {
        const response = await fetch(url, { next: { revalidate: 0 } });

        if (!response.ok) {
            const message = `Error fetching stock income statement`;
            console.error(message);
            console.error(JSON.stringify(response));
            return message;
        }

        const data = await response.json();
        const parsed = IncomeStatementSchema.safeParse(data);

        if (parsed.success) {
            return parsed.data;
        } else {
            console.error(parsed.error)
            throw new Error("Schema validation failed: unable to parse incmome statement data");
        }

    } catch (error) {
        const dataError: FMPDataLoadingError = `Unable to fetch income statement data`;
        return dataError;
    }
}

export async function getUpgradesAndDowngrades(): Promise<StockGrade[] | FMPDataLoadingError> {
    if (!process.env.FINANCIAL_MODELING_PREP_API_V4 || !process.env.FMP_API_KEY) {
        return "FMP URL v4 and key must be specified";
    }
    const url = `${process.env.FINANCIAL_MODELING_PREP_API_V4}/upgrades-downgrades-rss-feed?page=0&apikey=${process.env.FMP_API_KEY}`;

    try {
        const response = await fetch(url, { next: { revalidate: 0 } });

        if (!response.ok) {
            const message = `Error fetching stock news`;
            console.error(message);
            console.error(JSON.stringify(response));
            return message;
        }

        const data = await response.json();

        // Process each item individually to filter out invalid ones
        const validItems: StockGrade[] = [];
        for (const item of data) {
            const parsedItem = StockGradesArraySchema.element.safeParse(item);
            if (parsedItem.success) {
                validItems.push(parsedItem.data);
            } else {
                console.warn(`Invalid item ignored: ${JSON.stringify(item)}`);
            }
        }

        return validItems;

    } catch (error) {
        console.error("Error fetching or parsing stock grades:", error);
        const dataError: FMPDataLoadingError = `Unable to fetch news`;
        return dataError;
    }
}