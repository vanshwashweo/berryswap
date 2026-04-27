import { useState, useEffect } from "react";
import { server, CONTRACT_IDS } from "@/lib/blockchain";
import { Contract, Address } from "@stellar/stellar-sdk";

export const usePoolData = (tokenIn: string, amountIn: string, userAddress?: string | null) => {
  const [reserves, setReserves] = useState<{ resA: bigint; resB: bigint } | null>(null);
  const [totalShares, setTotalShares] = useState<bigint>(BigInt(0));
  const [userShares, setUserShares] = useState<bigint>(BigInt(0));
  const [priceImpact, setPriceImpact] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchReserves = async () => {
      setLoading(true);
      try {
        // Mocking reserves and shares
        setReserves({
          resA: BigInt(245000000000000), 
          resB: BigInt(480000000000000),
        });
        setTotalShares(BigInt(600000000000000));
        
        if (userAddress) {
          setUserShares(BigInt(12000000000000)); // Mock user holding
        }
      } catch (err) {
        console.error("Failed to fetch pool data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReserves();
    const interval = setInterval(fetchReserves, 5000);
    return () => clearInterval(interval);
  }, [userAddress]);

  useEffect(() => {
    if (reserves && amountIn) {
      const amtIn = BigInt(amountIn || 0);
      const impact = Number(amtIn * BigInt(100)) / Number(reserves.resA);
      setPriceImpact(impact);
    }
  }, [amountIn, reserves]);

  return { reserves, totalShares, userShares, priceImpact, loading };
};
