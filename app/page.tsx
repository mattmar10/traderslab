import AnimatedBackground from "@/components/landing-page/animated-background";
import Header from "@/components/sections/header";
import Hero from "@/components/sections/hero";
import Logos from "@/components/sections/logos";
import Problem from "@/components/sections/problem";
import { Button } from "@/components/ui/button";
import { BarChart2, DollarSign, TrendingUp } from "lucide-react";
import Image from "next/image";

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <Logos />
      <Problem />
    </main>
  );
}
