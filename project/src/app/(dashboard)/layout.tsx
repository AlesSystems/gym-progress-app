import Link from "next/link";
import ToastContainer from "@/components/ui/ToastContainer";

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
        <Link href="/templates" className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">
          Templates
        </Link>
        <Link href="/friends" className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">
          Friends
        </Link>
        <Link href="/sessions" className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">
          Sessions
        </Link>
        <Link href="/calendar" className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">
          Calendar
        </Link>
        <Link href="/settings/data" className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">
          Data &amp; Privacy
        </Link>
      </nav>
      {children}
      <ToastContainer />
    </div>
  );
}
