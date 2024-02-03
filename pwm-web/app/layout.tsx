import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theming/provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { QueryProviderClientRender } from "@/components/app/queryProviderClient";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PWM - Password Manager",
  description: "Next generational password manager",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-black dark:text-white text-black w-full h-full`}
      >
        <QueryProviderClientRender>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </QueryProviderClientRender>
      </body>
    </html>
  );
}
