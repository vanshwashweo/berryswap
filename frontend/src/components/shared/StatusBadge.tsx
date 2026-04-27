import { ReactNode } from "react";

interface StatusBadgeProps {
  children: ReactNode;
  type?: "success" | "warning" | "error" | "info" | "live";
  className?: string;
}

export default function StatusBadge({ children, type = "info", className = "" }: StatusBadgeProps) {
  const styles = {
    success: "bg-strawberry-red text-white border-strawberry-red",
    warning: "bg-strawberry-pink text-deep-berry border-strawberry-pink",
    error: "bg-deep-berry text-white border-deep-berry",
    info: "bg-strawberry-cream text-strawberry-red border-berry-border",
    live: "bg-strawberry-red text-white border-strawberry-red",
  };

  return (
    <div className={`px-3 py-1 rounded-full border text-[9px] font-bold uppercase tracking-widest inline-flex items-center gap-1.5 ${styles[type]} ${className}`}>
      {type === "live" && <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />}
      {children}
    </div>
  );
}
