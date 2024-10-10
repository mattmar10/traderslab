"use client";

import FlickeringGrid from "@/components/magicui/flickering-grid";
import Ripple from "@/components/magicui/ripple";

import Section from "@/components/section";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Safari from "../safari";

const features = [
  {
    title: "Instant Access to Leading Setups",
    description:
      "TradersLab’s intelligent screening tools allow traders to quickly discover the best stock opportunities in real time. Instead of wasting hours searching,  get tailored results that fit your strategy.",
    className: "hover:bg-red-500/10 transition-all duration-500 ease-out",
    content: (
      <>
        <Safari
          src={`/minicharts-single.png`}
          url="https://acme.ai"
          className="-mb-32 mt-2 max-h-64 w-full px-4 select-none drop-shadow-[0_0_28px_rgba(0,0,0,.1)] group-hover:translate-y-[-10px] transition-all duration-300"
        />
      </>
    ),
  },
  {
    title: "Market Timing Made Simple with PTMM ",
    description:
      "TradersLab’s Price-Breadth-Momentum (PTMM) model simplifies market timing by providing clear data-driven signals. By combining price action, breadth, and momentum, this model helps traders enter and exit positions with greater precision.",
    className:
      "order-3 xl:order-none hover:bg-blue-500/10 transition-all duration-500 ease-out",
    content: (
      <Safari
        src={`/ptmm.png`}
        url="https://acme.ai"
        className="-mb-32  max-h-64 w-full px-4 select-none drop-shadow-[0_0_28px_rgba(0,0,0,.1)] group-hover:translate-y-[-10px] transition-all duration-300"
      />
    ),
  },
  {
    title: "Collaborate with a Community of Traders",
    description:
      "TradersLab fosters a collaborative trading environment, allowing users to share and learn from the strategies of top traders. With a library of shared screeners and custom strategies, users can fine-tune their approach by leveraging the collective knowledge of experienced traders in the community.",
    className:
      "md:row-span-2 hover:bg-orange-500/10 transition-all duration-500 ease-out",
    content: (
      <>
        <FlickeringGrid
          className="z-0 absolute inset-10 [mask:radial-gradient(circle_at_center,#fff_400px,transparent_0)]"
          squareSize={4}
          gridGap={6}
          color="#000"
          maxOpacity={0.1}
          flickerChance={0.1}
          height={800}
          width={800}
        />
        <Safari
          src={`/screener-library.png`}
          url="https://acme.ai"
          className="-mb-48 ml-12 mt-2 h-full px-4 select-none drop-shadow-[0_0_28px_rgba(0,0,0,.1)] group-hover:translate-x-[-10px] transition-all duration-300"
        />
      </>
    ),
  },
  {
    title: "Complete Top-Down Analysis Tool",
    description:
      "TradersLab is the first platform built specifically for top-down market analysis. It enables traders to start by assessing the overall market, drilling into sectors and themes, and finally identifying leading stocks. This integrated approach provides a complete market picture, empowering traders to make informed decisions with all the necessary data in one place.",
    className:
      "flex-row order-4 md:col-span-2 md:flex-row xl:order-none hover:bg-green-500/10 transition-all duration-500 ease-out",
    content: (
      <>
        <Ripple className="absolute -bottom-full" />
        <div className="flex space-x-1">
          <Safari
            src={`/sectors-themes.png`}
            url="https://acme.ai"
            className="-mb-32  max-h-64 w-full px-4 select-none drop-shadow-[0_0_28px_rgba(0,0,0,.1)] group-hover:translate-y-[-10px] transition-all duration-300"
          />
          <Safari
            src={`/bubble-chart.png`}
            url="https://acme.ai"
            className="-mb-32  max-h-64 w-full px-4 select-none drop-shadow-[0_0_28px_rgba(0,0,0,.1)] group-hover:translate-y-[-10px] transition-all duration-300"
          />
        </div>
      </>
    ),
  },
];

export default function Component() {
  return (
    <Section
      title="Solution"
      subtitle="Transform Your Trading with Advanced Technology"
      description="TradersLab provides everything you need to stay ahead in the market, from real-time market insights to tailored stock screeners."
      className="bg-neutral-100 dark:bg-neutral-900"
    >
      <div className="mx-auto mt-16 grid max-w-sm grid-cols-1 gap-6 text-gray-500 md:max-w-3xl md:grid-cols-2 xl:grid-rows-2 md:grid-rows-3 xl:max-w-6xl xl:auto-rows-fr xl:grid-cols-3">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            className={cn(
              "group relative items-start overflow-hidden bg-neutral-50 dark:bg-neutral-800 p-6 rounded-2xl",
              feature.className
            )}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              type: "spring",
              stiffness: 100,
              damping: 30,
              delay: index * 0.1,
            }}
            viewport={{ once: true }}
          >
            <div>
              <h3 className="font-semibold mb-2 text-primary">
                {feature.title}
              </h3>
              <p className="text-foreground">{feature.description}</p>
            </div>
            {feature.content}
            <div className="absolute bottom-0 left-0 h-32 w-full bg-gradient-to-t from-neutral-50 dark:from-neutral-900 pointer-events-none"></div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
