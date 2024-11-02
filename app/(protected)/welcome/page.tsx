import { Button } from "@/components/ui/button";

import Link from "next/link";
//import Stripe from "stripe";

// Initialize Stripe with your secret key
//const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export default async function SuccessPage() {
  return (
    <main className="flex min-w-screen flex-col items-center justify-between pt-12">
      <h1 className="mt-[35vh] mb-3 scroll-m-20  text-5xl font-semibold tracking-tight transition-colors first:mt-0">
        Welcome to TradersLab.
      </h1>
      <p className="leading-7 text-center w-[60%]">Let&apos;s get cooking</p>
      <Link href="/market-overview" className="mt-4">
        <Button>Access Dashboard</Button>
      </Link>
    </main>
  );
}
