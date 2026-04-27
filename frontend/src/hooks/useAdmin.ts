"use client";

import { useState, useEffect } from "react";
import { useBlockchain } from "./useBlockchain";
import { 
  TransactionBuilder, 
  Asset, 
  Operation, 
  BASE_FEE 
} from "@stellar/stellar-sdk";
import { horizonServer, ISSUER_ADDRESS, NETWORK_DETAILS } from "@/lib/blockchain";
import { signWithFreighter } from "@/lib/freighter";
import { toast } from "sonner";

const ADMIN_ADDRESSES = [
  "GBKNHIATMCYTFZZZUX347NF2SCH7MKMT7HS73HOVCC55CDJEI53I6S5A", // Primary Issuer
  "GCGUQ2F6LKRCD6PUDJKTVNGNEFVGJJPLBM7L64I5YFM7SBQGGXNXMVUM", // Market Maker
  "GC7SEQUPZUQSFX4HZECHCF5CSD7VYUVXCDREQBHQVS5BLDCOESCD33HL", // Admin
];

export const useAdmin = () => {
  const { address } = useBlockchain();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!address) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    const currentAddress = address.trim().toUpperCase();
    const authorized = ADMIN_ADDRESSES.some(admin => admin.trim().toUpperCase() === currentAddress);
    
    setIsAdmin(authorized); 
    setLoading(false);
  }, [address]);

  const mintToken = async (targetAddress: string, amount: string) => {
    if (!address) throw new Error("Wallet not connected");
    
    const toastId = toast.loading("Preparing issuance transaction...");
    try {
      const account = await horizonServer.loadAccount(address);
      const asset = new Asset("BERRY", ISSUER_ADDRESS);

      const tx = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: NETWORK_DETAILS.networkPassphrase,
      })
        .addOperation(
          Operation.payment({
            destination: targetAddress,
            asset: asset,
            amount: amount,
          })
        )
        .setTimeout(30)
        .build();

      toast.loading("Please sign the issuance in Freighter", { id: toastId });
      const signedXdr = await signWithFreighter(tx.toXDR(), NETWORK_DETAILS.network);
      
      if (!signedXdr) throw new Error("Transaction rejected");

      toast.loading("Broadcasting issuance to network...", { id: toastId });
      const transaction = TransactionBuilder.fromXDR(signedXdr, NETWORK_DETAILS.networkPassphrase);
      const result = await horizonServer.submitTransaction(transaction);

      toast.success("Tokens Minted Successfully!", { 
        id: toastId,
        description: `TX: ${result.hash.substring(0, 8)}...`
      });
      return { status: "SUCCESS", hash: result.hash };
    } catch (e: any) {
      console.error("Issuance failed", e);
      
      const data = e.response?.data;
      const resultCodes = data?.extras?.result_codes;
      let errorMsg = resultCodes 
        ? `Stellar Error: ${resultCodes.transaction}${resultCodes.operations ? ` (${resultCodes.operations[0]})` : ""}`
        : (data?.detail || data?.title || e.message || "Minting failed");

      if (e.response?.status === 404) {
        errorMsg = "Account not found. Please fund your wallet with XLM via a faucet.";
      }

      toast.error(errorMsg, { id: toastId });
      throw new Error(errorMsg);
    }
  };

  const seedDEXLiquidity = async () => {
    if (!address) throw new Error("Wallet not connected");
    
    const toastId = toast.loading("Smart Seeding: Preparing liquidity & orders...");
    try {
      // 0. Issuer check: Issuer cannot hold their own tokens to provide liquidity
      if (address === ISSUER_ADDRESS) {
        throw new Error("Seeding denied: You are connected as the Issuer. Please use a different admin account to provide liquidity.");
      }

      const account = await horizonServer.loadAccount(address);
      const mtlswAsset = new Asset("BERRY", ISSUER_ADDRESS);
      const xlmAsset = Asset.native();

      // Diagnostic: Check balances
      const xlmBalance = parseFloat(account.balances.find((b: any) => b.asset_type === "native")?.balance || "0");
      const mtlswBalance = parseFloat(account.balances.find((b: any) => b.asset_code === "BERRY")?.balance || "0");

      if (xlmBalance < 105) {
        throw new Error(`Insufficient XLM: You have ${xlmBalance} XLM, but need at least 105 XLM for the liquidity offers and reserves. Please use a faucet.`);
      }

      if (mtlswBalance < 100) {
        throw new Error(`Insufficient BERRY: You have ${mtlswBalance} BERRY, but need 100 for the sell offer. Please Mint tokens from the Issuer first.`);
      }

      const tx = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: NETWORK_DETAILS.networkPassphrase,
      })
        // 1. Ensure Trustline: Needed for the non-issuer MM account to receive BERRY
        .addOperation(
          Operation.changeTrust({
            asset: mtlswAsset,
            limit: "1000000"
          })
        )
        // 2. Offer: Sell BERRY for XLM (Providing BERRY liquidity)
        .addOperation(
          Operation.manageSellOffer({
            selling: mtlswAsset,
            buying: xlmAsset,
            amount: "100",
            price: "2.0", // Sell 1 BERRY for 2 XLM
            offerId: "0" 
          })
        )
        // 3. Offer: Sell XLM for BERRY (Providing XLM liquidity)
        .addOperation(
          Operation.manageSellOffer({
            selling: xlmAsset,
            buying: mtlswAsset,
            amount: "100",
            price: "2.0", // Sell 1 XLM for 2 BERRY (Buy 1 BERRY for 0.5 XLM)
            offerId: "0"
          })
        )
        .setTimeout(180) 
        .build();

      toast.loading("Sign 'Smart Seed' (Trust + Mint + Orders) in Freighter", { id: toastId });
      const signedXdr = await signWithFreighter(tx.toXDR(), NETWORK_DETAILS.network);
      
      if (!signedXdr) throw new Error("Transaction rejected");

      toast.loading("Deploying liquidity to Blockchain network...", { id: toastId });
      const transaction = TransactionBuilder.fromXDR(signedXdr, NETWORK_DETAILS.networkPassphrase);
      const result = await horizonServer.submitTransaction(transaction);

      toast.success("DEX Market is Live!", { 
        id: toastId,
        description: "Trustline enabled, account funded & orders initialized."
      });
      return { status: "SUCCESS", hash: result.hash };
    } catch (e: any) {
      console.error("Smart Seeding failed", e);
      
      const data = e.response?.data;
      const resultCodes = data?.extras?.result_codes;
      
      // LOG DETAILED ERROR FOR DEBUGGING
      if (resultCodes) {
        console.group("Stellar Transaction Failed");
        console.error("Transaction Result Code:", resultCodes.transaction);
        console.error("Operations Result Codes:", resultCodes.operations);
        console.groupEnd();
      }
      
      // Find the first failing operation result code
      const opResult = resultCodes?.operations?.find((op: string) => op !== "op_success") || resultCodes?.operations?.[0];
      
      let errorMsg = resultCodes 
        ? `Stellar Error: ${resultCodes.transaction}${opResult ? ` (${opResult})` : ""}`
        : (data?.detail || e.message || "Smart Seeding failed");

      if (e.response?.status === 404) {
        errorMsg = "Account not found on network. Fund your wallet with XLM first.";
      }
      
      toast.error(errorMsg, { id: toastId, description: "Check console for ledger details" });
      throw new Error(errorMsg);
    }
  };

  const initializeWallet = async () => {
    if (!address) throw new Error("Wallet not connected");
    
    const toastId = toast.loading("Initializing Wallet: Creating trustline...");
    try {
      const account = await horizonServer.loadAccount(address);
      const mtlswAsset = new Asset("BERRY", ISSUER_ADDRESS);

      const tx = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: NETWORK_DETAILS.networkPassphrase,
      })
        .addOperation(
          Operation.changeTrust({
            asset: mtlswAsset,
            limit: "1000000"
          })
        )
        .setTimeout(30)
        .build();

      toast.loading("Please sign the trustline in Freighter", { id: toastId });
      const signedXdr = await signWithFreighter(tx.toXDR(), NETWORK_DETAILS.network);
      
      if (!signedXdr) throw new Error("Transaction rejected");

      toast.loading("Activating trustline on network...", { id: toastId });
      const transaction = TransactionBuilder.fromXDR(signedXdr, NETWORK_DETAILS.networkPassphrase);
      const result = await horizonServer.submitTransaction(transaction);

      toast.success("Wallet Initialized!", { 
        id: toastId,
        description: "You are now ready to receive BERRY tokens."
      });
      return { status: "SUCCESS", hash: result.hash };
    } catch (e: any) {
      console.error("Initialization failed", e);
      const data = e.response?.data;
      const resultCodes = data?.extras?.result_codes;
      const opResult = resultCodes?.operations?.find((op: string) => op !== "op_success") || resultCodes?.operations?.[0];
      
      let errorMsg = resultCodes 
        ? `Stellar Error: ${resultCodes.transaction}${opResult ? ` (${opResult})` : ""}`
        : (data?.detail || e.message || "Initialization failed");

      if (e.response?.status === 404) {
        errorMsg = "Account not found. Please fund with XLM first.";
      }

      toast.error(errorMsg, { id: toastId });
      throw new Error(errorMsg);
    }
  };

  return { isAdmin, loading, mintToken, seedDEXLiquidity, initializeWallet };
};

