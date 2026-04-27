"use client";

import { LayoutDashboard, Lock, ShieldAlert, Activity } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import { useAdmin } from "@/hooks/useAdmin";
import MintCard from "@/components/admin/MintCard";
import WalletInitCard from "@/components/admin/WalletInitCard";
import PreflightCheck from "@/components/admin/PreflightCheck";
import StatusBadge from "@/components/shared/StatusBadge";
import { motion } from "framer-motion";
import { useBlockchain } from "@/hooks/useBlockchain";
import { ISSUER_ADDRESS } from "@/lib/blockchain";
import { AlertCircle } from "lucide-react";

export default function AdminPage() {
  const { isAdmin, loading, seedDEXLiquidity } = useAdmin();
  const { address } = useBlockchain();
  
  const isIssuer = address === ISSUER_ADDRESS;

  if (loading) {
    return (
      <div className="min-h-screen bg-strawberry-cream flex flex-col items-center justify-center">
        <Navbar />
        <div className="p-8 plate border-b-2 border-strawberry-red animate-spin rounded-full" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-strawberry-cream flex flex-col items-center justify-center p-6 text-center font-bold">
        <Navbar />
        <div className="w-20 h-20 recessed flex items-center justify-center mb-6 bg-white">
          <Lock className="text-strawberry-red" size={40} />
        </div>
        <h1 className="text-3xl font-black mb-4 text-strawberry-red uppercase tracking-tighter">ACCESS_DENIED 🎀</h1>
        <p className="text-deep-berry max-w-md mb-8 uppercase text-[10px] leading-tight font-black">
          BERRY_ADMIN_BASKET_REQUIRED. ESTABLISH_AUTHORIZED_CONNECTION_TO_PROCEED.
        </p>
        <StatusBadge type="error">NOT_SWEET_ENOUGH</StatusBadge>
      </div>
    );
  }

  return (
    <div className="bg-strawberry-cream min-h-screen text-deep-berry pt-32 pb-12 font-bold">
      <Navbar />
      <div className="absolute top-0 left-0 w-full h-[600px] opacity-10 pointer-events-none grid-background" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Activity className="text-strawberry-red" size={32} />
              <h1 className="text-4xl font-black tracking-tighter text-strawberry-red uppercase">BERRY_HUB 🍓</h1>
            </div>
            <p className="text-deep-berry font-black uppercase text-[10px]">GLOBAL_ADMINISTRATION_AND_SWEET_DIAGNOSTIC_ORCHARD</p>
          </div>
          <div className="flex flex-wrap gap-2">
             <StatusBadge type="live">GARDEN_MONITOR</StatusBadge>
             <StatusBadge type="success">SWEET_LINK_ESTABLISHED</StatusBadge>
             <StatusBadge type={isIssuer ? "info" : "success"}>
               ROLE: {isIssuer ? "ISSUER" : "GARDENER"}
             </StatusBadge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="lg:col-span-8 space-y-8"
          >
            {!isIssuer && <WalletInitCard />}
            <MintCard />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="bg-white p-8 plate border-berry-border relative overflow-hidden group">
                  <div className="absolute -top-2 -right-2 text-2xl opacity-10">🌸</div>
                  <h3 className="text-lg font-black mb-2 text-strawberry-red uppercase tracking-tight">ORDERBOOK_REGISTRY</h3>
                  <p className="text-[10px] text-deep-berry/70 mb-6 font-black uppercase leading-tight">INITIALIZE_TRADITIONAL_DEX_FRUIT_FABRIC.</p>
                  
                  {isIssuer ? (
                    <div className="recessed p-4 mb-4 flex items-start gap-3 bg-strawberry-cream">
                      <AlertCircle className="text-strawberry-red shrink-0 mt-0.5" size={16} />
                      <div className="text-[9px] text-strawberry-red leading-tight uppercase font-black">
                        <strong>ISSUER_RESTRICTION:</strong> SWITCH_TO_GARDENER_IDENTITY.
                      </div>
                    </div>
                  ) : null}

                  <button 
                    disabled={isIssuer}
                    onClick={async () => {
                      try {
                        await seedDEXLiquidity();
                      } catch (err) {
                        // Handled by hook toasts
                      }
                    }}
                    className="text-strawberry-red font-black text-xs tracking-widest uppercase flex items-center gap-2 hover:scale-105 transition-all"
                  >
                    SEED_BERRY_LIQUIDITY 🍓
                  </button>
               </div>
               <div className="bg-white p-8 plate border-berry-border relative overflow-hidden group">
                  <div className="absolute -top-2 -right-2 text-2xl opacity-10">🎀</div>
                  <h3 className="text-lg font-black mb-2 text-strawberry-red uppercase tracking-tight">GARDEN_LOGS</h3>
                  <p className="text-[10px] text-deep-berry/70 mb-6 font-black uppercase leading-tight">AUDIT_CONTRACT_INTERACTIONS_AND_SWEET_STATE.</p>
                  <button className="text-strawberry-red font-black text-xs tracking-widest uppercase flex items-center gap-2 hover:scale-105 transition-all">
                    VIEW_GARDEN_TRAIL 🧺
                  </button>
               </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="lg:col-span-4"
          >
            <PreflightCheck />
            <div className="mt-8 p-6 plate border-berry-border flex items-start gap-4 bg-white">
               <ShieldAlert className="text-strawberry-red mt-1" size={20} />
               <div>
                  <h4 className="text-xs font-black text-strawberry-red mb-1 uppercase tracking-widest">BERRY_SAFETY_ZONE</h4>
                  <p className="text-[9px] text-deep-berry/70 leading-tight uppercase font-black">
                    FUNCTIONS_IN_THIS_MODULE_PERMANENTLY_ALTER_SWEETNESS. PROCEED_WITH_LOVE.
                  </p>
                  <button className="btn-industrial mt-4 text-[10px] font-black px-4 py-2 bg-strawberry-red text-white rounded-xl">
                    SUSPEND_GARDEN
                  </button>
               </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
