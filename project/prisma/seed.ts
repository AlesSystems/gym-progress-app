import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const rawConnectionString = process.env.DATABASE_URL;
if (!rawConnectionString) throw new Error("DATABASE_URL is not set");
const dbUrl = new URL(rawConnectionString);
dbUrl.searchParams.delete("sslmode");
const pool = new Pool({ connectionString: dbUrl.toString(), ssl: { rejectUnauthorized: false } });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const systemExercises = [
  // ── Chest ────────────────────────────────────────────────────────────────
  {
    name: "Bench Press",
    type: "compound",
    movementCategory: "push",
    primaryMuscle: "Chest",
    secondaryMuscles: ["Triceps", "Front Deltoids"],
    description: "Flat barbell bench press — primary horizontal push movement.",
  },
  {
    name: "Incline Bench Press",
    type: "compound",
    movementCategory: "push",
    primaryMuscle: "Chest",
    secondaryMuscles: ["Triceps", "Front Deltoids"],
    description: "Upper-chest emphasis barbell press.",
  },
  {
    name: "Decline Bench Press",
    type: "compound",
    movementCategory: "push",
    primaryMuscle: "Chest",
    secondaryMuscles: ["Triceps"],
    description: "Lower-chest emphasis barbell press.",
  },
  {
    name: "Dumbbell Chest Press",
    type: "compound",
    movementCategory: "push",
    primaryMuscle: "Chest",
    secondaryMuscles: ["Triceps", "Front Deltoids"],
    description: "Dumbbell flat chest press — greater range of motion than barbell.",
  },
  {
    name: "Dumbbell Flyes",
    type: "isolation",
    movementCategory: "push",
    primaryMuscle: "Chest",
    secondaryMuscles: ["Front Deltoids"],
    description: "Wide-arc dumbbell fly for chest stretch and contraction.",
  },
  {
    name: "Cable Crossover",
    type: "isolation",
    movementCategory: "push",
    primaryMuscle: "Chest",
    secondaryMuscles: [],
    description: "Cable fly variation for chest isolation.",
  },
  {
    name: "Push-Up",
    type: "compound",
    movementCategory: "push",
    primaryMuscle: "Chest",
    secondaryMuscles: ["Triceps", "Front Deltoids", "Core"],
    description: "Bodyweight horizontal push; many grip variants possible.",
  },
  {
    name: "Chest Dips",
    type: "compound",
    movementCategory: "push",
    primaryMuscle: "Chest",
    secondaryMuscles: ["Triceps", "Front Deltoids"],
    description: "Forward-lean dips that emphasise the lower chest.",
  },

  // ── Back ─────────────────────────────────────────────────────────────────
  {
    name: "Deadlift",
    type: "compound",
    movementCategory: "pull",
    primaryMuscle: "Back",
    secondaryMuscles: ["Hamstrings", "Glutes", "Core", "Traps"],
    description: "Conventional barbell deadlift — total posterior-chain builder.",
  },
  {
    name: "Romanian Deadlift",
    type: "compound",
    movementCategory: "legs",
    primaryMuscle: "Hamstrings",
    secondaryMuscles: ["Glutes", "Lower Back"],
    description: "Hip-hinge movement with minimal knee bend, heavy hamstring focus.",
  },
  {
    name: "Sumo Deadlift",
    type: "compound",
    movementCategory: "pull",
    primaryMuscle: "Back",
    secondaryMuscles: ["Quads", "Glutes", "Hamstrings"],
    description: "Wide-stance deadlift with upright torso.",
  },
  {
    name: "Pull-Up",
    type: "compound",
    movementCategory: "pull",
    primaryMuscle: "Lats",
    secondaryMuscles: ["Biceps", "Rear Deltoids", "Rhomboids"],
    description: "Pronated-grip vertical pull — bodyweight staple.",
  },
  {
    name: "Chin-Up",
    type: "compound",
    movementCategory: "pull",
    primaryMuscle: "Lats",
    secondaryMuscles: ["Biceps"],
    description: "Supinated-grip vertical pull — stronger bicep involvement.",
  },
  {
    name: "Lat Pulldown",
    type: "compound",
    movementCategory: "pull",
    primaryMuscle: "Lats",
    secondaryMuscles: ["Biceps", "Rear Deltoids"],
    description: "Cable lat pulldown — machine alternative to pull-ups.",
  },
  {
    name: "Barbell Row",
    type: "compound",
    movementCategory: "pull",
    primaryMuscle: "Back",
    secondaryMuscles: ["Biceps", "Rear Deltoids", "Lats"],
    description: "Bent-over barbell row — primary horizontal pull.",
  },
  {
    name: "Dumbbell Row",
    type: "compound",
    movementCategory: "pull",
    primaryMuscle: "Lats",
    secondaryMuscles: ["Biceps", "Rear Deltoids"],
    description: "Single-arm dumbbell row — unilateral back builder.",
  },
  {
    name: "Seated Cable Row",
    type: "compound",
    movementCategory: "pull",
    primaryMuscle: "Back",
    secondaryMuscles: ["Biceps", "Rear Deltoids"],
    description: "Cable row performed seated; good for scapular retraction.",
  },
  {
    name: "T-Bar Row",
    type: "compound",
    movementCategory: "pull",
    primaryMuscle: "Back",
    secondaryMuscles: ["Biceps", "Rear Deltoids"],
    description: "Landmine or T-bar row for mid-back thickness.",
  },
  {
    name: "Inverted Row",
    type: "compound",
    movementCategory: "pull",
    primaryMuscle: "Back",
    secondaryMuscles: ["Biceps", "Rear Deltoids", "Core"],
    description: "Bodyweight horizontal row performed under a bar.",
  },
  {
    name: "Machine Row",
    type: "compound",
    movementCategory: "pull",
    primaryMuscle: "Back",
    secondaryMuscles: ["Biceps"],
    description: "Chest-supported machine row — safe spinal loading.",
  },

  // ── Shoulders ────────────────────────────────────────────────────────────
  {
    name: "Overhead Press",
    type: "compound",
    movementCategory: "push",
    primaryMuscle: "Shoulders",
    secondaryMuscles: ["Triceps", "Upper Chest", "Core"],
    description: "Standing or seated barbell press overhead.",
  },
  {
    name: "Dumbbell Overhead Press",
    type: "compound",
    movementCategory: "push",
    primaryMuscle: "Shoulders",
    secondaryMuscles: ["Triceps"],
    description: "Dumbbell seated or standing press — allows greater range of motion.",
  },
  {
    name: "Arnold Press",
    type: "compound",
    movementCategory: "push",
    primaryMuscle: "Shoulders",
    secondaryMuscles: ["Triceps"],
    description: "Rotating dumbbell press targeting all three deltoid heads.",
  },
  {
    name: "Dumbbell Lateral Raise",
    type: "isolation",
    movementCategory: "push",
    primaryMuscle: "Side Deltoids",
    secondaryMuscles: [],
    description: "Side raise for lateral deltoid width.",
  },
  {
    name: "Front Raise",
    type: "isolation",
    movementCategory: "push",
    primaryMuscle: "Front Deltoids",
    secondaryMuscles: [],
    description: "Dumbbell or barbell front raise for anterior deltoid.",
  },
  {
    name: "Upright Row",
    type: "compound",
    movementCategory: "pull",
    primaryMuscle: "Shoulders",
    secondaryMuscles: ["Traps", "Biceps"],
    description: "Vertical pull to chin height — hits traps and deltoids.",
  },
  {
    name: "Rear Delt Fly",
    type: "isolation",
    movementCategory: "pull",
    primaryMuscle: "Rear Deltoids",
    secondaryMuscles: ["Rhomboids"],
    description: "Bent-over dumbbell fly targeting rear deltoids.",
  },
  {
    name: "Face Pull",
    type: "isolation",
    movementCategory: "pull",
    primaryMuscle: "Rear Deltoids",
    secondaryMuscles: ["External Rotators", "Traps"],
    description: "Cable face pull for rear-delt health and shoulder stability.",
  },

  // ── Biceps ───────────────────────────────────────────────────────────────
  {
    name: "Barbell Curl",
    type: "isolation",
    movementCategory: "pull",
    primaryMuscle: "Biceps",
    secondaryMuscles: ["Brachialis"],
    description: "Standard barbell bicep curl.",
  },
  {
    name: "Dumbbell Curl",
    type: "isolation",
    movementCategory: "pull",
    primaryMuscle: "Biceps",
    secondaryMuscles: ["Brachialis"],
    description: "Standing or incline dumbbell curl.",
  },
  {
    name: "Hammer Curl",
    type: "isolation",
    movementCategory: "pull",
    primaryMuscle: "Brachialis",
    secondaryMuscles: ["Biceps", "Brachioradialis"],
    description: "Neutral-grip curl — targets brachialis and forearm.",
  },
  {
    name: "Cable Curl",
    type: "isolation",
    movementCategory: "pull",
    primaryMuscle: "Biceps",
    secondaryMuscles: [],
    description: "Cable curl providing constant tension throughout the range of motion.",
  },
  {
    name: "Preacher Curl",
    type: "isolation",
    movementCategory: "pull",
    primaryMuscle: "Biceps",
    secondaryMuscles: [],
    description: "Curl performed on a preacher pad for strict form.",
  },
  {
    name: "Concentration Curl",
    type: "isolation",
    movementCategory: "pull",
    primaryMuscle: "Biceps",
    secondaryMuscles: [],
    description: "Seated single-arm curl with elbow braced against the inner thigh.",
  },

  // ── Triceps ──────────────────────────────────────────────────────────────
  {
    name: "Tricep Dips",
    type: "compound",
    movementCategory: "push",
    primaryMuscle: "Triceps",
    secondaryMuscles: ["Front Deltoids", "Chest"],
    description: "Upright-torso dips emphasising the triceps.",
  },
  {
    name: "Close-Grip Bench Press",
    type: "compound",
    movementCategory: "push",
    primaryMuscle: "Triceps",
    secondaryMuscles: ["Chest", "Front Deltoids"],
    description: "Narrow-grip bench press for tricep mass.",
  },
  {
    name: "Skull Crushers",
    type: "isolation",
    movementCategory: "push",
    primaryMuscle: "Triceps",
    secondaryMuscles: [],
    description: "Lying tricep extension (EZ-bar or dumbbells).",
  },
  {
    name: "Tricep Pushdown",
    type: "isolation",
    movementCategory: "push",
    primaryMuscle: "Triceps",
    secondaryMuscles: [],
    description: "Cable pushdown with rope or bar attachment.",
  },
  {
    name: "Overhead Tricep Extension",
    type: "isolation",
    movementCategory: "push",
    primaryMuscle: "Triceps",
    secondaryMuscles: [],
    description: "Dumbbell or cable overhead extension — long-head focus.",
  },

  // ── Legs ─────────────────────────────────────────────────────────────────
  {
    name: "Squat",
    type: "compound",
    movementCategory: "legs",
    primaryMuscle: "Quadriceps",
    secondaryMuscles: ["Glutes", "Hamstrings", "Core"],
    description: "Back squat — king of lower-body exercises.",
    defaultReps: 5,
  },
  {
    name: "Front Squat",
    type: "compound",
    movementCategory: "legs",
    primaryMuscle: "Quadriceps",
    secondaryMuscles: ["Glutes", "Core"],
    description: "Front-loaded squat with more upright torso — quad dominant.",
  },
  {
    name: "Goblet Squat",
    type: "compound",
    movementCategory: "legs",
    primaryMuscle: "Quadriceps",
    secondaryMuscles: ["Glutes", "Core"],
    description: "Dumbbell or kettlebell front-loaded squat, great for form practice.",
  },
  {
    name: "Leg Press",
    type: "compound",
    movementCategory: "legs",
    primaryMuscle: "Quadriceps",
    secondaryMuscles: ["Glutes", "Hamstrings"],
    description: "Machine leg press — high-load quad and glute builder.",
  },
  {
    name: "Lunge",
    type: "compound",
    movementCategory: "legs",
    primaryMuscle: "Quadriceps",
    secondaryMuscles: ["Glutes", "Hamstrings"],
    description: "Walking or stationary lunge — unilateral leg strength.",
  },
  {
    name: "Bulgarian Split Squat",
    type: "compound",
    movementCategory: "legs",
    primaryMuscle: "Quadriceps",
    secondaryMuscles: ["Glutes", "Hamstrings"],
    description: "Rear-foot-elevated split squat — demanding unilateral exercise.",
  },
  {
    name: "Leg Extension",
    type: "isolation",
    movementCategory: "legs",
    primaryMuscle: "Quadriceps",
    secondaryMuscles: [],
    description: "Machine quad isolation exercise.",
  },
  {
    name: "Leg Curl",
    type: "isolation",
    movementCategory: "legs",
    primaryMuscle: "Hamstrings",
    secondaryMuscles: [],
    description: "Lying or seated machine hamstring curl.",
  },
  {
    name: "Hip Thrust",
    type: "compound",
    movementCategory: "legs",
    primaryMuscle: "Glutes",
    secondaryMuscles: ["Hamstrings", "Core"],
    description: "Barbell hip thrust — primary glute-builder.",
  },
  {
    name: "Calf Raise",
    type: "isolation",
    movementCategory: "legs",
    primaryMuscle: "Calves",
    secondaryMuscles: [],
    description: "Standing or seated calf raise.",
  },
  {
    name: "Step-Up",
    type: "compound",
    movementCategory: "legs",
    primaryMuscle: "Quadriceps",
    secondaryMuscles: ["Glutes", "Hamstrings"],
    description: "Box step-up — functional unilateral lower-body exercise.",
  },

  // ── Core ─────────────────────────────────────────────────────────────────
  {
    name: "Plank",
    type: "isolation",
    movementCategory: "core",
    primaryMuscle: "Abs",
    secondaryMuscles: ["Obliques", "Lower Back"],
    description: "Isometric core stability exercise.",
  },
  {
    name: "Crunch",
    type: "isolation",
    movementCategory: "core",
    primaryMuscle: "Abs",
    secondaryMuscles: [],
    description: "Standard or weighted crunch.",
  },
  {
    name: "Leg Raise",
    type: "isolation",
    movementCategory: "core",
    primaryMuscle: "Abs",
    secondaryMuscles: ["Hip Flexors"],
    description: "Hanging or lying leg raises for lower abs.",
  },
  {
    name: "Cable Woodchopper",
    type: "isolation",
    movementCategory: "core",
    primaryMuscle: "Obliques",
    secondaryMuscles: ["Abs"],
    description: "Rotational cable exercise for oblique strength.",
  },
  {
    name: "Russian Twist",
    type: "isolation",
    movementCategory: "core",
    primaryMuscle: "Obliques",
    secondaryMuscles: ["Abs"],
    description: "Seated rotational exercise for obliques.",
  },
  {
    name: "Ab Wheel Rollout",
    type: "compound",
    movementCategory: "core",
    primaryMuscle: "Abs",
    secondaryMuscles: ["Lats", "Shoulders"],
    description: "Ab wheel rollout — advanced anti-extension core exercise.",
  },
  {
    name: "Side Plank",
    type: "isolation",
    movementCategory: "core",
    primaryMuscle: "Obliques",
    secondaryMuscles: ["Abs", "Glutes"],
    description: "Lateral isometric hold targeting obliques.",
  },

  // ── Compound / Functional ────────────────────────────────────────────────
  {
    name: "Clean and Press",
    type: "compound",
    movementCategory: "other",
    primaryMuscle: "Shoulders",
    secondaryMuscles: ["Legs", "Back", "Core"],
    description: "Olympic-style full-body power movement.",
  },
  {
    name: "Turkish Get-Up",
    type: "compound",
    movementCategory: "other",
    primaryMuscle: "Core",
    secondaryMuscles: ["Shoulders", "Hips", "Glutes"],
    description: "Slow kettlebell get-up for mobility and stability.",
  },
  {
    name: "Kettlebell Swing",
    type: "compound",
    movementCategory: "other",
    primaryMuscle: "Glutes",
    secondaryMuscles: ["Hamstrings", "Core", "Back"],
    description: "Hip-drive kettlebell swing — power and conditioning.",
  },

  // ── Calisthenics ─────────────────────────────────────────────────────────
  {
    name: "Dips",
    type: "compound",
    movementCategory: "push",
    primaryMuscle: "Triceps",
    secondaryMuscles: ["Chest", "Front Deltoids"],
    description: "Parallel-bar dips.",
  },
  {
    name: "Air Squat",
    type: "compound",
    movementCategory: "legs",
    primaryMuscle: "Quadriceps",
    secondaryMuscles: ["Glutes"],
    description: "Bodyweight squat.",
  },
  {
    name: "Burpee",
    type: "compound",
    movementCategory: "cardio",
    primaryMuscle: "Full Body",
    secondaryMuscles: [],
    description: "Full-body explosive conditioning exercise.",
  },
  {
    name: "Box Jump",
    type: "compound",
    movementCategory: "legs",
    primaryMuscle: "Quadriceps",
    secondaryMuscles: ["Glutes", "Calves"],
    description: "Plyometric jump onto a box for power development.",
  },
  {
    name: "Jumping Jacks",
    type: "compound",
    movementCategory: "cardio",
    primaryMuscle: "Full Body",
    secondaryMuscles: [],
    description: "Classic cardio warm-up exercise.",
  },
  {
    name: "Jump Rope",
    type: "compound",
    movementCategory: "cardio",
    primaryMuscle: "Calves",
    secondaryMuscles: ["Shoulders", "Core"],
    description: "Rope skipping — great for cardio conditioning.",
  },
  {
    name: "Machine Chest Press",
    type: "compound",
    movementCategory: "push",
    primaryMuscle: "Chest",
    secondaryMuscles: ["Triceps", "Front Deltoids"],
    description: "Guided-range machine chest press.",
  },
  {
    name: "Cable Fly",
    type: "isolation",
    movementCategory: "push",
    primaryMuscle: "Chest",
    secondaryMuscles: [],
    description: "Cable crossover fly for chest isolation.",
  },
];

async function main() {
  console.log("🌱 Seeding system exercises…");

  let created = 0;
  let skipped = 0;

  for (const ex of systemExercises) {
    const slug = slugify(ex.name);

    // Avoid duplicate system exercises on re-seed
    const existing = await prisma.exercise.findFirst({
      where: { slug, isSystemExercise: true },
    });

    if (existing) {
      skipped++;
      continue;
    }

    await prisma.exercise.create({
      data: {
        name: ex.name,
        slug,
        type: ex.type,
        movementCategory: ex.movementCategory,
        primaryMuscle: ex.primaryMuscle,
        secondaryMuscles: ex.secondaryMuscles,
        description: ex.description ?? null,
        defaultReps: (ex as { defaultReps?: number }).defaultReps ?? null,
        isSystemExercise: true,
        createdBy: null,
      },
    });

    created++;
  }

  console.log(`✅ Done — ${created} created, ${skipped} skipped.`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
