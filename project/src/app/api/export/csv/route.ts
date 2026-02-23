import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { stringify } from "csv-stringify";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const exerciseId = searchParams.get("exerciseId");

  const dateFilter: Record<string, Date> = {};
  if (from) dateFilter.gte = new Date(from);
  if (to) {
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);
    dateFilter.lte = toDate;
  }

  const sessions = await db.workoutSession.findMany({
    where: {
      userId,
      status: "completed",
      ...(from || to ? { startedAt: dateFilter } : {}),
    },
    orderBy: { startedAt: "asc" },
    include: {
      exercises: {
        where: exerciseId ? { exerciseId } : undefined,
        orderBy: { orderIndex: "asc" },
        include: {
          sets: { orderBy: { setNumber: "asc" } },
        },
      },
    },
  });

  const rows: unknown[] = [];
  for (const s of sessions) {
    const date = s.startedAt.toISOString().slice(0, 10);
    const durationMin =
      s.completedAt
        ? Math.round((s.completedAt.getTime() - s.startedAt.getTime()) / 60000)
        : "";
    for (const ex of s.exercises) {
      for (const set of ex.sets) {
        rows.push({
          date,
          session_name: s.name ?? "",
          exercise_name: ex.exerciseName,
          set_number: set.setNumber,
          is_warmup: set.isWarmup ? "true" : "false",
          weight: set.weight != null ? Number(set.weight) : "",
          weight_unit: set.weightUnit ?? "",
          reps: set.reps ?? "",
          rpe: set.rpe != null ? Number(set.rpe) : "",
          notes: set.notes ?? "",
          session_duration_min: durationMin,
        });
      }
    }
  }

  const today = new Date().toISOString().slice(0, 10);

  return new Promise<NextResponse>((resolve) => {
    const chunks: Buffer[] = [];
    const csvStream = stringify(rows, {
      header: true,
      columns: [
        "date",
        "session_name",
        "exercise_name",
        "set_number",
        "is_warmup",
        "weight",
        "weight_unit",
        "reps",
        "rpe",
        "notes",
        "session_duration_min",
      ],
    });

    csvStream.on("data", (chunk: Buffer) => chunks.push(chunk));
    csvStream.on("end", () => {
      const csv = Buffer.concat(chunks).toString("utf-8");
      resolve(
        new NextResponse(csv, {
          status: 200,
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="gym-history-${today}.csv"`,
          },
        })
      );
    });
    csvStream.on("error", () => {
      resolve(NextResponse.json({ error: "Failed to generate CSV" }, { status: 500 }));
    });
  });
}
