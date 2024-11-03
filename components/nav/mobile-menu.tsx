"use client";

import { useState } from "react";
import { LiaIndustrySolid } from "react-icons/lia";
import { IoMenuSharp } from "react-icons/io5";
import { IoIosHelpCircleOutline } from "react-icons/io";
import { GiRadarSweep } from "react-icons/gi";
import {
  User,
  LogOut,
  CreditCard,
  UserCog,
  HomeIcon,
  ArrowRight,
  LogInIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser, useClerk } from "@clerk/clerk-react";
import { motion, AnimatePresence } from "framer-motion";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { ThemeToggleButton } from "../ui/theme-toggle-button";

import { cn } from "@/lib/utils";
import { DashboardIcon } from "@radix-ui/react-icons";
import axios from "axios";

export interface MobileMenuProps {
  theme: string | undefined;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ theme }) => {
  const resolvedTheme = theme || "light";
  const logoSrc =
    resolvedTheme === "light"
      ? "/tl-light-theme-nav-logo.png"
      : "/tl-dark-theme-nav-logo.png";

  const { isLoaded, user } = useUser();
  const { signOut } = useClerk();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  if (!isLoaded) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
    router.push("/");
  };

  const handleSettingsClick = (path: string) => {
    setIsOpen(false);
    router.push(path);
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

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.2,
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Open menu">
          <IoMenuSharp className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <AnimatePresence>
        {!user && (
          <DialogContent className="w-[90vw] h-[90vh] max-w-none max-h-none p-0 overflow-auto flex flex-col items-center justify-start pt-48 ">
            <img
              src={logoSrc}
              alt="TradersLab Logo"
              className="w-auto h-10  duration-300"
            />
            <motion.div
              className="flex w-full max-w-2xl flex-col items-center justify-center  sm:flex-row sm:space-x-4 sm:space-y-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              <Link
                href="/sign-in"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "sm:w-auto text-foreground flex gap-2 w-56"
                )}
              >
                Sign in
                <LogInIcon className="w-4 h-4" aria-hidden="true" />
              </Link>
            </motion.div>
            <motion.div
              className="flex w-full max-w-2xl flex-col items-center justify-center sm:flex-row sm:space-x-4 sm:space-y-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              <Link
                href="/sign-up"
                className={cn(
                  buttonVariants({ variant: "default" }),
                  "sm:w-auto text-background flex gap-2 w-56"
                )}
              >
                Join Today
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </motion.div>
          </DialogContent>
        )}
        {user && isOpen && (
          <DialogContent className="w-[90vw] h-[90vh] max-w-none max-h-none p-0 overflow-auto">
            <motion.div
              className="h-full flex flex-col"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <motion.div
                className="p-4 border-b border-foreground/10"
                variants={itemVariants}
              >
                <div className="flex items-center space-x-4 pt-1">
                  {user.imageUrl ? (
                    <img
                      src={user.imageUrl}
                      alt="User Profile"
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <User className="h-10 w-10 rounded-full bg-muted p-2" />
                  )}
                  <div className="text-left">
                    <h3 className="font-medium">{`${user.firstName} ${user.lastName}`}</h3>
                    <p className="text-sm text-muted-foreground">
                      {user.emailAddresses[0].emailAddress}
                    </p>
                  </div>
                </div>
                <div className="w-full mt-4 flex space-x-2 pb-1 px-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleSettingsClick("/user-profile")}
                  >
                    <UserCog className="mr-2 h-4 w-4" />
                    Account
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={handleBillingPortalRedirect}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Subscription
                  </Button>
                </div>
              </motion.div>
              <motion.nav
                className="flex-grow p-4 overflow-y-auto"
                variants={itemVariants}
              >
                <ul className="space-y-4">
                  <motion.li key={"mobile-home"}>
                    <Link
                      href={"/market-overview"}
                      className="flex items-center space-x-2"
                      onClick={() => setIsOpen(false)}
                    >
                      {<HomeIcon className="h-5 w-5" />}
                      <span>Market Overview</span>
                    </Link>
                  </motion.li>
                  <motion.li key={"mobile-home"}>
                    <Link
                      href={"/breadth"}
                      className="flex items-center space-x-2"
                      onClick={() => setIsOpen(false)}
                    >
                      {<DashboardIcon className="h-5 w-5" />}
                      <span>PTMM Dashboard</span>
                    </Link>
                  </motion.li>
                  <motion.li key={"sectors-and-themes"}>
                    <Link
                      href={"/sectors-and-themes"}
                      className="flex items-center space-x-2"
                      onClick={() => setIsOpen(false)}
                    >
                      {<LiaIndustrySolid className="h-5 w-5" />}
                      <span>Sectors & Themes</span>
                    </Link>
                  </motion.li>
                  <motion.li key={"screener"}>
                    <Link
                      href={"/screener"}
                      className="flex items-center space-x-2"
                      onClick={() => setIsOpen(false)}
                    >
                      {<GiRadarSweep className="h-5 w-5" />}
                      <span>Screener</span>
                    </Link>
                  </motion.li>
                  <motion.li key={"mobile-docs"}>
                    <Link
                      href={
                        "https://primetrading.substack.com/p/primetrading-market-model-ptmm"
                      }
                      className="flex items-center space-x-2"
                      onClick={() => setIsOpen(false)}
                    >
                      <IoIosHelpCircleOutline className="h-5 w-5" />
                      <span>Documentation</span>
                    </Link>
                  </motion.li>
                </ul>
              </motion.nav>
              <motion.div
                className="p-4 border-t border-foreground/10"
                variants={itemVariants}
              >
                <div className="flex flex-col space-y-2 w-full">
                  <div className="flex">
                    <div className="flex-grow-[9]">
                      <Button
                        variant="secondary"
                        className="w-full"
                        onClick={handleSignOut}
                      >
                        <LogOut className="mr-2 h-4 w-4" /> Log out
                      </Button>
                    </div>
                    <div className="flex-grow-[1] text-right">
                      <ThemeToggleButton />
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
};

export default MobileMenu;
