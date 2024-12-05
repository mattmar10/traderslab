
import PageContainer from "@/components/layout/page-container";
import { Suspense } from "react";
import Loading from "@/components/loading";
import EtfContainer from "../_components/etf-wrapper/etf-wrapper-container";

const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
    return <div className="w-full">{children}</div>;
};

const Skeleton = () => {
    return <Loading />;
};

const EtfBreakdownPage = ({ params }: {
    params: { etfSymbol: string };
}) => {
    return (
        <PageContainer scrollable={false}>
            <div className="space-y-4 mt-2">


                <ErrorBoundary>
                    <Suspense fallback={<Skeleton />}>
                        <EtfContainer ticker={params.etfSymbol} />
                    </Suspense>
                </ErrorBoundary>
            </div>
        </PageContainer>
    );
};
export default EtfBreakdownPage;
