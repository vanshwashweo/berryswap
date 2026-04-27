"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Settings2 } from "lucide-react";
import { useState } from "react";

export default function SlippageModal({ 
  isOpen, 
  onClose, 
  value, 
  onChange 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  value: number;
  onChange: (val: number) => void;
}) {
  const PRESETS = [0.1, 0.5, 1.0];
  const [custom, setCustom] = useState(value.toString());

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
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm plate p-6 z-[101] shadow-2xl bg-white relative overflow-hidden"
          >
            <div className="absolute -top-4 -right-4 text-4xl rotate-12 opacity-20">🎀</div>
            
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-black tracking-tighter flex items-center gap-2 text-strawberry-red">
                <Settings2 size={18} className="text-strawberry-red" />
                BERRY_SETTINGS
              </h2>
              <button onClick={onClose} className="p-2 recessed hover:scale-110 transition-all bg-strawberry-cream">
                <X size={20} className="text-strawberry-red" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-bold text-deep-berry/70 mb-3 block uppercase tracking-widest">MAX_SQUISH (SLIPPAGE)</label>
                <div className="flex gap-1">
                  {PRESETS.map((p) => (
                    <button
                      key={p}
                      onClick={() => { onChange(p); setCustom(p.toString()); }}
                      className={`flex-1 py-3 font-black text-xs transition-all rounded-xl ${
                        value === p ? "bg-strawberry-red text-white" : "recessed bg-strawberry-cream text-strawberry-red"
                      }`}
                    >
                      {p}%
                    </button>
                  ))}
                  <div className="relative flex-1">
                    <input 
                      type="number"
                      placeholder="CUSTOM"
                      value={custom}
                      onChange={(e) => {
                        setCustom(e.target.value);
                        onChange(parseFloat(e.target.value) || 0.5);
                      }}
                      className="w-full h-full recessed px-3 outline-none text-right font-black text-xs text-strawberry-red bg-strawberry-cream/50 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 recessed bg-soft-pink/20 border-strawberry-pink/30 rounded-xl">
                <p className="text-[9px] font-bold text-deep-berry/70 leading-tight uppercase">
                  Execution will terminate if berry squishiness exceeds selected threshold.
                </p>
              </div>

              <button 
                onClick={onClose}
                className="btn-industrial w-full bg-strawberry-red text-white py-4 rounded-2xl font-black uppercase"
              >
                SAVE_SWEETNESS 💖
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
