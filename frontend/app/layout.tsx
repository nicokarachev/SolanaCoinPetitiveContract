import type { Metadata } from "next";
import "./globals.css";

import "@solana/wallet-adapter-react-ui/styles.css";
import { Toaster } from "sonner";

import { Providers } from "@/components/providers";
import { AnchorProvider } from "@/lib/anchor-provider";
// import { AuthProvider } from "@/components/auth-provider";
import ConditionalNavbar from "@/components/ConditionalNavbar";
import ClientLayout from "@/components/ClientLayout"; // 🆕 Wrapper component
import RedirectHandler from "@/components/RedirectHandler";
import { AuthProvider } from "@/lib/use-auth";
// import WalletChecker from "@/lib/wallet-checker";

export const metadata: Metadata = {
  title: "Coinpetitive",
  description: "Challenge platform on Solana blockchain",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <AuthProvider>
            <AnchorProvider>
              <ClientLayout>
                <RedirectHandler />
                <ConditionalNavbar />
                {/*<WalletChecker />*/}
                {children}
                <Toaster richColors position="top-right" />
              </ClientLayout>
            </AnchorProvider>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
