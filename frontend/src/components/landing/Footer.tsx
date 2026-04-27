"use client";

import { Activity, Github, Twitter, MessageSquare } from "lucide-react";
import Link from "next/link";
import { CONTRACT_IDS } from "@/lib/blockchain";

export default function Footer() {
  return (
    <footer className="py-24 border-t border-berry-border bg-soft-pink/30">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="md:col-span-2">
          <Link href="/" className="flex items-center gap-2 mb-6">
            <div className="p-2 recessed bg-white rounded-xl border border-strawberry-pink/30">
              <span className="text-xl">🍓</span>
            </div>
            <span className="font-accent text-2xl text-strawberry-red">BerrySwap</span>
          </Link>
          <p className="text-deep-berry max-w-sm mb-8 leading-tight text-xs uppercase font-bold">
             SOFT-GRADE LIQUIDITY INFRASTRUCTURE. FORGED ON SOROBAN. SWEET. PRECISE. DREAMY.
          </p>
          <div className="flex gap-2">
             <div className="p-3 plate cursor-pointer hover:scale-110 transition-all text-strawberry-red bg-white">
                <Twitter size={18} />
             </div>
             <div className="p-3 plate cursor-pointer hover:scale-110 transition-all text-strawberry-red bg-white">
                <Github size={18} />
             </div>
             <div className="p-3 plate cursor-pointer hover:scale-110 transition-all text-strawberry-red bg-white">
                <MessageSquare size={18} />
             </div>
          </div>
        </div>

        <div>
          <h4 className="font-black text-strawberry-red text-xs mb-6 pt-1 uppercase tracking-widest">_RESOURCES</h4>
          <ul className="space-y-4 text-deep-berry text-[10px] uppercase font-bold">
             <li><Link href="#" className="hover:text-strawberry-red transition-colors">Documentation</Link></li>
             <li><Link href="#" className="hover:text-strawberry-red transition-colors">Brand Assets</Link></li>
             <li><Link href="#" className="hover:text-strawberry-red transition-colors">Developer Portal</Link></li>
             <li><Link href="#" className="hover:text-strawberry-red transition-colors">Audit Reports</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-black text-strawberry-red text-xs mb-6 pt-1 uppercase tracking-widest">_BERRY_KEYS</h4>
          <ul className="space-y-4 text-[9px] text-deep-berry font-bold">
             <li className="flex flex-col gap-1">
                <span className="text-deep-berry/50 uppercase text-[8px] font-bold">ROUTER_ID</span>
                <span className="text-strawberry-red truncate">{CONTRACT_IDS.router}</span>
             </li>
             <li className="flex flex-col gap-1">
                <span className="text-deep-berry/50 uppercase text-[8px] font-bold">POOL_ID</span>
                <span className="text-strawberry-red truncate">{CONTRACT_IDS.pool}</span>
             </li>
             <li className="flex flex-col gap-1">
                <span className="text-deep-berry/50 uppercase text-[8px] font-bold">FACTORY_ID</span>
                <span className="text-strawberry-red truncate">{CONTRACT_IDS.token}</span>
             </li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 mt-20 pt-8 border-t border-berry-border flex flex-col md:flex-row justify-between items-center gap-4 text-[9px] text-deep-berry font-bold uppercase tracking-widest">
         <p>© 2026 BERRYSWAP. ALL RIGHTS RESERVED. 🍓🎀🌸</p>
         <div className="flex gap-8">
            <Link href="#" className="hover:text-strawberry-red transition-colors">PRIVACY_POLICY</Link>
            <Link href="#" className="hover:text-strawberry-red transition-colors">TERMS_OF_SERVICE</Link>
         </div>
      </div>
    </footer>
  );
}
