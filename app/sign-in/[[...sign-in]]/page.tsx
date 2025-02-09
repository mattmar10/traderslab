import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow flex flex-col items-center justify-center px-6 lg:px-8 py-12 sm:py-8">
        <SignIn forceRedirectUrl={"/market-overview"} />
      </main>
    </div>
  );
}
