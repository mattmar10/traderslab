"use client";
import { getDataSetMarketBreadthOverview } from "@/actions/breadth/breadth-actions";
import useViewport from "@/hooks/useViewport";
import { Dataset } from "@/lib/types/basic-types";
import { useQuery } from "@tanstack/react-query";
import Loading from "../loading";
import DesktopDashboard from "./desktop-dashboard";
import { MarketBreadthResponse } from "@/lib/types/market-breadth-types";
import { isFMPDataLoadingError } from "@/lib/types/fmp-types";

export interface DashboardWrapperProps {
  dataset: Dataset;
  datasetDescription: string;
}

const DashboardWrapper: React.FC<DashboardWrapperProps> = ({
  dataset,
  datasetDescription,
}) => {
  const { isMobile } = useViewport();

  const { data, error, isLoading } = useQuery({
    queryKey: [`dashboard-${dataset}`],
    queryFn: () => getDataSetMarketBreadthOverview(dataset),
    refetchInterval: 60000, // Refetch every minute
    staleTime: 5000, // Consider data stale after 55 seconds
  });

  if (isLoading || !data) {
    return (
      <main className="flex min-w-screen flex-col items-center justify-between pt-12">
        <Loading />
      </main>
    );
  }

  if (error || isFMPDataLoadingError(data)) {
    <main className="flex min-w-screen flex-col items-center justify-between pt-12">
      <Loading />
    </main>;
  }

  if (isMobile) {
    return (
      <main className="flex min-w-screen flex-col items-center justify-between pt-12">
        PTMM {datasetDescription} {JSON.stringify(data)}
      </main>
    );
  }

  return (
    <main
      className="flex flex-col items-center justify-between pt-12"
      style={{ width: "85%", margin: "0 auto" }}
    >
      <DesktopDashboard
        overview={data as MarketBreadthResponse}
        dataset={dataset}
        datasetDescription={datasetDescription}
      />
    </main>
  );
};

export default DashboardWrapper;
