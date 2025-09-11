import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useConnection } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { toast } from "@/hooks/use-toast";

interface WalletConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  publicKey: string | null;
  error: string | null;
  retryAttempts: number;
  balance: number;
}

export function useWalletConnection() {
  const { publicKey, connecting, disconnect, connect, wallet, connected } =
    useWallet();
  const { connection } = useConnection();

  const [state, setState] = useState<WalletConnectionState>({
    isConnected: false,
    isConnecting: false,
    publicKey: null,
    error: null,
    retryAttempts: 0,
    balance: 0,
  });

  // Track connection status
  useEffect(() => {
    setState((prev) => ({
      ...prev,
      isConnected: connected && !!publicKey,
      isConnecting: connecting,
      publicKey: publicKey?.toString() || null,
      error: null,
    }));
  }, [connected, publicKey, connecting]);

  // Fetch balance when wallet is connected
  useEffect(() => {
    const fetchBalance = async () => {
      if (connected && publicKey) {
        try {
          const balance = await connection.getBalance(publicKey);
          setState((prev) => ({
            ...prev,
            balance: balance / LAMPORTS_PER_SOL,
          }));
        } catch (error) {
          console.error("Failed to fetch balance:", error);
          setState((prev) => ({ ...prev, balance: 0 }));
        }
      } else {
        setState((prev) => ({ ...prev, balance: 0 }));
      }
    };

    fetchBalance();
  }, [connected, publicKey, connection]);

  // Auto-reconnect logic - DISABLED to prevent unwanted disconnections during navigation
  // useEffect(() => {
  //   if (!connected && !connecting && wallet && state.retryAttempts < 3) {
  //     const timer = setTimeout(() => {
  //       setState(prev => ({ ...prev, retryAttempts: prev.retryAttempts + 1 }))
  //       connect().catch((error) => {
  //         console.error('Auto-reconnect failed:', error)
  //         setState(prev => ({
  //           ...prev,
  //           error: 'Connection failed. Please try manually reconnecting.'
  //         }))
  //       })
  //     }, 2000) // Wait 2 seconds before retry

  //     return () => clearTimeout(timer)
  //   }
  // }, [connected, connecting, wallet, connect, state.retryAttempts])

  // Reset retry attempts on successful connection
  useEffect(() => {
    if (connected) {
      setState((prev) => ({ ...prev, retryAttempts: 0, error: null }));
    }
  }, [connected]);

  // Manual connect with error handling
  const connectWallet = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isConnecting: true, error: null }));
      await connect();

      toast({
        title: "Wallet Connected",
        description: "Successfully connected to your wallet",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to connect wallet";
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isConnecting: false,
      }));

      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [connect]);

  // Manual disconnect with confirmation
  const disconnectWallet = useCallback(async () => {
    try {
      // Check if wallet is actually connected
      if (!connected && !wallet) {
        setState((prev) => ({
          ...prev,
          retryAttempts: 0,
          error: null,
          isConnected: false,
          publicKey: null,
          balance: 0,
        }));

        toast({
          title: "Already Disconnected",
          description: "No wallet is currently connected",
        });
        return;
      }

      // Add timeout to disconnect call
      const disconnectPromise = disconnect();
      const disconnectTimeout = new Promise((_, reject) =>
        setTimeout(
          () =>
            reject(
              new Error("Disconnect timeout - wallet took too long to respond"),
            ),
          8000,
        ),
      );

      await Promise.race([disconnectPromise, disconnectTimeout]);

      // Force state update regardless of wallet adapter state
      setState((prev) => ({
        ...prev,
        retryAttempts: 0,
        error: null,
        isConnected: false,
        publicKey: null,
        balance: 0,
      }));

      toast({
        title: "Wallet Disconnected",
        description: "Your wallet has been disconnected",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to disconnect wallet";

      // Force disconnect state even on error to prevent stuck state
      if (errorMessage.includes("timeout")) {
        setState((prev) => ({
          ...prev,
          retryAttempts: 0,
          error: null,
          isConnected: false,
          publicKey: null,
          balance: 0,
        }));

        toast({
          title: "Disconnect Timeout",
          description:
            "Wallet took too long to respond, but has been disconnected locally",
        });
      } else {
        setState((prev) => ({ ...prev, error: errorMessage }));

        toast({
          title: "Disconnection Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    }
  }, [disconnect, connected, wallet]);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const resetRetryAttempts = useCallback(() => {
    setState((prev) => ({ ...prev, retryAttempts: 0 }));
  }, []);

  return {
    // Connection state
    isConnected: state.isConnected,
    connected: state.isConnected, // Alias for compatibility
    isConnecting: state.isConnecting || connecting,
    connecting: state.isConnecting || connecting, // Alias for compatibility

    // Wallet info
    wallet: wallet,
    publicKey: state.publicKey,
    balance: state.balance,

    // Error handling
    error: state.error,
    retryAttempts: state.retryAttempts,

    // Actions
    connectWallet,
    disconnectWallet,
    connect: connectWallet, // Alias for compatibility
    disconnect: disconnectWallet, // Alias for compatibility
    clearError,
    resetRetryAttempts,

    // Additional info
    walletName: wallet?.adapter?.name || null,
  };
}
