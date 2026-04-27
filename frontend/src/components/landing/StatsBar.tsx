"use client";

import { motion } from "framer-motion";

const stats = [
  { label: "TOTAL_VALUE_LOCKED", value: "$42.8M" },
  { label: "VOLUME_24H", value: "$12.4M" },
  { label: "TRANSACTION_COUNT", value: "842k+" },
  { label: "ACTIVE_POOLS", value: "128" },
];

export default function StatsBar() {
  return (
    <div id="stats" className="py-12 border-y border-berry-border bg-soft-pink/30">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            viewport={{ once: true }}
            className="text-center lg:text-left"
          >
            <div className="text-[10px] uppercase font-bold tracking-widest text-deep-berry mb-2">{stat.label}</div>
            <div className="text-3xl font-black text-strawberry-red">{stat.value}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
