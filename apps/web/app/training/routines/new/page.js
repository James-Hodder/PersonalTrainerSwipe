"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import RoutineEditor from "@/app/components/RoutineEditor";
import { saveRoutine } from "@/lib/training";

export default function NewRoutinePage() {
    const router = useRouter();

    return (
        <div className="min-h-screen px-4 py-6 max-w-md mx-auto">
            <header className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">New Routine</h1>
                <Link href="/training" className="text-sm text-green-400 font-semibold">
                    Cancel
                </Link>
            </header>

            <RoutineEditor
                onSave={(routine) => {
                    saveRoutine(routine);
                    router.push("/training");
                }}
            />
        </div>
    );
}
