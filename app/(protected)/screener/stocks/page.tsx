import PageContainer from "@/components/layout/page-container";
import { Lato } from "next/font/google";
import { Suspense } from "react";
import Loading from "@/components/loading";
import ScreenerResultsContainter from "../_components/stock-screener-container";
import Image from 'next/image'
const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  display: "swap",
});

const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  return <div className="w-full">{children}</div>;
};

const ScreenerSkeleton = () => {
  return <Loading />;
};

const StockScreener: React.FC = () => {
  return (
    <>
      <div className="flex items-center justify-between space-y-2 pt-4 pl-4">
        <div className="flex items-center">
          <Image
            src="/tl-transparent.png"
            alt="TL Logo"
            width={48}
            height={48}
            priority
          />
          <h2 className={`text-2xl font-bold tracking-tight ${lato.className}`}>
            Stock Screener
          </h2>
        </div>
      </div>
      <PageContainer scrollable={false}>

        <div className="space-y-4 mt-2">


          <ErrorBoundary>
            <Suspense fallback={<ScreenerSkeleton />}>
              <ScreenerResultsContainter />
            </Suspense>
          </ErrorBoundary>
        </div>
      </PageContainer>
    </>

  );
};
export default StockScreener;
