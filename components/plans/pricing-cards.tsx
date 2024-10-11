"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { useUser } from "@clerk/nextjs";
import { loadStripe } from "@stripe/stripe-js";
const PricingHeader = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) => (
  <section className="text-center">
    <h1 className={`text-2xl mt-2 font-semibold tracking-tight`}>{title}</h1>
    <p className="text-foreground/60 pt-1">{subtitle}</p>
    <br />
  </section>
);

export default function PricingCards() {
  const [isAnnual, setIsAnnual] = useState(false);
  const { user } = useUser();
  const [checkoutErrorMsg, setCheckoutErrorMsg] = useState<string>("");
  const [stripePromise, setStripePromise] = useState<Promise<any> | null>(null);

  useEffect(() => {
    setStripePromise(loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!));
  }, []);

  const plans = [
    {
      name: "Basic Plan",
      description: "Perfect for small businesses and startups",
      monthlyPrice: 39,
      annualPrice: 429,
      priceIdAnnual: "price_1Q6HzbCrok1zbJauEHqjrdvN",
      priceIdMonthly: "price_1Q6HyoCrok1zbJauVCQNhtss",
      features: [
        "Up to 5 users",
        "Basic analytics",
        "5GB storage",
        "Email support",
        "API access",
      ],
    },
    {
      name: "Pro Plan",
      description: "Everything you need to grow your business",
      monthlyPrice: 49,
      annualPrice: 490,
      priceIdAnnual: "price_1Q6I1eCrok1zbJauPQxATDST",
      priceIdMonthly: "price_1Q6I1eCrok1zbJaudYUm5amY",
      features: [
        "Unlimited users",
        "Advanced analytics",
        "24/7 priority support",
        "50GB storage",
        "Advanced security",
      ],
    },
  ];

  const handleCheckout = async (priceId: string, subscription: boolean) => {
    try {
      const { data } = await axios.post(
        `/api/payments/create-checkout-session`,
        {
          userId: user?.id,
          email: user?.emailAddresses?.[0]?.emailAddress,
          priceId,
          subscription,
        }
      );

      if (data.sessionId) {
        const stripe = await stripePromise;

        const response = await stripe?.redirectToCheckout({
          sessionId: data.sessionId,
        });

        return response;
      } else {
        console.error("Failed to create checkout session");
        setCheckoutErrorMsg("Failed to create checkout session");
        return;
      }
    } catch (error) {
      console.error("Error during checkout:", error);
      setCheckoutErrorMsg("Error during checkout");
      return;
    }
  };

  if (checkoutErrorMsg) {
    console.log("Error checking out");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PricingHeader title="Choose the plan that's right for you" subtitle="" />
      <div className="flex items-center justify-center mb-8">
        <span className="mr-2">Monthly</span>
        <Switch
          checked={isAnnual}
          onCheckedChange={setIsAnnual}
          aria-label="Toggle annual billing"
        />
        <span className="ml-2">Annual</span>
      </div>
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {plans.map((plan) => {
          const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
          const savings = isAnnual
            ? plan.monthlyPrice * 12 - plan.annualPrice
            : 0;

          return (
            <Card key={plan.name}>
              <CardHeader>
                <CardTitle className="text-left">{plan.name}</CardTitle>
                <CardDescription className="text-left">
                  {plan.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold mb-4">
                  ${price}
                  <span className="text-xl font-normal">
                    /{isAnnual ? "year" : "month"}
                  </span>
                </div>
                {isAnnual && (
                  <p className="text-sm text-green-600 mb-4">
                    Save ${savings} per year
                  </p>
                )}
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={() =>
                    handleCheckout(
                      isAnnual ? plan.priceIdAnnual : plan.priceIdMonthly,
                      true
                    )
                  }
                >
                  Get Started
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
      <div className="flex flex-col w-[70%] lg:w-[50%] mx-auto  mt-12">
        <h2
          className={` text-4xl mt-2 font-semibold text-center tracking-tight`}
        >
          Have Questions?
        </h2>
        <Accordion type="single" collapsible className="w-full mt-4">
          <AccordionItem value="item-1">
            <AccordionTrigger>
              <span className="font-medium text-lg">Can I cancel anytime?</span>
            </AccordionTrigger>
            <AccordionContent className="text-left">
              <p>Yes, you can cancel anytime.</p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-1">
            <AccordionTrigger>
              <span className="font-medium text-lg">
                Will my subscription renew?
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-left">
              <p>Yes, your subscription will renew automatically.</p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      <div className="mt-12 text-foreground/50 text-sm">
        Still have questions? Email us at{" "}
        <span className="underline">support@traderslab.com</span>
      </div>
    </div>
  );
}
