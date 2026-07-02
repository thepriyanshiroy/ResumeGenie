import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden flex flex-col">
      {/* Decorative background curve mimicking the image */}
      <div className="absolute top-0 left-0 w-full h-[800px] overflow-hidden -z-10 pointer-events-none">
        <svg viewBox="0 0 1440 600" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full object-cover opacity-50" preserveAspectRatio="none">
          <path d="M-100,150 C400,-20 1000,-20 1540,150" stroke="#DDE4ED" strokeWidth="1" fill="none" />
          <path d="M-100,280 C400,450 1000,450 1540,280" stroke="#DDE4ED" strokeWidth="1" fill="none" />
        </svg>
      </div>

      <Navbar />
      <div className="flex-1 z-10 pt-10">
        <Hero />
        <Features />
      </div>
    </main>
  );
}
