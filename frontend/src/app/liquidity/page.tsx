"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Minus, 
  Droplets, 
  Wallet,
  Loader2,
  ArrowRightLeft,
  Flower
} from "lucide-react";
import { useState, useEffect } from "react";
import { useBlockchain } from "@/hooks/useBlockchain";
import { usePoolData } from "@/hooks/usePoolData";
import { useLiquidity } from "@/hooks/useLiquidity";
import Navbar from "@/components/landing/Navbar";
import GlassCard from "@/components/shared/GlassCard";
import StatusBadge from "@/components/shared/StatusBadge";
import { useBalances } from "@/hooks/useBalances";
import { toast } from "sonner";

export default function LiquidityPage() {
  const { address, connect, checkAssetTrust, setupTrustline } = useBlockchain();
  const [activeTab, setActiveTab] = useState<"add" | "remove">("add");
  const { reserves, totalShares, userShares, loading: poolLoading } = usePoolData("XLM", "0", address);
  const { deposit, withdraw, loading: actionLoading } = useLiquidity();
  const { balances, refresh: refreshBalances } = useBalances(address);

  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");
  const [removePercent, setRemovePercent] = useState(50);
  
  const [hasTrustB, setHasTrustB] = useState(true);
  const [isCheckingTrust, setIsCheckingTrust] = useState(false);

  // Check trustline for Asset B (BERRY)
  useEffect(() => {
    const verifyTrust = async () => {
      if (!address) return;
      setIsCheckingTrust(true);
      const trusted = await checkAssetTrust("BERRY");
      setHasTrustB(trusted);
      setIsCheckingTrust(false);
    };
    verifyTrust();
  }, [address, checkAssetTrust]);

  useEffect(() => {
    if (amountA && reserves) {
      const ratio = Number(reserves.resB) / Number(reserves.resA);
      setAmountB((parseFloat(amountA) * ratio).toFixed(4));
    } else {
      setAmountB("");
    }
  }, [amountA, reserves]);

  const handleDeposit = async () => {
    if (!address) return connect();

    // Step 1: Trustline Check for BERRY
    if (!hasTrustB) {
      if (balances.XLM < 1.0) {
        toast.error("Insufficient XLM balance to enable token (requires at least 1 XLM)");
        return;
      }
      const success = await setupTrustline("BERRY");
      if (success) {
        const trusted = await checkAssetTrust("BERRY", undefined, 5);
        setHasTrustB(trusted);
        refreshBalances();
      }
      return;
    }

    const scaledA = (parseFloat(amountA) * 10000000).toString();
    const scaledB = (parseFloat(amountB) * 10000000).toString();
    await deposit(address, scaledA, scaledB);
  };

  const handleWithdraw = async () => {
    if (!address) return connect();
    const shareToBurn = (userShares * BigInt(removePercent)) / BigInt(100);
    await withdraw(address, shareToBurn.toString());
  };

  return (
    <div className="bg-strawberry-cream min-h-screen text-deep-berry pt-32 pb-20 overflow-x-hidden font-bold">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
            <div>
               <div className="flex items-center gap-3 mb-2">
                  <Flower className="text-strawberry-red" size={32} />
                  <h1 className="text-4xl font-black tracking-tighter text-strawberry-red">BERRY_GARDEN 🍓</h1>
               </div>
               <p className="text-deep-berry/70 max-w-lg text-[10px] uppercase leading-tight font-bold">
                 PROVISION OF ASSETS TO THE SWEET MARKET MAKER REGISTRY. EARN 0.3% TRANSACTION_FEES.
               </p>
            </div>
            <StatusBadge type="live">XLM / BERRY POOL</StatusBadge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                 
                 {/* Liquidity Management Card */}
                 <GlassCard className="p-8 bg-soft-pink/50 backdrop-blur-md border-berry-border relative overflow-hidden">
                    <div className="absolute -top-4 -right-4 text-4xl rotate-12 opacity-20">🎀</div>
                    
                    <div className="flex recessed p-1 gap-1 mb-10 w-full bg-white/50">
                      <button 
                        onClick={() => setActiveTab("add")}
                        className={`relative flex-1 py-3 font-black text-xs transition-all flex items-center justify-center gap-2 rounded-xl ${activeTab === "add" ? "bg-strawberry-red text-white" : "text-deep-berry hover:bg-white/50"}`}
                      >
                        <Plus size={14}/> ADD_BERRIES
                      </button>
                      <button 
                        onClick={() => setActiveTab("remove")}
                        className={`relative flex-1 py-3 font-black text-xs transition-all flex items-center justify-center gap-2 rounded-xl ${activeTab === "remove" ? "bg-strawberry-red text-white" : "text-deep-berry hover:bg-white/50"}`}
                      >
                        <Minus size={14}/> PICK_BERRIES
                      </button>
                    </div>

                    <AnimatePresence mode="wait">
                      {activeTab === "add" ? (
                        <motion.div key="add" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                          <div className="p-6 recessed bg-white/80">
                              <div className="flex justify-between items-center mb-4">
                                <span className="text-[9px] font-black uppercase tracking-widest text-deep-berry">CREAM_XLM</span>
                                <span className="text-[9px] font-bold text-strawberry-red">BAL: {balances.XLM || 0}</span>
                              </div>
                             <div className="flex justify-between items-center gap-4">
                                <input type="number" placeholder="0.00" value={amountA} onChange={(e) => setAmountA(e.target.value)} className="bg-transparent text-3xl font-black outline-none w-full text-strawberry-red" />
                                <div className="flex items-center gap-2 plate px-4 py-2 font-black text-xs text-strawberry-red bg-white">XLM</div>
                             </div>
                          </div>
                          <div className="flex justify-center -my-3 relative z-20">
                             <div className="p-2 plate text-strawberry-red bg-white"><Plus size={16} /></div>
                          </div>
                          <div className="p-6 recessed bg-white/80">
                              <div className="flex justify-between items-center mb-4">
                                <span className="text-[9px] font-black uppercase tracking-widest text-deep-berry">SWEET_BERRY</span>
                                <span className="text-[9px] font-bold text-strawberry-red">BAL: {balances.BERRY || 0}</span>
                              </div>
                             <div className="flex justify-between items-center gap-4">
                                <input type="number" placeholder="0.00" value={amountB} readOnly className="bg-transparent text-3xl font-black outline-none w-full text-strawberry-pink" />
                                <div className="flex items-center gap-2 plate px-4 py-2 font-black text-xs text-strawberry-red bg-white">BERRY</div>
                             </div>
                          </div>
                          <button 
                             onClick={handleDeposit} 
                             disabled={actionLoading || !amountA || isCheckingTrust} 
                             className="btn-industrial w-full bg-strawberry-red text-white mt-8 uppercase font-black tracking-widest rounded-2xl"
                          >
                            {actionLoading || isCheckingTrust ? (
                              <Loader2 className="animate-spin" />
                            ) : !address ? (
                              "CONNECT_BASKET"
                            ) : !hasTrustB ? (
                              "ENABLE_BERRY"
                            ) : (
                              "PLANT_SEEDS 🍓"
                            )}
                          </button>
                        </motion.div>
                      ) : (
                        <motion.div key="remove" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
                          <div className="text-center p-8 recessed bg-white/80">
                              <div className="text-5xl font-black mb-2 text-strawberry-red">{removePercent}%</div>
                              <input type="range" min="0" max="100" value={removePercent} onChange={(e) => setRemovePercent(parseInt(e.target.value))} className="w-full mt-8 accent-strawberry-red" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                              <div className="p-4 recessed bg-white/80">
                                  <div className="text-[9px] text-deep-berry font-black mb-1 uppercase">XLM_PICKED</div>
                                  <div className="text-xl font-black text-strawberry-red">{(Number(userShares) * removePercent / 1e9).toFixed(2)}</div>
                              </div>
                              <div className="p-4 recessed bg-white/80">
                                  <div className="text-[9px] text-deep-berry font-black mb-1 uppercase">BERRY_PICKED</div>
                                  <div className="text-xl font-black text-strawberry-red">{(Number(userShares) * removePercent / 1e9).toFixed(2)}</div>
                              </div>
                          </div>
                          <button onClick={handleWithdraw} disabled={actionLoading || userShares === BigInt(0)} className="btn-industrial w-full bg-deep-berry text-white mt-8 uppercase font-black tracking-widest rounded-2xl">
                            {actionLoading ? <Loader2 className="animate-spin" /> : "COLLECT_FRUIT 🧺"}
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                 </GlassCard>

                 {/* Position Information Overlay */}
                 <div className="space-y-8">
                    <GlassCard className="p-8 relative overflow-hidden group bg-soft-pink/50 backdrop-blur-md border-berry-border">
                        <div className="absolute -top-4 -right-4 text-4xl rotate-12 opacity-20">🌸</div>
                        <h3 className="font-black mb-6 flex items-center gap-2 text-[10px] uppercase tracking-widest text-deep-berry"><Wallet size={16} className="text-strawberry-red" /> YOUR_GARDEN</h3>
                        {address ? (
                           <div className="space-y-8">
                              <div className="flex justify-between items-end">
                                 <div>
                                    <div className="text-[9px] text-deep-berry/70 mb-1 font-black">GARDEN_SHARE</div>
                                    <div className="text-4xl font-black text-strawberry-red">{totalShares > 0 ? ((Number(userShares) / Number(totalShares)) * 100).toFixed(2) : "0.00"}%</div>
                                 </div>
                                 <div className="text-right">
                                    <div className="text-[9px] text-deep-berry/70 mb-1 font-black">SEED_INVENTORY</div>
                                    <div className="text-xl font-black text-strawberry-red">{Number(userShares) / 10000000} LP</div>
                                 </div>
                              </div>
                              <div className="space-y-4 pt-6 border-t border-berry-border">
                                 <p className="text-[9px] text-deep-berry/70 leading-tight uppercase font-bold">LIQUIDITY_PROVISION GENERATES 0.3% FEES PER TRADE. REWARDS ARE COMPOUNDED AUTOMATICALLY INTO GARDEN POSITION.</p>
                              </div>
                           </div>
                        ) : (
                           <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-berry-border gap-4 bg-white/30 rounded-2xl">
                              <p className="text-[9px] font-bold text-deep-berry uppercase tracking-widest">CONNECT_BASKET TO ACCESS GARDEN</p>
                              <button onClick={connect} className="btn-industrial px-6 py-2 text-[10px] font-black transition-all rounded-xl">ESTABLISH_CONNECTION</button>
                           </div>
                        )}
                    </GlassCard>

                    <div className="p-8 plate bg-white/80">
                       <h4 className="font-black flex items-center gap-2 text-[10px] mb-4 text-strawberry-red uppercase tracking-widest"><ArrowRightLeft size={16} className="text-strawberry-red" /> BERRY_BENEFITS</h4>
                       <ul className="space-y-3 text-[9px] text-deep-berry font-black uppercase leading-tight list-none">
                          <li>🌸 EARN PASSIVE REWARDS FROM TRANSACTION FLOW.</li>
                          <li>🍓 STABILIZE THE NETWORK BERRY FABRIC.</li>
                          <li>🎀 SECURE OWNERSHIP VIA SEED_TOKEN REGISTRATION.</li>
                       </ul>
                    </div>
                 </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}
