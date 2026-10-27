"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useExercises, useHydrated, useWorkouts } from "@/lib/training";
import { exerciseHistory, findExercise, formatDate, formatSet, personalBests } from "@pt-swipe/shared";

function Stat({ label, value }) {
    return (
        <div className="bg-white text-black rounded-2xl p-3 text-center shadow-lg">
            <p className="text-xl font-extrabold">{value ?? "—"}</p>
            <p className="text-xs text-gray-500">{label}</p>
        </div>
    );
}

export default function ExerciseDetailPage() {
    const params = useParams();
    const hydrated = useHydrated();
    const exercises = useExercises();
    const workouts = useWorkouts();

    if (!hydrated) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Loading exercise...</p>
            </div>
        );
    }

    const exercise = findExercise(exercises, params.id);
    const history = exerciseHistory(workouts, params.id);
    // A deleted custom exercise can still have history; recover its name from there.
    const name =
        exercise?.name ??
        workouts.flatMap((w) => w.exercises).find((ex) => ex.exerciseId === params.id)?.name;

    if (!name) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-3 p-4">
                <p>Exercise not found.</p>
                <Link href="/training/exercises" className="text-green-400 font-semibold">
                    ← Back to exercises
                </Link>
            </div>
        );
    }

    const bests = personalBests(workouts, params.id);
    const kg = (n) => (n === null ? null : `${n} kg`);

    return (
        <div className="min-h-screen px-4 py-6 max-w-md mx-auto space-y-6">
            <header>
                <Link href="/training/exercises" className="text-sm text-green-400 font-semibold">
                    ← Exercises
                </Link>
                <h1 className="text-2xl font-bold">{name}</h1>
                {exercise && (
                    <p className="text-sm text-zinc-400">
                        {exercise.muscleGroup} • {exercise.equipment}
                    </p>
                )}
            </header>

            <section>
                <h2 className="text-lg font-bold mb-3">Personal bests</h2>
                <div className="grid grid-cols-2 gap-2">
                    <Stat label="Heaviest weight" value={kg(bests.maxWeight)} />
                    <Stat label="Est. 1 rep max" value={kg(bests.bestOneRepMax)} />
                    <Stat label="Most reps in a set" value={bests.mostReps} />
                    <Stat
                        label="Best session volume"
                        value={bests.bestSessionVolume === null ? null : `${bests.bestSessionVolume.toLocaleString()} kg`}
                    />
                </div>
            </section>

            <section>
                <h2 className="text-lg font-bold mb-3">
                    History <span className="text-zinc-500 font-normal">({bests.sessions})</span>
                </h2>
                {history.length === 0 ? (
                    <div className="bg-white text-gray-500 rounded-2xl p-6 text-center text-sm">
                        You haven&apos;t logged this exercise yet.
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {history.map((session, i) => (
                            <li key={`${session.workoutId}-${i}`}>
                                <Link
                                    href={`/training/history/${session.workoutId}`}
                                    className="block bg-white text-black rounded-2xl p-4 shadow-lg"
                                >
                                    <p className="font-bold">{formatDate(session.date)}</p>
                                    <p className="text-xs text-gray-500 mb-2">{session.workoutName}</p>
                                    <p className="text-sm text-gray-700">{session.sets.map(formatSet).join("  •  ")}</p>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}
