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

const VALID_SOURCES = ['sectors', 'themes', 'screener'] as const;
type ValidSource = typeof VALID_SOURCES[number];

interface Props {
  searchParams: { source?: string }
}

function isValidSource(source: string): source is ValidSource {
  return VALID_SOURCES.includes(source as ValidSource);
}

function getPageTitle(source: ValidSource): string {
  if (source === 'screener') {
    return 'Relative Rotation From Screen (Experimental)';
  }
  return `Relative Rotation - ${source.charAt(0).toUpperCase() + source.slice(1)} (Experimental)`;
}

function validateSource(source?: string): ValidSource {
  if (!source) return 'sectors';
  if (!isValidSource(source)) {
    throw new Error(`Invalid source: ${source}. Valid options are: ${VALID_SOURCES.join(', ')}`);
  }
  return source;
}

export default function RelativeRotationPage({ searchParams }: Props) {
  const source = validateSource(searchParams.source);
  const isScreenResults = source === 'screener';

  return (
    <PageContainer scrollable={false}>
      <div className="space-y-4 mt-2">
        <div className="flex items-center justify-between space-y-2">
          <h2 className={`text-2xl font-bold tracking-tight ${lato.className}`}>
            {getPageTitle(source)}
          </h2>
        </div>

        <Suspense fallback={<BuildingContentLoader />}>
          {isScreenResults ? (
            <RRGFromScreener />
          ) : (
            <RelativeStrengthContent source={source} />
          )}
        </Suspense>
      </div>
    </PageContainer>
  );
}