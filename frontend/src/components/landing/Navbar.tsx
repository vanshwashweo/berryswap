"use client";

import { motion } from "framer-motion";
import { Activity, Menu, X } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useBlockchain } from "@/hooks/useBlockchain";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { address, connect, loading } = useBlockchain();

  return (
    <nav className="fixed top-0 w-full z-[999] px-6 py-4">
      <div className="max-w-7xl mx-auto plate px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="p-2 recessed group-hover:scale-110 transition-all bg-soft-pink rounded-xl border-strawberry-pink/30 border">
            <span className="text-xl">🍓</span>
          </div>
          <span className="font-accent text-2xl text-strawberry-red">BerrySwap</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6 text-xs font-bold text-deep-berry">
          <Link href="/swap" className="hover:text-strawberry-red transition-colors">SWAP</Link>
          <Link href="/liquidity" className="hover:text-strawberry-red transition-colors">LIQUIDITY</Link>
          <Link href="/pool" className="hover:text-strawberry-red transition-colors">ANALYTICS</Link>
          <Link href="/admin" className="hover:text-strawberry-red transition-colors border-l border-berry-border pl-6">ADMIN</Link>
          {address && (
            <a 
              href={`https://laboratory.blockchain.org/#account-creator?public_key=${address}`}
              target="_blank" 
              className="hidden lg:flex items-center gap-1 text-[9px] font-bold text-strawberry-red hover:underline transition-colors uppercase tracking-widest"
            >
              Get Berry Tokens
            </a>
          )}
          <button 
            onClick={connect}
            disabled={loading}
            className="btn-industrial py-2 rounded-xl"
          >
            {loading ? "PENDING..." : address ? `${address.slice(0,4)}...${address.slice(-4)}` : "CONNECT_BERRY"}
          </button>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-deep-berry" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden absolute top-20 left-6 right-6 plate p-6 flex flex-col gap-4 text-center"
        >
          <Link href="/swap" onClick={() => setIsOpen(false)} className="text-deep-berry text-sm font-bold">SWAP TOKENS</Link>
          <Link href="/liquidity" onClick={() => setIsOpen(false)} className="text-deep-berry text-sm font-bold">ADD LIQUIDITY</Link>
          <Link href="/pool" onClick={() => setIsOpen(false)} className="text-deep-berry text-sm font-bold">PROTOCOL ANALYTICS</Link>
          <Link href="/admin" onClick={() => setIsOpen(false)} className="text-strawberry-red font-bold">ADMIN HUB</Link>
          <button 
             onClick={() => { connect(); setIsOpen(false); }}
             disabled={loading}
             className="btn-industrial w-full rounded-xl"
          >
             {loading ? "PENDING..." : address ? `${address.slice(0,4)}...${address.slice(-4)}` : "CONNECT_BERRY"}
          </button>
        </motion.div>
      )}
    </nav>
  );
}
