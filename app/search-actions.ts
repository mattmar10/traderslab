"use server";

import { SearchResponse } from "@/lib/types/basic-types";
import { FMPDataLoadingError } from "@/lib/types/fmp-types";

export async function basicSearch(
  query: string
): Promise<FMPDataLoadingError | SearchResponse> {
  if (!process.env.TRADERS_LAB_API) {
    return Promise.resolve("TRADERS_LAB_API must be specified");
  }
  const url = `${process.env.TRADERS_LAB_API}/search/${query}`;

  try {
    const response = await fetch(url, { next: { revalidate: 0 } });

    if (!response.ok) {
      const message = `Error searching for ${query}`;
      console.error(message);
      console.error(JSON.stringify(response));
      return message;
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error(error);
    const dataError: FMPDataLoadingError = `Unable to execute search`;
    return dataError;
  }
}
