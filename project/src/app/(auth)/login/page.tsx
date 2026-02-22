import Link from "next/link";
import LoginForm from "@/components/auth/LoginForm";
import MagicLinkButton from "@/components/auth/MagicLinkButton";

export const metadata = { title: "Sign In – Gym Progress" };

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ verified?: string; error?: string }>;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
        <p className="text-sm text-gray-500 mt-1">Sign in to your account</p>
      </div>

      <LoginForm />

      <div className="flex items-center gap-3 text-gray-400 text-xs">
        <div className="flex-1 h-px bg-gray-200" />
        <span>or sign in without password</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <MagicLinkButton />

      <p className="text-center text-sm text-gray-500">
        <Link href="/forgot-password" className="text-indigo-600 hover:underline">
          Forgot password?
        </Link>
      </p>

      <p className="text-center text-sm text-gray-500">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-indigo-600 font-medium hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
