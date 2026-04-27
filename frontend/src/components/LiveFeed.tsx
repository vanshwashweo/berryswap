"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  Radio, 
  ExternalLink, 
  ArrowRightLeft, 
  PlusCircle, 
  MinusCircle, 
  Send,
  X 
} from "lucide-react";
import { useState } from "react";
import { useRealtimeEvents } from "@/hooks/useRealtimeEvents";

export default function LiveFeed() {
  const { events, isConnected } = useRealtimeEvents();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);

  const getEventIcon = (type: string) => {
    switch (type) {
      case "swap": return <ArrowRightLeft size={14} className="text-strawberry-red" />;
      case "deposit": return <PlusCircle size={14} className="text-strawberry-red" />;
      case "withdraw": return <MinusCircle size={14} className="text-strawberry-pink" />;
      case "transfer": return <Send size={14} className="text-strawberry-pink" />;
      default: return <Radio size={14} className="text-strawberry-pink" />;
    }
  };

  const getEventLabel = (type: string) => {
    switch (type) {
      case "swap": return "SWAP_SUCCESS 🍓";
      case "deposit": return "GARDEN_DEPOSIT 🌸";
      case "withdraw": return "GARDEN_WITHDRAW 🧺";
      case "transfer": return "BERRY_TRANSFER ✨";
      default: return "GARDEN_EVENT";
    }
  };

  if (isCollapsed) {
    return (
      <button 
        onClick={() => setIsCollapsed(false)}
        className="fixed top-24 right-4 md:right-6 plate p-3 hover:scale-110 active:scale-95 transition-all z-[100] shadow-xl bg-white"
      >
        <Radio size={20} className={isConnected ? "text-strawberry-red animate-pulse" : "text-strawberry-pink"} />
      </button>
    );
  }

  return (
    <div className="fixed top-24 right-4 md:right-6 w-[280px] md:w-[320px] max-h-[calc(100vh-140px)] plate z-[100] flex flex-col shadow-2xl bg-white border-berry-border overflow-hidden">
      <div className="p-4 border-b border-berry-border flex items-center justify-between bg-strawberry-cream/50">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-strawberry-red animate-pulse" : "bg-strawberry-pink"}`} />
          <span className="text-[10px] font-black uppercase tracking-widest text-strawberry-red">BERRY_WATCH 🍓</span>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setIsSoundEnabled(!isSoundEnabled)}
            className={`p-1.5 recessed transition-all rounded-lg ${isSoundEnabled ? "bg-strawberry-red text-white" : "bg-white text-strawberry-pink"}`}
          >
             <Radio size={12} />
          </button>
          <button onClick={() => setIsCollapsed(true)} className="p-1.5 recessed hover:bg-soft-pink bg-white text-strawberry-pink transition-all rounded-lg">
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-strawberry-cream/20 custom-scrollbar">
        <AnimatePresence mode="popLayout" initial={false}>
          {events.length > 0 ? (
            events.map((event) => (
              <motion.div
                key={event.id}
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-3 plate bg-white hover:border-strawberry-pink transition-all group relative overflow-hidden rounded-xl border border-transparent"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    {getEventIcon(event.type)}
                    <span className="text-[9px] font-black tracking-tighter text-deep-berry uppercase">
                      {getEventLabel(event.type)}
                    </span>
                  </div>
                  <a 
                    href={`https://blockchain.expert/explorer/testnet/tx/${event.id.split('-')[0]}`} 
                    target="_blank"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ExternalLink size={10} className="text-strawberry-pink hover:text-strawberry-red" />
                  </a>
                </div>
                
                <div className="flex flex-col gap-1 font-bold">
                  <div className="text-[9px] text-deep-berry/60">
                    USR: <span className="text-strawberry-red">{event.user.slice(0, 6)}...{event.user.slice(-4)}</span>
                  </div>
                  <div className="text-[10px] font-black truncate text-strawberry-red uppercase">
                    {event.type === 'swap' ? (
                       <span>{Number(event.data.amountIn) / 1e7} XLM → {Number(event.data.amountOut) / 1e7} BERRY</span>
                    ) : event.type === 'deposit' ? (
                       <span>ADD: {Number(event.data.amountA) / 1e7} / {Number(event.data.amountB) / 1e7}</span>
                    ) : (
                       <span>SYS: SWEET_ACTIVITY</span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="h-40 flex flex-col items-center justify-center text-strawberry-pink gap-3">
               <Radio size={32} className="opacity-20 animate-pulse" />
               <p className="text-[10px] uppercase font-black tracking-[0.2em] opacity-40">LISTENING_FOR_BERRIES...</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-2 bg-strawberry-cream/50 border-t border-berry-border text-center">
         <p className="text-[8px] text-deep-berry/60 uppercase tracking-widest font-black">SUBSCRIBED_TO_GARDEN_EVENTS 🎀</p>
      </div>
    </div>
  );
}
