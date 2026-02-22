"use client";

interface PreviousBestHintProps {
  weight?: number | null;
  weightUnit?: string | null;
  reps?: number | null;
  rpe?: number | null;
}

export default function PreviousBestHint({ weight, weightUnit, reps, rpe }: PreviousBestHintProps) {
  if (!weight && !reps) return null;

  const parts: string[] = [];
  if (weight !== null && weight !== undefined) parts.push(`${weight} ${weightUnit ?? "kg"}`);
  if (reps !== null && reps !== undefined) parts.push(`× ${reps}`);
  if (rpe !== null && rpe !== undefined) parts.push(`@ RPE ${rpe}`);

  return (
    <p className="text-xs text-gray-400 mt-0.5">
      Last time: {parts.join(" ")}
    </p>
  );
}
