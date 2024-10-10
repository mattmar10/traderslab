import Features from "@/components/features-vertical";
import Section from "@/components/section";
import { Sparkles, Upload, Zap } from "lucide-react";

const data = [
  {
    id: 1,
    title: "1. Scan the Market in Seconds",
    content:
      "Use TradersLab's built-in screeners to quickly analyze the entire market or specific sectors/themes. In just a few clicks, you'll uncover stocks that match your trading strategy, saving you hours of research.",
    image: "/filter-editor-2.png",
    icon: <Upload className="w-6 h-6 text-traderslabblue" />,
  },
  {
    id: 2,
    title: "2. Visualize and Evaluate Opportunities",
    content:
      "Instantly access mini-charts and real-time data for a detailed look at each stock’s and theme performance. TradersLab’s tools allow you to evaluate Market Price-Breadth-Momentum indicators and other key metrics to ensure you’re focusing on the best window of opportunity while protecting your capital when it’s not.",
    image: "/minicharts1.png",
    icon: <Zap className="w-6 h-6 text-traderslabblue" />,
  },
  {
    id: 3,
    title: "3. Make Data-Driven Trading Decisions",
    content:
      "Armed with actionable insights and clear analysis, execute your trades confidently. TradersLab provides all the data you need to enter or exit positions at the right time, helping you stay ahead in any market condition.",
    image: "/rsp.png",
    icon: <Sparkles className="w-6 h-6 text-traderslabblue" />,
  },
];

export default function Component() {
  return (
    <Section title="How it works" subtitle="3 Steps to Success">
      <Features data={data} />
    </Section>
  );
}
