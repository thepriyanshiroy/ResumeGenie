"use client";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full h-24 px-6 lg:px-20 flex items-center justify-between backdrop-blur-md sticky top-0 z-50 bg-background/80">
      {/* Logo */}
      <div className="flex items-center gap-3 cursor-pointer">
        <div className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-lg bg-primary shadow-lg">
          R
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground font-display">
          ResumeAI
        </h1>
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-4">
        <Link href="/login">
          <Button variant="outline" className="hidden sm:inline-flex border-gray-200">Sign In</Button>
        </Link>
        <Link href="/signup">
          <Button variant="default">Sign Up</Button>
        </Link>
      </div>
    </nav>
  );
}