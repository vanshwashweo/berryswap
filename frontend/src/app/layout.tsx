import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { BlockchainProvider } from "@/context/BlockchainContext";

export const metadata: Metadata = {
  title: "BerrySwap | Sweet Strawberry Liquidity 🍓",
  description: "Experience the sweetness of the blockchain with BerrySwap—soft, dreamy DeFi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <BlockchainProvider>
          {children}
          <Toaster richColors position="top-right" />
        </BlockchainProvider>
      </body>
    </html>
  );
}
