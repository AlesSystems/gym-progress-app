import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import TemplateEditor from "@/components/template/TemplateEditor";

export const metadata = { title: "New Template – Gym Progress" };

export default async function NewTemplatePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">New Template</h1>
          <p className="text-muted-foreground">Build your workout plan</p>
        </header>

        <div className="rounded-3xl border border-border bg-card/50 backdrop-blur-sm shadow-xl overflow-hidden">
          <TemplateEditor />
        </div>
      </div>
    </div>
  );
}
