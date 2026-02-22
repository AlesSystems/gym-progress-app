import Link from "next/link";
import SignupForm from "@/components/auth/SignupForm";
import MagicLinkButton from "@/components/auth/MagicLinkButton";

export const metadata = { title: "Sign Up – Gym Progress" };

export default function SignupPage() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Create an account</h1>
        <p className="text-sm text-gray-500 mt-1">
          Start tracking your gym progress
        </p>
      </div>

      <SignupForm />

      <div className="flex items-center gap-3 text-gray-400 text-xs">
        <div className="flex-1 h-px bg-gray-200" />
        <span>or sign up without password</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <MagicLinkButton />

      <p className="text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link href="/login" className="text-indigo-600 font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
