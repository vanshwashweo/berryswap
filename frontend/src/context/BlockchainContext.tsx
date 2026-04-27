"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from "react";
import { initPolyfills } from "@/lib/polyfills";
import { connectWallet, signWithFreighter, isWalletConnected } from "@/lib/freighter";
import { checkTrustline, createTrustlineXDR, submitTransactionXDR, horizonServer, NETWORK_DETAILS, ISSUER_ADDRESS } from "@/lib/blockchain";
import { toast } from "sonner";

// Initialize polyfills immediately at module level
initPolyfills();

interface BlockchainContextType {
  address: string | null;
  loading: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  checkAssetTrust: (assetCode: string, targetAddress?: string, retries?: number) => Promise<boolean>;
  setupTrustline: (assetCode: string) => Promise<boolean>;
}

const BlockchainContext = createContext<BlockchainContextType | undefined>(undefined);

export function BlockchainProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [connectAttempts, setConnectAttempts] = useState(0);

  // Client-side initialization
  useEffect(() => {
    initPolyfills();

    const checkExistingSession = async () => {
      try {
        const alreadyConnected = await isWalletConnected();
        const savedAddress = localStorage.getItem("blockchain_address");
        
        if (alreadyConnected && savedAddress) {
          // If extension says connected and we have a saved address, 
          // just restore it without prompting.
          setAddress(savedAddress);
        }
      } catch (e) {
        console.warn("Session check failed", e);
      } finally {
        setLoading(false);
      }
    };

    checkExistingSession();
  }, []);

  const connect = useCallback(async () => {
    setLoading(true);
    const toastId = toast.loading("Connecting to Freighter...");
    try {
      const pubKey = await connectWallet();
      if (pubKey) {
        setAddress(pubKey);
        localStorage.setItem("blockchain_address", pubKey);
        toast.success("Wallet Connected!", { id: toastId });
        setConnectAttempts(0);
      }
    } catch (e: any) {
      console.error("Connection failed", e);
      setConnectAttempts(prev => prev + 1);
      
      const errorMsg = e.message || "Unknown error";
      
      // Still keep the manual fallback as a safety net
      if (connectAttempts >= 1) {
        toast.error("Handshake Issue", {
          id: toastId,
          description: "Freighter is taking long to respond. Try manual entry?",
          duration: 10000,
          action: {
            label: "Enter Manually",
            onClick: () => {
              const addr = window.prompt("Enter your Blockchain Public Key:");
              if (addr && addr.startsWith("G") && addr.length === 56) {
                setAddress(addr);
                localStorage.setItem("blockchain_address", addr);
                toast.success("Linked Successfully");
              }
            }
          }
        });
      } else {
        toast.error(errorMsg, { id: toastId });
      }
    } finally {
      setLoading(false);
    }
  }, [connectAttempts]);

  const disconnect = useCallback(() => {
    setAddress(null);
    localStorage.removeItem("blockchain_address");
    setConnectAttempts(0);
    toast.info("Wallet Disconnected");
  }, []);

  const checkAssetTrust = useCallback(async (assetCode: string, targetAddress?: string, retries = 1) => {
    const checkAddr = targetAddress || address;
    if (!checkAddr) return false;
    
    // Self-trust protection: if the address is the issuer, they don't need a trustline
    if (checkAddr === ISSUER_ADDRESS) {
      // Still must verify account exists for issuance to work
      try {
        await horizonServer.loadAccount(checkAddr);
        return true;
      } catch (e: any) {
        if (e.response?.status === 404) throw e;
        return true; // Other errors, assume issuer is fine
      }
    }
    
    return await checkTrustline(checkAddr, assetCode, retries);
  }, [address]);

  const setupTrustline = useCallback(async (assetCode: string) => {
    if (!address) return false;
    const toastId = toast.loading(`Enabling ${assetCode}...`);
    try {
      const xdr = await createTrustlineXDR(address, assetCode);
      const signed = await signWithFreighter(xdr, NETWORK_DETAILS.network);
      if (signed) {
        toast.loading("Submitting to network...", { id: toastId });
        await submitTransactionXDR(signed);
        
        // Essential delay: Give Horizon time to index before first check
        await new Promise(r => setTimeout(r, 1500));
        
        // Wait and retry verification to handle Horizon delay
        const verified = await checkAssetTrust(assetCode, undefined, 5);
        if (verified) {
          toast.success(`${assetCode} Enabled!`, { id: toastId });
          return true;
        }
      }
      toast.error("Verification failed or rejected", { id: toastId });
      return false;
    } catch (e: any) {
      if (e.message.includes("insufficient XLM")) {
        toast.error("Insufficient Funds", {
          id: toastId,
          description: "Your Testnet account needs XLM to enable tokens.",
          action: {
            label: "Get XLM",
            onClick: () => window.open(`https://laboratory.blockchain.org/#account-creator?public_key=${address}`, "_blank")
          }
        });
      } else {
        toast.error(`Failed to enable ${assetCode}: ${e.message}`, { id: toastId });
      }
      return false;
    }
  }, [address, checkAssetTrust]);

  const contextValue = useMemo(() => ({
    address, 
    loading, 
    connect, 
    disconnect, 
    checkAssetTrust, 
    setupTrustline 
  }), [address, loading, connect, disconnect, checkAssetTrust, setupTrustline]);

  return (
    <BlockchainContext.Provider value={contextValue}>
      {children}
    </BlockchainContext.Provider>
  );
}

export function useBlockchainContext() {
  const context = useContext(BlockchainContext);
  if (context === undefined) {
    throw new Error("useBlockchainContext must be used within a BlockchainProvider");
  }
  return context;
}
