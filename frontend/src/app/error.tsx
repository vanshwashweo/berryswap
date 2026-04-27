"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 bg-red-950/200/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
        <AlertTriangle className="text-red-400" size={40} />
      </div>
      <h1 className="text-3xl font-bold mb-4">Something went wrong</h1>
      <p className="text-zinc-500 max-w-md mb-8">
        The application encountered an unexpected error. This might be due to a stale connection or a temporary network issue.
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="flex items-center gap-2 bg-black text-black px-6 py-3 rounded-2xl font-bold hover:bg-zinc-200 transition-all"
        >
          <RotateCcw size={18} /> Try Again
        </button>
        <a
          href="/"
          className="px-6 py-3 rounded-2xl font-bold border border-white/10 hover:bg-black/5 transition-all"
        >
          Return Home
        </a>
      </div>
      <pre className="mt-12 p-4 bg-black/5 rounded-xl text-[10px] font-mono text-zinc-600 max-w-xl overflow-auto text-left">
        {error.message}
      </pre>
    </div>
  );
}
