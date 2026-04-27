"use client";

import { useState } from "react";
import { TransactionBuilder, Contract, Address, xdr, nativeToScVal } from "@stellar/stellar-sdk";
import { server, NETWORK_DETAILS, CONTRACT_IDS } from "@/lib/blockchain";
import { signWithFreighter } from "@/lib/freighter";
import { toast } from "sonner";
import confetti from "canvas-confetti";

export const useLiquidity = () => {
  const [loading, setLoading] = useState(false);

  const deposit = async (
    userAddress: string,
    amountA: string, // Scaled 
    amountB: string  // Scaled
  ) => {
    setLoading(true);
    const toastId = toast.loading("Processing deposit...");

    try {
      if (CONTRACT_IDS.pool.includes("...") || !CONTRACT_IDS.pool.startsWith("C")) {
         await new Promise(r => setTimeout(r, 2000));
         toast.success("TESTING: Liquidity Added!", { id: toastId });
         confetti({ origin: { x: 0.1 } });
         setLoading(false);
         return { status: "SUCCESS" };
      }
      const account = await server.getAccount(userAddress);
      const contract = new Contract(CONTRACT_IDS.pool);

      const tx = new TransactionBuilder(account, {
        fee: "1000",
        networkPassphrase: NETWORK_DETAILS.networkPassphrase,
      })
        .addOperation(
          contract.call(
            "deposit",
            new Address(userAddress).toScVal(),
            nativeToScVal(BigInt(amountA), { type: "i128" }),
            nativeToScVal(BigInt(amountB), { type: "i128" })
          )
        )
        .setTimeout(30)
        .build();

      const signedXdr = await signWithFreighter(tx.toXDR(), NETWORK_DETAILS.network);
      if (!signedXdr) throw new Error("Signing rejected");

      const result = await server.sendTransaction(
        TransactionBuilder.fromXDR(signedXdr, NETWORK_DETAILS.networkPassphrase)
      );

      if (result.status && (result.status as string) === "PENDING") {
        toast.success("Liquidity Added!", { id: toastId });
        confetti({ origin: { x: 0.1 } });
      }
      return result;
    } catch (e: any) {
      toast.error("Deposit failed", { id: toastId, description: e.message });
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const withdraw = async (
    userAddress: string,
    shareAmount: string // Scaled
  ) => {
    setLoading(true);
    const toastId = toast.loading("Processing withdrawal...");

    try {
      if (CONTRACT_IDS.pool.includes("...") || !CONTRACT_IDS.pool.startsWith("C")) {
         await new Promise(r => setTimeout(r, 2000));
         toast.success("TESTING: Withdrawal Complete!", { id: toastId });
         setLoading(false);
         return { status: "SUCCESS" };
      }
      const account = await server.getAccount(userAddress);
      const contract = new Contract(CONTRACT_IDS.pool);

      const tx = new TransactionBuilder(account, {
        fee: "1000",
        networkPassphrase: NETWORK_DETAILS.networkPassphrase,
      })
        .addOperation(
          contract.call(
            "withdraw",
            new Address(userAddress).toScVal(),
            nativeToScVal(BigInt(shareAmount), { type: "i128" })
          )
        )
        .setTimeout(30)
        .build();

      const signedXdr = await signWithFreighter(tx.toXDR(), NETWORK_DETAILS.network);
      if (!signedXdr) throw new Error("Signing rejected");

      const result = await server.sendTransaction(
        TransactionBuilder.fromXDR(signedXdr, NETWORK_DETAILS.networkPassphrase)
      );

      if (result.status && (result.status as string) === "PENDING") {
        toast.success("Withdrawal Complete!", { id: toastId });
      }
      return result;
    } catch (e: any) {
      toast.error("Withdrawal failed", { id: toastId, description: e.message });
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { deposit, withdraw, loading };
};
