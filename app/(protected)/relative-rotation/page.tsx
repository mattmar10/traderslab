// page.tsx
import PageContainer from "@/components/layout/page-container";
import { Lato } from "next/font/google";
import { Suspense } from "react";
import RelativeStrengthContent from "./_components/relative-rotation-content";
import BuildingContentLoader from "@/components/animated-loader";
import RRGFromScreener from "./_components/rrg-from-screener";

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  display: "swap",
});

interface Props {
  searchParams: { source?: string }
}

export default function RelativeRotationPage({ searchParams }: Props) {
  const isScreenResults = searchParams.source === 'screener';

  return (
    <PageContainer scrollable={false}>
      <div className="space-y-4 mt-2">
        <div className="flex items-center justify-between space-y-2">
          <h2 className={`text-2xl font-bold tracking-tight ${lato.className}`}>
            {isScreenResults ? 'Relative Rotation From Screen (Experimental)' : 'Relative Rotation (Experimental)'}
          </h2>
        </div>

        <Suspense fallback={<BuildingContentLoader />}>
          {isScreenResults ? (
            <RRGFromScreener />
          ) : (
            <RelativeStrengthContent />
          )}
        </Suspense>
      </div>
    </PageContainer>
  );
}