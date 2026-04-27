"use client";

import { useState } from "react";
import { TransactionBuilder, Contract, Address, xdr, Asset, Operation, nativeToScVal } from "@stellar/stellar-sdk";
import { server, horizonServer, NETWORK_DETAILS, CONTRACT_IDS, ISSUER_ADDRESS } from "@/lib/blockchain";
import { signWithFreighter } from "@/lib/freighter";
import { toast } from "sonner";
import confetti from "canvas-confetti";

export type SwapStatus = "IDLE" | "CONNECTING" | "SIGNING" | "SUBMITTING" | "SUCCESS" | "ERROR";

export const useSwap = () => {
  const [status, setStatus] = useState<SwapStatus>("IDLE");
  const [txHash, setTxHash] = useState<string | null>(null);

  const executeSwap = async (
    userAddress: string,
    tokenIn: string,
    amountIn: string, // Scaled 1e7
    minOut: string    // Scaled 1e7
  ) => {
    setStatus("CONNECTING");
    const toastId = toast.loading("Preparing transaction...");

    try {
      // 1. Classic DEX Fallback (Blockchain Traditional DEX)
      const isRouterReady = CONTRACT_IDS.router && CONTRACT_IDS.router.length === 56 && CONTRACT_IDS.router.startsWith("C") && !CONTRACT_IDS.router.includes("...");
      const isPoolReady = CONTRACT_IDS.pool && CONTRACT_IDS.pool.length === 56 && CONTRACT_IDS.pool.startsWith("C") && !CONTRACT_IDS.pool.includes("...");
      if (!isRouterReady || !isPoolReady) {
        console.log("Using Classic DEX Path Payment fallback...");
        
        const account = await horizonServer.loadAccount(userAddress);
        const assetIn = tokenIn === "XLM" ? Asset.native() : new Asset("BERRY", ISSUER_ADDRESS);
        const assetOut = tokenIn === "XLM" ? new Asset("BERRY", ISSUER_ADDRESS) : Asset.native();

        // Convert scaled integer strings (raw amounts) back to decimal strings for Classic Operations
        const decAmountIn = (BigInt(amountIn).toString().padStart(8, '0'));
        const formattedIn = decAmountIn.slice(0, -7) + "." + decAmountIn.slice(-7);
        
        // Ensure minOut is at least 1 stroop (0.0000001) — destMin=0 causes op_malformed
        const minOutBigInt = BigInt(minOut) > BigInt(0) ? BigInt(minOut) : BigInt(1);
        const decMinOut = (minOutBigInt.toString().padStart(8, '0'));
        const formattedOut = decMinOut.slice(0, -7) + "." + decMinOut.slice(-7);

        console.log("[SWAP DEBUG] tokenIn:", tokenIn, "| amountIn (raw):", amountIn, "| minOut (raw):", minOut);
        console.log("[SWAP DEBUG] formattedIn:", formattedIn, "| formattedOut:", formattedOut);
        console.log("[SWAP DEBUG] assetIn:", assetIn.isNative() ? "XLM (native)" : `${assetIn.getCode()}:${assetIn.getIssuer()}`);
        console.log("[SWAP DEBUG] assetOut:", assetOut.isNative() ? "XLM (native)" : `${assetOut.getCode()}:${assetOut.getIssuer()}`);

        const txBuilder = new TransactionBuilder(account, {
          fee: "1000",
          networkPassphrase: NETWORK_DETAILS.networkPassphrase,
        });

        // 1.1 SMART TRUSTLINE: Check if destination needs authorization
        if (!assetOut.isNative()) {
          const hasTrust = account.balances.some(
            (b: any) => b.asset_code === assetOut.getCode() && b.asset_issuer === assetOut.getIssuer()
          );
          
          if (!hasTrust) {
            console.log(`Auto-bundling trustline for ${assetOut.getCode()}...`);
            txBuilder.addOperation(
              Operation.changeTrust({
                asset: assetOut,
                limit: "1000000"
              })
            );
          }
        }

        // 1.2 Original Swap Operation
        txBuilder.addOperation(
          Operation.pathPaymentStrictSend({
            sendAsset: assetIn,
            sendAmount: formattedIn, 
            destAsset: assetOut,
            destMin: formattedOut, 
            destination: userAddress,
            path: []
          })
        );

        const tx = txBuilder.setTimeout(180).build();

        setStatus("SIGNING");
        toast.loading("Actual Transaction: Please sign in Freighter", { id: toastId });
        
        const signedXdr = await signWithFreighter(tx.toXDR(), NETWORK_DETAILS.network);
        if (!signedXdr) throw new Error("Signing rejected");

        setStatus("SUBMITTING");
        toast.loading("Broadcasting to Blockchain Testnet...", { id: toastId });
        
        const transaction = TransactionBuilder.fromXDR(signedXdr, NETWORK_DETAILS.networkPassphrase);
        const result = await horizonServer.submitTransaction(transaction);

        setStatus("SUCCESS");
        setTxHash(result.hash);
        
        toast.success("Transaction Confirmed!", {
          id: toastId,
          description: `Swapped ${formattedIn} ${tokenIn} successfully.`
        });

        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#8B5CF6', '#06B6D4', '#ffffff']
        });
        
        return result;
      }

      // 2. Soroban Smart Contract Path (Standard Router)
      const account = await server.getAccount(userAddress);
      const contract = new Contract(CONTRACT_IDS.router);

      const tx = new TransactionBuilder(account, {
        fee: "1000",
        networkPassphrase: NETWORK_DETAILS.networkPassphrase,
      })
        .addOperation(
          contract.call(
            "swap_exact_tokens",
            new Address(userAddress).toScVal(),
            new Address(CONTRACT_IDS.pool).toScVal(),
            new Address(tokenIn).toScVal(),
            nativeToScVal(BigInt(amountIn), { type: "i128" }),
            nativeToScVal(BigInt(minOut), { type: "i128" })
          )
        )
        .setTimeout(30)
        .build();

      setStatus("SIGNING");
      toast.loading("Please sign the transaction in Freighter", { id: toastId });

      const signedXdr = await signWithFreighter(tx.toXDR(), NETWORK_DETAILS.network);
      if (!signedXdr) throw new Error("User rejected signing");

      setStatus("SUBMITTING");
      toast.loading("Broadcasting to Soroban RPC...", { id: toastId });

      const result = await server.sendTransaction(
        TransactionBuilder.fromXDR(signedXdr, NETWORK_DETAILS.networkPassphrase)
      );

      if (result.status && (result.status as string) === "PENDING") {
        setStatus("SUCCESS");
        setTxHash(result.hash);
        toast.success("Swap confirmed!", {
          id: toastId,
          description: `Transaction ${result.hash.slice(0, 8)}... completed.`
        });
        
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#8B5CF6', '#06B6D4', '#ffffff']
        });

        return result;
      } else {
        throw new Error("Transaction failed or was rejected by the network.");
      }
    } catch (e: any) {
      console.error("Swap process failed", e);
      setStatus("ERROR");
      
      let errorMsg = e.message || "Unknown error";
      const extras = e.response?.data?.extras;
      const resultCodes = extras?.result_codes;
      
      if (resultCodes) {
        console.group("Blockchain Transaction Failed");
        console.error("Result Code:", resultCodes.transaction);
        console.error("Operations:", resultCodes.operations);
        console.groupEnd();
      }

      if (resultCodes) {
        const opResult = resultCodes.operations?.find((op: string) => op !== "op_success") || resultCodes.operations?.[0];
        errorMsg = `Blockchain Error: ${resultCodes.transaction}${opResult ? ` (${opResult})` : ""}`;
      } else if (e.response?.data?.detail) {
        errorMsg = e.response.data.detail;
      }

      if (errorMsg.includes("op_too_few_offers")) {
        errorMsg = "Market not initialized. Please go to Admin Hub and click 'Seed DEX Liquidity'.";
      }

      toast.error("Transaction Failed", {
        id: toastId,
        description: errorMsg,
        action: errorMsg.includes("Admin Hub") ? {
          label: "Go to Admin",
          onClick: () => window.location.href = "/admin"
        } : (errorMsg.includes("Balance") || errorMsg.includes("fund")) ? {
          label: "Get Tokens",
          onClick: () => window.open(`https://laboratory.stellar.org/#account-creator?public_key=${userAddress}`, "_blank")
        } : undefined
      });
      throw e;
    }
  };

  const getSwapQuote = async (tokenIn: string, amountIn: string, tokenOut: string) => {
    try {
      const assetIn = tokenIn === "XLM" ? Asset.native() : new Asset("BERRY", ISSUER_ADDRESS);
      const assetOut = tokenOut === "XLM" ? Asset.native() : new Asset("BERRY", ISSUER_ADDRESS);
      
      // Convert scaled integer string to decimal for Horizon API
      const decAmountIn = (BigInt(amountIn).toString().padStart(8, '0'));
      const formattedIn = decAmountIn.slice(0, -7) + "." + decAmountIn.slice(-7);

      const paths = await horizonServer.strictSendPaths(assetIn, formattedIn, [assetOut]).call();
      
      if (paths.records.length > 0) {
        return paths.records[0].destination_amount;
      }
      return null;
    } catch (e) {
      console.error("Failed to fetch path quote", e);
      return null;
    }
  };

  return { executeSwap, getSwapQuote, status, txHash };
};
