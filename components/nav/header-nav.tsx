"use client";

import { useState, useEffect } from "react";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ChevronDown, Menu } from "lucide-react";
import { useTheme } from "next-themes";

export function HeaderNav() {
  const { theme } = useTheme();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use a default value for theme if it's undefined
  const resolvedTheme = theme || "light";
  const logoSrc =
    resolvedTheme === "light"
      ? "/tl-light-theme-nav-logo.png"
      : "/tl-dark-theme-nav-logo.png";

  const handleLinkClick = () => {
    setIsSheetOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="px-4 flex h-16 items-center justify-between w-full">
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

        <nav className="hidden md:flex items-center space-x-6">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center space-x-1">
              <span>Products</span>
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Market Analysis</DropdownMenuItem>
              <DropdownMenuItem>Portfolio Management</DropdownMenuItem>
              <DropdownMenuItem>Risk Assessment</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link className="text-sm font-medium" href="#">
            Solutions
          </Link>
          <Link className="text-sm font-medium" href="#">
            Resources
          </Link>
          <Link className="text-sm font-medium" href="#">
            Enterprise
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          <SignedOut>
            <div className="hidden md:flex w-full justify-end space-x-2">
              <Link href="/sign-in">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/sign-up">
                <Button>Get started</Button>
              </Link>
            </div>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>

          {/* Mobile menu */}
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="focus:outline-none">
              <nav className="flex flex-col space-y-4">
                <Link
                  className="text-sm font-medium"
                  href="#"
                  onClick={handleLinkClick}
                >
                  Products
                </Link>
                <Link
                  className="text-sm font-medium"
                  href="#"
                  onClick={handleLinkClick}
                >
                  Solutions
                </Link>
                <Link
                  className="text-sm font-medium"
                  href="#"
                  onClick={handleLinkClick}
                >
                  Resources
                </Link>
                <Link
                  className="text-sm font-medium"
                  href="#"
                  onClick={handleLinkClick}
                >
                  Enterprise
                </Link>
                <SignedOut>
                  <div className="flex flex-col space-y-2 pt-4">
                    <Link href="/sign-in" onClick={handleLinkClick}>
                      <Button variant="outline" className="w-full">
                        Login
                      </Button>
                    </Link>
                    <Link href="/sign-up" onClick={handleLinkClick}>
                      <Button className="w-full">Get started</Button>
                    </Link>
                  </div>
                </SignedOut>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
