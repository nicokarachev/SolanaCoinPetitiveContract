import React, { useState, useEffect, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  setupAndMintTokens,
  getTokenBalance,
  getTokenState,
} from "../utils/anchor";
import "./TokenMinting.css";
import { idl } from "../utils/types";

const TokenMinting = () => {
  const { connected, publicKey } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [tokenBalance, setTokenBalance] = useState(null);
  const [tokenState, setTokenState] = useState(null);
  const [lastTransaction, setLastTransaction] = useState(null);

  // Load initial data when wallet connects
  const loadTokenData = useCallback(async () => {
    if (!connected) return;

    try {
      const wallet = { publicKey };
      const [balance, state] = await Promise.all([
        getTokenBalance(wallet),
        getTokenState(wallet),
      ]);

      setTokenBalance(balance);
      setTokenState(state);
    } catch (err) {
      console.log(
        `Could not load token data (token may not be initialized yet). ${err}`,
      );
    }
  }, [connected, publicKey]);

  useEffect(() => {
    if (connected && publicKey) {
      loadTokenData();
    }
  }, [connected, publicKey, loadTokenData]);

  const handleMintTokens = async () => {
    if (!connected) {
      setError("Please connect your wallet first");
      return;
    }

    setIsLoading(true);
    setError("");
    setStatus("Preparing transaction...");

    try {
      const wallet = { publicKey };
      const quantity = 1000000; // 0.1 CPT (with 7 decimals)

      setStatus("🔄 Initializing token and minting...");
      setStatus("⏳ Please approve the transaction in your wallet...");

      // This will trigger wallet approval popup
      const result = await setupAndMintTokens(wallet, quantity);

      if (result.success) {
        setStatus("✅ Success! Tokens minted to your wallet!");
        setLastTransaction(result.mintResult);

        // Refresh balance
        await loadTokenData();

        // Clear status after 5 seconds
        setTimeout(() => setStatus(""), 5000);
      }
    } catch (err) {
      console.error("Minting failed:", err);

      if (err.message?.includes("User rejected")) {
        setError("❌ Transaction was rejected by user");
      } else if (err.message?.includes("insufficient funds")) {
        setError("❌ Insufficient SOL for transaction fees");
      } else if (err.message?.includes("ExceedsMaxSupplyCap")) {
        setError("❌ Cannot mint: would exceed maximum token supply");
      } else {
        setError(`❌ Minting failed: ${err.message}`);
      }

      setStatus("");
    } finally {
      setIsLoading(false);
    }
  };

  const formatBalance = (balance) => {
    if (!balance) return "0";
    return (
      balance.uiAmount ||
      parseFloat(balance.balance) / Math.pow(10, balance.decimals || 7)
    );
  };

  const formatSupply = (supply) => {
    if (!supply) return "0";
    return (parseFloat(supply) / Math.pow(10, 7)).toLocaleString();
  };

  return (
    <div className="token-minting-container">
      <div className="minting-card">
        <h2>🪙 CPT Token Minting</h2>
        <p className="description">
          Mint real CPT tokens directly to your connected wallet through smart
          contract interaction.
        </p>

        {/* Wallet Status */}
        <div className="wallet-status">
          <div
            className={`status-indicator ${connected ? "connected" : "disconnected"}`}
          >
            {connected ? "🟢 Wallet Connected" : "🔴 Wallet Not Connected"}
          </div>
          {connected && (
            <div className="wallet-address">
              {publicKey.toString().slice(0, 8)}...
              {publicKey.toString().slice(-8)}
            </div>
          )}
        </div>

        {/* Token Balance */}
        {connected && tokenBalance && (
          <div className="balance-display">
            <h3>Your CPT Balance</h3>
            <div className="balance-amount">
              {formatBalance(tokenBalance)} CPT
            </div>
          </div>
        )}

        {/* Token State Info */}
        {tokenState && (
          <div className="token-info">
            <h3>Token Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="label">Total Supply:</span>
                <span className="value">
                  {formatSupply(tokenState.currentSupply)} CPT
                </span>
              </div>
              <div className="info-item">
                <span className="label">Challenges Completed:</span>
                <span className="value">{tokenState.challengesCompleted}</span>
              </div>
              <div className="info-item">
                <span className="label">Unique Wallets:</span>
                <span className="value">{tokenState.uniqueWallets}</span>
              </div>
            </div>
          </div>
        )}

        {/* Minting Section */}
        <div className="minting-section">
          <button
            className={`mint-button ${isLoading ? "loading" : ""}`}
            onClick={handleMintTokens}
            disabled={!connected || isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Minting...
              </>
            ) : (
              "🪙 Mint 0.1 CPT Tokens"
            )}
          </button>

          {!connected && (
            <p className="connect-prompt">
              Please connect your wallet to mint tokens
            </p>
          )}
        </div>

        {/* Status Messages */}
        {status && <div className="status-message success">{status}</div>}

        {error && <div className="status-message error">{error}</div>}

        {/* Last Transaction */}
        {lastTransaction && (
          <div className="transaction-info">
            <h3>Last Transaction</h3>
            <div className="transaction-details">
              <div className="detail-item">
                <span className="label">Amount:</span>
                <span className="value">
                  {lastTransaction.quantity / 10000000} CPT
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Signature:</span>
                <span className="value signature">
                  {lastTransaction.signature.slice(0, 8)}...
                  {lastTransaction.signature.slice(-8)}
                </span>
              </div>
              {lastTransaction.explorerUrl && (
                <a
                  href={lastTransaction.explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="explorer-link"
                >
                  View on Explorer →
                </a>
              )}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="instructions">
          <h3>How it works:</h3>
          <ol>
            <li>Connect your Solana wallet (Phantom, Solflare, etc.)</li>
            <li>Click &quot;Mint CPT Tokens&quot; button</li>
            <li>Approve the transaction in your wallet popup</li>
            <li>Tokens will be deposited directly to your wallet</li>
            <li>Check your wallet to see the new CPT tokens!</li>
          </ol>
        </div>

        {/* Technical Details */}
        <div className="technical-details">
          <details>
            <summary>Technical Details</summary>
            <div className="tech-info">
              <p>
                <strong>Program ID:</strong> {idl.address}
              </p>
              <p>
                <strong>Network:</strong> Local Testnet (127.0.0.1:8899)
              </p>
              <p>
                <strong>Token Decimals:</strong> 7
              </p>
              <p>
                <strong>Mint Amount:</strong> 1,000,000 units = 0.1 CPT
              </p>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
};

export default TokenMinting;
