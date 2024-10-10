import { SignUp } from "@clerk/nextjs";
import { Sign } from "crypto";

export default function Page() {
  return (
    <main className="grid min-h-screen place-items-center px-6 lg:px-8 no-scrollbar">
      <SignUp />
    </main>
  );
}
