"use client";

import Drawer from "@/components/nav/mobile-menu";

import Menu from "@/components/menu";
import { buttonVariants } from "@/components/ui/button";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Icons } from "../icons";
import { siteConfig } from "@/lib/config";
import { useTheme } from "next-themes";
import { Arrow } from "@radix-ui/react-dropdown-menu";
import { ArrowBigRight, ArrowRight, ArrowRightCircle } from "lucide-react";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { UserManagement } from "../nav/user-management";
import MobileMenu from "@/components/nav/mobile-menu";

export default function Header() {
  const [addBorder, setAddBorder] = useState(false);
  const { theme } = useTheme();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setAddBorder(true);
      } else {
        setAddBorder(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const resolvedTheme = theme || "light";
  const logoSrc =
    resolvedTheme === "light"
      ? "/tl-light-theme-nav-logo.png"
      : "/tl-dark-theme-nav-logo.png";

  return (
    <header
      className={
        "relative sticky top-0 z-50 py-2 bg-background/60 backdrop-blur"
      }
    >
      <div className="flex justify-between items-center container">
        <Link href="/">
          <div className="flex items-center space-x-4">
            {/* Render the logo based on the resolved theme */}
            <img
              src={logoSrc}
              alt="TradersLab Logo"
              className={`w-auto h-8 transition-opacity duration-300 ${
                !mounted ? "opacity-0" : "opacity-100"
              }`}
            />
          </div>
        </Link>
        <div className="hidden lg:block">
          <div className="flex items-center ">
            <nav className="mr-10">
              <Menu />
            </nav>

            <div className="gap-2 flex">
              <SignedOut>
                <div className="hidden md:flex w-full justify-end space-x-2">
                  <Link
                    href="/sign-in"
                    className={buttonVariants({ variant: "outline" })}
                  >
                    Login
                  </Link>
                  <Link
                    href="/sign-up"
                    className={cn(
                      buttonVariants({ variant: "default" }),
                      "w-full sm:w-auto text-background flex gap-2"
                    )}
                  >
                    Get Started
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </Link>
                </div>
              </SignedOut>
              <SignedIn>
                <UserManagement />
              </SignedIn>
            </div>
          </div>
        </div>

        <div className="mt-2 cursor-pointer block lg:hidden">
          <MobileMenu theme={theme} />
        </div>
      </div>
      <hr
        className={cn(
          "absolute w-full bottom-0 transition-opacity duration-300 ease-in-out",
          addBorder ? "opacity-100" : "opacity-0"
        )}
      />
    </header>
  );
}
