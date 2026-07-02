"use client";
import { Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AuthLayout({ children }) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F5F9FC] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background curve */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <svg viewBox="0 0 1440 800" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full object-cover opacity-30" preserveAspectRatio="none">
          <path d="M-100,150 C400,-20 1000,-20 1540,150" stroke="#DDE4ED" strokeWidth="1" fill="none" />
        </svg>
      </div>

      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8 relative">
          <button 
            onClick={() => router.back()} 
            className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          
          <Link href="/" className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity">
            <div className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-lg bg-primary shadow-lg">
              R
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-display">
              ResumeAI
            </h1>
          </Link>
        </div>
        
        <div className="bg-card shadow-[0_8px_32px_-4px_rgba(45,107,230,0.08)] rounded-3xl p-8 border border-white/60">
          {children}
        </div>
      </div>
    </div>
  );
}
