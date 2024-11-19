import { FMPDataLoadingError } from "@/lib/types/fmp-types";
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