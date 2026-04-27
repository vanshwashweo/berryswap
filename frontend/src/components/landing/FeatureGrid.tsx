"use client";

import React from "react";
import { motion } from "framer-motion";
import { Heart, Sparkles, Flower } from "lucide-react";

const features = [
  {
    title: "SWEET_SWAPS",
    desc: "Lightning-fast token exchanges on the Soroban network with love and zero friction.",
    icon: <Heart size={24} />,
    className: ""
  },
  {
    title: "BERRY_LIQUIDITY",
    desc: "Deposit assets into our sweet protocol and earn yield from network activity.",
    icon: <Flower size={24} />,
    className: ""
  },
  {
    title: "SOROBAN_MAGIC",
    desc: "Powered by next-generation smart contract technology. Secure. Scalable. Dreamy.",
    icon: <Sparkles size={24} />,
    className: ""
  }
];

export default function FeatureGrid() {
  return (
    <section id="features" className="py-24 max-w-7xl mx-auto px-6">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-black mb-4 text-strawberry-red tracking-tight">BERRY_PROTOCOL</h2>
        <p className="text-deep-berry max-w-xl mx-auto text-sm font-bold uppercase">
          BerrySwap utilizes high-performance Soroban infrastructure to deliver soft and dreamy DeFi solutions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.2 }}
            className={`plate p-8 transition-all hover:scale-105 ${f.className}`}
          >
            <div className="w-12 h-12 recessed flex items-center justify-center mb-6 bg-soft-pink border-berry-border">
              {React.cloneElement(f.icon as React.ReactElement, { className: "text-strawberry-red" })}
            </div>
            <h3 className="text-xl font-black mb-3 text-strawberry-red tracking-tight">{f.title}</h3>
            <p className="text-deep-berry leading-tight text-xs font-bold uppercase">
              {f.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
