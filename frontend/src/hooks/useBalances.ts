"use client";

import { useState, useEffect, useCallback } from "react";
import { horizonServer } from "@/lib/blockchain";

interface Balances {
  XLM: number;
  [key: string]: number;
}

export const useBalances = (address: string | null) => {
  const [balances, setBalances] = useState<Balances>({ XLM: 0 });
  const [loading, setLoading] = useState(false);

  const fetchBalances = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    try {
      const account = await horizonServer.loadAccount(address);
      const newBalances: Balances = { XLM: 0 };
      
      account.balances.forEach((b: any) => {
        if (b.asset_type === "native") {
          newBalances.XLM = parseFloat(b.balance);
        } else if (b.asset_code) {
          newBalances[b.asset_code] = parseFloat(b.balance);
        }
      });
      
      setBalances(newBalances);
    } catch (e) {
      console.error("Failed to fetch balances", e);
      // If account not found, keep 0
    } finally {
      setLoading(false);
    }
  }, [address]);

  // Publicly exposed refresh function
  const refresh = useCallback(async () => {
    await fetchBalances();
  }, [fetchBalances]);

  useEffect(() => {
    fetchBalances();
    // Standard polling every 15s
    const interval = setInterval(fetchBalances, 15000); 
    return () => clearInterval(interval);
  }, [fetchBalances]);

  return { balances, loading, refresh };
};
