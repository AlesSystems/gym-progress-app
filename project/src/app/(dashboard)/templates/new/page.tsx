import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import TemplateEditor from "@/components/template/TemplateEditor";

export const metadata = { title: "New Template – Gym Progress" };

export default async function NewTemplatePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-6 border-b border-gray-200 bg-white">
        <h1 className="text-xl font-bold text-gray-900">New Template</h1>
        <p className="text-sm text-gray-500 mt-0.5">Build your workout plan</p>
      </div>
      <TemplateEditor />
    </div>
  );
}
