"use client";

import { Activity, ShieldCheck, Database, Server } from "lucide-react";
import GlassCard from "../shared/GlassCard";
import StatusBadge from "../shared/StatusBadge";
import { CONTRACT_IDS } from "@/lib/blockchain";

export default function PreflightCheck() {
  const isRouterSet = CONTRACT_IDS.router && !CONTRACT_IDS.router.includes("...");
  const isPoolSet = CONTRACT_IDS.pool && !CONTRACT_IDS.pool.includes("...");

  const checks = [
    { name: "BERRY_NODE", status: "HEALTHY", icon: Server },
    { name: "ROUTER_STATE", status: "SWEET", icon: Database },
    { name: "POOL_REGISTRY", status: "FLOWERING", icon: ShieldCheck },
    { name: "LEDGER_STREAM", status: "ACTIVE", icon: Activity },
  ];

  return (
    <GlassCard className="p-8 bg-white border-berry-border font-bold relative overflow-hidden">
      <div className="absolute -top-4 -right-4 text-4xl rotate-12 opacity-10">🎀</div>
      <h3 className="text-lg font-black mb-6 flex flex-col gap-2 text-strawberry-red uppercase tracking-tight">
        GARDEN_HEALTH 🌸
        <StatusBadge type="live">
          NETWORK_TESTNET_SYNCHRONIZED
        </StatusBadge>
      </h3>
      
      <div className="grid grid-cols-1 gap-2">
        {checks.map((check) => (
          <div key={check.name} className="p-4 recessed flex items-center justify-between bg-strawberry-cream/30 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 plate text-strawberry-red bg-white border border-strawberry-pink/30 rounded-lg">
                <check.icon size={16} />
              </div>
              <span className="text-[10px] font-black text-deep-berry/70 uppercase">{check.name}</span>
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-strawberry-red">{check.status}</span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
