"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { deleteWorkout, renameWorkout, useHydrated, useWorkouts } from "@/lib/training";
import {
    completedSetCount,
    estimateOneRepMax,
    formatDate,
    formatDuration,
    formatSet,
    workoutVolume,
} from "@pt-swipe/shared";

// Click to rename. Enter or clicking away saves; Escape cancels; blank keeps the old name.
function EditableTitle({ name, onRename }) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(name);
    // Enter/Escape unmount the input, which can also fire blur; only act once.
    const settled = useRef(false);

    function start() {
        setDraft(name);
        settled.current = false;
        setEditing(true);
    }

    function finish(save) {
        if (settled.current) return;
        settled.current = true;
        const trimmed = draft.trim();
        if (save && trimmed && trimmed !== name) onRename(trimmed);
        setEditing(false);
    }

    if (editing) {
        return (
            <input
                autoFocus
                value={draft}
                maxLength={60}
                aria-label="Workout name"
                onChange={(e) => setDraft(e.target.value)}
                onFocus={(e) => e.target.select()}
                onBlur={() => finish(true)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") finish(true);
                    if (e.key === "Escape") finish(false);
                }}
                className="w-full text-2xl font-bold bg-transparent border-b-2 border-green-500 focus:outline-none"
            />
        );
    }

    return (
        <h1>
            <button
                type="button"
                onClick={start}
                title="Rename workout"
                className="text-2xl font-bold text-left hover:underline decoration-dotted underline-offset-4"
            >
                {name} <span className="text-base text-zinc-500 font-normal">✎</span>
            </button>
        </h1>
    );
}

export default function WorkoutDetailPage() {
    const params = useParams();
    const router = useRouter();
    const hydrated = useHydrated();
    const workout = useWorkouts().find((w) => w.id === params.id);

    if (!hydrated) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Loading workout...</p>
            </div>
        );
    }

    if (!workout) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-3 p-4">
                <p>Workout not found.</p>
                <Link href="/training/history" className="text-green-400 font-semibold">
                    ← Back to history
                </Link>
            </div>
        );
    }

    function remove() {
        if (!window.confirm("Delete this workout from your history?")) return;
        router.push("/training/history");
        deleteWorkout(workout.id);
    }

    return (
        <div className="min-h-screen px-4 py-6 max-w-md mx-auto space-y-4">
            <header>
                <Link href="/training/history" className="text-sm text-green-400 font-semibold">
                    ← History
                </Link>
                <EditableTitle name={workout.name} onRename={(name) => renameWorkout(workout.id, name)} />
                <p className="text-sm text-zinc-400">{formatDate(workout.startedAt)}</p>
            </header>

            <div className="grid grid-cols-3 gap-2 text-center">
                {[
                    ["Duration", formatDuration(workout.finishedAt - workout.startedAt)],
                    ["Sets", completedSetCount(workout)],
                    ["Volume", `${workoutVolume(workout).toLocaleString()} kg`],
                ].map(([label, value]) => (
                    <div key={label} className="bg-white text-black rounded-2xl p-3 shadow-lg">
                        <p className="text-lg font-extrabold">{value}</p>
                        <p className="text-xs text-gray-500">{label}</p>
                    </div>
                ))}
            </div>

            {workout.exercises.map((ex, i) => (
                <section key={`${ex.exerciseId}-${i}`} className="bg-white text-black rounded-2xl p-4 shadow-lg">
                    <Link href={`/training/exercises/${ex.exerciseId}`} className="font-bold hover:underline">
                        {ex.name}
                    </Link>
                    <ol className="mt-2 space-y-1 text-sm">
                        {ex.sets.map((set, si) => (
                            <li key={si} className="flex justify-between">
                                <span className="text-gray-500 w-12">Set {si + 1}</span>
                                <span className="flex-1 font-semibold">{formatSet(set)}</span>
                                {set.weight > 0 && (
                                    <span className="text-xs text-gray-400">
                                        ~{estimateOneRepMax(set.weight, set.reps)} kg 1RM
                                    </span>
                                )}
                            </li>
                        ))}
                    </ol>
                </section>
            ))}

            <button type="button" onClick={remove} className="w-full text-red-400 p-2 text-sm font-semibold">
                Delete workout
            </button>
        </div>
    );
}
