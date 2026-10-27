"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    useActiveWorkout,
    useExercises,
    useHydrated,
    useRoutines,
    useWorkouts,
    setActiveWorkout,
} from "@/lib/training";
import {
    createWorkout,
    findExercise,
    formatDate,
    formatDuration,
    workoutFromRoutine,
    workoutVolume,
} from "@pt-swipe/shared";

export default function TrainingPage() {
    const router = useRouter();
    const hydrated = useHydrated();
    const exercises = useExercises();
    const routines = useRoutines();
    const workouts = useWorkouts();
    const active = useActiveWorkout();

    function begin(workout) {
        if (active && !window.confirm(`Discard "${active.name}" in progress and start a new workout?`)) {
            return;
        }
        setActiveWorkout(workout);
        router.push("/training/workout");
    }

    if (!hydrated) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Loading training...</p>
            </div>
        );
    }

    const last = workouts[0];

    return (
        <div className="min-h-screen px-4 py-6 max-w-md mx-auto space-y-6">
            <header className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Training 🏋️</h1>
                <Link href="/swipe" className="text-sm text-green-400 font-semibold">
                    ← Swipe
                </Link>
            </header>

            {active && (
                <Link
                    href="/training/workout"
                    className="flex items-center justify-between bg-green-500 text-black rounded-2xl p-4 shadow-lg"
                >
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide">In progress</p>
                        <p className="font-bold">{active.name}</p>
                    </div>
                    <span className="font-bold">Resume →</span>
                </Link>
            )}

            <div className="grid grid-cols-3 gap-2 text-center text-sm font-semibold">
                <button
                    type="button"
                    onClick={() => begin(createWorkout("Workout"))}
                    className="bg-white text-black rounded-2xl p-3 shadow-lg"
                >
                    ⚡ Quick start
                </button>
                <Link href="/training/exercises" className="bg-white text-black rounded-2xl p-3 shadow-lg">
                    📚 Exercises
                </Link>
                <Link href="/training/history" className="bg-white text-black rounded-2xl p-3 shadow-lg">
                    📈 History
                </Link>
            </div>

            <section>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-bold">Routines</h2>
                    <Link href="/training/routines/new" className="text-sm text-green-400 font-semibold">
                        + New routine
                    </Link>
                </div>

                {routines.length === 0 ? (
                    <div className="bg-white text-gray-700 rounded-2xl p-6 text-center shadow-xl">
                        <p className="text-lg font-bold mb-1 text-black">No routines yet</p>
                        <p className="text-sm text-gray-500 mb-4">
                            Build a routine once, then start it in one tap every session.
                        </p>
                        <Link
                            href="/training/routines/new"
                            className="inline-block bg-green-500 text-black px-4 py-2 rounded-full font-bold"
                        >
                            Create a routine
                        </Link>
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {routines.map((r) => (
                            <li key={r.id} className="bg-white text-black rounded-2xl p-4 shadow-lg">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="font-bold">{r.name}</p>
                                        <p className="text-sm text-gray-500 truncate">
                                            {r.exercises
                                                .map((re) => findExercise(exercises, re.exerciseId)?.name)
                                                .filter(Boolean)
                                                .join(", ") || "No exercises"}
                                        </p>
                                    </div>
                                    <Link
                                        href={`/training/routines/${r.id}`}
                                        className="text-sm text-gray-500 font-semibold shrink-0"
                                    >
                                        Edit
                                    </Link>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => begin(workoutFromRoutine(r, exercises))}
                                    disabled={r.exercises.length === 0}
                                    className="mt-3 w-full bg-green-500 text-black p-2 rounded-full font-bold disabled:opacity-40"
                                >
                                    Start workout
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            {last && (
                <section>
                    <h2 className="text-lg font-bold mb-3">Last workout</h2>
                    <Link
                        href={`/training/history/${last.id}`}
                        className="block bg-white text-black rounded-2xl p-4 shadow-lg"
                    >
                        <p className="font-bold">{last.name}</p>
                        <p className="text-sm text-gray-500">
                            {formatDate(last.startedAt)} • {formatDuration(last.finishedAt - last.startedAt)} •{" "}
                            {workoutVolume(last).toLocaleString()} kg
                        </p>
                    </Link>
                </section>
            )}
        </div>
    );
}
