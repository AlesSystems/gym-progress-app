import AppSidebar from "@/components/layout/AppSidebar";
import BottomNav from "@/components/layout/BottomNav";
import ToastContainer from "@/components/ui/ToastContainer";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      <AppSidebar />
      <main className="flex-1 flex flex-col min-w-0 pb-24 md:pb-0 transition-all duration-300 ease-in-out">
        {children}
      </main>
      <BottomNav />
      <ToastContainer />
    </div>
  );
}
