import ErrorCard from "@/components/error-card";
import PricingCards from "@/components/plans/pricing-cards";
import Footer from "@/components/sections/footer";
import Header from "@/components/sections/header";
export default function Page() {

  const annualPriceId = process.env.STRIPE_ANNUAL_PRICE_ID
  const monthlyPriceId = process.env.STRIPE_MONTHLY_PRICE_ID

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow flex flex-col items-center justify-center px-6 lg:px-8 py-8 sm:py-8">
        {!annualPriceId || !monthlyPriceId ? (
         <ErrorCard errorMessage={"Unable to find pricing options"} />
        ) : (
          <>
            <h1 className="text-6xl font-bold tracking-tighter mb-6 text-center">
              Join the lab <span className="text-traderslabblue">Today</span>
            </h1>
            <PricingCards annualPriceId={annualPriceId} monthlyPriceId={monthlyPriceId} />
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
