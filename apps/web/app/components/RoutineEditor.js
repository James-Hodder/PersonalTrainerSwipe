"use client";

import { useState } from "react";
import { findExercise, newId } from "@pt-swipe/shared";
import { useExercises } from "@/lib/training";
import ExercisePicker from "./ExercisePicker";

// Form fields are kept as strings so inputs can be cleared while typing;
// they're validated and converted back to numbers on save.
function toRow(re) {
    return {
        key: newId(),
        exerciseId: re.exerciseId,
        sets: String(re.sets),
        reps: String(re.reps),
        weight: re.weight === null ? "" : String(re.weight),
    };
}

function parseInteger(value, min, max) {
    const n = Number(value);
    return Number.isInteger(n) && n >= min && n <= max ? n : null;
}

export default function RoutineEditor({ initial, onSave, onDelete }) {
    const exercises = useExercises();
    const [name, setName] = useState(initial?.name ?? "");
    const [rows, setRows] = useState(() => (initial?.exercises ?? []).map(toRow));
    const [picking, setPicking] = useState(false);
    const [error, setError] = useState("");

    function updateRow(key, field, value) {
        setRows((rs) => rs.map((r) => (r.key === key ? { ...r, [field]: value } : r)));
    }

    function move(index, delta) {
        setRows((rs) => {
            const target = index + delta;
            if (target < 0 || target >= rs.length) return rs;
            const next = [...rs];
            [next[index], next[target]] = [next[target], next[index]];
            return next;
        });
    }

    function addExercise(exercise) {
        setRows((rs) => [...rs, toRow({ exerciseId: exercise.id, sets: 3, reps: 10, weight: null })]);
        setPicking(false);
    }

    function save(e) {
        e.preventDefault();

        const trimmed = name.trim();
        if (!trimmed) return setError("Give your routine a name.");
        if (rows.length === 0) return setError("Add at least one exercise.");

        const parsed = [];
        for (const row of rows) {
            const label = findExercise(exercises, row.exerciseId)?.name ?? "an exercise";
            const sets = parseInteger(row.sets, 1, 20);
            const reps = parseInteger(row.reps, 1, 100);
            const weight = row.weight.trim() === "" ? null : Number(row.weight);

            if (sets === null) return setError(`Sets for ${label} must be a whole number from 1 to 20.`);
            if (reps === null) return setError(`Reps for ${label} must be a whole number from 1 to 100.`);
            if (weight !== null && (!Number.isFinite(weight) || weight < 0)) {
                return setError(`Weight for ${label} must be 0 or more, or left blank.`);
            }

            parsed.push({ exerciseId: row.exerciseId, sets, reps, weight });
        }

        const now = Date.now();
        onSave({
            id: initial?.id ?? newId(),
            name: trimmed,
            exercises: parsed,
            createdAt: initial?.createdAt ?? now,
            updatedAt: now,
        });
    }

    const inputClass =
        "w-full p-2 rounded-lg bg-gray-100 text-gray-900 text-center border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500";

    return (
        <>
        <form onSubmit={save} className="space-y-4">
            <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Routine name (e.g. Push Day)"
                className="w-full p-3 rounded-xl bg-white text-gray-900 placeholder-gray-500 font-semibold focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            {rows.length === 0 ? (
                <div className="bg-white text-gray-500 rounded-2xl p-6 text-center text-sm">
                    No exercises yet. Add some below.
                </div>
            ) : (
                <ul className="space-y-3">
                    {rows.map((row, i) => {
                        const exercise = findExercise(exercises, row.exerciseId);
                        return (
                            <li key={row.key} className="bg-white text-black rounded-2xl p-4 shadow-lg">
                                <div className="flex items-start justify-between gap-2 mb-3">
                                    <div>
                                        <p className="font-bold">{exercise?.name ?? "Unknown exercise"}</p>
                                        {exercise && (
                                            <p className="text-xs text-gray-500">
                                                {exercise.muscleGroup} • {exercise.equipment}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex gap-1 text-gray-400">
                                        <button
                                            type="button"
                                            onClick={() => move(i, -1)}
                                            disabled={i === 0}
                                            className="px-2 disabled:opacity-30"
                                            aria-label="Move up"
                                        >
                                            ↑
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => move(i, 1)}
                                            disabled={i === rows.length - 1}
                                            className="px-2 disabled:opacity-30"
                                            aria-label="Move down"
                                        >
                                            ↓
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setRows((rs) => rs.filter((r) => r.key !== row.key))}
                                            className="px-2 text-red-400"
                                            aria-label="Remove exercise"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-xs text-gray-500">
                                    <label>
                                        Sets
                                        <input
                                            inputMode="numeric"
                                            value={row.sets}
                                            onChange={(e) => updateRow(row.key, "sets", e.target.value)}
                                            className={`${inputClass} mt-1`}
                                        />
                                    </label>
                                    <label>
                                        Reps
                                        <input
                                            inputMode="numeric"
                                            value={row.reps}
                                            onChange={(e) => updateRow(row.key, "reps", e.target.value)}
                                            className={`${inputClass} mt-1`}
                                        />
                                    </label>
                                    <label>
                                        Weight (kg)
                                        <input
                                            inputMode="decimal"
                                            value={row.weight}
                                            onChange={(e) => updateRow(row.key, "weight", e.target.value)}
                                            placeholder="—"
                                            className={`${inputClass} mt-1`}
                                        />
                                    </label>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}

            <button
                type="button"
                onClick={() => setPicking(true)}
                className="w-full border-2 border-dashed border-zinc-500 text-zinc-500 p-3 rounded-2xl font-semibold"
            >
                + Add exercise
            </button>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button type="submit" className="w-full bg-green-500 text-black p-3 rounded-full font-bold">
                Save routine
            </button>

            {onDelete && (
                <button
                    type="button"
                    onClick={onDelete}
                    className="w-full text-red-400 p-2 text-sm font-semibold"
                >
                    Delete routine
                </button>
            )}
        </form>

        {/* Outside the form so Enter in the picker's search box doesn't submit it. */}
        {picking && (
            <ExercisePicker exercises={exercises} onSelect={addExercise} onClose={() => setPicking(false)} />
        )}
        </>
    );
}
