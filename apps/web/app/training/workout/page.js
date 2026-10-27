"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ExercisePicker from "@/app/components/ExercisePicker";
import {
    discardActiveWorkout,
    finishActiveWorkout,
    setActiveWorkout,
    useActiveWorkout,
    useExercises,
    useHydrated,
    useWorkouts,
} from "@/lib/training";
import { formatClock, formatSet, lastPerformance, workoutExerciseFor } from "@pt-swipe/shared";

// "" -> null so a cleared input means "not entered" rather than 0.
function parseNumber(value) {
    if (value.trim() === "") return null;
    const n = Number(value);
    return Number.isFinite(n) && n >= 0 ? n : undefined;
}

function ElapsedTimer({ startedAt }) {
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(id);
    }, []);

    return <span className="tabular-nums">{formatClock(now - startedAt)}</span>;
}

export default function WorkoutPage() {
    const router = useRouter();
    const hydrated = useHydrated();
    const workout = useActiveWorkout();
    const exercises = useExercises();
    const history = useWorkouts();
    const [picking, setPicking] = useState(false);

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
                <p>No workout in progress.</p>
                <Link href="/training" className="text-green-400 font-semibold">
                    ← Back to training
                </Link>
            </div>
        );
    }

    // Every edit writes straight to storage, so a refresh never loses a set.
    function update(mutate) {
        const draft = structuredClone(workout);
        mutate(draft);
        setActiveWorkout(draft);
    }

    // Hint for each set: what you did last time, falling back to the routine target.
    function placeholderFor(ex, setIndex) {
        const previous = lastPerformance(history, ex.exerciseId)?.[setIndex];
        return {
            weight: previous?.weight ?? ex.targetWeight,
            reps: previous?.reps ?? ex.targetReps,
            previous,
        };
    }

    function setField(ei, si, field, value) {
        const parsed = parseNumber(value);
        if (parsed === undefined) return;
        update((w) => {
            w.exercises[ei].sets[si][field] = parsed;
        });
    }

    function toggleDone(ei, si) {
        update((w) => {
            const ex = w.exercises[ei];
            const set = ex.sets[si];
            if (!set.done) {
                // Ticking an untouched set accepts the hinted values, like most lifting apps.
                const hint = placeholderFor(ex, si);
                set.weight ??= hint.weight;
                set.reps ??= hint.reps;
            }
            set.done = !set.done;
        });
    }

    function addSet(ei) {
        update((w) => {
            const sets = w.exercises[ei].sets;
            const prev = sets[sets.length - 1];
            sets.push({ weight: prev?.weight ?? null, reps: prev?.reps ?? null, done: false });
        });
    }

    function finish() {
        const finished = finishActiveWorkout();
        if (finished) {
            router.push(`/training/history/${finished.id}`);
            return;
        }
        if (window.confirm("No sets are ticked off yet. Discard this workout?")) {
            router.push("/training");
            discardActiveWorkout();
        }
    }

    function discard() {
        if (!window.confirm("Discard this workout? Nothing will be saved.")) return;
        router.push("/training");
        discardActiveWorkout();
    }

    const cellInput =
        "w-full p-2 rounded-lg bg-gray-100 text-gray-900 text-center border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500";

    return (
        <div className="min-h-screen px-4 py-6 max-w-md mx-auto space-y-4">
            <header className="flex items-center justify-between sticky top-0 bg-background py-2 z-10">
                <div>
                    <Link href="/training" className="text-sm text-green-400 font-semibold">
                        ← Training
                    </Link>
                    <h1 className="text-2xl font-bold">{workout.name}</h1>
                    <p className="text-sm text-zinc-400">
                        <ElapsedTimer startedAt={workout.startedAt} />
                    </p>
                </div>
                <button
                    type="button"
                    onClick={finish}
                    className="bg-green-500 text-black font-bold px-5 py-2 rounded-full"
                >
                    Finish
                </button>
            </header>

            {workout.exercises.length === 0 && (
                <div className="bg-white text-gray-500 rounded-2xl p-6 text-center text-sm">
                    Add your first exercise to start logging sets.
                </div>
            )}

            {workout.exercises.map((ex, ei) => (
                <section key={`${ex.exerciseId}-${ei}`} className="bg-white text-black rounded-2xl p-4 shadow-lg">
                    <div className="flex items-start justify-between mb-3">
                        <div>
                            <p className="font-bold">{ex.name}</p>
                            {ex.targetReps !== null && (
                                <p className="text-xs text-gray-500">
                                    Target: {formatSet({ weight: ex.targetWeight, reps: ex.targetReps })}
                                </p>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() =>
                                update((w) => {
                                    w.exercises.splice(ei, 1);
                                })
                            }
                            className="text-red-400 text-sm px-1"
                            aria-label={`Remove ${ex.name}`}
                        >
                            ✕
                        </button>
                    </div>

                    <div className="grid grid-cols-[1.5rem_1fr_1fr_1fr_2.5rem_1.5rem] gap-2 items-center text-xs text-gray-500 font-semibold mb-1">
                        <span>Set</span>
                        <span>Previous</span>
                        <span className="text-center">kg</span>
                        <span className="text-center">Reps</span>
                        <span />
                        <span />
                    </div>

                    <ul className="space-y-2">
                        {ex.sets.map((set, si) => {
                            const hint = placeholderFor(ex, si);
                            return (
                                <li
                                    key={si}
                                    className={`grid grid-cols-[1.5rem_1fr_1fr_1fr_2.5rem_1.5rem] gap-2 items-center rounded-lg ${
                                        set.done ? "bg-green-100" : ""
                                    }`}
                                >
                                    <span className="text-sm font-bold text-gray-500 text-center">{si + 1}</span>
                                    <span className="text-xs text-gray-400 truncate">
                                        {hint.previous ? formatSet(hint.previous) : "—"}
                                    </span>
                                    <input
                                        inputMode="decimal"
                                        aria-label={`Set ${si + 1} weight`}
                                        value={set.weight ?? ""}
                                        placeholder={hint.weight != null ? String(hint.weight) : "—"}
                                        onChange={(e) => setField(ei, si, "weight", e.target.value)}
                                        className={cellInput}
                                    />
                                    <input
                                        inputMode="numeric"
                                        aria-label={`Set ${si + 1} reps`}
                                        value={set.reps ?? ""}
                                        placeholder={hint.reps != null ? String(hint.reps) : "—"}
                                        onChange={(e) => setField(ei, si, "reps", e.target.value)}
                                        className={cellInput}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => toggleDone(ei, si)}
                                        disabled={!set.done && (set.reps ?? hint.reps) == null}
                                        aria-label={set.done ? `Undo set ${si + 1}` : `Complete set ${si + 1}`}
                                        className={`h-9 rounded-lg font-bold disabled:opacity-30 ${
                                            set.done ? "bg-green-500 text-black" : "bg-gray-200 text-gray-500"
                                        }`}
                                    >
                                        ✓
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            update((w) => {
                                                w.exercises[ei].sets.splice(si, 1);
                                            })
                                        }
                                        aria-label={`Remove set ${si + 1}`}
                                        className="h-9 text-gray-400 hover:text-red-500"
                                    >
                                        ✕
                                    </button>
                                </li>
                            );
                        })}
                    </ul>

                    <button
                        type="button"
                        onClick={() => addSet(ei)}
                        className="mt-3 w-full bg-gray-100 text-gray-700 p-2 rounded-lg text-sm font-semibold"
                    >
                        + Add set
                    </button>
                </section>
            ))}

            <button
                type="button"
                onClick={() => setPicking(true)}
                className="w-full border-2 border-dashed border-zinc-500 text-zinc-500 p-3 rounded-2xl font-semibold"
            >
                + Add exercise
            </button>

            <button type="button" onClick={discard} className="w-full text-red-400 p-2 text-sm font-semibold">
                Discard workout
            </button>

            {picking && (
                <ExercisePicker
                    exercises={exercises}
                    onSelect={(exercise) => {
                        update((w) => {
                            w.exercises.push(workoutExerciseFor(exercise, { sets: 3, reps: null, weight: null }));
                        });
                        setPicking(false);
                    }}
                    onClose={() => setPicking(false)}
                />
            )}
        </div>
    );
}
