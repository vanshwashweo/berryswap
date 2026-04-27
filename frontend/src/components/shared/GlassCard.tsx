import { ReactNode } from "react";
import { motion } from "framer-motion";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

/**
 * Machined Metal Plate Component (Legacy name GlassCard)
 */
export default function GlassCard({ children, className = "", hover = true }: GlassCardProps) {
  return (
    <motion.div
      whileHover={hover ? { scale: 1.01, filter: "brightness(1.1)" } : {}}
      transition={{ duration: 0.1, ease: "linear" }}
      className={`plate rounded-none overflow-hidden ${className}`}
    >
      {children}
    </motion.div>
  );
}
