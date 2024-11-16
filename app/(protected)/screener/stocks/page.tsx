import PageContainer from "@/components/layout/page-container";
import { Lato } from "next/font/google";
import { Suspense } from "react";
import ScreenerResultsContainter from "../_components/stock-screener-container";
import Loading from "@/components/loading";

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  display: "swap",
});

const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  return <div className="w-full">{children}</div>;
};

const ScreenerSkeleton = () => {
  return (
    <Loading />
  );
};

const StockScreener: React.FC = () => {
  return (
    <PageContainer scrollable={false}>
      <div className="space-y-4 mt-2">
        <div className="flex items-center justify-between space-y-2">
          <h2 className={`text-2xl font-bold tracking-tight ${lato.className}`}>
            Stock Screener
          </h2>
        </div>

        <ErrorBoundary>
          <Suspense fallback={<ScreenerSkeleton />}>
            <ScreenerResultsContainter />
          </Suspense>
        </ErrorBoundary>
      </div>
    </PageContainer>
  );
};
export default StockScreener;
