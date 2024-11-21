/*import Footer from "@/components/sections/footer";
import Header from "@/components/sections/header";
import Hero from "@/components/sections/hero";
import HowItWorks from "@/components/sections/how-it-works";
import Logos from "@/components/sections/logos";
import Problem from "@/components/sections/problem";
import Solution from "@/components/sections/solution";*/
import ComingSoon from "./coming-soon/_components/coming-soon";

export default function Home() {
  return (
    <main className="flex items-center justify-center h-screen">
      {/*<Header />
      <Hero />
      <Logos />
      <Problem />
      <Solution />
      <HowItWorks />
      <Footer />*/}
      <ComingSoon />
    </main>
  );
}
