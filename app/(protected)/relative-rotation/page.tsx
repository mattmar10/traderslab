// page.tsx
import PageContainer from "@/components/layout/page-container";
import { Lato } from "next/font/google";
import { Suspense } from "react";
import RelativeStrengthContent from "./_components/relative-strength-content";
import BuildingContentLoader from "@/components/animated-loader";

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  display: "swap",
});

export default function RelativeRotationPage() {
  return (
    <PageContainer scrollable={false}>
      <div className="space-y-4 mt-2">
        <div className="flex items-center justify-between space-y-2">
          <h2 className={`text-2xl font-bold tracking-tight ${lato.className}`}>
            Relative Rotation (Expirimental)
          </h2>
        </div>

        <Suspense fallback={<BuildingContentLoader />}>
          <RelativeStrengthContent />
        </Suspense>
      </div>
    </PageContainer>
  );
}