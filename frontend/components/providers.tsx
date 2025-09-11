"use client";

import { isMobileDevice } from "@/lib/utils";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import type { Adapter } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  CoinbaseWalletAdapter,
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TrustWalletAdapter,
  WalletConnectWalletAdapter,
} from "@solana/wallet-adapter-wallets";
// import { createDefaultAddressSelector, createDefaultAuthorizationResultCache, createDefaultWalletNotFoundHandler, SolanaMobileWalletAdapter } from "@solana-mobile/wallet-adapter-mobile";
// import { Commitment } from "@solana/web3.js"; // Import Commitment
import { useMemo } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  // Use devnet endpoints
  const endpoint = useMemo(() => {
    return process.env.NEXT_PUBLIC_RPC_URL as string;
  }, []);

  // Enhanced connection config for devnet
  // const connectionConfig = useMemo(
  //   () => ({
  //     commitment: "confirmed" as Commitment,
  //     confirmTransactionInitialTimeout: 60000, // 1 minute for devnet
  //     wsEndpoint: endpoint.replace("https", "wss"), // WebSocket endpoint for devnet
  //     confirmationStrategy: {
  //       skipPreflight: false,
  //       maxRetries: 3,
  //       searchTransactionRetryIntervalMs: 1000,
  //     },
  //   }),
  //   [endpoint],
  // );

  const wallets: Adapter[] = useMemo(() => {
    if (isMobileDevice()) {
      return [
        new WalletConnectWalletAdapter({
          network: WalletAdapterNetwork.Mainnet,
          options: {
            relayUrl: "wss://relay.walletconnect.com",
            projectId: "bcff8ebe603c89b1d028cf248db090bf", // required
            metadata: {
              name: "Coinpetitive",
              description: "Competitive platform",
              url: "https://coinpetitive.io",
              icons: ["https://coinpetitive.io/favicon.ico"],
            },
          },
        }),
      ];
    } else {
      return [
        new PhantomWalletAdapter(),
        new SolflareWalletAdapter(),
        new CoinbaseWalletAdapter(),
        new TrustWalletAdapter(),
      ];
    }
  }, []);

  return (
    // <ConnectionProvider endpoint={endpoint} config={connectionConfig}>
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider
        wallets={wallets.filter(w => w.name !== 'WalletConnect')}
        autoConnect
        onError={(error) => {
          console.error("Wallet connection error:", error);
        }}
      >
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
