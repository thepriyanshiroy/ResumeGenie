"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { LogOut, User, X } from "lucide-react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";

export default function DashboardNavbar() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get("/users/me");
        setUser(response.data.data.user);
      } catch (error) {
        console.error("Failed to fetch user data", error);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await api.get("/users/logout");
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
    <>
      <nav className="w-full min-h-16 sm:min-h-20 safe-x sm:px-6 lg:px-12 flex items-center justify-between gap-4 bg-white border-b border-border sticky top-0 z-40">
        {/* Logo */}
        <Link href="/dashboard" className="flex min-w-0 items-center gap-3 cursor-pointer">
          <div className="h-10 w-10 shrink-0 rounded-xl flex items-center justify-center text-white font-bold text-lg bg-primary shadow-lg">
            R
          </div>
          <h1 className="truncate text-lg sm:text-xl font-bold tracking-tight text-foreground font-display">
            ResumeGenie
          </h1>
        </Link>

        {/* Profile Button */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="w-10 h-10 rounded-xl bg-primary text-white font-bold flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-72 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="font-display font-bold text-lg text-foreground">Profile</h2>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 text-muted-foreground hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex-1 flex flex-col gap-6">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="w-20 h-20 rounded-2xl bg-primary text-white font-display font-bold text-3xl flex items-center justify-center shadow-lg">
              {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-8 h-8" />}
            </div>
            <div>
              <p className="font-bold text-foreground text-lg">{user?.name || "User"}</p>
              <p className="text-muted-foreground text-sm">{user?.email || "Loading..."}</p>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-border">
          <Button 
            variant="outline" 
            onClick={handleLogout} 
            disabled={isLoggingOut}
            className="w-full justify-center gap-2 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
          >
            <LogOut className="h-4 w-4" />
            {isLoggingOut ? "Logging out..." : "Logout"}
          </Button>
        </div>
      </div>
    </>
  );
}
