"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Suspense } from "react";

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your link…");

  useEffect(() => {
    const signinToken = searchParams.get("signin_token");

    if (!signinToken) {
      setStatus("error");
      setMessage("Invalid or missing verification token.");
      return;
    }

    signIn("credentials", {
      magicToken: signinToken,
      redirect: false,
    }).then((res) => {
      if (res?.error) {
        setStatus("error");
        setMessage("This link has expired or is invalid. Please request a new one.");
      } else {
        setStatus("success");
        setMessage("Signed in successfully! Redirecting…");
        setTimeout(() => router.push("/profile"), 1500);
      }
    });
  }, [searchParams, router]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center space-y-4">
      {status === "loading" && (
        <>
          <div className="mx-auto w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-gray-600">{message}</p>
        </>
      )}
      {status === "success" && (
        <>
          <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-green-100 text-green-600 text-2xl">
            ✓
          </div>
          <p className="text-gray-700 font-medium">{message}</p>
        </>
      )}
      {status === "error" && (
        <>
          <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-red-100 text-red-600 text-2xl">
            ✕
          </div>
          <p className="text-gray-700 font-medium">{message}</p>
          <a
            href="/login"
            className="inline-block mt-2 text-sm text-indigo-600 hover:underline"
          >
            Back to login
          </a>
        </>
      )}
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="mx-auto w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
