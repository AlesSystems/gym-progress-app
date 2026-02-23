"use client";

interface MaxLift {
  id: string;
  exerciseId: string;
  weight: number;
  unit: string;
  achievedAt: string;
  exercise?: { name: string; movementCategory: string };
}

interface MaxLiftsListProps {
  maxLifts: MaxLift[];
  unitPreference: string;
}

function convertWeight(weight: number, from: string, to: string): number {
  if (from === to) return weight;
  if (from === "kg" && to === "lb") return Math.round(weight * 2.2046 * 10) / 10;
  if (from === "lb" && to === "kg") return Math.round((weight / 2.2046) * 10) / 10;
  return weight;
}

export default function MaxLiftsList({ maxLifts, unitPreference }: MaxLiftsListProps) {
  if (maxLifts.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic">
        No max lifts recorded yet. Complete workouts to track your personal records!
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
            <th className="pb-2 pr-4">Exercise</th>
            <th className="pb-2 pr-4">Category</th>
            <th className="pb-2 pr-4">Max Lift</th>
            <th className="pb-2">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {maxLifts.map((lift) => {
            const displayWeight = convertWeight(lift.weight, lift.unit, unitPreference);
            return (
              <tr key={lift.id} className="py-2">
                <td className="py-2 pr-4 font-medium text-foreground">
                  {lift.exercise?.name ?? lift.exerciseId}
                </td>
                <td className="py-2 pr-4 text-muted-foreground">
                  {lift.exercise?.movementCategory ?? "—"}
                </td>
                <td className="py-2 pr-4 font-semibold text-primary">
                  {displayWeight} {unitPreference}
                </td>
                <td className="py-2 text-muted-foreground">
                  {new Date(lift.achievedAt).toLocaleDateString()}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
