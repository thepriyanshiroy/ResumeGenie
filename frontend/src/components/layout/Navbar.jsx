"use client";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full min-h-20 safe-x sm:px-6 lg:px-20 flex items-center justify-between gap-4 backdrop-blur-md sticky top-0 z-50 bg-background/90">
      {/* Logo */}
      <Link href="/" className="flex min-w-0 items-center gap-3 cursor-pointer">
        <div className="h-10 w-10 shrink-0 rounded-xl flex items-center justify-center text-white font-bold text-lg bg-primary shadow-lg">
          R
        </div>
        <h1 className="truncate text-xl sm:text-2xl font-bold tracking-tight text-foreground font-display">
          ResumeGenie
        </h1>
      </Link>

      {/* Buttons */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        <Link href="/login">
          <Button variant="outline" size="sm" className="hidden sm:inline-flex border-gray-200">Sign In</Button>
        </Link>
        <Link href="/signup">
          <Button variant="default" size="sm" className="sm:min-h-11 sm:px-5">Sign Up</Button>
        </Link>
      </div>
    </nav>
  );
}
