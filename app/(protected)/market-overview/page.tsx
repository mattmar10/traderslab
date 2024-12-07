import PageContainer from "@/components/layout/page-container";

import { Lato } from "next/font/google";
import MarketOverViewCards from "./_components/market-overview-cards";
import MarketOverviewMonitor from "./_components/market-overview-monitor";

import HotStocksServer from "./_components/hotstocks/hotstocks";
import { LeadingStocksServer } from "./_components/leading-stocks/leading-stocks";
import { SettingUpStocksServer } from "./_components/setting-up-stocks/setting-up-stocks";
import HeadlinesServer from "./_components/headlines/headlines";
import EconomicCalendarServer from "./_components/calendar/economic-calendar";
import { UpgradesDownGradesServer } from "./_components/upgrades-downgrades/upgrades-downgrades";
import EarningsCalendarServer from "./_components/calendar/earnings-calendar";

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  display: "swap",
});

const HomePage: React.FC = () => {
  return (
    <PageContainer scrollable>
      <div className="space-y-4 mt-2">
        <div className="flex items-center justify-between space-y-2">
          <h2 className={`text-2xl font-bold tracking-tight ${lato.className}`}>
            Hi, Welcome back 👋
          </h2>
        </div>
        <MarketOverViewCards />
        <div className="grid grid-cols-1 gap-4 3xl:grid-cols-8">
          <div className="col-span-1 3xl:col-span-6">
            <MarketOverviewMonitor />
          </div>
          <div className="col-span-2 w-full ">
            <HeadlinesServer />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 3xl:grid-cols-9">
          <div className="col-span-1 3xl:col-span-3 ">
            <HotStocksServer />
          </div>
          <div className="col-span-1 3xl:col-span-3 ">
            <LeadingStocksServer />
          </div>
          <div className="col-span-1 3xl:col-span-3 ">
            <SettingUpStocksServer />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 3xl:grid-cols-9">
          <div className="col-span-1 3xl:col-span-3 ">
            <UpgradesDownGradesServer />
          </div>
          <div className="col-span-1 3xl:col-span-3 ">
            <EconomicCalendarServer />
          </div>
          <div className="col-span-1 3xl:col-span-3 ">
            <EarningsCalendarServer />
          </div>
        </div>

      </div>
    </PageContainer>
  );
};

export default HomePage;
