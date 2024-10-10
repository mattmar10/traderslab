import { isAuthorized } from "@/actions/data/user/is-authorized";
import Header from "@/components/sections/header";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await currentUser();

  const { authorized, message } = await isAuthorized(user?.id!);

  if (!authorized) {
    redirect("/plans");
  }

  return (
    <div>
      <Header />
      <main>{children}</main>
    </div>
  );
}
