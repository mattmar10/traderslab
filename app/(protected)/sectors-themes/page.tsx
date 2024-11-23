import PageContainer from "@/components/layout/page-container";
import { Lato } from "next/font/google";
import { Suspense } from "react";
import Loading from "@/components/loading";
import MarketsSectorsThemesContainer from "./_components/markets-sectors-themes-containter";

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  display: "swap",
});

const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  return <div className="w-full">{children}</div>;
};

const Skeleton = () => {
  return <Loading />;
};

const StockScreener: React.FC = () => {
  return (
    <PageContainer scrollable={false}>
      <div className="space-y-4 mt-2">
        <div className="flex items-center justify-between space-y-2">
          <h2 className={`text-2xl font-bold tracking-tight ${lato.className}`}>
            Sub Markets, Sectors, and Themes
          </h2>
        </div>

        <ErrorBoundary>
          <Suspense fallback={<Skeleton />}>
            <MarketsSectorsThemesContainer />
          </Suspense>
        </ErrorBoundary>
      </div>
    </PageContainer>
  );
};
export default StockScreener;
