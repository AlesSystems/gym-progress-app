export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 md:px-6 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 -translate-x-1/4 -translate-y-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] -z-10" />
      
      <div className="w-full max-w-lg animate-in fade-in zoom-in-95 duration-700">
        {children}
      </div>
    </div>
  );
}
