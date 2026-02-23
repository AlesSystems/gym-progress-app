import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const SUPPORTED_SCHEMA_VERSIONS = ["1.0"];
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

// ─── Zod schema ──────────────────────────────────────────────────────────────

const WorkoutSetSchema = z.object({
  setNumber: z.number().int().positive(),
  weight: z.number().nullable().optional(),
  weightUnit: z.string().nullable().optional(),
  reps: z.number().int().nullable().optional(),
  rpe: z.number().nullable().optional(),
  isWarmup: z.boolean().optional().default(false),
  completedAt: z.string().nullable().optional(),
});

const SessionExerciseSchema = z.object({
  exerciseName: z.string().min(1),
  orderIndex: z.number().int().min(0),
  restSeconds: z.number().int().nullable().optional(),
  sets: z.array(WorkoutSetSchema).optional().default([]),
});

const SessionSchema = z.object({
  name: z.string().nullable().optional(),
  startedAt: z.string(),
  completedAt: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  exercises: z.array(SessionExerciseSchema).optional().default([]),
});

const CustomExerciseSchema = z.object({
  name: z.string().min(1),
  type: z.string().optional().default("compound"),
  movementCategory: z.string().optional().default("other"),
  primaryMuscle: z.string().optional().default(""),
  secondaryMuscles: z.array(z.string()).optional().default([]),
  defaultUnit: z.string().nullable().optional(),
  defaultReps: z.number().int().nullable().optional(),
  demoVideoUrl: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
});

const TemplateExerciseSchema = z.object({
  exerciseName: z.string().min(1),
  orderIndex: z.number().int().min(0),
  sets: z.number().int().positive().optional().default(3),
  reps: z.string().optional().default("8-12"),
  targetWeight: z.number().nullable().optional(),
  targetWeightUnit: z.string().nullable().optional(),
  restSeconds: z.number().int().nullable().optional(),
  tempoNotes: z.string().nullable().optional(),
});

const TemplateSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  exercises: z.array(TemplateExerciseSchema).optional().default([]),
});

const ScheduledWorkoutSchema = z.object({
  scheduledDate: z.string(),
  title: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

const BackupSchema = z.object({
  schemaVersion: z.string(),
  exportedAt: z.string().optional(),
  profile: z
    .object({
      displayName: z.string().nullable().optional(),
      unitPreference: z.string().optional(),
      createdAt: z.string().nullable().optional(),
    })
    .optional(),
  customExercises: z.array(CustomExerciseSchema).optional().default([]),
  workoutTemplates: z.array(TemplateSchema).optional().default([]),
  scheduledWorkouts: z.array(ScheduledWorkoutSchema).optional().default([]),
  sessions: z.array(SessionSchema).optional().default([]),
});

// ─── Route ───────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  // Parse multipart form data
  let fileText: string;
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded. Use field name 'file'." }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "File exceeds 10 MB limit." }, { status: 413 });
    }
    fileText = await file.text();
  } catch {
    return NextResponse.json({ error: "Failed to read uploaded file." }, { status: 400 });
  }

  // Parse JSON
  let raw: unknown;
  try {
    raw = JSON.parse(fileText);
  } catch {
    return NextResponse.json({ error: "File is not valid JSON." }, { status: 422 });
  }

  // Validate schema
  const parsed = BackupSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid backup file format.", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const backup = parsed.data;

  if (!SUPPORTED_SCHEMA_VERSIONS.includes(backup.schemaVersion)) {
    return NextResponse.json(
      {
        error: `Unsupported schema version "${backup.schemaVersion}". Supported versions: ${SUPPORTED_SCHEMA_VERSIONS.join(", ")}.`,
      },
      { status: 422 }
    );
  }

  // For large files (> 1 MB), run async via ImportJob
  if (fileText.length > 1024 * 1024) {
    const job = await db.importJob.create({
      data: { userId, status: "pending" },
    });

    // Run import in background (fire and forget)
    runImport(userId, backup, job.id).catch(() => {});

    return NextResponse.json({ jobId: job.id, status: "pending" }, { status: 202 });
  }

  // Sync import for smaller files
  const summary = await runImport(userId, backup, null);
  return NextResponse.json({ summary }, { status: 200 });
}

// ─── Import logic ─────────────────────────────────────────────────────────────

type BackupData = z.infer<typeof BackupSchema>;

