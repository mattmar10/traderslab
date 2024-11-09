import PageContainer from "@/components/layout/page-container";
import { Lato } from "next/font/google";
import PTMMSettings from "./_components/ptmm-settings";
import ScreenerSettings from "./_components/screener-settings";
import ChartSettingsCard from "./_components/chart-settings";
const lato = Lato({
    subsets: ["latin"],
    weight: ["400", "700", "900"],
    display: "swap",
});
const ScreenerPage: React.FC = () => {
    return (
        <PageContainer scrollable>
            <div className="space-y-4 mt-2">
                <div className="flex items-center justify-between space-y-2">
                    <h2 className={`text-2xl font-bold tracking-tight ${lato.className}`}>
                        Settings
                    </h2>
                </div>
                <div className="w-full overflow-auto">
                    <ChartSettingsCard />
                </div>
                <div className="w-full">
                    <PTMMSettings />
                </div>
                <div className="w-full">
                    <ScreenerSettings />
                </div>
            </div>
        </PageContainer>
    );
};

export default ScreenerPage;
