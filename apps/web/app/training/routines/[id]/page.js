"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import RoutineEditor from "@/app/components/RoutineEditor";
import { deleteRoutine, saveRoutine, useHydrated, useRoutines } from "@/lib/training";

export default function EditRoutinePage() {
    const params = useParams();
    const router = useRouter();
    const hydrated = useHydrated();
    const routine = useRoutines().find((r) => r.id === params.id);

    if (!hydrated) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Loading routine...</p>
            </div>
        );
    }

    if (!routine) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-3 p-4">
                <p>Routine not found.</p>
                <Link href="/training" className="text-green-400 font-semibold">
                    ← Back to training
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen px-4 py-6 max-w-md mx-auto">
            <header className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Edit Routine</h1>
                <Link href="/training" className="text-sm text-green-400 font-semibold">
                    Cancel
                </Link>
            </header>

            <RoutineEditor
                key={routine.id}
                initial={routine}
                onSave={(updated) => {
                    saveRoutine(updated);
                    router.push("/training");
                }}
                onDelete={() => {
                    if (!window.confirm(`Delete "${routine.name}"? Past workouts are kept.`)) return;
                    router.push("/training");
                    deleteRoutine(routine.id);
                }}
            />
        </div>
    );
}
