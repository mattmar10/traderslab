import { isDataset } from "@/lib/types/basic-types";
import { notFound } from "next/navigation";
import DashboardWrapper from "../_components/dashboard-wrapper";

const PTMMDashboard = ({
  params,
}: // searchParams,
  {
    params: { dataset: string };
    // searchParams?: { [key: string]: string | string[] | undefined };
  }) => {
  const dataset = decodeURIComponent(params.dataset.toUpperCase());

  if (!isDataset(dataset)) {
    notFound();
  }

  let datasetDesc = "";

  if (dataset === "NDX100") {
    datasetDesc = "Equal Weight NDX 100";
  } else if (dataset === "NYSE") {
    datasetDesc = "NYSE Composite";
  } else if (dataset === "S&P500") {
    datasetDesc = "Equal Weight S&P 500";
  } else if (dataset === "IWM") {
    datasetDesc = "Russell 2000";
  }


  return (
    <DashboardWrapper dataset={dataset} datasetDescription={datasetDesc} />
  );
};

export default PTMMDashboard;
