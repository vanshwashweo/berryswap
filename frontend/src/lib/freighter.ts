import { isConnected, requestAccess, signTransaction } from "@stellar/freighter-api";

export const isWalletConnected = async () => {
  if (typeof window === "undefined") return false;
  try {
    return await isConnected();
  } catch {
    return false;
  }
};

export const connectWallet = async () => {
  console.log("FREIGHTER: Modern connection path (v6+) started...");
  
  try {
    // 1. Check if extension exists (standard library check)
    const connected = await isConnected();
    if (!connected) {
      throw new Error("Freighter wallet not detected. Please ensure the extension is installed and enabled.");
    }

    // 2. Request Access (This triggers the popup and returns the public key)
    // In v6+, this is the primary handshake method
    const result = await requestAccess();
    
    // Some versions return an object with address, some return the address string
    const address = (result as any).address || result;

    if (address && typeof address === "string") {
      return address;
    }

    throw new Error("Shared public key not found in response.");
  } catch (e: any) {
    console.error("FREIGHTER: requestAccess failed", e);
    const msg = e.message || "Unknown error";
    
    if (msg.toLowerCase().includes("denied") || msg.toLowerCase().includes("declined") || msg.toLowerCase().includes("rejected")) {
      throw new Error("Connection request rejected by user.");
    }
    
    // In v6+, Site Not Trusted errors are usually handled gracefully by the popup itself
    throw new Error(`Connection Error: ${msg}`);
  }
};

export const signWithFreighter = async (xdr: string, network: string) => {
  try {
    // In v6+, signTransaction returns an object { signedTxXdr, signerAddress }
    const result = await signTransaction(xdr, { networkPassphrase: network });
    
    if (typeof result === "string") return result;
    if (result && (result as any).signedTxXdr) {
      return (result as any).signedTxXdr as string;
    }
    
    return null;
  } catch (e) {
    console.error("Signing failed", e);
    return null;
  }
};
