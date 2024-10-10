import BlurFade from "@/components/magicui/blur-fade";
import Section from "@/components/section";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Clock, DollarSign, Shield, Zap } from "lucide-react";

const problems = [
  {
    title: "Data Overload",
    description:
      "With endless stocks to sift through, finding the ones primed for a move can take hours. Traders miss out on profits by not having enough time to find the best opportunities each day.",
    icon: Brain,
  },
  {
    title: "Timing is Off",
    description:
      "Getting the timing right is one of the hardest parts of trading. Without multiple, accurate data models, traders often enter or exit too early or too late, leaving gains on the table or risking losses.",
    icon: Clock,
  },
  {
    title: "Protecting Gains",
    description:
      "Market downturns can wipe out months or years of gains. Without real-time market data and clear signals, traders struggle to protect their capital - leading to devastating losses during downturns.",
    icon: DollarSign,
  },
];

export default function Component() {
  return (
    <Section title="Problem" subtitle="Out of step with the market?">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
        {problems.map((problem, index) => (
          <BlurFade key={index} delay={0.2 + index * 0.2} inView>
            <Card className="bg-background border-none shadow-none">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 bg-traderslabblue/10 rounded-full flex items-center justify-center">
                  <problem.icon className="w-6 h-6 text-traderslabblue" />
                </div>
                <h3 className="text-xl font-semibold">{problem.title}</h3>
                <p className="text-muted-foreground">{problem.description}</p>
              </CardContent>
            </Card>
          </BlurFade>
        ))}
      </div>
    </Section>
  );
}
