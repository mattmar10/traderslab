import * as z from "zod";

export const FmpStockNewsSchema = z.object({
    symbol: z.string(),
    publishedDate: z.coerce.date(),
    title: z.string(),
    image: z.string().nullable(),
    site: z.string(),
    text: z.string(),
    url: z.string(),
});
export const FmpStockNewsListSchema = FmpStockNewsSchema.array();
export type FmpStockNewsList = z.infer<typeof FmpStockNewsListSchema>;
export type FmpStockNews = z.infer<typeof FmpStockNewsSchema>;

export const FmpGeneralNewsSchema = z.object({
    publishedDate: z.coerce.date(),
    title: z.string(),
    image: z.string(),
    site: z.string(),
    text: z.string(),
    url: z.string(),
});
export const FmpGeneralNewsListSchema = FmpGeneralNewsSchema.array();
export type FmpGeneralNewsList = z.infer<typeof FmpGeneralNewsListSchema>;
export type FmpGeneralNews = z.infer<typeof FmpGeneralNewsSchema>;