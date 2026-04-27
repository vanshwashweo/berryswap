"use client";

import { motion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden bg-strawberry-cream">
      {/* Background Grid */}
      <div className="absolute inset-0 grid-background opacity-40 pointer-events-none" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <motion.div
           initial={{ opacity: 0, x: -50 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1 recessed text-[10px] font-bold mb-6 text-strawberry-red uppercase">
            <span className="flex h-1.5 w-1.5 bg-strawberry-red animate-pulse rounded-full" />
                SYSTEM_STATUS: BERRY_SWEET 🍓
          </div>
          <h1 className="text-6xl md:text-8xl font-black leading-[0.9] mb-8 text-strawberry-red tracking-tight">
            SWAP <br />
            WITH <span className="font-accent text-strawberry-pink lowercase">love</span>
          </h1>
          <p className="text-lg font-medium text-deep-berry mb-10 max-w-lg leading-tight">
            Soft, dreamy, and decentralized. Built with precision Soroban smart contracts. No friction. All flavor.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/swap" className="btn-industrial bg-strawberry-red text-white px-10 py-5 text-lg flex items-center gap-2 rounded-2xl">
              START_SWAPPING <span className="text-xl">🎀</span>
            </Link>
            <Link href="#features" className="btn-industrial px-10 py-5 text-lg text-deep-berry bg-white border-berry-border">
              RESOURCES.MD
            </Link>
          </div>
          
          <div className="mt-12 flex items-center gap-6">
            <div className="flex -space-x-1">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-8 h-8 plate border border-berry-border bg-white rounded-full flex items-center justify-center text-[10px]">🌸</div>
              ))}
            </div>
            <div className="text-[10px] font-bold text-deep-berry uppercase tracking-widest">
              <span className="font-bold text-strawberry-red">2,400+</span>
              <span className="ml-2">HAPPY_USERS</span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="relative flex justify-center lg:justify-end"
        >
          {/* Main Hero Asset */}
          <div className="relative w-full max-w-lg plate p-4 bg-white/50 backdrop-blur-sm">
             <div className="recessed p-2 bg-white">
                <div className="aspect-square bg-gradient-to-br from-strawberry-pink to-strawberry-red rounded-2xl flex items-center justify-center text-8xl">
                    🍓
                </div>
             </div>
             
             {/* Live TPS Badge - Sweet Style */}
             <motion.div 
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="absolute -top-6 -right-6 plate p-4 bg-white shadow-berry border-berry-border"
             >
                 <div className="flex items-center gap-3">
                    <div className="p-2 recessed text-strawberry-red bg-soft-pink">
                       <Zap size={20} />
                    </div>
                    <div>
                       <div className="text-[9px] uppercase font-bold text-deep-berry">SWEET_THROUGHPUT</div>
                       <div className="text-xl font-bold text-strawberry-red">248.55_TPS</div>
                    </div>
                 </div>
             </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
