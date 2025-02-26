"use server";
import { fetchWithRetries } from "@/app/api/utils";
import { Dataset, getTickerForDataset } from "@/lib/types/basic-types";
import { MarketBreadthResponse } from "@/lib/types/market-breadth-types";

export async function getDataSetMarketBreadthOverview(
  dataset: Dataset
): Promise<MarketBreadthResponse> {
  console.log("fetching Prime trading overview");
  if (!process.env.TRADERS_LAB_COMPUTE_API) {
    return Promise.reject("TRADERS_LAB_COMPUTE_API must be specified");
  }

  const url = `${process.env.TRADERS_LAB_COMPUTE_API
    }/breadth/${getTickerForDataset(dataset).replaceAll("^NYA", "NYSE")}`;

  return getBreathOverviewFromURL(url);
}

export async function getBreathOverviewFromURL(
  url: string
): Promise<MarketBreadthResponse> {
  try {
    console.log(`fetcing breadth from ${url}`);

    const response = await fetchWithRetries(
      url,
      { next: { revalidate: 0 } },
      1
    );

    return response;
  } catch (error) {
    throw new Error("Unable to load market breadth overview");
  }
}
