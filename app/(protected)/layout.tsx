import { isAuthorized } from "@/actions/data/user/is-authorized";
import AppSidebar from "@/components/layout/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await currentUser();

  if (!user) {
    redirect("/plans");
  }
  const { authorized } = await isAuthorized(user.id);

  if (!authorized) {
    redirect("/plans");
  }

  return (
    <div className="py-2">
      <SidebarProvider>
        <AppSidebar>{children}</AppSidebar>
      </SidebarProvider>
    </div>
  );
}
