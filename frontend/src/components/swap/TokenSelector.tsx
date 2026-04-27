"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Check } from "lucide-react";
import { useState } from "react";

const TOKENS = [
  { id: "XLM", name: "WILD_CHERRY", symbol: "XLM", logo: "🍒" },
  { id: "BERRY", name: "SWEET_STRAWBERRY", symbol: "BERRY", logo: "🍓" },
  { id: "BETA", name: "SPRING_FLOWER", symbol: "BETA", logo: "🌸" },
  { id: "USDC", name: "SPARKLING_GEM", symbol: "USDC", logo: "💎" },
];

export default function TokenSelector({ 
  isOpen, 
  onClose, 
  onSelect, 
  selectedToken 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSelect: (token: any) => void;
  selectedToken: string;
}) {
  const [search, setSearch] = useState("");

  const filteredTokens = TOKENS.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.symbol.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-deep-berry/60 backdrop-blur-sm z-[100]"
          />
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-0 md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-full max-w-md plate p-6 z-[101] shadow-2xl bg-white"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black tracking-tighter text-strawberry-red">BERRY_PICKER 🍓</h2>
              <button onClick={onClose} className="p-2 recessed hover:scale-110 transition-all bg-strawberry-cream">
                <X size={20} className="text-strawberry-red" />
              </button>
            </div>

            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-strawberry-pink" size={18} />
              <input 
                type="text" 
                placeholder="FIND_FRUIT..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full recessed py-3 pl-12 pr-4 outline-none font-bold text-xs text-deep-berry placeholder:text-strawberry-pink bg-strawberry-cream/50"
              />
            </div>

            <div className="space-y-1 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredTokens.map((token) => (
                <button
                  key={token.id}
                  onClick={() => { onSelect(token); onClose(); }}
                  className={`w-full p-4 flex items-center justify-between transition-all rounded-2xl ${
                    selectedToken === token.id ? "bg-strawberry-cream border-2 border-strawberry-pink" : "hover:bg-soft-pink/20"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl w-10 h-10 flex items-center justify-center recessed bg-white border border-strawberry-pink">
                      {token.logo}
                    </div>
                    <div className="text-left">
                      <div className="font-black text-sm text-deep-berry">{token.symbol}</div>
                      <div className="text-[10px] text-strawberry-red uppercase font-bold">{token.name}</div>
                    </div>
                  </div>
                  {selectedToken === token.id && <Check size={18} className="text-strawberry-red" />}
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
