"use client";
import { Button } from "@/components/ui/Button";
import { Sparkles } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative w-full pt-16 pb-16 md:pt-20 md:pb-24 flex flex-col items-center text-center px-4">
      {/* Decorative element */}
      <div className="mb-8 flex items-center justify-center h-14 w-14 rounded-full bg-[#EBF1FA] text-primary">
        <Sparkles className="h-6 w-6" strokeWidth={1.5} />
      </div>

      {/* Title */}
      <h1 className="max-w-4xl text-5xl md:text-7xl font-bold tracking-tight text-[#1A3375] mb-6 leading-tight">
        Land More Offers <br className="hidden md:block"/> With AI Resume Analyzer
      </h1>

      {/* Subtitle */}
      <p className="max-w-2xl text-lg md:text-xl text-[#64748B] mb-10">
        Instantly analyze your resume against any job description and get an ATS score with actionable AI-powered suggestions.
      </p>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Button variant="premium" size="lg">
          Start!
        </Button>
      </div>
    </section>
  );
}