async function runImport(userId: string, backup: BackupData, jobId: string | null) {
  if (jobId) {
    await db.importJob.update({ where: { id: jobId }, data: { status: "processing" } });
  }

  const summary = { imported: { sessions: 0, exercises: 0, templates: 0, scheduled: 0 }, skipped: 0, errors: [] as string[] };

  try {
    await db.$transaction(async (tx) => {
      // ── Custom exercises ──────────────────────────────────────────────────
      for (const ex of backup.customExercises) {
        const existing = await tx.exercise.findFirst({
          where: {
            createdBy: userId,
            name: { equals: ex.name, mode: "insensitive" },
            isDeleted: false,
          },
        });
        if (existing) { summary.skipped++; continue; }

        const slug = `${ex.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${userId.slice(-6)}`;
        await tx.exercise.create({
          data: {
            name: ex.name,
            slug: `${slug}-${Date.now()}`,
            type: ex.type ?? "compound",
            movementCategory: ex.movementCategory ?? "other",
            primaryMuscle: ex.primaryMuscle ?? "",
            secondaryMuscles: ex.secondaryMuscles ?? [],
            defaultUnit: ex.defaultUnit ?? null,
            defaultReps: ex.defaultReps ?? null,
            demoVideoUrl: ex.demoVideoUrl ?? null,
            description: ex.description ?? null,
            isSystemExercise: false,
            createdBy: userId,
          },
        });
        summary.imported.exercises++;
      }

      // ── Templates ─────────────────────────────────────────────────────────
      for (const tpl of backup.workoutTemplates) {
        const existing = await tx.workoutTemplate.findFirst({
          where: { userId, name: { equals: tpl.name, mode: "insensitive" } },
        });
        if (existing) { summary.skipped++; continue; }

        // Resolve exercise IDs
        const exerciseRows: Array<{
          exerciseId: string;
          orderIndex: number;
          sets: number;
          reps: string;
          targetWeight: number | null;
          targetWeightUnit: string | null;
          restSeconds: number | null;
          tempoNotes: string | null;
        }> = [];

        for (const te of tpl.exercises) {
          const exercise = await tx.exercise.findFirst({
            where: { name: { equals: te.exerciseName, mode: "insensitive" }, isDeleted: false },
          });
          if (!exercise) continue;
          exerciseRows.push({
            exerciseId: exercise.id,
            orderIndex: te.orderIndex,
            sets: te.sets ?? 3,
            reps: te.reps ?? "8-12",
            targetWeight: te.targetWeight ?? null,
            targetWeightUnit: te.targetWeightUnit ?? null,
            restSeconds: te.restSeconds ?? null,
            tempoNotes: te.tempoNotes ?? null,
          });
        }

        await tx.workoutTemplate.create({
          data: {
            userId,
            name: tpl.name,
            description: tpl.description ?? null,
            exercises: { create: exerciseRows },
          },
        });
        summary.imported.templates++;
      }

      // ── Scheduled workouts ────────────────────────────────────────────────
      for (const sw of backup.scheduledWorkouts) {
        const scheduledDate = new Date(sw.scheduledDate);
        const existing = await tx.scheduledWorkout.findFirst({
          where: { userId, scheduledDate },
        });
        if (existing) { summary.skipped++; continue; }

        await tx.scheduledWorkout.create({
          data: {
            userId,
            scheduledDate,
            title: sw.title ?? null,
            notes: sw.notes ?? null,
          },
        });
        summary.imported.scheduled++;
      }

      // ── Sessions ──────────────────────────────────────────────────────────
      for (const s of backup.sessions) {
        const startedAt = new Date(s.startedAt);
        const windowStart = new Date(startedAt.getTime() - 60_000);
        const windowEnd = new Date(startedAt.getTime() + 60_000);

        const duplicate = await tx.workoutSession.findFirst({
          where: {
            userId,
            startedAt: { gte: windowStart, lte: windowEnd },
          },
        });
        if (duplicate) { summary.skipped++; continue; }

        // Resolve exercise IDs for session exercises
        const exerciseCreates: Array<{
          exerciseName: string;
          exerciseId: string;
          orderIndex: number;
          restSeconds: number | null;
          sets: {
            create: Array<{
              setNumber: number;
              weight: number | null;
              weightUnit: string | null;
              reps: number | null;
              rpe: number | null;
              isWarmup: boolean;
              completedAt: Date | null;
            }>;
          };
        }> = [];

        for (const ex of s.exercises) {
          const exercise = await tx.exercise.findFirst({
            where: { name: { equals: ex.exerciseName, mode: "insensitive" }, isDeleted: false },
          });
          if (!exercise) continue;

          exerciseCreates.push({
            exerciseName: ex.exerciseName,
            exerciseId: exercise.id,
            orderIndex: ex.orderIndex,
            restSeconds: ex.restSeconds ?? null,
            sets: {
              create: (ex.sets ?? []).map((set) => ({
                setNumber: set.setNumber,
                weight: set.weight ?? null,
                weightUnit: set.weightUnit ?? null,
                reps: set.reps ?? null,
                rpe: set.rpe ?? null,
                isWarmup: set.isWarmup ?? false,
                completedAt: set.completedAt ? new Date(set.completedAt) : null,
              })),
            },
          });
        }

        await tx.workoutSession.create({
          data: {
            userId,
            name: s.name ?? null,
            status: "completed",
            startedAt,
            completedAt: s.completedAt ? new Date(s.completedAt) : null,
            notes: s.notes ?? null,
            exercises: { create: exerciseCreates },
          },
        });
        summary.imported.sessions++;
      }
    });

    if (jobId) {
      await db.importJob.update({
        where: { id: jobId },
        data: { status: "completed", summary },
      });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    summary.errors.push(message);
    if (jobId) {
      await db.importJob.update({
        where: { id: jobId },
        data: { status: "failed", error: message },
      });
    }
    if (!jobId) throw err;
  }

  return summary;
}
