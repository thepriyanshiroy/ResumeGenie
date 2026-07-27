"use client";
import { Button } from "@/components/ui/Button";
import { Sparkles } from "lucide-react";

import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative w-full min-h-[calc(100dvh-64px)] sm:min-h-0 safe-x pt-10 pb-12 sm:pt-14 sm:pb-16 md:pt-20 md:pb-24 flex flex-col items-center justify-center sm:justify-start text-center">
      {/* Decorative element */}
      <div className="mb-6 sm:mb-8 flex items-center justify-center h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-[#EBF1FA] text-primary">
        <Sparkles className="h-6 w-6" strokeWidth={1.5} />
      </div>

      {/* Title */}
      <h1 className="max-w-4xl text-[2.5rem] leading-[1.05] sm:text-5xl md:text-6xl lg:text-7xl font-bold text-[#1A3375] mb-5 sm:mb-6">
        Land More Offers <br className="hidden md:block"/> With AI Resume Analyzer
      </h1>

      {/* Subtitle */}
      <p className="max-w-2xl text-base sm:text-lg md:text-xl text-[#64748B] mb-8 sm:mb-10 leading-relaxed">
        Instantly analyze your resume against any job description and get an ATS score with actionable AI-powered suggestions.
      </p>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Link href="/login">
          <Button variant="premium" size="lg" className="w-full sm:w-auto">
            Start!
          </Button>
        </Link>
      </div>
    </section>
  );
}
