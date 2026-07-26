"use client";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full min-h-16 safe-x sm:min-h-20 sm:px-6 lg:px-20 flex items-center justify-between gap-2 sm:gap-4 backdrop-blur-md sticky top-0 z-50 bg-background/90">
      {/* Logo */}
      <Link href="/" className="flex flex-none items-center gap-1.5 sm:gap-3 cursor-pointer">
        <div className="h-8 w-8 shrink-0 rounded-xl flex items-center justify-center text-white font-bold text-base sm:h-10 sm:w-10 sm:text-lg bg-primary shadow-lg">
          R
        </div>
        <h1 className="whitespace-nowrap text-base sm:text-2xl font-bold tracking-tight text-foreground font-display">
          Resume Genie
        </h1>
      </Link>

      {/* Buttons */}
      <div className="flex shrink-0 items-center gap-1 sm:gap-4">
        <Link href="/login">
          <Button variant="outline" size="sm" className="min-h-8 px-2 text-xs sm:min-h-9 sm:px-4 sm:text-sm border-gray-200">Sign In</Button>
        </Link>
        <Link href="/signup">
          <Button variant="default" size="sm" className="min-h-8 px-2 text-xs sm:min-h-11 sm:px-5 sm:text-sm">Sign Up</Button>
        </Link>
      </div>
    </nav>
  );
}
