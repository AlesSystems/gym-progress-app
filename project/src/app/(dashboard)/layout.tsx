import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <nav className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-6">
        <Link href="/profile" className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">
          Profile
        </Link>
        <Link href="/exercises" className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">
          Exercise Library
        </Link>
      </nav>
      {children}
    </div>
  );
}
