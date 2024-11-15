import { fetchWithRetries } from "@/app/api/utils";
import ErrorCard from "@/components/error-card";
import { FMPDataLoadingError } from "@/lib/types/fmp-types";
import {
  FilterCriteria,
  ScreenerResults,
  ScreenerResultsSchema,
} from "@/lib/types/screener-types";
import { Either, isRight, Left, Right } from "@/lib/utils";

import ScreenerResultsWrapper from "./stock-screener-results-wrapper";

const ScreenerResultsContainter: React.FC = async () => {
  const [data, countryCodes] = await Promise.all([
    getStocksWithStats(),
    getCountryCodes(),
  ]);

  if (isRight(data)) {
    const initialData: ScreenerResults = data.value;

    return (
      <ScreenerResultsWrapper
        initialData={initialData}
        countryCodes={countryCodes}
      />
    );
  } else {
    return (
      <div>
        <ErrorCard errorMessage={"Unable to load data"} />
      </div>
    );
  }
};

export default ScreenerResultsContainter;

async function getStocksWithStats(
  filterCriteria?: FilterCriteria
): Promise<Either<FMPDataLoadingError, ScreenerResults>> {
  if (!process.env.TRADERS_LAB_API) {
    return Promise.resolve(Left("PTMM API URL and key must be specified"));
  }

  const url = `${process.env.TRADERS_LAB_API}/market-performance/stocks`;

  try {
    const response = await fetchWithRetries(
      url,

      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filters: filterCriteria || {},
          sortAttribute: "rsRank",
          sortDirection: "asc",
          page: 1,
          pageSize: 25,
        }),
        next: { revalidate: 0 },
      },
      1
    );

    const parsed = ScreenerResultsSchema.safeParse(response);

    if (parsed.success) {
      return Right<ScreenerResults>(parsed.data);
    } else {
      return Left<FMPDataLoadingError>(`Error parsing stock screener results`);
    }
  } catch (error) {
    console.error(error);
    return Promise.resolve(
      Left<FMPDataLoadingError>(`Unable to get stock screener results`)
    );
  }
}

async function getCountryCodes(): Promise<Record<string, string>> {
  const url = `${process.env.TRADERS_LAB_API}/symbol/country-codes`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}
