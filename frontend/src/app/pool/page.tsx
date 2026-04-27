"use client";
import { useState, useEffect } from "react";

import { motion } from "framer-motion";
import { 
  Activity, 
  BarChart3, 
  LineChart as LineChartIcon,
  TrendingUp, 
  History,
  Info,
  ArrowRight
} from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import GlassCard from "@/components/shared/GlassCard";
import StatusBadge from "@/components/shared/StatusBadge";
import { 
  LineChart, 
  Line, 
  BarChart,
  Bar,
  ResponsiveContainer, 
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { useRealtimeEvents } from "@/hooks/useRealtimeEvents";
import Link from "next/link";

const MOCK_TVL_DATA = [
  { day: "MON", tvl: 1.2 },
  { day: "TUE", tvl: 1.5 },
  { day: "WED", tvl: 1.3 },
  { day: "THU", tvl: 1.9 },
  { day: "FRI", tvl: 2.4 },
  { day: "SAT", tvl: 2.1 },
  { day: "SUN", tvl: 2.45 },
];

const MOCK_VOL_DATA = [
  { day: "MON", vol: 240 },
  { day: "TUE", vol: 320 },
  { day: "WED", vol: 180 },
  { day: "THU", vol: 450 },
  { day: "FRI", vol: 510 },
  { day: "SAT", vol: 390 },
  { day: "SUN", vol: 482 },
];

export default function PoolAnalyticsPage() {
  const { events } = useRealtimeEvents();
  const [dbStats, setDbStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/pool/stats");
        const data = await res.json();
        setDbStats(data);
      } catch (e) {
        console.error("Failed to fetch pool stats", e);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    { label: "GARDEN_TVL", val: dbStats ? `$${(dbStats.tvlUSD / 1e6).toFixed(2)}M` : "$2.45M", change: "+12.4%", icon: LineChartIcon },
    { label: "HARVEST_VOLUME", val: dbStats ? `$${dbStats.volume24h.toLocaleString()}` : "$482,000", change: "+4.2%", icon: TrendingUp },
    { label: "SWEET_FEES", val: dbStats ? `$${(dbStats.volume24h * 0.003).toLocaleString()}` : "$1,446", change: "+2.1%", icon: BarChart3 },
    { label: "ACTIVE_GARDENS", val: "1", change: "STABLE", icon: Info },
  ];

  return (
    <div className="bg-strawberry-cream min-h-screen text-deep-berry pt-32 pb-20 font-bold selection:bg-strawberry-pink/40">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header Area */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <Activity className="text-strawberry-red" size={32} />
               <h1 className="text-4xl font-black tracking-tighter text-strawberry-red">BERRY_STATS 🍓</h1>
            </div>
            <p className="text-deep-berry/70 font-bold text-[10px] uppercase leading-tight max-w-lg">
              REAL-TIME MONITORING OF XLM/BERRY BERRY FABRIC AND SWEET THROUGHPUT.
            </p>
          </div>
          <Link 
            href="/liquidity" 
            className="btn-industrial bg-strawberry-red text-white flex items-center gap-2 px-6 py-3 font-black text-xs transition-all group rounded-2xl"
          >
            MANAGE_GARDEN 🧺 <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
           {stats.map((stat, i) => (
             <GlassCard key={i} className="p-6 bg-white/80 border-berry-border relative overflow-hidden group">
                <div className="absolute -top-2 -right-2 text-2xl opacity-0 group-hover:opacity-10 transition-opacity">🍓</div>
                <div className="flex justify-between items-start mb-4">
                   <div className="p-2 recessed bg-strawberry-cream text-strawberry-red">
                      <stat.icon size={18} />
                   </div>
                   <span className="text-[9px] font-black text-strawberry-red tracking-tight">{stat.change}</span>
                </div>
                <div className="text-[9px] text-deep-berry/70 font-black uppercase tracking-widest mb-1">{stat.label}</div>
                <div className="text-2xl font-black text-strawberry-red">{stat.val}</div>
             </GlassCard>
           ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-12">
           {/* TVL Chart */}
           <GlassCard className="p-8 h-[400px] flex flex-col bg-white/80 border-berry-border">
              <div className="flex justify-between items-center mb-8">
                 <h3 className="font-black flex items-center gap-2 text-[10px] uppercase tracking-widest text-deep-berry/70">
                    <LineChartIcon size={14} /> FRUIT_GROWTH
                 </h3>
                 <StatusBadge type="live">XLM_BERRY</StatusBadge>
              </div>
              <div className="flex-1 w-full recessed p-2 bg-strawberry-cream/30">
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={MOCK_TVL_DATA}>
                       <XAxis dataKey="day" hide />
                       <YAxis hide />
                       <Tooltip contentStyle={{ backgroundColor: '#FFF0F3', borderColor: '#FFB3C1', borderRadius: '12px' }} itemStyle={{ color: '#FF4D6D', fontSize: '10px' }} labelStyle={{ display: 'none' }} />
                       <Line type="stepAfter" dataKey="tvl" stroke="#FF4D6D" strokeWidth={3} dot={false} />
                    </LineChart>
                 </ResponsiveContainer>
              </div>
           </GlassCard>

           {/* Volume Chart */}
           <GlassCard className="p-8 h-[400px] flex flex-col bg-white/80 border-berry-border">
              <div className="flex justify-between items-center mb-8">
                 <h3 className="font-black flex items-center gap-2 text-[10px] uppercase tracking-widest text-deep-berry/70">
                    <BarChart3 size={14} /> HARVEST_VOLUME
                 </h3>
                 <StatusBadge type="info">USD_INDEX</StatusBadge>
              </div>
              <div className="flex-1 w-full recessed p-2 bg-strawberry-cream/30">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={MOCK_VOL_DATA}>
                       <XAxis dataKey="day" hide />
                       <YAxis hide />
                       <Tooltip contentStyle={{ backgroundColor: '#FFF0F3', borderColor: '#FFB3C1', borderRadius: '12px' }} itemStyle={{ color: '#FF4D6D', fontSize: '10px' }} labelStyle={{ display: 'none' }} />
                       <Bar dataKey="vol" fill="#FF85A2" radius={[4, 4, 0, 0]} />
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </GlassCard>
        </div>

        {/* Protocol Feed */}
        <GlassCard className="overflow-hidden bg-white/80 border-berry-border relative">
           <div className="absolute -top-4 -right-4 text-4xl rotate-12 opacity-20">🎀</div>
           <div className="p-8 border-b border-berry-border flex items-center justify-between">
              <h3 className="font-black flex items-center gap-2 text-xs uppercase tracking-widest text-strawberry-red">
                 <History size={18} className="text-strawberry-red" />
                 GARDEN_JOURNAL
              </h3>
              <StatusBadge type="live">SYNCHRONIZED</StatusBadge>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left uppercase">
                 <thead className="text-[9px] font-black text-deep-berry/50 border-b border-berry-border">
                    <tr>
                       <th className="p-6">_EVENT</th>
                       <th className="p-6">_ORCHARD</th>
                       <th className="p-6 text-right">_BASKET</th>
                       <th className="p-6 text-right">_GARDENER</th>
                       <th className="p-6 text-right">_SEASON</th>
                    </tr>
                 </thead>
                 <tbody className="text-[10px]">
                    {events.map((e, i) => (
                       <motion.tr 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          key={e.id} 
                          className="border-b border-berry-border hover:bg-soft-pink/30 transition-colors group"
                       >
                          <td className="p-6">
                             <StatusBadge type={e.type === 'swap' ? 'live' : e.type === 'deposit' ? 'success' : 'info'}>
                                {e.type}
                             </StatusBadge>
                          </td>
                          <td className="p-6 text-deep-berry/70">{e.contractId.slice(0, 12)}...</td>
                          <td className="p-6 text-right font-black text-strawberry-red">
                             {e.type === 'swap' ? `${Number(e.data.amountIn)/1e7} > ${Number(e.data.amountOut)/1e7}` : "CALL_DATA"}
                          </td>
                          <td className="p-6 text-right text-deep-berry/70">{e.user.slice(0, 6)}...{e.user.slice(-4)}</td>
                          <td className="p-6 text-right text-deep-berry/70">{e.ledger}</td>
                       </motion.tr>
                    ))}
                    {events.length === 0 && (
                       <tr>
                          <td colSpan={5} className="p-12 text-center text-deep-berry/50 font-black tracking-widest text-[10px]">
                             AWAITING_SWEET_EVENTS...
                          </td>
                       </tr>
                    )}
                 </tbody>
              </table>
           </div>
        </GlassCard>
      </div>
    </div>
  );
}
