import DashboardNavbar from "@/components/dashboard/DashboardNavbar";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[#F5F9FC]">
      <DashboardNavbar />
      
      <main className="p-8 md:p-12 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold font-display text-foreground mb-2">My Resumes</h1>
        <p className="text-muted-foreground">Analyze and track your resume scores</p>
        
        {/* Placeholder for future dashboard content */}
        <div className="mt-12 flex flex-col items-center justify-center py-20 border-2 border-dashed border-[#DDE4ED] rounded-3xl bg-white/50">
          <p className="text-lg text-muted-foreground mb-4">You are successfully logged in!</p>
          <p className="text-sm text-muted-foreground">Your dashboard content will appear here.</p>
        </div>
      </main>
    </div>
  );
}
