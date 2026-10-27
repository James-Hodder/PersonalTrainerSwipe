"use client";

import Link from "next/link";
import { useHydrated, useWorkouts } from "@/lib/training";
import { completedSetCount, formatDate, formatDuration, workoutVolume } from "@pt-swipe/shared";

export default function HistoryPage() {
    const hydrated = useHydrated();
    const workouts = useWorkouts();

    return (
        <div className="min-h-screen px-4 py-6 max-w-md mx-auto">
            <header className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">History</h1>
                <Link href="/training" className="text-sm text-green-400 font-semibold">
                    ← Training
                </Link>
            </header>

            {!hydrated ? (
                <p className="text-center text-zinc-400">Loading history...</p>
            ) : workouts.length === 0 ? (
                <div className="bg-white text-gray-700 rounded-2xl p-6 text-center shadow-xl">
                    <p className="text-lg font-bold mb-1 text-black">No workouts yet</p>
                    <p className="text-sm text-gray-500 mb-4">Finish a workout and it&apos;ll show up here.</p>
                    <Link
                        href="/training"
                        className="inline-block bg-green-500 text-black px-4 py-2 rounded-full font-bold"
                    >
                        Start training
                    </Link>
                </div>
            ) : (
                <ul className="space-y-3">
                    {workouts.map((w) => (
                        <li key={w.id}>
                            <Link
                                href={`/training/history/${w.id}`}
                                className="block bg-white text-black rounded-2xl p-4 shadow-lg"
                            >
                                <div className="flex items-baseline justify-between gap-2">
                                    <p className="font-bold">{w.name}</p>
                                    <p className="text-xs text-gray-500 shrink-0">{formatDate(w.startedAt)}</p>
                                </div>
                                <p className="text-sm text-gray-500">
                                    {formatDuration(w.finishedAt - w.startedAt)} • {completedSetCount(w)} sets •{" "}
                                    {workoutVolume(w).toLocaleString()} kg
                                </p>
                                <p className="text-xs text-gray-400 truncate mt-1">
                                    {w.exercises.map((ex) => ex.name).join(", ")}
                                </p>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
