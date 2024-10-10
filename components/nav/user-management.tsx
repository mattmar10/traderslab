"use client";
import axios from "axios";

import React, { useEffect, useState } from "react";
import {
  NavigationMenuItem,
  NavigationMenuTrigger,
} from "@radix-ui/react-navigation-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuLink,
  NavigationMenuList,
} from "../ui/navigation-menu";

import { useUser, useClerk } from "@clerk/clerk-react";
import { redirect } from "next/navigation";
import { cn } from "@/lib/utils";

import { LogOutIcon } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "../ui/button";

export function UserManagement() {
  const { isLoaded, user } = useUser();
  const { signOut } = useClerk();

  if (!isLoaded || !user) {
    return <></>;
  }

  const handleSignOut = () => {
    signOut();

    redirect("/");
  };

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
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>
            <img
              src={user.imageUrl}
              alt="User Profile"
              className="w-6 h-6 mt-2 rounded-full" // Adjust size as needed
            />
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="pl-6 pt-4 font-semibold">
              Welcome, {user.firstName}
            </div>
            <ul className="grid gap-3 p-4 w-[400px] md:w-[300px] lg:w-[400px]">
              <ListItem
                key={"user-settings-nav"}
                href={"/user-profile"}
                title={"User Settings"}
              >
                {"Manage your user profile settings"}
              </ListItem>
              <li key={"payment-settings-nav"} className="text-left ">
                <NavigationMenuLink asChild>
                  <div
                    className={cn(
                      "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground text-left cursor-pointer"
                    )}
                    onClick={handleBillingPortalRedirect}
                  >
                    <div className="text-sm font-medium leading-none">
                      Subscription Settings
                    </div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      Manage your payment/subscription settings
                    </p>
                  </div>
                </NavigationMenuLink>
              </li>
              <li key={"log-out"} className="text-left ">
                <NavigationMenuLink asChild>
                  <a
                    className={cn(
                      "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground border-t border-foreground/10"
                    )}
                    href="/"
                    onClick={handleSignOut}
                  >
                    <div className="flex space-x-1 items-center justify-between hover:bg-accent hover:text-accent-foreground  ">
                      <div className="text-sm leading-none">Sign Out</div>
                      <LogOutIcon className="h-4 w-4" />
                    </div>
                  </a>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
