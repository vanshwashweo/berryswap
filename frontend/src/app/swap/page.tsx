"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeftRight, 
  Settings2, 
  ChevronDown, 
  ExternalLink,
  Loader2,
  Info
} from "lucide-react";
import { useState, useEffect } from "react";
import { useBlockchain } from "@/hooks/useBlockchain";
import { useSwap } from "@/hooks/useSwap";
import { usePoolData } from "@/hooks/usePoolData";
import Navbar from "@/components/landing/Navbar";
import TokenSelector from "@/components/swap/TokenSelector";
import SlippageModal from "@/components/swap/SlippageModal";
import PriceChart from "@/components/swap/PriceChart";
import GlassCard from "@/components/shared/GlassCard";
import { useBalances } from "@/hooks/useBalances";
import { toast } from "sonner";

export default function SwapPage() {
  const { address, connect, checkAssetTrust, setupTrustline } = useBlockchain();
  const { executeSwap, getSwapQuote, status, txHash } = useSwap();
  const [isQuoting, setIsQuoting] = useState(false);
  const [sellAmount, setSellAmount] = useState("");
  const [buyAmount, setBuyAmount] = useState("");
  const [sellToken, setSellToken] = useState({ id: "XLM", symbol: "XLM", logo: "🚀" });
  const [buyToken, setBuyToken] = useState({ id: "BERRY", symbol: "BERRY", logo: "🍓" });
  const [isTokenSelectorOpen, setIsTokenSelectorOpen] = useState(false);
  const [selectorTarget, setSelectorTarget] = useState<"sell" | "buy">("sell");
  const [isSlippageOpen, setIsSlippageOpen] = useState(false);
  const [slippage, setSlippage] = useState(0.5);
  const { balances, refresh: refreshBalances } = useBalances(address);

  const { priceImpact, loading: poolLoading } = usePoolData(sellToken.id, sellAmount);

  // Live price update from Network Pathfinding
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (sellAmount && parseFloat(sellAmount) > 0) {
         setIsQuoting(true);
          const [whole = "0", frac = ""] = sellAmount.split(".");
          const paddedFrac = (frac + "0000000").slice(0, 7);
          const amountInScaled = (BigInt(whole) * BigInt(10000000) + BigInt(paddedFrac)).toString();
          const quote = await getSwapQuote(sellToken.id, amountInScaled, buyToken.id);
         
         if (quote) {
            setBuyAmount(parseFloat(quote).toFixed(4));
         } else {
            setBuyAmount("0.00");
         }
         setIsQuoting(false);
      } else {
         setBuyAmount("");
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [sellAmount, sellToken, buyToken, getSwapQuote]);

  const [hasTrust, setHasTrust] = useState(true);
  const [isCheckingTrust, setIsCheckingTrust] = useState(false);

  // Check trustline when buy token or address changes
  useEffect(() => {
    const verifyTrust = async () => {
      if (!address || buyToken.symbol === "XLM") {
        setHasTrust(true);
        return;
      }
      setIsCheckingTrust(true);
      const trusted = await checkAssetTrust(buyToken.symbol);
      setHasTrust(trusted);
      setIsCheckingTrust(false);
    };
    verifyTrust();
  }, [address, buyToken, checkAssetTrust]);

  const handleSwap = async () => {
    if (!address) {
      await connect();
      return;
    }
    
    // Step 1: Trustline Check
    if (!hasTrust) {
      if (balances.XLM < 1.0) { // 0.5 reserve + fee + buffer
        toast.error("Insufficient XLM balance to enable token (requires at least 1 XLM)");
        return;
      }
      const success = await setupTrustline(buyToken.symbol);
      if (success) {
        // Re-verify trustline state after successful setup (with retries for Horizon)
        const trusted = await checkAssetTrust(buyToken.symbol, undefined, 5);
        setHasTrust(trusted);
        refreshBalances();
      }
      return;
    }

    // Validate amounts before proceeding
    if (!sellAmount || parseFloat(sellAmount) <= 0) {
      toast.error("Please enter a valid sell amount.");
      return;
    }
    if (!buyAmount || parseFloat(buyAmount) <= 0) {
      toast.error("No quote available. Market may have no liquidity — try seeding DEX from Admin Hub.");
      return;
    }

    // Scale decimal strings to 7-decimal-place integers without floating point errors
    const scaleToStroops = (decimalStr: string): string => {
      const [whole = "0", frac = ""] = decimalStr.split(".");
      const paddedFrac = (frac + "0000000").slice(0, 7);
      return (BigInt(whole) * BigInt(10000000) + BigInt(paddedFrac)).toString();
    };

    const minOutDecimal = (parseFloat(buyAmount) * (1 - slippage / 100)).toFixed(7);
    const amountIn = scaleToStroops(sellAmount);
    const minOutScaled = scaleToStroops(minOutDecimal);

    try {
      await executeSwap(address, sellToken.id, amountIn, minOutScaled);
      refreshBalances();

      // Calculate new reserves (AMM x * y = k)
      // For this demo, we assume initial reserves are 10,000 : 1,000
      const currentReserves = { XLM: 10000, BERRY: 1000 };
      const amtIn = parseFloat(sellAmount);
      const amtOut = parseFloat(buyAmount);
      const newResA = sellToken.symbol === "XLM" ? currentReserves.XLM + amtIn : currentReserves.XLM - amtOut;
      const newResB = sellToken.symbol === "BERRY" ? currentReserves.BERRY + amtIn : currentReserves.BERRY - amtOut;

      // Persist to MongoDB
      await Promise.all([
        fetch("/api/swaps", {
          method: "POST",
          body: JSON.stringify({
            userAddress: address,
            fromToken: sellToken.symbol,
            toToken: buyToken.symbol,
            fromAmount: sellAmount,
            toAmount: buyAmount,
            txHash: "sim_" + Math.random().toString(36).substring(7)
          })
        }),
        fetch("/api/pool/stats", {
          method: "PATCH",
          body: JSON.stringify({
            xlmReserve: newResA.toString(),
            berryReserve: newResB.toString(),
            volume24h: 482000 + (sellToken.symbol === "XLM" ? amtIn : amtOut * 10)
          })
        })
      ]);
    } catch (err) {
      // Handled by hook
    }
  };

  const getImpactColor = (impact: number) => {
    if (impact < 1) return "text-strawberry-red";
    if (impact < 3) return "text-deep-berry opacity-80";
    return "text-deep-berry brightness-50";
  };

  return (
    <div className="bg-strawberry-cream min-h-screen text-deep-berry pt-24 pb-12 font-bold selection:bg-strawberry-pink/40">
      <Navbar />
      <div className="absolute top-0 left-0 w-full h-[600px] opacity-10 pointer-events-none grid-background" />

      <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row justify-center items-start gap-8 relative z-10 pt-8">
        
        {/* Left Side: Chart & Info */}
        <div className="hidden lg:flex flex-col gap-6 w-[300px]">
          <div className="plate p-6 h-[300px] bg-white">
            <PriceChart />
          </div>
          <div className="plate p-6 bg-white">
            <h3 className="flex items-center gap-2 text-[10px] mb-4 tracking-widest text-deep-berry">
               <Info size={14} className="text-strawberry-red" /> BERRY_SPECIFICATIONS
            </h3>
            <div className="space-y-3 text-[10px]">
                <div className="flex justify-between">
                   <span className="text-deep-berry/70">FRUIT_DEPTH</span>
                   <span className="text-strawberry-red">$2.4M</span>
                </div>
                <div className="flex justify-between">
                   <span className="text-deep-berry/70">BERRY_VOLUME_24H</span>
                   <span className="text-strawberry-red">$482k</span>
                </div>
                <div className="flex justify-between">
                   <span className="text-deep-berry/70">SWEET_FEES_24H</span>
                   <span className="text-strawberry-red">$1.4k</span>
                </div>
            </div>
          </div>
        </div>

        {/* Center: Swap Card */}
        <div className="flex-1 flex justify-center w-full">
          <GlassCard className="w-full max-w-[480px] p-8 bg-soft-pink/50 backdrop-blur-md border-berry-border relative overflow-hidden">
            {/* Bow Decoration */}
            <div className="absolute -top-4 -right-4 text-4xl rotate-12 opacity-20">🎀</div>
            
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black tracking-tighter text-strawberry-red">BERRY_SWAP 🍓</h2>
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsSlippageOpen(true)}
                  className="p-2 recessed hover:scale-110 transition-all bg-white"
                >
                  <Settings2 size={18} className="text-strawberry-red" />
                </button>
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-2 relative">
              {/* From */}
              <div className="p-6 recessed group transition-all bg-white/80">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[9px] font-black tracking-widest text-deep-berry">YOUR_BASKET</span>
                  <div className="text-[9px] text-deep-berry">
                    BAL: <span className="text-strawberry-red">{balances[sellToken.symbol as keyof typeof balances] || 0}</span>
                    <button 
                      onClick={() => setSellAmount((balances[sellToken.symbol as keyof typeof balances] || 0).toString())}
                      className="ml-2 text-strawberry-red underline font-black hover:brightness-125"
                    >
                      MAX
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center gap-4">
                  <input 
                    type="number"
                    placeholder="0.00"
                    value={sellAmount}
                    onChange={(e) => setSellAmount(e.target.value)}
                    className="bg-transparent text-4xl font-black outline-none w-full placeholder:text-strawberry-pink text-strawberry-red"
                  />
                  <button 
                    onClick={() => { setSelectorTarget("sell"); setIsTokenSelectorOpen(true); }}
                    className="flex items-center gap-2 plate px-4 py-2 transition-all active:scale-95 bg-white"
                  >
                    <span className="text-xl">{sellToken.logo}</span>
                    <span className="font-black text-strawberry-red">{sellToken.symbol}</span>
                    <ChevronDown size={16} className="text-deep-berry" />
                  </button>
                </div>
              </div>

              {/* Swap Button */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                <motion.button 
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  onClick={() => {
                    const temp = sellToken;
                    setSellToken(buyToken);
                    setBuyToken(temp);
                  }}
                  className="p-3 plate bg-white text-strawberry-red shadow-berry active:scale-90"
                >
                  <ArrowLeftRight size={20} />
                </motion.button>
              </div>

              {/* To */}
              <div className="p-6 recessed group transition-all pt-8 bg-white/80">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[9px] font-black tracking-widest text-deep-berry">FRESH_FRUIT</span>
                  <div className="text-[9px] text-deep-berry">
                    BAL: <span className="text-strawberry-red">{(balances[buyToken.symbol as keyof typeof balances] || 0).toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center gap-4">
                  <div className="text-4xl font-black w-full truncate h-10 flex items-center text-strawberry-red">
                    {isQuoting ? (
                      <Loader2 className="animate-spin text-strawberry-pink" size={24} />
                    ) : buyAmount ? (
                      buyAmount
                    ) : (
                      <span className="text-strawberry-pink opacity-30">0.00</span>
                    )}
                  </div>
                  <button 
                    onClick={() => { setSelectorTarget("buy"); setIsTokenSelectorOpen(true); }}
                    className="flex items-center gap-2 plate px-4 py-2 transition-all active:scale-95 bg-white"
                  >
                    <span className="text-xl">{buyToken.logo}</span>
                    <span className="font-black text-strawberry-red">{buyToken.symbol}</span>
                    <ChevronDown size={16} className="text-deep-berry" />
                  </button>
                </div>
              </div>
            </div>

            {/* Details */}
            <AnimatePresence>
              {sellAmount && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-6 space-y-3 overflow-hidden text-[10px]"
                >
                   <div className="flex justify-between items-center text-deep-berry/70">
                      <span>SWEET_RATE</span>
                      <span className="font-black text-strawberry-red">
                        {isQuoting ? "..." : `1 ${sellToken.symbol} = ${(parseFloat(buyAmount) / (parseFloat(sellAmount) || 1)).toFixed(4)} ${buyToken.symbol}`}
                      </span>
                   </div>
                   <div className="flex justify-between items-center text-deep-berry/70">
                      <span>BERRY_IMPACT</span>
                      <span className={`font-black ${getImpactColor(priceImpact)}`}>{poolLoading ? "..." : `${priceImpact.toFixed(2)}%`}</span>
                   </div>
                   <div className="flex justify-between items-center text-deep-berry/70">
                      <span>SLIPPAGE_TOLERANCE</span>
                      <span className="font-black text-strawberry-red">{slippage}%</span>
                   </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Button */}
            <button 
              onClick={handleSwap}
              disabled={(status !== "IDLE" && status !== "SUCCESS" && status !== "ERROR") || isCheckingTrust}
              className={`w-full py-5 font-black uppercase tracking-tighter text-lg mt-8 transition-all flex items-center justify-center gap-2 btn-industrial rounded-3xl ${
                address 
                  ? "bg-strawberry-red text-white" 
                  : "bg-soft-pink text-deep-berry opacity-50"
              }`}
            >
              <span className="z-10 flex items-center gap-2">
                {isCheckingTrust ? (
                  <Loader2 size={24} className="animate-spin" />
                ) : !address ? (
                  "PREPARE_BASKET 🧺"
                ) : !hasTrust ? (
                  `ADOPT_${buyToken.symbol} 🍓`
                ) : status === "IDLE" || status === "SUCCESS" || status === "ERROR" ? (
                  "SWAP_WITH_LOVE 💖"
                ) : (
                  <>
                    <Loader2 size={24} className="animate-spin" />
                    {status.toUpperCase()}
                  </>
                )}
              </span>
            </button>

            {/* Result Link */}
            {txHash && (
               <motion.a 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 href={`https://blockchain.expert/explorer/testnet/tx/${txHash}`}
                 target="_blank"
                 className="flex items-center justify-center gap-2 mt-6 text-[10px] text-deep-berry/50 hover:text-strawberry-red transition-colors font-black tracking-widest"
               >
                 VIEW_ON_EXPLORER <ExternalLink size={10} />
               </motion.a>
            )}
          </GlassCard>
        </div>

      </div>

      {/* Modals */}
      <TokenSelector 
        isOpen={isTokenSelectorOpen}
        onClose={() => setIsTokenSelectorOpen(false)}
        selectedToken={selectorTarget === "sell" ? sellToken.id : buyToken.id}
        onSelect={(token) => {
          if (selectorTarget === "sell") setSellAmount(""), setSellToken(token);
          else setBuyToken(token);
        }}
      />

      <SlippageModal 
        isOpen={isSlippageOpen}
        onClose={() => setIsSlippageOpen(false)}
        value={slippage}
        onChange={setSlippage}
      />
    </div>
  );
}
