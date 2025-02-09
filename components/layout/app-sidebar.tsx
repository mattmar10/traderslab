"use client";
import axios from "axios";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  ChevronRight,
  ChevronsUpDown,
  GalleryVerticalEnd,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { redirect, usePathname } from "next/navigation";
import * as React from "react";
import { Icons } from "../icons";

import ThemeToggle from "./ThemeToggle/theme-toggle";
import { useClerk, useUser } from "@clerk/nextjs";
import SearchInput from "../search-input";
import { useTheme } from "next-themes";
import { Roboto_Slab } from "next/font/google";

const robotoSlab = Roboto_Slab({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

export const company = {
  name: "Acme Inc",
  logo: GalleryVerticalEnd,
  plan: "Enterprise",
};

export interface NavItem {
  title: string;
  url: string;
  disabled?: boolean;
  external?: boolean;
  icon?: keyof typeof Icons;
  label?: string;
  description?: string;
  isActive?: boolean;
  items?: NavItem[];
}

export const navItems: NavItem[] = [
  {
    title: "Market Overview",
    url: "/market-overview",
    icon: "chartNoAxes",
    isActive: false,
    items: [], // Empty array as there are no child items for Dashboard
  },
  {
    title: "TLMM Breadth",
    url: "/tlmm/s&p500", // Placeholder as there is no direct link for the parent
    icon: "billing",
    isActive: true,

    items: [
      {
        title: "NYSE Composite",
        url: "/tlmm/nyse",
        icon: "userPen",
      },
      {
        title: "S&P 500",
        url: "/tlmm/s&p500",
        icon: "login",
      },
      {
        title: "Nasdaq 100",
        url: "/tlmm/ndx100",
        icon: "login",
      },
      {
        title: "Russell 2K",
        url: "/tlmm/IWM",
        icon: "login",
      },
    ],
  },
  {
    title: "Screener",
    icon: "radar",
    isActive: true,
    url: "/screener/stocks",
    items: [],
  },
  {
    title: "Sectors and Themes",
    url: "/sectors-themes", // Placeholder as there is no direct link for the parent
    icon: "industry",
    isActive: true,
    items: [],
  },
  {
    title: "Settings",
    url: "/settings", // Placeholder as there is no direct link for the parent
    icon: "userPen",
    isActive: true,
  },
];

export default function AppSidebar({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoaded, user } = useUser();
  const [mounted, setMounted] = React.useState(false);
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();
  const { open } = useSidebar();

  const { signOut } = useClerk();
  const handleSignOut = () => {
    signOut();

    redirect("/");
  };

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !user || !isLoaded) {
    return null; // or a loading skeleton
  }

  const logoSrc =
    resolvedTheme === "light"
      ? "/tl-light-theme-nav-logo.png"
      : "/tl-dark-theme-nav-logo.png";

  const handleBillingPortalRedirect = async () => {
    try {
      const { data } = await axios.post(
        `/api/payments/create-billing-portal-session`,
        {
          email: user?.emailAddresses?.[0]?.emailAddress,
        }
      );

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("Failed to create checkout session");

        return;
      }
    } catch (error) {
      console.error("Error during checkout:", error);

      return;
    }
  };

  return (
    <>
      <Sidebar collapsible="icon" className="your-sidebar-class">
        <SidebarHeader>
          <Link href={"/market-overview"}>
            {!open ? (
              <div
                className={`${robotoSlab.className} font-semibold w-8 h-8 bg-traderslabblue text-white flex items-center justify-center rounded-full`}
              >
                TL
              </div>
            ) : (
              <div className="px-3 py-3 flex items-center justify-center">
                <img
                  src={logoSrc}
                  alt="TradersLab Logo"
                  className="w-auto h-10 duration-300"
                />
              </div>
            )}
          </Link>
        </SidebarHeader>
        <SidebarContent className="overflow-x-hidden">
          <SidebarGroup>
            <SidebarGroupLabel>Overview</SidebarGroupLabel>
            <SidebarMenu>
              {navItems.map((item) => {
                const Icon = item.icon ? Icons[item.icon] : Icons.logo;
                return item?.items && item?.items?.length > 0 ? (
                  <Collapsible
                    key={item.title}
                    asChild
                    defaultOpen={item.isActive}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          tooltip={item.title}
                          isActive={pathname === item.url}
                        >
                          <div className="flex items-center">
                            <Link
                              href={item.url}
                              className="hover:bg-accent rounded-md p-1 -m-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Icon className="w-4 h-4" />{" "}
                            </Link>
                          </div>
                          <span>{item.title}</span>
                          <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items?.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={pathname === subItem.url}
                              >
                                <Link href={subItem.url}>
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                ) : (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      isActive={pathname === item.url}
                    >
                      <Link href={item.url}>
                        <Icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage
                        src={user.imageUrl || ""}
                        alt={user.firstName || ""}
                      />
                      <AvatarFallback className="rounded-lg">
                        {user.lastName}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {user.firstName || ""}
                      </span>
                      <span className="truncate text-xs">
                        {user.emailAddresses?.[0]?.emailAddress || ""}
                      </span>
                    </div>
                    <ChevronsUpDown className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                  side="bottom"
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuItem>
                    <Link href={"/user-profile"}>
                      <div className="block select-none space-y-1 rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground text-left cursor-pointer">
                        <div className="text-sm font-medium leading-none">
                          Profile Settings
                        </div>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <div
                      className="block select-none space-y-1 rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground text-left cursor-pointer"
                      onClick={handleBillingPortalRedirect}
                    >
                      <div className="text-sm font-medium leading-none">
                        Subscription Settings
                      </div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut />
                    <div className="ml-2">Log Out</div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="flex h-12  items-center justify-between gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 ">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
          </div>
          <div className=" hidden w-1/3 items-center gap-2 px-4 md:flex ">
            {<SearchInput />}
          </div>
          <div className="hidden md:flex items-center gap-2 px-4">
            <ThemeToggle />
          </div>
        </header>

        {children}
      </SidebarInset>
    </>
  );
}
