import Link from "next/link";
import { Compass, ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center text-white">
      <div className="w-20 h-20 bg-brand-blue/10 rounded-full flex items-center justify-center mb-6 border border-brand-blue/20">
        <Compass className="text-brand-blue" size={40} />
      </div>
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-zinc-500 max-w-md mb-8">
        The page you are looking for has drifted into deep space or never existed in this quadrant.
      </p>
      <Link
        href="/"
        className="flex items-center gap-2 bg-brand-blue text-white px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-all shadow-lg shadow-brand-blue/20"
      >
        Back to Dashboard <ArrowRight size={18} />
      </Link>
    </div>
  );
}
