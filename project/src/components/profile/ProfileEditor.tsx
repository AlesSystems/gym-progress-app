"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProfileSchema, type UpdateProfileInput } from "@/lib/validations/profile";

interface ProfileEditorProps {
  initialValues: {
    name?: string | null;
    displayName?: string | null;
    unitPreference: string;
  };
  onUpdated?: (data: UpdateProfileInput) => void;
}

export default function ProfileEditor({ initialValues, onUpdated }: ProfileEditorProps) {
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: initialValues.name ?? "",
      displayName: initialValues.displayName ?? "",
      unitPreference: (initialValues.unitPreference as "kg" | "lb") ?? "kg",
    },
  });

  const onSubmit = async (data: UpdateProfileInput) => {
    setServerMessage(null);
    setServerError(null);

    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const json = await res.json();

    if (!res.ok || !json.success) {
      setServerError(json.error?.message ?? "Failed to update profile.");
      return;
    }

    setServerMessage("Profile updated!");
    onUpdated?.(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverMessage && (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-700 border border-green-200">
          {serverMessage}
        </div>
      )}
      {serverError && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">
          {serverError}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Full Name
        </label>
        <input
          {...register("name")}
          id="name"
          type="text"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
          Display Name
        </label>
        <input
          {...register("displayName")}
          id="displayName"
          type="text"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="How others see you"
        />
        {errors.displayName && (
          <p className="mt-1 text-xs text-red-600">{errors.displayName.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Weight Unit
        </label>
        <div className="flex gap-4">
          {(["kg", "lb"] as const).map((unit) => (
            <label key={unit} className="flex items-center gap-2 cursor-pointer">
              <input
                {...register("unitPreference")}
                type="radio"
                value={unit}
                className="accent-indigo-600"
              />
              <span className="text-sm text-gray-700">{unit}</span>
            </label>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !isDirty}
        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
