"use client";

interface MaxLift {
  id: string;
  exerciseId: string;
  weight: number;
  unit: string;
  achievedAt: string;
  exercise?: { name: string; category: string };
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
      <p className="text-sm text-gray-500 italic">
        No max lifts recorded yet. Complete workouts to track your personal records!
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
            <th className="pb-2 pr-4">Exercise</th>
            <th className="pb-2 pr-4">Category</th>
            <th className="pb-2 pr-4">Max Lift</th>
            <th className="pb-2">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {maxLifts.map((lift) => {
            const displayWeight = convertWeight(lift.weight, lift.unit, unitPreference);
            return (
              <tr key={lift.id} className="py-2">
                <td className="py-2 pr-4 font-medium text-gray-900">
                  {lift.exercise?.name ?? lift.exerciseId}
                </td>
                <td className="py-2 pr-4 text-gray-500">
                  {lift.exercise?.category ?? "—"}
                </td>
                <td className="py-2 pr-4 font-semibold text-indigo-600">
                  {displayWeight} {unitPreference}
                </td>
                <td className="py-2 text-gray-500">
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
