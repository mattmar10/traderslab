import AnimatedBackground from "@/components/landing-page/animated-background";
import { Button } from "@/components/ui/button";
import { BarChart2, DollarSign, TrendingUp } from "lucide-react";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen font-[family-name:var(--font-geist-sans)] ">
      <main className="flex-grow">
        <section className="relative py-20 overflow-hidden border-b border-foreground/10">
          <AnimatedBackground />
          <div className="absolute inset-0 bg-grid-blue-500/[0.03] bg-[size:30px_30px]" />

          <div className="container relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <h1 className="text-6xl font-bold tracking-tighter mb-4">
                Empowering Traders with{" "}
                <span className="text-traderslabblue">Collaborative</span>{" "}
                Innovation
              </h1>
              <p className="text-lg text-foreground/50 mb-8">
                Combine TradersLab's intelligent analysis system with powerful
                infrastructure for faster insights without the maintenance
                burden.
              </p>
              <div className="flex justify-center space-x-4">
                <Button>Get started now</Button>
                <Button variant="outline">Book a Demo</Button>
              </div>
            </div>

            <div>
              <div className="mx-auto max-w-6xl px-6 lg:px-8">
                <div className="mt-16 flow-root sm:mt-24">
                  <div className="-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
                    <div className="relative overflow-hidden rounded-lg shadow-inne bg-white p-1">
                      <img
                        src="screenshot1.png"
                        alt="Daily Market Breadth Snapshot"
                        width={1165}
                        height={704}
                        className="w-full h-auto object-cover transition duration-300 ease-in-out transform hover:scale-100"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/*<div className="text-center mb-10">
              <div className="text-5xl font-mono font-bold mb-2">Something</div>
            </div>*/}
            {/* <div className="text-center mb-20">
              <p className="text-sm text-gray-500 uppercase tracking-wider mb-4">
                Trusted by top financial institutions
              </p>
              <div className="flex flex-wrap justify-center items-center gap-8">
                {[
                  "Goldman Sachs",
                  "JPMorgan",
                  "Morgan Stanley",
                  "BlackRock",
                  "Fidelity",
                  "Vanguard",
                  "Charles Schwab",
                ].map((company) => (
                  <div
                    key={company}
                    className="text-2xl font-bold text-gray-400"
                  >
                    {company}
                  </div>
                ))}
              </div>
            </div>*/}
          </div>
        </section>

        <section className="py-20 border-b">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                {
                  icon: BarChart2,
                  title: "Boost trader productivity",
                  description:
                    "The fast builds and instant setup that traders love, now integrated into a single, automated workflow.",
                },
                {
                  icon: TrendingUp,
                  title: "Analyze only what matters",
                  description:
                    "When deployed on TradersLab, our AI only analyzes market-affecting events, saving time and keeping your team ultra-productive.",
                },
                {
                  icon: DollarSign,
                  title: "Best trading experience",
                  description:
                    "Developed by the team behind TurboTrade to optimize the entire monorepo workflow, without any added complexity.",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                    <item.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 ">
          <div className="container">
            <div>
              <div className="relative isolate">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
                >
                  <div
                    style={{
                      clipPath:
                        "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 4.1% 44.1%)",
                    }}
                    className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
                  />
                </div>

                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
                >
                  <div
                    style={{
                      clipPath:
                        "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
                    }}
                    className="relative left-[calc(50%-13rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-36rem)] sm:w-[72.1875rem]"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-start justify-between gap-10">
              <div className="w-full md:w-1/2 p-4">
                <div className="relative overflow-hidden rounded-xl shadow-lg bg-white dark:bg-gray-800 p-3">
                  <div className="relative overflow-hidden rounded-lg shadow-inner">
                    <img
                      src="snapshot.png"
                      alt="Daily Market Breadth Snapshot"
                      width={1165}
                      height={704}
                      className="w-full h-auto object-cover transition duration-300 ease-in-out transform hover:scale-100"
                    />
                  </div>
                </div>
              </div>
              <div className="w-full md:w-1/2 pt-12">
                <h2 className="text-4xl font-bold mb-4">
                  Comprehensive Breadth Model
                </h2>
                <p className="text-xl text-gray-600 mb-6">
                  TradersLab minimizes configuration, making it seamless to set
                  up, analyze, and deploy your trading strategies in seconds
                  without worrying about infrastructure.
                </p>
                <Button
                  size="lg"
                  className="bg-black text-white hover:bg-gray-800"
                >
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </section>
        <section></section>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        This is the main footer
      </footer>
    </div>
  );
}
