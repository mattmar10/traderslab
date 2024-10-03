import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <main className="grid min-h-screen place-items-center px-6 py-8 sm:py-8 lg:px-8 bg-foreground/10 no-scrollbar">
      <SignIn />
    </main>
  );
}
