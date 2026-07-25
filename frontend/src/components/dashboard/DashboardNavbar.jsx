"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { LogOut } from "lucide-react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { useState } from "react";

export default function DashboardNavbar() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await api.get("/users/logout"); // The backend has a router.get for logout based on authRoutes.js
      localStorage.removeItem("token");
      toast.success("Logged out successfully");
      router.push("/");
    } catch (error) {
      toast.error("Error logging out");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <nav className="w-full min-h-16 sm:min-h-20 safe-x sm:px-6 lg:px-12 flex items-center justify-between gap-4 bg-white border-b border-border sticky top-0 z-50">
      {/* Logo */}
      <Link href="/dashboard" className="flex min-w-0 items-center gap-3 cursor-pointer">
        <div className="h-10 w-10 shrink-0 rounded-xl flex items-center justify-center text-white font-bold text-lg bg-primary shadow-lg">
          R
        </div>
        <h1 className="truncate text-lg sm:text-xl font-bold tracking-tight text-foreground font-display">
          ResumeGenie
        </h1>
      </Link>

      {/* Logout Button */}
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          onClick={handleLogout} 
          disabled={isLoggingOut}
          size="sm"
          className="text-muted-foreground hover:text-foreground gap-2"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">{isLoggingOut ? "Logging out..." : "Logout"}</span>
          <span className="sm:hidden">{isLoggingOut ? "..." : "Logout"}</span>
        </Button>
      </div>
    </nav>
  );
}
