"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Loader2, Sparkles, AlertCircle } from "lucide-react";
import StatusBadge from "../shared/StatusBadge";
import { useAdmin } from "@/hooks/useAdmin";
import { useBlockchain } from "@/hooks/useBlockchain";
import { toast } from "sonner";

export default function WalletInitCard() {
  const { initializeWallet } = useAdmin();
  const { address, checkAssetTrust } = useBlockchain();
  const [hasTrust, setHasTrust] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  const checkStatus = async () => {
    if (!address) return;
    setChecking(true);
    try {
      const result = await checkAssetTrust("BERRY");
      setHasTrust(result);
    } catch (e) {
      setHasTrust(false);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, [address]);

  const handleInit = async () => {
    setLoading(true);
    try {
      await initializeWallet();
      await checkStatus();
    } catch (e) {
      // Handled by hook
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 plate border-berry-border relative overflow-hidden group font-bold">
      <div className="absolute -top-4 -right-4 text-4xl rotate-12 opacity-10 group-hover:opacity-20 transition-opacity">🍓</div>
      
      <div className="flex justify-between items-center mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-strawberry-cream rounded-2xl">
            <ShieldCheck className="text-strawberry-red" />
          </div>
          <div>
            <h3 className="text-xl font-black text-strawberry-red uppercase tracking-tight">SWEET_AUTHORIZATION 🎀</h3>
            <p className="text-xs text-deep-berry/70 font-black uppercase">VERIFY_GARDEN_TRUSTLINE</p>
          </div>
        </div>
        {checking ? (
          <Loader2 className="animate-spin text-strawberry-pink" size={16} />
        ) : (
          <StatusBadge type={hasTrust ? "success" : "warning"}>
            {hasTrust ? "SWEETENED" : "UNAUTHORIZED"}
          </StatusBadge>
        )}
      </div>

      <div className="space-y-4 relative z-10">
        <div className="p-5 rounded-2xl recessed bg-strawberry-cream/30 border border-strawberry-pink/10">
          <div className="flex items-start gap-3">
            {hasTrust ? (
              <Sparkles className="text-strawberry-red mt-1" size={18} />
            ) : (
              <AlertCircle className="text-strawberry-pink mt-1" size={18} />
            )}
            <div>
              <h4 className="text-sm font-black text-strawberry-red mb-1 uppercase">
                {hasTrust ? "GARDEN_READY" : "TRUST_REQUIRED"}
              </h4>
              <p className="text-[10px] text-deep-berry/70 leading-relaxed uppercase font-black">
                {hasTrust 
                  ? "YOUR_BASKET_IS_SUCCESSFULLY_LINKED_TO_THE_BERRY_GARDEN. YOU_CAN_NOW_PICK_FRUITS_AND_SEED_MARKET_LIQUIDITY."
                  : "EVERY_GARDENER_MUST_EXPLICITLY_TRUST_THE_PROTOCOLS_BERRIES_BEFORE_THEY_CAN_RECEIVE_THEM."}
              </p>
            </div>
          </div>
        </div>

        {!hasTrust && (
          <button
            onClick={handleInit}
            disabled={loading || checking}
            className="w-full py-4 bg-strawberry-red text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:scale-[1.02] shadow-berry transition-all active:scale-[0.98] disabled:opacity-50 uppercase tracking-widest text-xs"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                INITIALIZE_BASKET ✨
              </>
            )}
          </button>
        )}
        
        {hasTrust && (
          <div className="w-full py-4 bg-white text-strawberry-red border border-strawberry-pink/30 rounded-2xl font-black flex items-center justify-center gap-2 uppercase tracking-widest text-xs shadow-inner">
            <ShieldCheck size={20} /> INITIALIZATION_COMPLETE 🎀
          </div>
        )}
      </div>
    </div>
  );
}
