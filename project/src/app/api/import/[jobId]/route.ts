import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  void req;
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const { jobId } = await params;

  const job = await db.importJob.findUnique({ where: { id: jobId } });

  if (!job || job.userId !== userId) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  return NextResponse.json({
    jobId: job.id,
    status: job.status,
    summary: job.summary ?? null,
    error: job.error ?? null,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
  });
}
