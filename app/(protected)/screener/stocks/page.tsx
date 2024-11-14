import PageContainer from "@/components/layout/page-container";
import { Lato } from "next/font/google";
import { Suspense } from "react";
import ScreenerResultsContainter from "../_components/stock-screener-container";

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
    <div className="w-full space-y-8 animate-pulse">
      <div className="h-8 w-48 bg-gray-200 rounded-md" />
      <div className="space-y-4">
        <div className="h-64 bg-gray-200 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-md" />
          ))}
        </div>
      </div>
    </div>
  );
};

const StockScreener: React.FC = () => {
  return (
    <PageContainer scrollable>
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
