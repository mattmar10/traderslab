import PricingCards from "@/components/plans/pricing-cards";

export default function Page() {
  return (
    <main className=" min-h-screen text-center px-6 py-8 sm:py-8 lg:px-8  no-scrollbar">
      <h1 className="text-6xl font-bold tracking-tighter mt-12 mb-6 ">
        Join the lab <span className="text-traderslabblue">Today</span>{" "}
      </h1>
      <PricingCards />
    </main>
  );
}
