import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "@/lib/utils";
import { IoIosHelpCircleOutline } from "react-icons/io";
import { ThemeProvider } from "next-themes";
import ReactQueryProvider from "./providers/Providers";
import { Toaster } from "@/components/ui/toaster";
import { ChartSettingsProvider } from "./context/chart-settigns-context";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
/*const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});*/

export const metadata: Metadata = {
  title: "TradersLab.io",
  description: "Elevate your trading",
};

const MaintenancePage = () => (
  <body
    className={cn("antialiased min-h-screen font-sans", geistSans.className)}
  >
    <div className="sticky top-0 z-50 border-b bg-background">
      <div className="flex h-16 items-center px-4 justify-between">
        <div className="flex items-center space-x-2 cursor-pointer">
          <img src="/logo-small.png" alt="Logo" className="h-8 w-auto" />
          <div className="flex space-x-2">
            <div className="font-bold text-xl hidden md:block">Traderslab</div>
            <div className="text-xl hidden md:block">|</div>
            <div className="md:text-xl text-lg text-foreground/90">
              Traderslab
            </div>
          </div>
        </div>
        <div className="hidden md:flex items-center space-x-2 ml-auto">
          <div className="flex space-x-1 p-2 rounded text-foreground/90 hover:bg-foreground/5">
            <a
              href="https://primetrading.substack.com/p/primetrading-market-model-ptmm"
              target="_blank"
              className="flex items-center space-x-1"
            >
              <IoIosHelpCircleOutline className="text-2xl" />
              <div className="hidden md:block">Documentation</div>
            </a>
          </div>
        </div>
      </div>
    </div>
    <main className="grid min-h-screen place-items-center px-6 py-8 sm:py-8 lg:px-8 bg-foreground/10 no-scrollbar">
      <div className="text-center w-5/6">
        <img
          src="https://ptmm-features.s3.us-east-2.amazonaws.com/whats-cooking.png"
          alt="What's cooking"
          className="w-full max-w-md mx-auto mb-12"
        />
        <h1 className="text-xl lg:text-3xl font-bold tracking-tight text-foreground/85">
          Sit tight, we are working on something extra special for you.
        </h1>
        <p className="text-base lg:text-xl font-semibold mt-8">
          We will be back soon
        </p>
      </div>
    </main>
    <Toaster />
  </body>
);

//export const metadata: Metadata = constructMetadata({});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isMaintenanceMode = process.env.MAINTENANCE_MODE === "TRUE";

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="scrollbar-stable scrollbar-thin"
    >
      <head>
        <title>Traderslab</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta
          name="description"
          content="Market breadth dashboard for the PTMM Model"
        />
        {/* Favicons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
        {/* Apple Icons */}
        <link rel="apple-touch-icon" sizes="57x57" href="/apple-icon-57x57.png" />
        <link rel="apple-touch-icon" sizes="60x60" href="/apple-icon-60x60.png" />
        <link rel="apple-touch-icon" sizes="72x72" href="/apple-icon-72x72.png" />
        <link rel="apple-touch-icon" sizes="76x76" href="/apple-icon-76x76.png" />
        <link rel="apple-touch-icon" sizes="114x114" href="/apple-icon-114x114.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/apple-icon-120x120.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/apple-icon-144x144.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/apple-icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-icon-180x180.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      {isMaintenanceMode ? (
        <MaintenancePage />
      ) : (
        <body
          className={cn(
            "min-h-screen bg-background antialiased w-full mx-auto scroll-smooth",
            geistSans.className
          )}
        >
          <ClerkProvider>
            <ReactQueryProvider>
              <ChartSettingsProvider>
                <ThemeProvider
                  attribute="class"
                  defaultTheme="light"
                  enableSystem={false}
                  disableTransitionOnChange
                >
                  {children}
                </ThemeProvider>
              </ChartSettingsProvider>
            </ReactQueryProvider>
          </ClerkProvider>
        </body>
      )}
    </html>
  );
}
